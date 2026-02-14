from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

app = FastAPI()

origins = [
    "http://localhost:8081",
    "localhost:8081"
]

DATABASE_URL = "postgresql://user:password@localhost/dbname"


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


DATABASE_URL = "postgresql://user:password@localhost/dbname"
engine = create_engine(DATABASE_URL, pool_size=10, max_overflow=20)
SessionLocal = sessionmaker(autocommit=False, autoflush=True, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db  
    finally:
        db.close() 

todos = [
    {
        "id": "1",
        "item": "Get Omomo."
    },
    {
        "id": "2",
        "item": "Skip 125."
    },
]

@app.post("/add-item", tags=["pantry"])
async def add_item_to_pantry_list() -> dict:
	# Check from postgres side to make sure it's a real item
    # This will return two different types of jsons, error or good
    return { "data": todos }

################################################################

@app.get("/todo", tags=["todos"])
async def get_todos() -> dict:
    return { "data": todos }


@app.get("/", tags=["root"])
async def read_root() -> dict:
    return {"message": "Omomo"}