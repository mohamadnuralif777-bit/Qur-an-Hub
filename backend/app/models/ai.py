from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    content_id: Optional[str] = None
    session_id: Optional[str] = None
