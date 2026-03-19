from datetime import datetime, timezone
from fastapi import Depends, APIRouter
from backend.app.models import RecipeSelection
from backend.app.database import get_db
from sqlalchemy import text, bindparam
from sqlalchemy.dialects.postgresql import TIMESTAMP

user_router = APIRouter()

@user_router.post("/add_user", tags=["users"])
async def add_new_user(db = Depends(get_db)) -> int:
    """Adds a new user to the db and returns its assigned ID"""

    query = text("""
        INSERT INTO users (id) VALUES (DEFAULT)
        RETURNING id
    """)
    result = db.execute(query).fetchone()
    db.commit()
    user_id = result[0]
    return user_id

@user_router.post("/select_recipe", tags=["users"])
async def select_recipe(selection: RecipeSelection, db = Depends(get_db)):
    """Adds a recipe selected by a user to their history of chosen recipes"""

    add_recipe = text("""
        INSERT INTO user_liked_recipe (user_id, recipe_id, liked_at)
        VALUES (:user_id, :recipe_id, :liked_at)
        ON CONFLICT (user_id, recipe_id) DO UPDATE SET liked_at = CURRENT_TIMESTAMP
    """).bindparams(bindparam("liked_at", type_= TIMESTAMP))
    
    db.execute(add_recipe, {"user_id": selection.user_id, 
                            "recipe_id": selection.recipe_id,
                            "liked_at": datetime.now(timezone.utc)}
            )
    db.commit()
    return {"status" : "ok"}