import pandas as pd
from sqlalchemy import create_engine
import os
from pathlib import Path
from ast import literal_eval

def load_datasets(csv_files_path: str, table_name: str, load_mode: str, username: str, port: int):

    def populate_table():
        """Loads/populates a table to postgres"""
        if table_name == 'ingredient':
            df['keywords'] = df['keywords'].apply(literal_eval)

        ps_password = os.getenv('PS_PASSWORD')
        db_connection_string = f'postgresql://{username}:{ps_password}@localhost:{port}/foodfinder'
        engine = create_engine(db_connection_string)

        df.to_sql(
            table_name,
            con=engine,
            if_exists=load_mode, # Options: 'replace', 'append', 'fail'
            index=False          
        )
        print(f"Data successfully loaded into table {table_name}.")

    csv_files_path = Path(csv_files_path)
    if not csv_files_path.is_dir():
        df = pd.read_csv(csv_files_path)
        df.columns = df.columns.str.lower()
        populate_table()
        return
    
    for path in csv_files_path.iterdir():
        df = pd.read_csv(path)
        df.columns = df.columns.str.lower()
        populate_table()

def load_all(username: str, port: int, load_mode: str = 'append'):
    table_names = ['categories', 'ingredient', 'shelflives', 'recipe', 'recipeingredients']
    csv_paths = ['../data/ingredients/categories_ids_mapping', '../data/ingredients/foodkeeper_items.csv', 
                 '../data/ingredients/shelf_lives.csv', '../data/recipes', '../data/recipe_ingredients']

    for i in range(len(table_names)):
        load_datasets(csv_paths[i], table_names[i], load_mode, username, port)
    

if __name__ == '__main__':
    table_name = 'shelflives'
    csv_path = '../data/ingredients/shelf_lives.csv'
    username = 'anikaraghavan'
    load_mode = 'append'
    port = 5432

    load_datasets(csv_path, table_name, load_mode, username, port)

   
