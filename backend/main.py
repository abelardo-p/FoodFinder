import uvicorn
from fastapi import FastAPI
from backend.app.routers.pantry import pantry_router
from backend.app.routers.recommend import recipe_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.include_router(pantry_router)
app.include_router(recipe_router)

# Allows calls from:
origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)

