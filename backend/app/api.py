import os

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from format_results import format_items

username = os.getenv('USERNAME', default='postgres') 
ps_password = os.getenv('PS_PASSWORD', default='password')
port = 5432 

DATABASE_URL = f'postgresql://{username}:{ps_password}@localhost:{port}/foodfinder'

engine = create_engine(DATABASE_URL, pool_size=10, max_overflow=20)
Session = sessionmaker(autocommit=False, autoflush=True, bind=engine)

app = FastAPI()

# Allows calls from:
origins = ["http://localhost:8081"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


def get_db():
    db = Session()
    try:
        yield db  
    finally:
        db.close() 

todos = [
    {
        "id": "1",
        "item": "Get Omomo."
    },
    {
        "id": "2",
        "item": "Skip 125."
    },
]

def format_item_results(rows: list[sqlalchemy.engine.Row]):
    """Formats & deduplicates ingredient names/keywords returned by a keyword-search query"""
    ingredients_to_keywords = {}
    # Group ingredients with the same name together
    for row in rows:
        d = row._asdict()
        name = d["name"].lower()
        ing_id = int(d["id"])
        ing_keywords = d["keywords"] or []
        ingredients_to_keywords[name][ing_id] = list(ing_keywords)

    return format_items(ingredients_to_keywords)

# It's a POST request since we're just checking if item is valid
# Returns a list of results sized based on how many items are queried from the keywords
@app.post("/search", tags=["pantry"])
async def search_item(item: str, db = Depends(get_db)) -> dict:
	# Check from postgres side to make sure it's a real item
    # This will return two different types of jsons, error or good

    # They choose which actual item they want from the frontend, from there, item id is passed back to
    # the backend and then we get the right item for them
    query = """
    SELECT id, name, keywords
    FROM ingredient 
    WHERE keywords @> ARRAY[:item];
    """

    results = db.execute(query, {"item": item}).fetchall()
    print(f'Result: {results}')

    if not results:
        return { "status" : "err"}
    
    formatted = format_item_results(results)
    return {"status": "ok", "results": formatted}


# SQL LITE Database:

# Food Item Table:
# varchar broad_category
# varchar subcategory
# enum storage
# int min_days
# int max_days
# varchar name
# int FoodId (pk)

# (These are updated when user adds item or updates quantity)
# int quantity
# date purchased
# date opened


# POPULATES FROM POSTGRESQL:
# Ingredient (from USDA):
# * id (int), pk
# * category_id (int), fk
# * name (str)
# * keywords (TEXT[])    

# ShelfLives (per Ingredient):
# * id (int), pk
# * storage (varchar) enum
# * state (varchar) enum
# * min_days (int)
# * max_days (int)
# * source (varchar)

# Categories (from USDA):
# * id (int), pk
# * broad_category (varchar) 
# * subcategory (varchar)

@app.get("/add_item", tags=["pantry"])
async def add_item_to_pantry_list(food_id: str, db = Depends(get_db)) -> dict:


    query = """
        SELECT name, i.id, broad_category, storage, min_days, max_days 
        FROM ingredient as i 
        JOIN categories as c on c.id = i.id 
        JOIN shelflives as sl on sl.fk_id = i.id  
        where i.id = :id;
    """

    results = db.execute(query, {"id": food_id}).fetchall


    print(f'Results: {results}')

    return {}


@app.get("/todo", tags=["todos"])
async def get_todos() -> dict:
    return { "data": todos }


@app.get("/", tags=["root"])
async def read_root() -> dict:
    return {"message": "Omomo"}