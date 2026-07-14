from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class Pillar(str, Enum):
    quran = "quran"
    hadith = "hadith"
    tafsir = "tafsir"
    sirah = "sirah"


class ContentStatus(str, Enum):
    draft = "draft"
    published = "published"


class ContentCreate(BaseModel):
    pillar: Pillar
    category: Optional[str] = None
    title: str
    slug: str
    html_body: str = ""
    tags: List[str] = []
    cover_image: Optional[str] = None
    status: ContentStatus = ContentStatus.draft


class ContentUpdate(BaseModel):
    category: Optional[str] = None
    title: Optional[str] = None
    slug: Optional[str] = None
    html_body: Optional[str] = None
    tags: Optional[List[str]] = None
    cover_image: Optional[str] = None
    status: Optional[ContentStatus] = None


class ContentOut(BaseModel):
    id: str
    pillar: str
    category: Optional[str] = None
    title: str
    slug: str
    html_body: str
    tags: List[str] = []
    cover_image: Optional[str] = None
    status: str
    author_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ContentSummary(BaseModel):
    id: str
    pillar: str
    category: Optional[str] = None
    title: str
    slug: str
    tags: List[str] = []
    cover_image: Optional[str] = None
    status: str
    author_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime
