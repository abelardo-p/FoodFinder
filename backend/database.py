import sqlite3

SQLITE_PATH = "local_session.db"

# connection.execute("DROP TABLE userSession")


# Schemas Defined:
"""
To get all items in pantry, get all rows in this table

Item Table:
varchar FoodType
varchar ShelfLife
enum StorageMode
int Quantity
varchar CanonicalName
Boolean? Low Stock Threshold
...anymore fields?
int FoodId*


From PostgresSQL:
USDA:
int FoodID*
varchar FoodName
varchar? Keywords
varchar? Name_Subtitle

How should we store recipes in the database? Espically when some data types are array of strings.
Recipes:
varchar? NER*
varchar? Ingredient List*
varchar? Directions*
varchar Link
Image?
int RecipeID*

Foods_In_Recipes:
int FoodID*
int RecipeID*
(March between NER and FoodName/Keywords/Name_Subtitle?) // Talk about this more

When user does a search, join USDA and Foods_In_recipes?

Category Table:
varchar FoodType
int FoodTypeID (Foreign Key)*

Storage Table:
varchar StorageType
varchar FoodType
int FoodTypeID (Foreign Key)*


Shelf Life Table:
varchar ShelfLife
FoodTypeID (Foreign Key)*

"""

def init_sqlite():
    
    conn = sqlite3.connect(SQLITE_PATH)
    cursor = conn.cursor()
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS userSession (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT UNIQUE NOT NULL,
            user_id TEXT NOT NULL,
            data TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            expires_at TIMESTAMP
        )
    """)
    
    conn.commit()
    conn.close()

@contextmanager
def get_sqlite():
    """Automatic connection to sql database for each function that calls this"""
    conn = sqlite3.connect(SQLITE_PATH)
    conn.row_factory = sqlite3.Row # instead of accessing columns by index, you can access them by name like a python dict
    try:
        yield conn # opens a connection to whoever called this
    finally:
        conn.close() # always close the connection once it's done