from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from app.models.ai import ChatRequest
from app.core.database import get_db
from app.core.config import settings
import json
import asyncio
from datetime import datetime
from bson import ObjectId
import re

router = APIRouter()


def strip_html(html: str) -> str:
    clean = re.sub(r"<[^>]+>", " ", html)
    clean = re.sub(r"\s+", " ", clean).strip()
    return clean[:2000]


async def get_ai_response_openai(messages: list, system_prompt: str):
    from openai import AsyncOpenAI
    client = AsyncOpenAI(api_key=settings.LLM_API_KEY)
    stream = await client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "system", "content": system_prompt}] + messages,
        stream=True,
    )
    async for chunk in stream:
        delta = chunk.choices[0].delta.content
        if delta:
            yield delta


async def get_ai_response_gemini(messages: list, system_prompt: str):
    import google.generativeai as genai
    genai.configure(api_key=settings.LLM_API_KEY)
    model = genai.GenerativeModel("gemini-1.5-flash", system_instruction=system_prompt)
    gemini_messages = []
    for m in messages:
        role = "user" if m["role"] == "user" else "model"
        gemini_messages.append({"role": role, "parts": [m["content"]]})
    response = await asyncio.to_thread(
        model.generate_content, gemini_messages, stream=True
    )
    for chunk in response:
        if chunk.text:
            yield chunk.text


async def get_ai_response_anthropic(messages: list, system_prompt: str):
    import anthropic
    client = anthropic.AsyncAnthropic(api_key=settings.LLM_API_KEY)
    anthropic_messages = [
        {"role": m["role"], "content": m["content"]}
        for m in messages
        if m["role"] in ("user", "assistant")
    ]
    async with client.messages.stream(
        model="claude-3-haiku-20240307",
        max_tokens=1024,
        system=system_prompt,
        messages=anthropic_messages,
    ) as stream:
        async for text in stream.text_stream:
            yield text


async def stream_ai_response(messages: list, system_prompt: str):
    provider = settings.LLM_PROVIDER.lower()
    if provider == "openai":
        gen = get_ai_response_openai(messages, system_prompt)
    elif provider == "gemini":
        gen = get_ai_response_gemini(messages, system_prompt)
    elif provider == "anthropic":
        gen = get_ai_response_anthropic(messages, system_prompt)
    else:
        raise ValueError(f"Unknown LLM provider: {provider}")
    async for chunk in gen:
        yield chunk


@router.post("/chat")
async def ai_chat(request: ChatRequest):
    db = get_db()
    system_prompt = (
        "You are a knowledgeable and respectful Islamic education tutor. "
        "Help users understand Quran, Hadith, Tafsir, and Sirah. "
        "Be concise, accurate, and encouraging."
    )

    if request.content_id:
        try:
            content_doc = await db.contents.find_one(
                {"_id": ObjectId(request.content_id), "status": "published", "deleted_at": None}
            )
            if content_doc:
                snippet = strip_html(content_doc.get("html_body", ""))
                system_prompt += (
                    f"\n\nThe user is currently reading: \"{content_doc['title']}\" "
                    f"({content_doc.get('pillar', '')} pillar).\n"
                    f"Content snippet: {snippet}"
                )
        except Exception:
            pass

    if not settings.LLM_API_KEY:
        async def mock_stream():
            mock_response = "AI Tutor is not configured. Please set LLM_API_KEY and LLM_PROVIDER environment variables."
            for char in mock_response:
                yield f"data: {json.dumps({'delta': char})}\n\n"
                await asyncio.sleep(0.02)
            yield "data: [DONE]\n\n"

        return StreamingResponse(mock_stream(), media_type="text/event-stream")

    messages_list = [{"role": m.role, "content": m.content} for m in request.messages]

    async def event_stream():
        full_response = ""
        try:
            async for chunk in stream_ai_response(messages_list, system_prompt):
                full_response += chunk
                yield f"data: {json.dumps({'delta': chunk})}\n\n"
        except Exception:
            yield f"data: {json.dumps({'error': 'An error occurred while generating the response.'})}\n\n"
        finally:
            yield "data: [DONE]\n\n"
            # Save conversation
            if request.session_id and db is not None:
                try:
                    all_messages = messages_list + [
                        {"role": "assistant", "content": full_response, "timestamp": datetime.utcnow().isoformat()}
                    ]
                    await db.ai_conversations.update_one(
                        {"user_session": request.session_id},
                        {
                            "$set": {"context_content_id": request.content_id},
                            "$push": {"messages": {"$each": [
                                {"role": m["role"], "content": m["content"], "timestamp": datetime.utcnow().isoformat()}
                                for m in messages_list[-1:]
                            ] + [{"role": "assistant", "content": full_response, "timestamp": datetime.utcnow().isoformat()}]}},
                        },
                        upsert=True,
                    )
                except Exception:
                    pass

    return StreamingResponse(event_stream(), media_type="text/event-stream")
