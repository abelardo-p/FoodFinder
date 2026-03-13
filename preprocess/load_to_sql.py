import pandas as pd
from sqlalchemy import create_engine
from sqlalchemy.engine import URL
import os
from pathlib import Path
from ast import literal_eval
from json import load

def insert_with_error_handling(table, conn, keys, data_iter):
    inserted = 0
    skipped = 0

    for row_num, row in enumerate(data_iter, start=1):
        row_dict = dict(zip(keys, row))
        try:
            with conn.begin_nested():
                conn.execute(table.table.insert(),[row_dict])
            inserted += 1
        except UnicodeEncodeError as e:
            skipped += 1
            print(f"Skipping row {row_num} due to UnicodeEncodeError: {e}")
        except Exception as e:
            skipped += 1
            print(f"Skipping row {row_num} due to unexpected error: {e}")

    print(f"Inserted {inserted} rows, skipped {skipped} rows.")

def load_datasets(csv_files_path: str, table_name: str, load_mode: str, username: str, port: int):

    def populate_table(df):
        if table_name == 'ingredient':
            df['keywords'] = df['keywords'].apply(literal_eval)

        ps_password = os.getenv('PS_PASSWORD')
        url = URL.create(
            "postgresql+psycopg2",
            username=username,
            password=ps_password,
            host="127.0.0.1",
            port=port,
            database="meta-foodfinder"
        )

        engine = create_engine(url)

        df.to_sql(
            table_name,
            con=engine,
            if_exists=load_mode,
            method=insert_with_error_handling,
            index=False
        )
        print(f"Finished loading data into table {table_name}.")

    csv_files_path = Path(csv_files_path)

    if not csv_files_path.is_dir():
        # For category types:
        if csv_files_path.glob("*.json"):
            with open(csv_files_path, 'r') as f:
                cats = load(f)
                df = pd.DataFrame(cats.items(), columns = ['name', 'cuisinetypeid'])
                print(df.head())
        else:
            df = pd.read_csv(csv_files_path, encoding="utf-8")
        df.columns = df.columns.str.lower()
        populate_table(df)
        return

    for path in sorted(csv_files_path.glob("*.csv")):
        df = pd.read_csv(path, encoding="utf-8")
        print("shape:", df.shape)
        print("columns:", list(df.columns))
        print(df.head())

        df.columns = df.columns.str.lower().str.strip()
        print("after cleanup:", list(df.columns))
        populate_table(df)

# May need to adjust table_names as schema evolves
def load_all(username: str, port: int, load_mode: str = 'append'):
    table_names = ['categories', 'ingredient', 'shelflives', 'recipe', 'recipeingredients']
    csv_paths = [
        '../data/ingredients/categories_ids_mapping',
        '../data/ingredients/foodkeeper_items.csv',
        '../data/ingredients/shelf_lives.csv',
        '../data/recipes',
        '../data/recipe_ingredients'
    ]

    for i in range(len(table_names)):
        load_datasets(csv_paths[i], table_names[i], load_mode, username, port)

if __name__ == '__main__':
    table_name = 'cuisinetype'
    csv_path = '/Users/anikaraghavan/Downloads/more_recipess/cuisines_to_ids.json'
    username = 'anikaraghavan'
    load_mode = 'append'
    port = 5432

    load_datasets(csv_path, table_name, load_mode, username, port)
