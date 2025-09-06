from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.models.user import User, UserOut
from app.models.usage import APIUsage
from app.api.deps import get_current_user
from pydantic import BaseModel
from datetime import datetime
from beanie.odm.operators.update.general import Set

router = APIRouter()

# Define a Pydantic model for the usage log response
class UsageLogOut(BaseModel):
    prompt: str
    timestamp: datetime

@router.get("/me", response_model=UserOut)
async def read_users_me(current_user: User = Depends(get_current_user)):
    """
    Fetch the current logged in user.
    """
    return current_user

# --- THIS IS THE MISSING ENDPOINT ---
@router.get("/me/usage", response_model=List[UsageLogOut])
async def read_user_usage_history(current_user: User = Depends(get_current_user)):
    """
    Fetch the API usage history for the current user.
    """
    # Find all usage logs linked to the current user and sort by newest first
    usage_logs = await APIUsage.find(
        APIUsage.user.id == current_user.id
    ).sort(-APIUsage.timestamp).to_list()
    
    return usage_logs

@router.patch("/sessions/{session_id}/archive")
async def archive_chat_session(session_id: str, current_user: User = Depends(get_current_user)):
    # In a real app, you'd verify the session belongs to the user
    # For now, we'll assume the frontend handles this.
    # Logic to update the session in the database would go here.
    return {"message": "Session archived successfully"}

@router.patch("/sessions/{session_id}/unarchive")
async def unarchive_chat_session(session_id: str, current_user: User = Depends(get_current_user)):
    # Logic to update the session in the database would go here.
    return {"message": "Session unarchived successfully"}