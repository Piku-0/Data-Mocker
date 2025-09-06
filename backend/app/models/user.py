from beanie import Document
from pydantic import BaseModel, EmailStr, Field


# Defines the user data structure in the MongoDB database
class User(Document):
    first_name: str
    last_name: str
    username: str = Field(unique=True)
    email: EmailStr = Field(unique=True)
    hashed_password: str
    is_active: bool = True
    
    class Settings:
        name = "users"

class UserCreate(BaseModel):
    first_name: str
    last_name: str
    username: str
    email: EmailStr
    password: str
    confirm_password: str

class UserOut(BaseModel):
    email: EmailStr
    is_active: bool