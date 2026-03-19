import datetime
from fastapi import Depends, APIRouter
from backend.app.models import RecommendationRequest
from backend.app.utils import cos_sim, dot, to_float32
from backend.app.database import get_db
from sqlalchemy import text, bindparam, BigInteger
from sqlalchemy.dialects.postgresql import ARRAY, JSONB
from pgvector.sqlalchemy import Vector
from typing import List, Tuple, Dict, Any

recipe_router = APIRouter()
weights = {'embedding_similarity': 0.25, 'pantry_match': 0.40, 'expiry_urgency': 0.25, 'preferred_cuisine_match': 0.10}
filter_procedure_name = 'filter_candidates'
matching_ingred_thresh: float = 0.40
recently_chosen_limit: int = 20
top_k = 3

def min_max_normalize(values: List[float]) -> List[float]:
    """Min-max normalizes values to [0, 1]. If all values are identical, returns 0.0 for all entries."""
    if not values:
        return []
    min_val = min(values)
    max_val = max(values)
    range_val = max_val - min_val

    if range_val == 0:
        return [0.0 for _ in values]
    return [(v - min_val) / range_val for v in values]


def compute_normalized_embedding_scores(
    candidates_embeddings: List[Tuple[int, Any]],
    user_history: List[Any],
    top_k: int,
) -> Dict[int, float]:
    """Calculates a normalized embedding similarity score in [0, 1] for each candidate recipe.
    (Since cosine similarity is originally in [-1, 1]
    """
    embed_similarities: Dict[int, float] = {}

    for recipe_id, candidate_embed in candidates_embeddings:
        if not user_history:
            embed_similarities[recipe_id] = 0.0
            continue

        sim_scores = [(cos_sim(candidate_embed, prev_embed) + 1.0) / 2.0 for prev_embed in user_history]
        k = min(top_k, len(sim_scores))
        highest_scores = sorted(sim_scores)[-k:]
        agg_score = sum(highest_scores) / k

        embed_similarities[recipe_id] = float(agg_score)

    return embed_similarities


def build_normalized_features(
    filtered_recipes_and_features: Dict[str, List[float]],
    embedding_scores: Dict[int, float],
    recipes_of_pref_cuisine: List[int],
) -> List[Dict[str, Any]]:
    """
    Builds one JSON-like feature object per recipe.
    Output example:
    [
        {
            "recipe_id": 123,
            "scores": {
                "embedding_similarity": 0.82,
                "pantry_match": 0.67,
                "expiry_urgency": 0.91,
                "preferred_cuisine_match": 1.0
            }
        },
    ]
    """
    recipe_ids = filtered_recipes_and_features["recipes"]
    pantry_match_scores = filtered_recipes_and_features["pantry_match_scores"]
    raw_expiry_scores = filtered_recipes_and_features["expiry_status"]

    # Expiry boosts are not constrained to [0,1] so min-max normalize them:
    normalized_expiry = min_max_normalize([float(score) for score in raw_expiry_scores])
    pref_cuisine_set = set(recipes_of_pref_cuisine)

    payload = []
    for recipe_id, pantry_score, expiry_score in zip(
        recipe_ids,
        pantry_match_scores,
        normalized_expiry,
    ):
        payload.append({
            "recipe_id": recipe_id,
            "scores": {
                "embedding_similarity": round(float(embedding_scores.get(recipe_id, 0.0)), 4),
                "pantry_match": round(float(pantry_score), 4),
                "expiry_urgency": round(float(expiry_score), 4),
                "preferred_cuisine_match": 1.0 if recipe_id in pref_cuisine_set else 0.0,
            }
        })

    return payload


def rank_candidates(normalized_feature_payload: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Takes as input already-normalized feature scores and returns ranked JSON-friendly output."""
    ranked_results = []

    for recipe_entry in normalized_feature_payload:
        recipe_id = recipe_entry["recipe_id"]
        scores = recipe_entry["scores"]

        features = [
            scores["embedding_similarity"],
            scores["pantry_match"],
            scores["expiry_urgency"],
            scores["preferred_cuisine_match"],
        ]

        overall_score = dot(to_float32(list(weights.values())), to_float32(features)).item()
        ranked_results.append({
            "recipe_id": recipe_id,
            "scores": scores,
            "overall_score": round(float(overall_score), 4),
        })

    ranked_results.sort(key=lambda x: x["overall_score"], reverse=True)
    return ranked_results


def get_candidates(request: RecommendationRequest, db: Depends):
    itemids = []
    restrictions = request.restrictions
    pantry_ingredients = {}

    for item in request.pantry_items:
        itemids.append(item.id)
        date_obj = item.date_opened if item.date_opened else item.date_purchased

        pantry_ingredients[item.id] = {
            "near_expire": (date_obj + datetime.timedelta(days=item.storage_option.min_days)).isoformat(),
            "hard_expire": (date_obj + datetime.timedelta(days=item.storage_option.max_days)).isoformat(),
        }

    query = text("""
            SELECT *
            FROM filter_candidates(:pantry_ingredients, :itemids, :meal_type, :match_thresh, :restrictions)
        """).bindparams(
            bindparam("pantry_ingredients", type_=JSONB),
            bindparam("restrictions", type_=ARRAY(BigInteger)),
        )

    candidates = db.execute(
        query,
        {"pantry_ingredients": pantry_ingredients,
            "itemids": itemids,
            "meal_type": request.meal_type,
            "match_thresh": matching_ingred_thresh,
            "restrictions": restrictions,
        },
    ).fetchall()

    recipes, pantry_match_scores, expiry_scores = [], [], []
    for row in candidates:
        recipe_id, ingredient_perc_matching, expired_boost = row
        recipes.append(recipe_id)
        pantry_match_scores.append(float(ingredient_perc_matching))
        expiry_scores.append(float(expired_boost))

    return {
        "recipes": recipes,
        "pantry_match_scores": pantry_match_scores,
        "expiry_status": expiry_scores,
    }

def associate_recipe_metadata(top_ranked_payload: List[Dict[str, Any]], recipeids: List[int], db: Depends):
    recipe_ids = [recipe['recipe_id'] for recipe in top_ranked_payload]
    get_recipe_meta = text("""
                        SELECT r.recipeid, r.recipename, r.link, r.image_link, ct.name
                           FROM recipe r
                           JOIN recipecuisinetype rct 
                                ON r.recipeid = rct.recipeid
                           JOIN cuisinetype ct 
                                ON rct.cuisineid = ct.cuisinetypeid 
                           WHERE r.recipeid = ANY(:recipeids)
                    """)
    rows = db.execute(get_recipe_meta, {'recipeids': recipe_ids}).fetchall()
    
    recipes_to_metadata = { int(row[0]) : {'recipename': row[1], 'link': row[2], 'image_link': row[3], 'cuisine': row[4]} 
                           for row in rows}
    for payload in top_ranked_payload:
        metadata = recipes_to_metadata[payload['recipe_id']]
        payload.update(metadata)
    return top_ranked_payload
    
@recipe_router.post("/recommend", tags=["recommender"])
async def get_top_recipes(request: RecommendationRequest, db=Depends(get_db)):
    filtered_recipes_and_features = get_candidates(request, db)

    if not filtered_recipes_and_features["recipes"]:
        return []

    fetch_candidate_embeds = text("""
            SELECT id, embedding
            FROM recipe_embeddings
            WHERE id = ANY(:recipeids)
        """).bindparams(bindparam("recipeids", type_=ARRAY(BigInteger))).columns(id=BigInteger, embedding=Vector(384))

    candidate_rows = db.execute(
        fetch_candidate_embeds,
        {"recipeids": filtered_recipes_and_features["recipes"]}
        ).fetchall()
    
    candidates_embeddings = [(row[0], row[1]) for row in candidate_rows]

    get_previously_chosen = text("""
            SELECT re.embedding
            FROM user_liked_recipe ulr
            INNER JOIN recipe_embeddings re
                ON ulr.recipe_id = re.id
            WHERE ulr.user_id = :user
            ORDER BY ulr.liked_at DESC
            LIMIT :past_limit
        """).columns(embedding=Vector(384))

    history_rows = db.execute(
            get_previously_chosen,
            {"user": request.user_id, "past_limit": recently_chosen_limit}
            ).fetchall()
    user_history = [row[0] for row in history_rows]

    get_cuisines = text("""
            SELECT DISTINCT recipeid
            FROM recipecuisinetype
            WHERE recipeid = ANY(:recipeids)
            AND cuisineid = ANY(:preferred_cuisines)
        """)

    rows = db.execute(get_cuisines, {"recipeids": filtered_recipes_and_features["recipes"],
                                     "preferred_cuisines": request.preferred_cuisines}).fetchall()
    
    recipes_of_pref_cuisine = [row[0] for row in rows]

    embedding_scores = compute_normalized_embedding_scores(
        candidates_embeddings=candidates_embeddings,
        user_history=user_history,
        top_k=top_k,
    )

    normalized_feature_payload = build_normalized_features(
        filtered_recipes_and_features=filtered_recipes_and_features,
        embedding_scores=embedding_scores,
        recipes_of_pref_cuisine=recipes_of_pref_cuisine,
    )

    ranked = rank_candidates(normalized_feature_payload)
    top_ranked = ranked[:request.limit]
    return associate_recipe_metadata(top_ranked, recipes_of_pref_cuisine, db)
