<<<<<<< HEAD
# 🎓 CampusVoice — Campus Complaint Management System

A full-stack complaint management system for educational institutions. Built with **React + Vite**, **Node.js + Express**, and **Supabase**.

---

## 🏗 Architecture

```
Browser (React)
     ↓  JWT token in every request
Express Backend (Node.js)
     ↓  Service Role Key (secret, server only)
Supabase (PostgreSQL + Storage)
```

- The **frontend** handles UI and Supabase Auth (login/logout)
- The **backend** handles all data operations securely using the service role key
- **Supabase** stores data, files, and manages authentication tokens

---

## 📁 Project Structure

```
campus-complaints/
├── frontend/                   # React + Vite app
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/         # Sidebar, Layout
│   │   │   ├── complaints/     # ComplaintCard, FilterBar
│   │   │   └── ui/             # ProtectedRoute
│   │   ├── hooks/
│   │   │   ├── useAuth.jsx     # Supabase auth context
│   │   │   └── useComplaints.js
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── SignupPage.jsx
│   │   │   ├── FeedPage.jsx
│   │   │   ├── SubmitPage.jsx
│   │   │   ├── MyComplaintsPage.jsx
│   │   │   └── AdminPage.jsx
│   │   ├── services/
│   │   │   ├── supabase.js     # Supabase anon client (auth only)
│   │   │   ├── auth.js         # Auth service
│   │   │   └── api.js          # All backend API calls
│   │   └── utils/
│   │       └── constants.js
│   └── .env.example
│
├── backend/                    # Node.js + Express API
│   ├── server.js               # Entry point
│   ├── config/
│   │   └── supabase.js         # Admin client (service role key)
│   ├── middleware/
│   │   └── auth.js             # JWT verification + admin check
│   ├── routes/
│   │   ├── auth.js             # Signup, /me
│   │   ├── complaints.js       # CRUD + image upload
│   │   ├── votes.js            # Toggle vote
│   │   └── admin.js            # Admin-only routes
│   └── .env.example
│
└── supabase_schema.sql         # Database schema
```

---

## 🚀 Setup Guide

### Step 1 — Supabase Setup

1. Go to [supabase.com](https://supabase.com) → create a project
2. Go to **SQL Editor** → paste and run `supabase_schema.sql`
3. Go to **Authentication → Settings** → turn OFF email confirmations

### Step 2 — Backend Setup

```bash
cd backend
cp .env.example .env
```

Fill in your `.env`:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key   # Settings → API → service_role
PORT=4000
ADMIN_EMAILS=admin@vnrvjiet.in
CLIENT_URL=http://localhost:5173
```

> ⚠️ The **service_role** key is under Settings → API → service_role (not the anon key). Keep this secret — never put it in the frontend.

```bash
npm install
npm run dev     # starts on http://localhost:4000
```

### Step 3 — Frontend Setup

```bash
cd frontend
cp .env.example .env
```

Fill in your `.env`:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key        # Settings → API → anon/public
VITE_API_URL=http://localhost:4000/api
```

```bash
npm install
npm run dev     # starts on http://localhost:5173
```

---

## 🔑 API Endpoints

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/signup` | Public | Create account |
| GET | `/api/auth/me` | User | Get current user info |
| GET | `/api/complaints` | Public | Get all complaints |
| POST | `/api/complaints` | User | Submit complaint + image |
| GET | `/api/complaints/my` | User | Get my complaints |
| DELETE | `/api/complaints/:id` | User/Admin | Delete complaint |
| POST | `/api/votes/:id/toggle` | User | Toggle vote |
| GET | `/api/votes/my` | User | Get my voted complaint IDs |
| GET | `/api/admin/complaints` | Admin | Get all complaints |
| PATCH | `/api/admin/complaints/:id` | Admin | Update status + remarks |
| DELETE | `/api/admin/complaints/:id` | Admin | Delete any complaint |
| GET | `/api/admin/stats` | Admin | Dashboard stats |
| GET | `/api/health` | Public | Health check |

---

## 👑 Admin Setup

1. Sign up with `admin@vnrvjiet.in`
2. Make sure that email is in `backend/.env` under `ADMIN_EMAILS`
3. Log in → Admin Panel appears in the sidebar automatically

To add more admins, comma-separate them:
```env
ADMIN_EMAILS=admin@vnrvjiet.in,director@vnrvjiet.in
```

---

## 🗄 Database Tables

### `complaints`
| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| title | TEXT | Complaint title |
| description | TEXT | Full description |
| category | TEXT | infrastructure, academics, hostel, food, transport, hygiene, safety, other |
| status | TEXT | pending, in_progress, resolved, rejected |
| user_id | UUID | FK to auth.users |
| author_name | TEXT | Display name or "Anonymous" |
| is_anonymous | BOOLEAN | Hide author in feed |
| image_url | TEXT | Supabase storage URL |
| votes_count | INTEGER | Denormalized total |
| admin_remarks | TEXT | Admin response |

### `votes`
| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| complaint_id | UUID | FK to complaints |
| user_id | UUID | FK to auth.users |

---

## 🚢 Deployment

**Backend** → [Railway](https://railway.app) or [Render](https://render.com)

**Frontend** → [Vercel](https://vercel.com) or [Netlify](https://netlify.com)

After deploying backend, update frontend `.env`:
```env
VITE_API_URL=https://your-backend.railway.app/api
```
=======
# Campus-Complaints
A web-based Smart Campus Management System that enables students and faculty to report and track classroom infrastructure issues efficiently. It provides administrators with tools to manage, assign, and resolve complaints, ensuring smooth campus operations and improved accountability.
>>>>>>> 1dde595ae933eceb47dfac0facae9b4c1eb69bed
