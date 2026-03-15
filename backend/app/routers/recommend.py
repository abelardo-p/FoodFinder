import json
from datetime import datetime
from fastapi import FastAPI, Body, Depends, HTTPException, APIRouter
from pydantic import BaseModel
from backend.app.models import RecommendationRequest
from backend.app.database import get_db
from sqlalchemy import text, bindparam, BigInteger
from sqlalchemy.dialects.postgresql import ARRAY

recipe_router = APIRouter()

# (start time, end time, meal_type id)
MEAL_RANGES = [
    (5, 10, 4),   # breakfast
    (10, 12, 5),  # brunch
    (12, 15, 1),  # lunch
    (15, 18, 3),  # snack
    (18, 24, 2),  # dinner
    (0, 5, 3)     # late snack
]

def get_time_of_day():
    hour = datetime.now().hour
    for start, end, mealtypeid in MEAL_RANGES:
        if start <= hour < end:
            return mealtypeid
        
matching_ingred_thresh: float = 0.05

@recipe_router.post("/recommend/{limit}", tags=["recommender"])
async def get_top_recipes(request: RecommendationRequest, limit: int = 10, 
                          db = Depends(get_db)):
    """
    Input: 'snapshot' of the pantry and user preferences/restrictions 
    Result: Retrieves the top <limit> recipes
    """

    meal_type = get_time_of_day()
    itemids = [item.id for item in request.pantry_items]
    restrictions = request.restrictions
    query = text("""
                WITH recipe_matches AS (
                    SELECT
                        ri.recipeid,
                        COUNT(*) FILTER (WHERE ri.ingredientid = ANY(:itemids))::float
                            / COUNT(*) AS perc_matching
                    FROM recipeingredients ri
                    GROUP BY ri.recipeid
                )
                SELECT rm.recipeid, rm.perc_matching
                FROM recipe_matches rm
                INNER JOIN recipemealtype rmt
                    ON rm.recipeid = rmt.recipeid
                WHERE rmt.mealtypeid = :meal_type
                AND rm.perc_matching >= :match_thresh
                AND (
                        SELECT COALESCE(ARRAY_AGG(DISTINCT rrt.healthlabelid), '{}')
                        FROM reciperestrictiontype rrt
                        WHERE rrt.recipeid = rm.recipeid
                    ) @> :restrictions
            """).bindparams(
                    bindparam("restrictions", type_=ARRAY(BigInteger))
                )
    
    candidates = db.execute(query, {"itemids": itemids, 
                       "meal_type": meal_type, 
                       "match_thresh": matching_ingred_thresh, 
                       "restrictions": restrictions}).fetchall()
    
    recipes = []
    pantry_match_scores = []
    for recipe_id, ingredient_perc_matching in candidates:
        recipes.append(recipe_id)
        pantry_match_scores.append(ingredient_perc_matching)
    
    return {"recipes": recipes, "scores": pantry_match_scores}
    

