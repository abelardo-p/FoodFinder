from pydantic import BaseModel
from datetime import date
from typing import List
from enum import Enum

""" (Input format for /recommend input)
User “Snapshot” (RecommendationRequest model):
{
"pantry_items": [
{
"id": 12,
"name": "milk",
"date_purchased": "03/10/2026",
"date_opened": "03/10/2026", 
"storage_option": StorageOption{“state”: “open”, ”storage": "fridge", "min_days": 5, "max_days": 7}
}
],
"allergies": ["peanut"],
"preferred_cuisines": ["indian"]
}
"""
class StorageType(str, Enum):
    fridge = "FRIDGE"
    freezer = "FREEZER"
    pantry = "PANTRY"

class StorageOption(BaseModel):
    state: str   
    storage: StorageType | None
    min_days: int
    max_days: int

class PantryItem(BaseModel):
    id : int
    name: str
    date_purchased: date
    date_opened : date | None = None
    storage_option: StorageOption | None

class RecommendationRequest(BaseModel):
    pantry_items: List[PantryItem]
    # restrictions and preferred_cuisines should take in IDs (ints) for more efficient querying (less joins)
    restrictions: List[int]             
    preferred_cuisines: List[int]



