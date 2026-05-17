# Job Automation System

> A personal job automation system that scrapes LinkedIn, Naukri, and Indeed, filters jobs based on preferences, tailors resumes using Claude AI, and notifies the user via email and real-time dashboard updates.

**Author:** Suraj  
**Started:** May 2026  
**Status:** Phase 2 — Project Setup  
**Stack:** Node.js · TypeScript · Express · PostgreSQL · Redis · BullMQ · Claude AI

---

## Table of Contents

1. [What It Does](#what-it-does)
2. [System Architecture](#system-architecture)
3. [Tech Stack](#tech-stack)
4. [Folder Structure](#folder-structure)
5. [Local Development Setup](#local-development-setup)
6. [Environment Variables](#environment-variables)
7. [Available Scripts](#available-scripts)
8. [API Endpoints](#api-endpoints)
9. [Database Schema](#database-schema)
10. [Git Workflow](#git-workflow)
11. [Development Roadmap](#development-roadmap)
12. [Key Engineering Concepts](#key-engineering-concepts)

---

## What It Does

Every 15 minutes the system:

1. Wakes up via a cron scheduler
2. Scrapes new job postings from LinkedIn, Naukri, and Indeed
3. Deduplicates jobs using a composite key `(external_job_id, source)`
4. Matches unique jobs to users based on their preferences (role, location, salary, work mode)
5. Sends matched jobs to Claude AI for categorisation (Backend Heavy / Frontend Heavy / Full Stack)
6. Generates one tailored resume per category per user
7. Uploads resume PDFs to S3
8. Pushes real-time updates to the user's dashboard via WebSocket
9. Sends an email digest notification

### Job Matching Filters
- Role: Full Stack / Backend Engineer
- Location: Mumbai
- Employment type: Permanent only
- Work mode: 5 days working (onsite)
- Minimum salary: 9+ LPA
- Apply as early as possible after job is posted

---

## System Architecture

```
CLIENT LAYER
└── Web App (React)

GATEWAY LAYER
└── Nginx API Gateway
    └── JWT Auth Middleware

BACKEND SERVICES
├── HTTP Service (REST API — Express.js)
└── WebSocket Service (real-time job feed)

JOB PIPELINE (runs independently every 15 min)
├── Scheduler         (node-cron)
├── Scraper Service   (LinkedIn / Naukri / Indeed)
├── Dedup Engine      (job fingerprinting)
├── Message Queue     (BullMQ + Redis)
├── Matcher Service   (maps unique jobs to users)
├── Claude Service    (categorise + generate resumes)
└── Notification      (Nodemailer + Gmail SMTP)

STORAGE LAYER
├── PostgreSQL        (structured data)
└── S3 Storage        (resume PDFs)
```

### Architecture Type
This is a **modular monolith** — not microservices. Everything runs in one Node.js process, sharing one DB connection and one Redis connection. The pipeline and API are independent modules inside the same process.

### Data Flow
```
Cron fires
  → Scraper hits job platforms
  → Dedup filters already-seen jobs
  → Matcher maps new jobs to users
  → BullMQ queue receives user+job batches
  → Claude Service categorises jobs
  → Claude Service generates tailored resume per category
  → Resume PDF uploaded to S3
  → WebSocket pushes new jobs to dashboard
  → Email digest sent to user
```

---

## Tech Stack

| Component | Technology | Why |
|---|---|---|
| Backend | Node.js + Express 4 | Fast, JS ecosystem, widely documented |
| Language | TypeScript | Type safety, catches bugs at compile time |
| Database | PostgreSQL | Relational, ACID-compliant, free locally |
| Queue | BullMQ + Redis | Job queue with retry, DLQ, survives crashes |
| Scheduler | node-cron | Cron expression based, prevents overlapping runs |
| AI | Anthropic Claude API | Categorises jobs + generates tailored resumes |
| Resume Storage | AWS S3 | Store PDFs, return public URL |
| Notifications | Nodemailer + Gmail SMTP | Free, 500 emails/day |
| Frontend | React | Simple dashboard |
| Auth | JWT + bcrypt | Access token (15min) + Refresh token (7 days) |
| Validation | Zod | Schema validation for env vars and request bodies |
| Logging | Winston | Structured logging with log levels |
| Local Infra | Docker Compose | Runs Postgres + Redis locally in one command |

### Cost
Only Claude API calls cost money. Load $5 once — lasts weeks for personal use at ~$0.01–0.03 per resume generation.

---

## Folder Structure

```
job-automation/
├── backend/
│   ├── src/
│   │   ├── api/                         ← HTTP layer only
│   │   │   ├── routes/
│   │   │   │   ├── auth.routes.ts
│   │   │   │   ├── user.routes.ts
│   │   │   │   ├── job.routes.ts
│   │   │   │   └── notification.routes.ts
│   │   │   ├── controllers/
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── user.controller.ts
│   │   │   │   ├── job.controller.ts
│   │   │   │   └── notification.controller.ts
│   │   │   └── middleware/
│   │   │       ├── auth.middleware.ts
│   │   │       ├── error.middleware.ts
│   │   │       └── validate.middleware.ts
│   │   │
│   │   ├── services/                    ← Business logic (shared by API + pipeline)
│   │   │   ├── auth.service.ts
│   │   │   ├── user.service.ts
│   │   │   ├── job.service.ts
│   │   │   └── notification.service.ts
│   │   │
│   │   ├── repositories/                ← DB queries only, no business logic
│   │   │   ├── user.repository.ts
│   │   │   ├── job.repository.ts
│   │   │   ├── resume.repository.ts
│   │   │   └── notification.repository.ts
│   │   │
│   │   ├── pipeline/                    ← Autonomous background pipeline
│   │   │   ├── scheduler.ts
│   │   │   ├── scraper/
│   │   │   │   ├── scraper.ts
│   │   │   │   ├── linkedin.scraper.ts
│   │   │   │   ├── naukri.scraper.ts
│   │   │   │   └── indeed.scraper.ts
│   │   │   ├── dedup.ts
│   │   │   ├── matcher.ts
│   │   │   ├── claude/
│   │   │   │   ├── claude.service.ts
│   │   │   │   └── claude.prompts.ts
│   │   │   └── queue/
│   │   │       ├── queue.ts
│   │   │       └── workers/
│   │   │           └── claude.worker.ts
│   │   │
│   │   ├── websocket/
│   │   │   ├── ws.server.ts
│   │   │   └── ws.handler.ts
│   │   │
│   │   ├── db/
│   │   │   ├── schema.prisma
│   │   │   └── migrations/
│   │   │
│   │   ├── config/
│   │   │   ├── env.ts                   ← parse + validate all env vars with Zod
│   │   │   ├── db.ts                    ← Prisma client instance
│   │   │   └── redis.ts                 ← ioredis connection
│   │   │
│   │   ├── types/
│   │   │   ├── job.types.ts
│   │   │   ├── user.types.ts
│   │   │   ├── queue.types.ts
│   │   │   └── errors.types.ts
│   │   │
│   │   ├── utils/
│   │   │   ├── logger.ts
│   │   │   ├── pdf.ts
│   │   │   └── storage.ts
│   │   │
│   │   └── index.ts                     ← boots DB → Redis → HTTP → WS → Pipeline
│   │
│   ├── .env                             ← never committed to git
│   ├── .env.example                     ← committed, all keys with empty values
│   ├── tsconfig.json
│   └── package.json
│
├── frontend/                            ← React app (Phase 3)
├── docker-compose.yml                   ← Postgres + Redis for local dev
└── PROJECT.md                           ← this file
```

### Layer Responsibilities

| Layer | Responsibility |
|---|---|
| `routes/` | Define URL paths and HTTP methods. Wire to controllers. |
| `controllers/` | Parse request, call service, return response. No business logic. |
| `services/` | Business logic. Called by controllers and pipeline. No DB queries directly. |
| `repositories/` | SQL queries only. No if-statements, no business rules. |
| `pipeline/` | Background job. Never called by HTTP controllers. |
| `config/` | All connections and env vars. Everything imports from here. |

---

## Local Development Setup

### Prerequisites
- Node.js 18+
- Docker Desktop
- Git

### Steps

**1. Clone the repository**
```bash
git clone <repo-url>
cd job-automation
```

**2. Install dependencies**
```bash
cd backend
npm install
```

**3. Set up environment variables**
```bash
cp .env.example .env
# Fill in all values in .env
```

**4. Start Postgres and Redis**
```bash
# From project root
docker compose up -d
```

**5. Run database migrations**
```bash
npm run db:migrate
npm run db:generate
```

**6. Start the development server**
```bash
npm run dev
```

Server runs at `http://localhost:3000`

---

## Environment Variables

All variables must be set in `.env`. The app validates these at startup using Zod — missing variables crash immediately with a clear error.

```env
# Server
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:3000

# Auth
JWT_ACCESS_SECRET=your_access_signing_secret
JWT_REFRESH_SECRET=your_refresh_signing_secret

# Database (must match docker-compose.yml)
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=your_database_user
DATABASE_PASSWORD=your_database_password
DATABASE_NAME=your_database_name

# Redis (must match docker-compose.yml)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Claude AI
CLAUDE_API_KEY=your_claude_api_key
CLAUDE_API_URL=https://api.anthropic.com/v1/messages

# Email (Gmail SMTP)
GMAIL_USER=your_gmail@gmail.com
GMAIL_APP_PASSWORD=your_16_char_app_password

# AWS S3
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=ap-south-1
AWS_S3_BUCKET_NAME=your_bucket_name

# Logging
LOG_LEVEL=info
LOG_FILE_PATH=logs/app.log
```

> **Note:** `GMAIL_APP_PASSWORD` is a 16-character password generated from Google Account → Security → App Passwords. It is not your Gmail login password.

---

## Available Scripts

Run from inside `backend/`:

| Command | What It Does |
|---|---|
| `npm run dev` | Start dev server with hot reload (ts-node + nodemon) |
| `npm run build` | Compile TypeScript → JavaScript into `dist/` |
| `npm start` | Run compiled JS (production only) |
| `npm run db:migrate` | Apply new migrations to the database |
| `npm run db:generate` | Regenerate Prisma client after schema change |
| `npm run db:studio` | Open visual DB browser at localhost:5555 |

---

## API Endpoints

**Base URL:** `/api/v1`  
**Auth:** JWT Bearer token in `Authorization` header (all routes except `/auth/*`)  
**Pagination:** Cursor-based on all list endpoints

### Auth
```
POST   /api/v1/auth/register      Create account
POST   /api/v1/auth/login         Login, returns access token + HttpOnly refresh cookie
POST   /api/v1/auth/logout        Clears refresh token cookie
POST   /api/v1/auth/refresh       Get new access token using refresh cookie
```

### User
```
GET    /api/v1/user/profile       Get profile
PATCH  /api/v1/user/profile       Update name or email
GET    /api/v1/user/preferences   Get job preferences
PATCH  /api/v1/user/preferences   Update job preferences
GET    /api/v1/user/skills        Get skills list
PATCH  /api/v1/user/skills        Replace skills list
DELETE /api/v1/user/account       Delete account (CASCADE deletes all data)
```

### Jobs
```
GET    /api/v1/jobs                         List matched jobs (cursor paginated)
GET    /api/v1/jobs/:job_id                 Get job details
PATCH  /api/v1/jobs/:job_id/seen            Mark as seen
PATCH  /api/v1/jobs/:job_id/applied         Mark as applied
GET    /api/v1/jobs/:job_id/resume/download Get resume URL for this job
```

### Notifications
```
GET    /api/v1/notifications       List notifications (cursor paginated)
```

### WebSocket
```
WS     /ws/jobs     Real-time job feed
                    Auth: JWT in connection headers
                    Push: { type: "new_jobs", jobs: [...], resume_urls: {...} }
```

### HTTP Status Codes
```
200 → success with body
201 → resource created
204 → success, no body (DELETE)
400 → bad request / validation error
401 → unauthorized (invalid or missing token)
403 → forbidden (valid token, no permission)
404 → resource not found
500 → internal server error
```

---

## Database Schema

10 tables. All foreign keys use `ON DELETE CASCADE`.

| Table | Purpose |
|---|---|
| `users` | Identity — who you are |
| `user_preferences` | Job search preferences — what you want |
| `skills` | Global master skill list |
| `user_skills` | Junction — which user has which skills |
| `jobs` | All scraped jobs from all platforms |
| `user_job_matches` | Which jobs matched which user |
| `job_categories` | Claude-generated category per user per cycle |
| `job_category_matches` | Which jobs belong to which category |
| `resumes` | Generated resume PDFs per category |
| `notifications` | Email digest records |

### Key Design Decisions

**Composite unique constraint on jobs:**
```sql
UNIQUE(external_job_id, source)
```
LinkedIn job 123 and Naukri job 123 are different jobs. Source differentiates them.

**Deduplication pattern:**
```sql
INSERT INTO jobs (...) ON CONFLICT (external_job_id, source) DO NOTHING
```

**Resume versioning:**
When Claude regenerates a resume — old row gets `status=outdated`, new row gets `status=active` with `version+1`. Dashboard always downloads the active resume.

**Lookup chain for resume download:**
```
job_id → job_category_matches → category_id → resumes (status=active) → resume_url
```

---

## Git Workflow

### Branch Strategy
```
main    ← stable, working code only. Merge here when a phase is complete.
dev     ← daily work. All commits go here.
```

### Commit Convention — Conventional Commits

```
type(scope): short description

Types:
  feat     → new feature
  fix      → bug fix
  chore    → setup, config, tooling
  refactor → restructure without behaviour change
  docs     → documentation only
  test     → adding or fixing tests
```

### Real Examples From This Project
```bash
git commit -m "chore(setup): initialise backend project with typescript"
git commit -m "chore(config): add docker-compose for postgres and redis"
git commit -m "chore(env): add env.example with all required variables"
git commit -m "feat(config): add env validation with zod"
git commit -m "feat(db): add prisma schema with all 10 tables"
git commit -m "feat(auth): add register and login endpoints"
git commit -m "fix(auth): handle duplicate email on register"
git commit -m "feat(pipeline): add scheduler with 15min cron and job lock"
git commit -m "feat(scraper): add linkedin scraper with exponential backoff"
git commit -m "feat(claude): add job categorisation and resume generation"
```

### When to Push

| Situation | Push? |
|---|---|
| Completed a working unit of work | ✅ Yes, push to `dev` |
| Mid-feature, broken code | ❌ No |
| End of day even if incomplete | ✅ Yes, push to `dev` |
| Phase complete and tested | ✅ Merge `dev` → `main` |
| `.env` file | ❌ Never — in `.gitignore` |
| `.env.example` | ✅ Always commit |

---

## Development Roadmap

```
Phase 1 — System Design                          ✅ Complete
  ✅ HLD — architecture, data flow
  ✅ LLD — service flows, DB schema, API contract

Phase 2 — Project Setup                          🔄 In Progress
  ✅ Folder structure
  ✅ docker-compose.yml (Postgres + Redis)
  ✅ .env.example
  ✅ package.json + tsconfig.json
  ⬜ config/env.ts — Zod env validation
  ⬜ config/db.ts — Prisma connection
  ⬜ config/redis.ts — Redis connection
  ⬜ index.ts — boot sequence
  ⬜ Prisma schema — all 10 tables
  ⬜ Run first migration

Phase 3 — Build Layer by Layer
  ⬜ Auth Service (register, login, refresh, logout)
  ⬜ User Service (profile, preferences, skills)
  ⬜ Job pipeline (scheduler → scraper → dedup → matcher → Claude → notify)
  ⬜ WebSocket Service
  ⬜ Frontend (React dashboard)

Phase 4 — Testing
  ⬜ Unit tests per service
  ⬜ Integration tests
  ⬜ End to end tests

Phase 5 — DevOps
  ⬜ Dockerise the backend
  ⬜ Deploy to Oracle Cloud Free Tier
  ⬜ Environment secrets management
  ⬜ CI/CD pipeline

Phase 6 — Scale
  ⬜ Add more users
  ⬜ Add more job boards
  ⬜ Move to paid infra if needed
```

---

## Key Engineering Concepts

### Database Design
- **Normalisation (1NF, 2NF, 3NF)** — one fact in one place, eliminate redundancy
- **Junction tables** — for many-to-many (user_skills, user_job_matches, job_category_matches)
- **Composite unique constraints** — UNIQUE(external_job_id, source)
- **ON CONFLICT DO NOTHING** — upsert pattern for deduplication
- **Foreign key CASCADE** — auto-delete dependents when parent is deleted
- **Indexes** — on frequently queried columns to prevent full table scans
- **Transactions + ROLLBACK** — ACID compliance, all-or-nothing operations

### Authentication & Security
- **bcrypt** — one-way password hashing, never store plain text
- **Salt** — random data added before hashing, defeats rainbow table attacks
- **JWT structure** — header.payload.signature (three base64 parts)
- **Access token vs Refresh token** — short-lived (15 min) vs long-lived (7 days)
- **HttpOnly cookies** — JS cannot read them, but browser auto-sends with requests
- **SameSite=Strict** — prevents CSRF attacks
- **Refresh token rotation** — invalidate old on use, issue new one

### API Design
- **REST conventions** — nouns not verbs (/jobs not /getJobs)
- **API versioning (/api/v1/)** — allows breaking changes without breaking old clients
- **Cursor-based pagination** — no page drift, O(log n) with index vs O(n) for offset
- **204 No Content** — correct response for DELETE

### Backend Architecture
- **node-cron vs setInterval** — cron with job lock prevents overlapping runs
- **Exponential backoff** — 2s → 4s → 8s retry intervals on failure
- **Dead Letter Queue** — parking lot for jobs that failed max retries
- **Message queue (BullMQ)** — decouples services, handles retries, survives crashes
- **Repository pattern** — separates DB queries from business logic
- **Service layer** — business logic lives between controller and repository
- **Zod** — validates env vars at startup and request bodies at runtime

### System Design Thinking
- **Modular monolith** — one process, clean internal module boundaries
- **User-independent scraping** — scrape once, match to many users
- **Master search list** — aggregate unique preferences before scraping
- **Initial load = HTTP, real-time = WebSocket** — correct hybrid pattern
- **Cost optimisation** — Claude categorises 500 jobs into 10 categories, generates 10 resumes not 500

---

*This document is updated at the end of each development phase.*
