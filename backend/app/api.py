import os

import sqlalchemy
from fastapi import Body, Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import ARRAY, String, bindparam, create_engine, text
from sqlalchemy.orm import sessionmaker

from format_results import *


class SearchSchema(BaseModel):
    item: str
    

username = os.getenv('USERNAME', default='postgres') 
ps_password = os.getenv('PS_PASSWORD', default='password')
port = 5432 

# DATABASE_URL = f'postgresql://{username}:{ps_password}@localhost:{port}/foodfinder'
DATABASE_URL = f'postgresql://postgres:password@localhost:{port}/omomo'


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


# It's a POST request since we're just checking if item is valid
# Returns a list of results sized based on how many items are queried from the keywords
@app.post("/search", tags=["pantry"])
async def search_item(data: SearchSchema, db = Depends(get_db)) -> dict:
    query = text("""
    SELECT id, name, keywords
    FROM ingredient 
    WHERE keywords @> :item;
    """)
    
    item_list = data.item.split()
    item_list = [word.lower() for word in item_list]

    print(item_list)
    results = db.execute(query, {"item": item_list}).fetchall()
    print(f'Result: {results}')

    if not results:
        return { "status" : "err"}
    
    formatted = format_items(format_item_results(results))
    print(formatted)
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
async def add_item_to_pantry_list(food_id: int, db = Depends(get_db)) -> dict:


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


@app.get("/", tags=["root"])
async def read_root() -> dict:
    return {"message": "Omomo"}