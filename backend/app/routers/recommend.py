import datetime
from fastapi import Depends, APIRouter
from backend.app.models import RecommendationRequest
from backend.app.database import get_db
from sqlalchemy import text, bindparam, BigInteger
from sqlalchemy.dialects.postgresql import ARRAY, JSONB

recipe_router = APIRouter()
filter_procedure_name = 'filter_candidates'

# (start time, end time, meal_type id)
MEAL_RANGES = [
    (5, 10, 4),   # breakfast
    (10, 12, 5),  # brunch
    (12, 15, 1),  # lunch
    (15, 18, 3),  # snack
    (18, 24, 2),  # dinner
    (0, 5, 3)     # (late) snack
]

def get_time_of_day():
    hour = datetime.datetime.now().hour
    for start, end, mealtypeid in MEAL_RANGES:
        if start <= hour < end:
            return mealtypeid
        
matching_ingred_thresh: float = 0.40

@recipe_router.post("/recommend/{limit}", tags=["recommender"])
async def get_top_recipes(request: RecommendationRequest, limit: int = 10, meal_type: int = get_time_of_day(),
                          db = Depends(get_db)):
    """
    Input: 'snapshot' of the pantry and user preferences/restrictions 
    Result: Retrieves the top <limit> recipes
    """
    if not meal_type: 
        meal_type = get_time_of_day()

    itemids = []
    restrictions = request.restrictions
    pantry_ingredients = {}
    for item in request.pantry_items:
        itemids.append(item.id)
        date_obj = item.date_opened if item.date_opened else item.date_purchased
        pantry_ingredients[item.id] = {}
        pantry_ingredients[item.id]['near_expire'] = (date_obj + datetime.timedelta(days=item.storage_option.min_days)).isoformat()
        pantry_ingredients[item.id]['hard_expire'] = (date_obj + datetime.timedelta(days=item.storage_option.max_days)).isoformat()

    query = text("""
            SELECT * 
            FROM filter_candidates(:pantry_ingredients, :itemids, :meal_type, :match_thresh, :restrictions)
            """).bindparams(bindparam("pantry_ingredients", type_=JSONB),
                            bindparam("restrictions", type_=ARRAY(BigInteger)))
    
    candidates = db.execute(query, {
                    "pantry_ingredients": pantry_ingredients,
                    "itemids": itemids, 
                    "meal_type": meal_type, 
                    "match_thresh": matching_ingred_thresh, 
                    "restrictions": restrictions}).fetchall()

    recipes = []
    pantry_match_scores = []
    expiry_scores = []
    for row in candidates:
        recipe_id, ingredient_perc_matching, expired_boost = row
        recipes.append(recipe_id)
        pantry_match_scores.append(ingredient_perc_matching)
        expiry_scores.append(expired_boost)
    
    return {"recipes": recipes, "ingredient_match_scores": pantry_match_scores, "expiry_status": expiry_scores}
    

