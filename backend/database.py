import sqlite3

# DON"T NEED THIS ANYMORE??

SQLITE_PATH = "local_session.db"

# connection.execute("DROP TABLE userSession")


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