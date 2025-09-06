from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from app.api.deps import get_current_user
from app.models.user import User
from app.config import settings
from pydantic import BaseModel
import json
from fastapi import Request

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

router = APIRouter()

class AIPrompt(BaseModel):
    prompt: str

llm = ChatGoogleGenerativeAI(
    google_api_key=settings.GOOGLE_API_KEY, 
    model="gemini-1.5-flash", 
    temperature=0
)

prompt_template = ChatPromptTemplate.from_messages([
    ("system", "You are an expert data generation assistant. Your task is to generate a JSON array of objects. Your response MUST be only the raw JSON array, starting with `[` and ending with `]`. Do not include markdown formatting like ```json, explanations, or any other text."),
    ("human", "User Request: {prompt}")
])

chain = prompt_template | llm | StrOutputParser()

@router.post("/generate-ai-stream")
async def generate_ai_data_stream(
    request: Request,
    payload: AIPrompt,
    current_user: User = Depends(get_current_user)
):
    async def stream_generator():
        try:
            full_response = ""
            async for chunk in chain.astream({"prompt": payload.prompt}):
                if await request.is_disconnected():
                    print("Client disconnected, stopping generation.")
                    break
                full_response += chunk
                # Try to find complete JSON objects in the stream
                try:
                    # Look for JSON arrays
                    json_objects = json.loads(full_response)
                    if isinstance(json_objects, list):
                        # Send the current state of the list as a server-sent event
                        yield f"data: {json.dumps(json_objects)}\n\n"
                except json.JSONDecodeError:
                    # Not a complete JSON object yet, continue accumulating
                    continue
        except Exception as e:
            print(f"Error during AI data streaming: {e}")
            error_message = json.dumps({"error": "Failed to stream data."})
            yield f"data: {error_message}\n\n"

    return StreamingResponse(stream_generator(), media_type="text/event-stream")

# Replace your TitlePrompt / title_chain / generate-title endpoint with this:

from pydantic import BaseModel
import json, re
from typing import Any, Optional, List

class TitlePrompt(BaseModel):
    prompt: str

title_prompt_template = ChatPromptTemplate.from_messages([
    ("system",
     "You are a chat session titler. "
     "Your job is to create a short, human-friendly topic title. "
     "The title MUST:\n"
     "1. Be different from the user request.\n"
     "2. Summarize the topic (not the instruction).\n"
     "3. Contain 2–4 words, in Title Case.\n"
     "4. Reply ONLY with JSON in the form {\"title\":\"...\"}"),
    ("human", "User asked: {prompt}\n\nNow reply with only the title JSON.")
])


title_chain = title_prompt_template | llm | StrOutputParser()

def _fallback_title(src: str) -> str:
    words = re.findall(r"[A-Za-z0-9\-]+", src)[:5]
    if len(words) < 3:
        words = (src.strip() or "New Chat").split()[:3]
    title = " ".join(words).title()
    return title[:60].strip(" .,:;!?") or "New Chat"

import re, json

def _extract_title(text: str) -> str | None:
    """Try to pull a 'title' value out of model JSON, then clean it."""
    text = re.sub(r"```(?:json)?", "", text).strip("` \n\t")

    try:
        obj = json.loads(text)
        if isinstance(obj, dict) and isinstance(obj.get("title"), str):
            return _clean_title(obj["title"])
    except Exception:
        pass

    # Fallback: look for {"title":"..."}
    m = re.search(r'"title"\s*:\s*"([^"]+)"', text)
    if m:
        return _clean_title(m.group(1))

    return _clean_title(text)


def _clean_title(raw: str, original: str = "") -> str:
    words = re.findall(r"[A-Za-z][A-Za-z0-9_-]*", raw)

    stopwords = {
        "records", "record", "data", "dataset", "list", "of", "the",
        "generate", "generated", "creating", "new", "with", "and", "for"
    }

    cleaned = [w for w in words if w.lower() not in stopwords and not any(ch.isdigit() for ch in w)]
    if not cleaned:
        return "New Chat"

    title = " ".join(cleaned[:3]).title()

    # 🚨 NEW: If it's basically the same as the prompt, force fallback
    if original and title.lower() in original.lower():
        return "Chat Session"

    return title[:60].strip(" .,:;!?") or "New Chat"



@router.post("/generate-title")
async def generate_title_from_prompt(
    payload: TitlePrompt,
    current_user: User = Depends(get_current_user)
):
    user_prompt = (payload.prompt or "").strip()
    if not user_prompt:
        return {"title": "New Chat"}

    try:
        response_text = await title_chain.ainvoke({"prompt": user_prompt})
        candidate = _extract_title(response_text) or _clean_title(user_prompt, user_prompt)
        clean_title = _clean_title(candidate)
        return {"title": clean_title}


    except Exception as e:
        print(f"Error generating title: {e}")
        return {"title": _fallback_title(user_prompt)}