import json
import os

import sqlalchemy
from app.format_results import *
from fastapi import Body, Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import ARRAY, String, bindparam, create_engine, text
from sqlalchemy.orm import sessionmaker


class SearchSchema(BaseModel):
    item: str

username = os.getenv('USERNAME', default='postgres') 
ps_password = os.getenv('PS_PASSWORD', default='password')
database = os.getenv('DATABASE', default='omomo')
port = 5432 

# DATABASE_URL = f'postgresql://{username}:{ps_password}@localhost:{port}/{database}'
DATABASE_URL = f'postgresql://postgres:password@localhost:{port}/omomo'


engine = create_engine(DATABASE_URL, pool_size=10, max_overflow=20)
Session = sessionmaker(autocommit=False, autoflush=True, bind=engine)

app = FastAPI()

# Allows calls from:
origins = ["*"]

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


@app.post("/search", tags=["pantry"])
async def search_item(data: SearchSchema, db = Depends(get_db)) -> dict:
    """Returns a list of results sized based on how many items are queried from the keywords"""
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
    
    formatted = extract_general(convert_sets_to_lists(format_item_results(results)))
    json_string = json.dumps(formatted)
    print(json_string)
    return {"status": "ok", "results": json_string}


@app.get("/add_item", tags=["pantry"])
async def add_item_to_pantry_list(food_id: int, db = Depends(get_db)) -> dict:
    """Retrieves all the necessary item information to add 
    an item to the pantry list, including name, category, 
    and storage info (storage type, min/max days) based on the food ID."""

    query = text("""
        SELECT name, i.id, broad_category, storage, min_days, max_days 
        FROM ingredient as i 
        JOIN categories as c on c.id = i.category_id 
        JOIN shelflives as sl on sl.fk_id = i.id 
        WHERE i.id = :id;
    """)

    results = db.execute(query, {"id": food_id}).fetchall()
    
    formatted_results = format_single_item_returned_from_id(results)
    

    json_string = json.dumps(formatted_results)
    print(f'Results: {json_string}')
    
    return {"status": "ok", "results": json_string}


@app.get("/", tags=["root"])
async def read_root() -> dict:
    return {"message": "Omomo"}