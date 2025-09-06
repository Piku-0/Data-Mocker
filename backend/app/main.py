from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from beanie import init_beanie

from app.database import database
from app.models.user import User
from app.api import auth, users, data  # Import the new users router
from app.models.user import User
from app.models.usage import APIUsage # Import the new model

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_beanie(
        database=database,
        document_models=[User, APIUsage] # Add the APIUsage model here
    )
    print("Database connection initialized with User and APIUsage models.")
    yield


app = FastAPI(lifespan=lifespan)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add the API routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["Users"]) # Add this line
app.include_router(data.router, prefix="/api/data", tags=["Data Generation"])

@app.get("/api")
def read_root():
    return {"message": "Hello from the FastAPI backend!"}