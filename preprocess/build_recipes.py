import pandas as pd
import ast
import json

DEBUG = False

ITEMS_OUT_PATH = '../data/foodkeeper_items.csv'
RECIPES_PATH = '/Users/anikaraghavan/Downloads/dataset/full_dataset.csv'
SIM_THRESH = 1.0
MATCHED_INGREDIENTS_THRESH = 7/9 # Defines what % of ingredient names in a recipe need to be matched to USDA ingredients for this recipe to 'count'

def get_mapping(ingredients_df: pd.DataFrame):
    itemid_to_keywords = {}
    itemid_to_name = {}
    for _, row in ingredients_df.iterrows():
        ingredient_id = row['id']  
        kws = row['keywords']    
        name = row['name'].strip().lower()
        ingredient_keywords = ast.literal_eval(kws) if isinstance(kws, str) else list(kws)
        itemid_to_name[ingredient_id] = name
        itemid_to_keywords[ingredient_id] = ingredient_keywords
    return itemid_to_keywords, itemid_to_name
    
def tokenize_name(name: str):
    return [word.strip().lower() for word in name.split()]
    
def compute_sim(name_tokens: list[str], keywords: list[str]) -> float:
    """Computes the overlap-coefficient similarity between these sets"""
    A, B = set(name_tokens), set(keywords)
    if not A or not B:
        return 0.0
    return len(A & B) / len(A)

def calc_max_sim_score(ingredient_name: str, ingredients_cache: dict[str, tuple], 
                       itemid_to_keywords: dict[int, list], itemid_to_name: dict[int, str]):
    if ingredient_name in ingredients_cache:
        return
    
    most_similar, max_score = None, 0.0
    for itemid in itemid_to_name:
        if ingredient_name == itemid_to_name[itemid]:
            most_similar = itemid
            max_score = 1.0

    if most_similar is None:
        name_tokens = tokenize_name(ingredient_name)
        for itemid, kws in itemid_to_keywords.items():
            sim_score = compute_sim(name_tokens, kws)
            if sim_score > max_score:
                max_score, most_similar = sim_score, itemid

    ingredients_cache[ingredient_name] = (most_similar, max_score)

    if DEBUG:
        print(f"ingredient name: {ingredient_name}. ",
              f"highest matched USDA ingredient : {itemid_to_name.get(most_similar, None)}. ", 
              f"similarity score : {max_score}.")


if __name__ == '__main__':
    # Mapping between NER ingredient name and its max sim. score with any of the canonical ingredients
    ingredients_cache = {}
    ingredients_df = pd.read_csv(ITEMS_OUT_PATH)
    # Extract only the columns needed from ingredients table (id, keywords)
    itemid_to_keywords, itemid_to_name = get_mapping(ingredients_df)
    recipe_ingredients = pd.DataFrame(columns=['RecipeID', 'IngredientID'])
    chunk_index = 0
    recipe_index = 0
    num_recipes_created = 0

    # Read dataset in chunks since it's very large
    for chunk in pd.read_csv(RECIPES_PATH, chunksize=50000):
        final_recipes = pd.DataFrame(columns=['RecipeID', 'RecipeName', 'Link'])
        recipe_ingredients = pd.DataFrame(columns=['RecipeID', 'IngredientID'])
        # For each recipe in this batch
        # if chunk_index < 8:
        #     chunk_index += 1
        #     continue
        for _, row in chunk.iterrows():
            recipe_id = recipe_index
            recipe_name = row['title']
            recipe_link = row['link']
            ner_terms = ast.literal_eval(row['NER'])
            if not ner_terms:
                continue
            matched_ingredients = []
            for ingredient_name in ner_terms:
                calc_max_sim_score(ingredient_name, ingredients_cache, itemid_to_keywords, itemid_to_name)
                most_similar_ingredient, max_score = ingredients_cache[ingredient_name]
                if max_score >= SIM_THRESH:
                    matched_ingredients.append((most_similar_ingredient, max_score))
            
            if len(matched_ingredients) / len(ner_terms) >= MATCHED_INGREDIENTS_THRESH:
                # Add recipe
                num_recipes_created += 1
                recipe_index += 1
                final_recipes.loc[len(final_recipes)] = [recipe_id, recipe_name, recipe_link]
                # Link NER ingredient with the canonical (USDA) ingredient
                for ingredient_id, _ in matched_ingredients:
                    recipe_ingredients.loc[len(recipe_ingredients)] = [recipe_id, ingredient_id]

        final_recipes.to_csv(f'../data/recipes/{chunk_index}.csv', index=False)
        recipe_ingredients.to_csv(f'../data/recipe_ingredients/{chunk_index}.csv', index=False)
        chunk_index += 1
    
    if DEBUG:
        with open('similarity_scores', 'w') as f:
            json.dump(ingredients_cache, f, indent=4)
            f.write(f"Total number of recipes successfuly created: {num_recipes_created}")
