import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.engine import URL

# Postgres database 
username = os.getenv('USERNAME', default='postgres') 
ps_password = os.getenv('PS_PASSWORD', default='password')
database = os.getenv('DATABASE', default='omomo')
port = 5432 

# letting SQLAlchemy handle encoding to prevent parsing errors
DATABASE_URL = URL.create(
    "postgresql+psycopg2",
    username=username,
    password=ps_password,
    host="127.0.0.1",
    port=5432,
    database=database
)

engine = create_engine(DATABASE_URL, pool_size=10, max_overflow=20)
Session = sessionmaker(autocommit=False, autoflush=True, bind=engine)

def get_db():
    db = Session()
    try:
        yield db  
    finally:
        db.close() 