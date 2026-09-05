# SmartPYQ

> PYQ paper platform for Osmania University — browse, upload, download, and search past exam papers with an AI study assistant.

**Stack:** FastAPI · React 18 (Vite) · SQLite · Tailwind CSS

---

## Features

- **PYQ Hub** — Browse papers by Stream → Specialization → Semester → Subject → Year
- **Upload & Share** — 3-step upload wizard with PDF processing and admin approval
- **AI Chat** — Gemini-powered study assistant for exam prep
- **Question Analysis** — Extract questions from papers and detect repeated patterns
- **Practice Mode** — Flashcard-based revision from extracted questions (320 questions included)
- **Bookmarks** — Save and organize questions across papers
- **Search** — Full-text keyword search across all papers
- **Analytics** — Dashboard with upload stats, view counts, and study insights
- **Academic Access Control** — Users only see content for their registered stream/specialization
- **Demo Mode** — Full platform access with demo credentials

---

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- npm

### Backend

```bash
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend

```bash
cd smartpyq-frontend
npm install
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000`
- API Docs: `http://localhost:8000/docs`

### Quick Start (Windows)

Double-click `start.bat` to start both servers.

---

## Demo Credentials

| Email | Password | Role | Access |
|-------|----------|------|--------|
| sumer@edu.in | demo123 | Demo | Full platform access |

---

## Project Structure

```
smartpyq/
├── app/                          # Backend (FastAPI)
│   ├── core/                     # Config, DB, auth, exceptions
│   ├── models/                   # SQLAlchemy models
│   ├── schemas/                  # Pydantic request/response schemas
│   ├── routers/                  # API route handlers
│   ├── services/                 # Business logic
│   ├── repositories/             # Database queries
│   ├── middleware/               # Error handling, security headers
│   ├── utils/                    # PDF, storage, AI, email helpers
│   └── workers/                  # Background tasks (Celery)
├── smartpyq-frontend/            # Frontend (React + Vite)
│   └── src/
│       ├── components/           # Reusable UI components (10 files)
│       ├── pages/                # Route pages (23 files)
│       ├── contexts/             # React context (auth)
│       ├── data/                 # Course data, practice questions
│       └── lib/                  # API client, spell check
├── alembic/                      # Database migrations
├── uploads/                      # Uploaded PDF storage
├── docs/                         # Audit docs
├── smartpyq.db                   # SQLite database
├── .env                          # Environment variables
└── requirements.txt              # Python dependencies
```

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/auth/simple-login` | No | Login |
| POST | `/api/v1/auth/register-complete` | No | Register with OTP + academic profile |
| POST | `/api/v1/auth/refresh` | No | Refresh token |
| GET | `/api/v1/papers/` | Yes | List papers with filters |
| POST | `/api/v1/papers/upload` | Yes | Upload PDF |
| GET | `/api/v1/papers/{id}/download` | No | Download PDF |
| GET | `/api/v1/papers/search` | Yes | Search papers |
| POST | `/api/v1/papers/{id}/approve` | Admin | Approve paper |
| POST | `/api/v1/chat/simple` | No | AI chat (no auth, graceful fallback) |
| POST | `/api/v1/chat` | Yes | AI chat (authenticated) |
| GET/POST | `/api/v1/bookmarks/` | Yes | Bookmarks |
| POST | `/api/v1/analysis/analyze` | Yes | Extract questions |
| GET | `/api/v1/analysis/questions` | Yes | Get questions |
| GET | `/api/v1/admin/stats` | Admin | Admin statistics |

---

## User Roles

| Role | Capabilities |
|------|-------------|
| **Student** | Browse, search, download, upload papers, AI chat, bookmarks, practice |
| **Admin** | Approve/reject papers, view stats, manage users |
| **Tenant Admin** | Admin scoped to a tenant |
| **Super Admin** | Full system access |

---

## Tech Details

### Authentication

- JWT access + refresh tokens
- Argon2 password hashing
- OTP-based email verification during registration
- Session expiry detection with banner notification
- Auto-refresh before token expiry

### Registration Flow

1. Enter email
2. Select academic year
3. Select stream/course (B.Sc, B.Com, BCA, BBA)
4. Select specialization
5. Select semester + enter name + create password
6. Enter OTP (sent to email, logged to console in dev mode)
7. Account created with full academic profile

### PYQ Data

Papers are organized in a 6-level hierarchy:

```
Stream (B.Sc / B.Com / BCA / BBA)
  └─ Specialization (MSCS / MPC / BiPC / General / ...)
       └─ Semester (Sem 1–6)
            └─ Subject (Mathematics / English / ...)
                 └─ PYQ Year (2019–2027)
                      └─ PDF papers
```

### Academic Access Control

- Each user registers with a stream + specialization
- PYQ Hub shows only content matching the user's academic profile
- Server-side enforcement via `/api/v1/auth/papers-accessible`
- Demo users see all content

### Frontend

- Lazy-loaded routes for performance
- Protected routes via `AuthContext`
- Glassmorphism UI with Tailwind CSS
- Animated page transitions (Framer Motion)
- Mobile responsive with hamburger menu
- Intro video with localStorage persistence

---

## Pages

| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Animated landing page |
| PYQ Hub | `/pyq` | Browse papers by stream/semester/subject |
| Upload | `/upload` | 3-step upload wizard |
| Dashboard | `/dashboard` | Stats and quick actions |
| AI Chat | `/ai` | Gemini-powered study assistant |
| Analysis | `/analyze` | Extract questions from papers |
| Repeated Questions | `/repeated-questions` | Recurring exam patterns |
| Practice | `/practice` | Flashcard revision mode |
| Search | `/search` | Keyword search |
| Bookmarks | `/bookmarks` | Saved questions |
| Profile | `/profile` | Account settings |
| Login | `/login` | Email/password login |
| Register | `/register` | 6-step academic registration |
| Forgot Password | `/forgot-password` | OTP-based password reset |
| Contact | `/contact` | Contact form |
| FAQ | `/faq` | Searchable FAQ |
| 404 | `*` | Not found page |

---

## Environment Variables

### Backend (.env)

```env
ENV=development
PORT=8000
DATABASE_URL=sqlite+aiosqlite:///./smartpyq.db
JWT_SECRET=your-secret-key-here
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
DEV_EMAIL_LOG_OTP=true
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
USE_SUPABASE_STORAGE=false
GEMINI_API_KEY=
OPENAI_API_KEY=
```

### Frontend (.env.local)

```env
VITE_BACKEND_URL=http://localhost:8000
```

---

## Troubleshooting

### Login not working
- Ensure the backend is running: `python -m uvicorn app.main:app --host 127.0.0.1 --port 8000`
- Check the backend console for errors

### Registration OTP not received
- In dev mode, OTP is logged to the backend console
- Check the terminal where the backend is running
- Look for `OTP for your@email.com: XXXXXX`

### Chat not responding
- The AI chat requires a valid API key (Gemini or OpenAI) in `.env`
- Without a valid key, the chat shows a graceful fallback message

### Build errors
- Run `npm install` in `smartpyq-frontend/`
- Ensure no TypeScript errors: check the build output

---

## License

Private — All rights reserved.
