from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "http://localhost:8081",
    "localhost:8081"
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

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

# DO THIS REINA. MAKE A SQLITE SCHEMA JUST FOR THE USER METADATA
@app.get("/pantry-list", tags=["pantry"])
async def get_pantry_list() -> dict:
    # call database
    
    return { "data": todos }

@app.post("/add-item", tags=["pantry"])
async def add_item_to_pantry_list() -> dict:
    return { "data": todos }

@app.post("/update-quantity", tags=["pantry"])
async def add_item_to_pantry_list() -> dict:
    return { "data": todos }

################################################################

@app.get("/todo", tags=["todos"])
async def get_todos() -> dict:
    return { "data": todos }


@app.get("/", tags=["root"])
async def read_root() -> dict:
    return {"message": "Omomo"}