import pandas as pd 
import json
from pathlib import Path
from get_shelf_life import extract_shelf_life_rows

INGREDIENTS_USDA_PATH = '../data/source/foodkeeper.json'
ITEMS_OUT_PATH = '../data/ingredients/foodkeeper_items.csv'
SHELF_LIFE_PATH = '../data/ingredients/shelf_lives.csv'
CATEGORIES_TO_IDS_PATH = '../data/ingredients/categories_ids_mapping.csv'

def normalize_foodkeeper_data(raw_json):
    """Converts weird format of an ingredient in the input data file to a dict where keys are attributes
    Returns a list of dicts (1 dict per ingredient)"""
    normalized = []
    for ingredient_row in raw_json["data"]:
        merged = {}
        for item in ingredient_row:
            merged.update(item)   
        normalized.append(merged)

    return normalized

def build_ingredient_catalog(inventory: dict, stopwords: set[str]):
    ingredients = normalize_foodkeeper_data(inventory)
    ingredient_catalog = pd.DataFrame(columns=['id', 'category_id', 'name', 'keywords'])
    shelf_life_rules = []
    
    for ingredient in ingredients:
        fk_id = int(ingredient['ID'])
        category_id = int(ingredient['Category_ID'])
        name = ingredient['Name']
        keywords_str = ingredient['Keywords']
        if keywords_str:
            keywords = [word.strip().lower() for word in keywords_str.split(',')]
            keywords = [word for word in keywords if word not in stopwords]
        else:
            keywords = []

        row_data = [fk_id, category_id, name, keywords]
        ingredient_catalog.loc[len(ingredient_catalog)] = row_data

        ingredient_shelf_lives = extract_shelf_life_rows(ingredient)
        shelf_life_rules.append(ingredient_shelf_lives)

        shelf_lives_df = pd.DataFrame(shelf_life_rules)

    return ingredient_catalog, shelf_lives_df

def map_category_ids(categories: dict):
    table_of_categories = pd.DataFrame(columns=['id', 'broad_category', 'subcategory'])
    categories = categories['data']
    for category_lst in categories:
        row = []
        row.append(category_lst[0]['ID'])
        row.append(category_lst[1]['Category_Name'])
        row.append(category_lst[2]['Subcategory_Name']) # PRIMARY key for categories
        table_of_categories.loc[len(table_of_categories)] = row
    
    return table_of_categories


if __name__ == '__main__':
    with open(INGREDIENTS_USDA_PATH, 'r', encoding='utf-8') as f:
        file_dict = json.load(f)
        categories = file_dict['sheets'][1]
        inventory = file_dict['sheets'][2]
        stopwords = set()

        cats_to_ids = map_category_ids(categories)
        ingredient_catalog, shelf_lives = build_ingredient_catalog(inventory, stopwords)
        ingredient_catalog.to_csv(ITEMS_OUT_PATH, index=False)
        shelf_lives.to_csv(SHELF_LIFE_PATH, index=False)
        cats_to_ids.to_csv(CATEGORIES_TO_IDS_PATH, index=False)

