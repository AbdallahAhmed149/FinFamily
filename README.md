# FinFamily 👨‍👩‍👧‍👦💳

**FinFamily** is a family financial-literacy platform that gives parents a simulated debit-card system to manage their children's allowance, chores, and savings goals — while teaching kids real financial habits through interactive missions, mini-games, and a gamified rewards system.

> ⚠️ **Note:** FinFamily simulates a prepaid-card experience (fake card numbers, no real PAN/CVV, no live bank integration). It is built to demonstrate secure fintech-style architecture and **PCI-DSS-aligned** engineering practices, not to process real payment cards.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Security](#security)
- [Getting Started](#getting-started)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [API Overview](#api-overview)
- [Resetting the Database](#resetting-the-database)

---

## Features

### 👪 For Parents
- **Dashboard** — family balance, spending trends, and at-a-glance insights.
- **Allowance** — send instant or recurring allowance to any child.
- **Spending Limits & Blocked Categories** — set daily/weekly/monthly limits per child, and block entire spending categories.
- **Card Controls** — freeze/unfreeze, deactivate, or replace a child's simulated card.
- **Approvals** — review and approve/reject chore completions, reward redemptions, and card purchases above the configured limit.
- **AI Parent Coach** — chat with an AI assistant that has real context on the family's spending and habits.
- **Family Members & Activity Feed** — manage children profiles and see a live feed of everything happening in the family account.
- **Audit Log** — a full "who did what, and when" trail of every sensitive action (logins, limit changes, card status changes, approvals, etc.).
- **Two-Factor Authentication (mandatory)** — every parent account must enroll in TOTP-based 2FA (Google/Microsoft Authenticator) before using the dashboard.

### 🧒 For Kids
- **Simulated Debit Card (MeezaCard)** — a masked, realistic-looking card UI with balance and transaction history.
- **Missions & Chores** — complete assigned chores to earn money, or redeem savings for rewards (parent-approved).
- **Savings Goals** — set a goal, deposit toward it, and track progress.
- **Mini-Games** — 11 interactive, financial-literacy mini-games (budgeting, needs vs. wants, scam detection, investing basics, and more), each with its own XP/coin rewards.
- **Leveling, Streaks & Badges** — XP, levels, daily streaks, and unlockable badges for consistent engagement.
- **Leaderboard** — friendly competition between siblings.
- **AI Coach** — a kid-friendly financial chatbot.

---

## Tech Stack

**Frontend**
- React 18 + Vite
- React Router
- Tailwind CSS + shadcn/ui (Radix primitives)
- Framer Motion, Recharts, canvas-confetti

**Backend**
- FastAPI (Python)
- PostgreSQL + SQLAlchemy ORM
- JWT authentication (`python-jose`)
- `passlib` / `bcrypt` for password & PIN hashing
- `pyotp` + `qrcode` for TOTP-based MFA
- `slowapi` for rate limiting
- `resend` for transactional email (password reset)
- OpenAI API for the AI Coach

---

## Architecture

```
┌─────────────────┐        HTTPS/JSON        ┌──────────────────┐
│  React (Vite)   │ ───────────────────────▶ │   FastAPI (REST)  │
│  Parent + Child │ ◀─────────────────────── │   /api/*          │
│  SPA            │                          └─────────┬────────┘
└─────────────────┘                                    │
                                                         │ SQLAlchemy ORM
                                                         ▼
                                              ┌──────────────────┐
                                              │   PostgreSQL     │
                                              └──────────────────┘
```

Two independent apps live in one repo:
- **`/backend`** — a standalone FastAPI service exposing a REST API under `/api`.
- **`/src`** — a Vite/React single-page app that consumes that API.

They run as two separate local processes during development (see [Getting Started](#getting-started)).

---

## Security

Security was a first-class concern in this build, in line with PCI-DSS-style principles:

| Area | Implementation |
|---|---|
| **Card data** | No real PAN/CVV/PIN is ever generated or stored; card numbers are simulated and pre-masked (only last 4 digits kept). |
| **Password & PIN storage** | Hashed with `bcrypt` via `passlib` — never stored in plaintext. |
| **Transport** | JSON over HTTPS in production (CORS restricted to the configured frontend origin). |
| **Authentication** | JWT-based sessions, role-scoped (`parent` / `child`), with every query scoped to the caller's own family. |
| **MFA** | Mandatory TOTP two-factor authentication for all parent accounts (enrollment enforced via a route guard before any dashboard access). |
| **Rate limiting** | Login, child PIN login, registration, and family-code lookup are all rate-limited (`slowapi`) to prevent brute-force attacks. |
| **Audit logging** | Every sensitive action (logins — success/failure, limit changes, card status changes, MFA enable/disable, approvals) is recorded with actor, role, IP, and timestamp. |
| **Least privilege** | Every endpoint is guarded by role (`require_parent` / `require_child`) and scoped to `family_id` — no cross-family data access. |
| **Input validation** | All request bodies are validated through Pydantic schemas (length limits, regex patterns for PINs/OTPs, email validation). |

---

## Getting Started

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

pip install -r requirements.txt
```

Create a `.env` file inside `backend/` (see [Environment Variables](#environment-variables)), then run:

```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`, with interactive docs at `http://localhost:8000/docs`.

### Frontend Setup

```bash
npm install
npm run dev
```

Open the local URL Vite prints (typically `http://localhost:5173`).

> The frontend currently points at `http://localhost:8000/api` (see `src/api/base44Client.js`). Update this if your backend runs elsewhere.

---

## Environment Variables

Create `backend/.env` with:

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/finfamily

# Auth
JWT_SECRET=your-long-random-secret

# AI Coach
OPENAI_API_KEY=sk-...

# Password reset emails (https://resend.com)
RESEND_API_KEY=re_...
RESEND_FROM_ADDRESS="FinFamily <onboarding@resend.dev>"   # optional, has a default
```

`JWT_SECRET` should be a long, random string — never commit real secrets to the repo.

---

## Project Structure

```
FinFamily/
├── backend/
│   ├── api/            # FastAPI routers (auth, family/wallet, AI coach)
│   ├── core/           # security, JWT deps, rate limiter, MFA, audit logging
│   ├── db/             # SQLAlchemy models & session setup
│   ├── schemas/        # Pydantic request/response schemas
│   ├── services/       # business logic (scoring, insights, games, badges, streaks, email)
│   ├── main.py          # FastAPI app entrypoint
│   └── reset_db.py      # dev-only: drops & recreates all tables
│
└── src/
    ├── api/             # thin fetch wrapper around the backend
    ├── components/      # shared UI (shadcn/ui-based) + fin-specific components
    ├── lib/             # AuthContext, API helpers, shared data/constants
    └── pages/
        ├── fin/parent/  # parent-facing screens
        └── fin/child/   # child-facing screens
```

---

## API Overview

All endpoints are namespaced under `/api`. Full interactive documentation is auto-generated by FastAPI at `/docs` once the backend is running. Highlights:

| Group | Examples |
|---|---|
| **Auth** | `POST /auth/register`, `POST /auth/login`, `POST /auth/child-login`, `POST /auth/forgot-password`, `POST /auth/reset-password` |
| **MFA** | `GET /auth/mfa/status`, `POST /auth/mfa/setup`, `POST /auth/mfa/enable`, `POST /auth/mfa/disable` |
| **Wallet** | `GET /wallet/me`, `PATCH /wallet/child/{id}/limits`, `PATCH /wallet/child/{id}/card-status`, `POST /wallet/child/{id}/allowance` |
| **Missions** | `POST /missions`, `POST /missions/{id}/submit`, `POST /missions/{id}/review` |
| **Card Purchases** | `POST /card/purchases`, `POST /card/purchases/{id}/review` |
| **Games & Badges** | `POST /games/complete`, `GET /badges/mine` |
| **Insights & Activity** | `GET /family/insights`, `GET /family/activity`, `GET /audit-logs` |
| **AI Coach** | `POST /functions/aiCoach` |

---

## Resetting the Database

For local development, `reset_db.py` drops the entire `public` schema (via `CASCADE`, so it's safe against schema drift) and recreates all tables from the current models:

```bash
cd backend
python reset_db.py
```

⚠️ This **permanently deletes all data** — use only in development.