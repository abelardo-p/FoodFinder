from collections import defaultdict

import sqlalchemy
from krovetzstemmer import Stemmer

ks = Stemmer()

def format_items(ingredients_to_keywords: dict[str, dict[int, list[str]]]):
    """For each ingredient name-group: remove name tokens; hide group-common tokens; keep remaining as display keywords."""
    for name, id_to_kwlist in ingredients_to_keywords.items():
        name_tokens = {ks.stem(tok) for tok in name.split()}

        processed = {}
        all_sets = []
        for ing_id, kw_list in id_to_kwlist.items():
            s = set()
            for kw in kw_list:
                kw_s = ks.stem(str(kw).lower())
                if kw_s == name:
                    continue
                if kw_s in name_tokens:
                    continue
                s.add(kw_s)
            processed[ing_id] = s
            all_sets.append(s)

        common = set.intersection(*all_sets) if all_sets else set()

        for ing_id in processed:
            ingredients_to_keywords[name][ing_id] = processed[ing_id] - common

    return ingredients_to_keywords

def format_item_results(rows: list[sqlalchemy.engine.Row]):
    """Formats & deduplicates ingredient names/keywords returned by a keyword-search query"""
    ingredients_to_keywords = defaultdict(dict)
    # Group ingredients with the same name together
    for row in rows:
        d = row._asdict()
        name = d["name"].lower()
        ing_id = int(d["id"])
        ing_keywords = d["keywords"] or []

        if name not in ingredients_to_keywords:
            ingredients_to_keywords[name] = {}

        ingredients_to_keywords[name][ing_id] = list(ing_keywords)

    return format_items(ingredients_to_keywords)

def format_single_item_returned_from_id(rows: list[sqlalchemy.engine.Row]):
    """Since postgres returns a list of tuples of each row, we format it so that id is key, and 
    rest of attributes is a list of are values."""
    """
    [
    ('Chicken', 517, 'Deli & Prepared Foods', 'FREEZER', 30, 60),
    ('Chicken', 517, 'Deli & Prepared Foods', 'FRIDGE', 3, 5),
    ('Chicken', 517, 'Deli & Prepared Foods', 'FRIDGE', 14, 14)
    ]
    into this:
    {
    517: {
            'name': 'Chicken',
            'category': 'Deli & Prepared Foods',
            'storage': [
            {'storage': 'FREEZER', 'min_days': 30, 'max_days': 60},
            {'storage': 'FRIDGE', 'min_days': 3, 'max_days': 5},
            {'storage': 'FRIDGE', 'min_days': 14, 'max_days': 14}
            ]
        }
    }
    """

    foodItem = {}
    
    for name, id, category, storage, min_days, max_days in rows:
        if id not in foodItem:
            foodItem[id] = {
                'name': name,
                'category': category,
                'storage_type': []
            }
        
        foodItem[id]['storage_type'].append({
            'storage': storage,
            'min_days': min_days,
            'max_days': max_days
        })
    
    return foodItem

def convert_sets_to_lists(data):
    """Convert all sets in nested dict to lists"""
    result = {}
    for key, value in data.items():
        result[key] = {item_id: list(keywords) for item_id, keywords in value.items()}
    return result


def extract_general(data: dict) -> dict:
    general = {}
    cleaned = {}
    
    for category, items in data.items():
        cleaned_items = {}
        for key, tags in items.items():
            if not tags:
                general[key] = [category]
            else:
                cleaned_items[key] = tags
        if cleaned_items:
            cleaned[category] = cleaned_items
    
    cleaned["_general"] = general
    return cleaned

