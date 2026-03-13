import os
import csv
import re
from collections import defaultdict
from sentence_transformers import SentenceTransformer, util
from data.recipe_category_overrides import OVERRIDES, CATEGORY_DESCRIPTIONS

def map_ingredient_ids_to_names(recipe_to_ingredients: dict, ingredients_path: str) -> None:
    """
    Takes as input: 
        dict[int, list[int]] mapping recipe_id -> list(ingredient_ids)

    Maps each ingredient_id to its corresponding name. 
    """
    ids_to_names = {}
    with open(ingredients_path, "r", newline="", encoding="utf-8") as f:
        reader = csv.reader(f)
        _ = next(reader, None)
        
        for row in reader:
            if not row:
                continue
            try:
                id = int(row[0])
                name = row[2]
                ids_to_names[id] = name
            except ValueError:
                # skip malformed rows
                continue
    
    for recipe_id in recipe_to_ingredients:
        ingredients = recipe_to_ingredients[recipe_id]
        names = []
        for id in ingredients:
            names.append(ids_to_names[id])
        recipe_to_ingredients[recipe_id] = names
    

def build_recipe_ingredient_map(recep_to_ingred_directory_path: str, ingredients_path: str):
    """
    Reads all files in directory containing:
        RecipeID,IngredientID
    Returns:
        dict[int, list[int]] mapping recipe_id -> list(ingredient_ids)
    """
    recipe_to_ingredients = defaultdict(list)

    for filename in os.listdir(recep_to_ingred_directory_path):

        filepath = os.path.join(recep_to_ingred_directory_path, filename)
        with open(filepath, "r", newline="", encoding="utf-8") as f:
            reader = csv.reader(f)
            # skip header
            header = next(reader, None)

            for row in reader:
                if not row:
                    continue
                try:
                    recipe_id = int(row[0])
                    ingredient_id = int(row[1])
                    recipe_to_ingredients[recipe_id].append(ingredient_id)
                except ValueError:
                    # skip malformed rows
                    continue

    map_ingredient_ids_to_names(recipe_to_ingredients, ingredients_path)
    return recipe_to_ingredients

def contains_override(title: str, override_terms: list[str]) -> bool:
    title = title.lower()

    for term in override_terms:
        # escape special chars in term
        pattern = r"\b" + re.escape(term.lower()) + r"\b"
        if re.search(pattern, title):
            return True

    return False

NUM_KEPT_INGREDIENTS = 8    # max number of recipe ingredients to encode in the recipe embedding
SIM_THRESH = 0.05

def clean_name():
    """Cleans a recipe title so it only contains ingredient-relevant information"""

def categorize_recipes(recipes_directory_path: str, recipe_to_ingredients: dict, embed_model: SentenceTransformer):
    """
    Classifies each recipe as one of {breakfast, lunch, dinner, dessert, side}. 
    * Can include a secondary category if scores are similar enough for two categories
    """
    category_embed_strs = {
        category: f"{CATEGORY_DESCRIPTIONS[category]} {', '.join(OVERRIDES[category])}"
        for category in OVERRIDES
    }
    category_embeddings = {
        category : embed_model.encode(category_embed_strs[category])
        for category in OVERRIDES
    }
    
    recipe_to_cat = defaultdict(str)
    for i, filename in enumerate(os.listdir(recipes_directory_path)):

        filepath = os.path.join(recipes_directory_path, filename)
        with open(filepath, "r", newline="", encoding="utf-8") as f:
            reader = csv.reader(f)
            _ = next(reader, None)
            # For each recipe:
            for row in reader:
                if not row:
                    continue
                id = int(row[0])
                title = row[1] # TODO: CLEAN THE NAME (for ex: get rid of captions in parenthesis conditionally)

                primary_category = None
                secondary_category = None

                for category in OVERRIDES:
                    if contains_override(title, OVERRIDES[category]):
                        primary_category = category
                        break

                if not primary_category:
                    ingredients = recipe_to_ingredients[id][:NUM_KEPT_INGREDIENTS]
                    embed_str = f"{title}. Ingredients: {', '.join(ing.lower() for ing in ingredients)}"

                    recipe_embedded = embed_model.encode(embed_str)
                    sim_scores = {
                        category : util.cos_sim(recipe_embedded, category_embeddings[category].item()) 
                        for category in category_embeddings}
                    sim_scores = sorted(sim_scores.items(), key=lambda pair : pair[1], reverse=True)

                    if abs(sim_scores[0][1] - sim_scores[1][1]) <= SIM_THRESH:
                        secondary_category = sim_scores[1][0]

                    primary_category = sim_scores[0][0]

                recipe_to_cat[id] = [primary_category, secondary_category]

            os.makedirs("recipe_meal_categories", exist_ok=True)
            with open(f"data/recipe_meal_categories/{i}.csv", "w", newline="", encoding="utf-8") as output_file:
                writer = csv.writer(output_file)
                writer.writerow(["RecipeID", "PrimaryCategory", "SecondaryCategory"])
                for rid, (primary, secondary) in recipe_to_cat.items():
                    writer.writerow([rid, primary, secondary])

            recipe_to_cat.clear()


if __name__ == '__main__':
    recipes_to_ingredients = build_recipe_ingredient_map (
                                recep_to_ingred_directory_path='data/recipe_ingredients',
                                ingredients_path='data/ingredients/foodkeeper_items.csv')
    
    embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
    categorize_recipes(recipes_directory_path='data/recipes',
                        recipe_to_ingredients=recipes_to_ingredients,
                        embed_model=embedding_model)


 