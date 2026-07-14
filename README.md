# Quran Hub — Islamic Learning Platform

> Calm, Immersive Islamic Learning

A modern full-stack Islamic education platform with 4 pillars of content: **Quran, Hadith, Tafsir, Sirah** — powered by an admin CMS and AI Tutor.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + TypeScript + TailwindCSS + React Router + TipTap |
| Backend | FastAPI + Motor (async MongoDB) + Pydantic |
| Database | MongoDB |
| Auth | JWT (access + refresh tokens), bcrypt |
| AI | OpenAI GPT / Google Gemini / Anthropic Claude |
| HTML Safety | DOMPurify (frontend) + bleach (backend) |

## Quick Start with Docker Compose

### 1. Clone and configure

```bash
git clone https://github.com/mohamadnuralif777-bit/Qur-an-Hub.git
cd Qur-an-Hub
cp .env.example .env
# Edit .env — set JWT_SECRET and LLM_API_KEY
```

### 2. Start services

```bash
docker-compose up -d
```

### 3. Seed the database

```bash
docker-compose --profile seed run seed
```

This creates:
- Superadmin: `admin@quranhub.com` / `Admin@1234`
- Sample content for all 4 pillars

### 4. Access the app

| URL | Description |
|-----|-------------|
| http://localhost:5173 | Public frontend |
| http://localhost:8000 | Backend API |
| http://localhost:8000/docs | Swagger API docs |
| http://localhost:5173/admin | Admin panel |

## Development Setup

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
echo "VITE_API_URL=http://localhost:8000" > .env
npm run dev
```

## Features

### Public
- **Landing Page** — Hero with "Calm, Immersive Islamic Learning" tagline
- **Quran** — Surah listing and detail with Arabic font support
- **Hadith** — Hadith collections (Bukhari, Muslim, etc.)
- **Tafsir** — Quranic commentary and interpretation
- **Sirah** — Prophetic biography and Islamic history
- **AI Tutor** — Chat interface with streaming responses, context-aware
- **Global Search** — Search across all 4 pillars
- **Dark Mode** — Persistent via localStorage

### Admin (`/admin`)
- **Login** — JWT-protected admin access
- **Dashboard** — Content counts and recent activity
- **Content CRUD** — Create, edit, delete with soft-delete
- **HTML Upload** — Upload `.html` files with sanitization
- **WYSIWYG Editor** — TipTap rich text editor
- **RBAC** — superadmin / editor / contributor roles
- **User Management** — Superadmin can manage admin users
- **Audit Logs** — Track all content changes

## AI Tutor Configuration

Set these environment variables:

```bash
LLM_PROVIDER=openai   # or: gemini, anthropic
LLM_API_KEY=sk-...
```

Supported providers:
- `openai` → GPT-4o-mini
- `gemini` → Gemini 1.5 Flash
- `anthropic` → Claude 3 Haiku

## Environment Variables

### Backend (`.env`)
```
MONGO_URL=mongodb://localhost:27017
MONGO_DB=quran_hub
JWT_SECRET=your-secret-key
LLM_PROVIDER=openai
LLM_API_KEY=your-api-key
FRONTEND_URL=http://localhost:5173
```

### Frontend (`.env`)
```
VITE_API_URL=http://localhost:8000
```

## RBAC Roles

| Role | Permissions |
|------|-------------|
| `superadmin` | Full access + user management |
| `editor` | CRUD all content, cannot manage users |
| `contributor` | Create drafts only, cannot publish |

## MongoDB Collections

- `users` — Admin users with role
- `contents` — All content (quran/hadith/tafsir/sirah)
- `ai_conversations` — AI chat history
- `audit_logs` — Content change tracking

## API Endpoints

```
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout

GET  /api/contents?pillar=&category=&q=&page=
GET  /api/contents/{slug}

GET  /api/admin/contents
POST /api/admin/contents
PUT  /api/admin/contents/{id}
DELETE /api/admin/contents/{id}
POST /api/admin/upload-html

GET  /api/admin/users
POST /api/admin/users
PUT  /api/admin/users/{id}
DELETE /api/admin/users/{id}

GET  /api/admin/dashboard
GET  /api/admin/audit-logs

POST /api/ai/chat (SSE streaming)
```

## Security

- HTML sanitization: bleach (backend) + DOMPurify (frontend)
- Blocked: `<script>`, event handlers, `<iframe>`, `<form>`, `<object>`
- CORS whitelist configured
- JWT tokens with expiry
- Passwords hashed with bcrypt

## Branding

- Primary color: `#0F3830` (deep green)
- Accent: soft gold `#C9A84C`
- UI font: Comic Neue
- Arabic font: Amiri
