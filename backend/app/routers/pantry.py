import json
from backend.app.database import get_db
from backend.app.format_results import *
from fastapi import FastAPI, Body, Depends, HTTPException, APIRouter
from pydantic import BaseModel
from sqlalchemy import ARRAY, String, bindparam, create_engine, text

pantry_router = APIRouter()


@pantry_router.get("/search/{data}", tags=["pantry"])
async def search_item(data: str, db = Depends(get_db)) -> dict:
    """Returns a list of results sized based on how many items are queried from the keywords"""
    query = text("""
    SELECT id, name, keywords
    FROM ingredient 
    WHERE keywords @> :item;
    """)
    
    item_list = data.split()
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


@pantry_router.get("/add_item", tags=["pantry"])
async def add_item_to_pantry_list(food_id: int, db = Depends(get_db)) -> dict:
    """Retrieves all the necessary item information to add 
    an item to the pantry list, including name, category, 
    and storage info (storage type, min/max days) based on the food ID."""

    query = text("""
        SELECT name, i.id, broad_category, storage, state, min_days, max_days 
        FROM ingredient as i 
        JOIN categories as c on c.id = i.category_id 
        JOIN shelflives as sl on sl.fk_id = i.id 
        WHERE i.id = :id;
    """)

    results = db.execute(query, {"id": food_id}).fetchall()
    
    formatted_results = format_single_item_returned_from_id(results)
    
    print(f'Results: {formatted_results}')
    return {"status": "ok", "results": formatted_results}


@pantry_router.get("/", tags=["root"])
async def read_root() -> dict:
    return {"message": "Omomo"}

