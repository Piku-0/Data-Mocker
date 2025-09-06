from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, EmailStr # Add BaseModel here
from fastapi.security import OAuth2PasswordRequestForm
from app.models.user import User, UserCreate
from app.utils.security import get_password_hash, verify_password, create_access_token, Token


router = APIRouter()

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register_new_user(user_data: UserCreate):
    # Check if username or email already exists
    if await User.find_one(User.username == user_data.username):
        raise HTTPException(status_code=400, detail="Username already registered")
    if await User.find_one(User.email == user_data.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Check if passwords match
    if user_data.password != user_data.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    hashed_password = get_password_hash(user_data.password)
    
    new_user = User(
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        username=user_data.username,
        email=user_data.email, 
        hashed_password=hashed_password
    )
    await new_user.insert()
    
    return {"message": "User registered successfully"}


@router.post("/login", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await User.find_one(User.email == form_data.username)
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # --- MODIFICATION IS HERE: Add more data to the token ---
    access_token_data = {
        "sub": user.email,
        "first_name": user.first_name,
        "username": user.username
    }
    access_token = create_access_token(data=access_token_data)
    
    return {"access_token": access_token, "token_type": "bearer"}

class CheckUsername(BaseModel):
    username: str

class CheckEmail(BaseModel):
    email: EmailStr

@router.post("/check-username")
async def check_username_exists(payload: CheckUsername):
    user = await User.find_one(User.username == payload.username)
    return {"exists": user is not None}

@router.post("/check-email")
async def check_email_exists(payload: CheckEmail):
    user = await User.find_one(User.email == payload.email)
    return {"exists": user is not None}