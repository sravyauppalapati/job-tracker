# 🎯 JobTracker — Command Center

A full-stack job application tracker built with **React.js + Node.js + Express + MySQL**.

---

## ✨ Features

- 🔐 **Authentication** — JWT-based register/login with hashed passwords (bcrypt)
- 📋 **Job Management** — Track applications with status, priority, salary, location
- 🗓️ **Interview Countdown** *(Unique Feature #1)* — Visual countdown showing days until your next interview, with urgency highlighting
- 📊 **Analytics Dashboard** *(Unique Feature #2)* — Pie + bar charts showing pipeline stats, response rate, offer rate
- 📝 **Activity Log / Notes** *(Unique Feature #3)* — Per-application notes log to track updates, calls, and feedback
- 🔍 **Filtering** — Filter by status, priority, or search by company/role
- ⚡ **Quick Status Update** — Update application status directly from the detail view

---

## 🛠️ Tech Stack

| Layer    | Technology              |
|----------|-------------------------|
| Frontend | React 18, React Router 6, Recharts, Axios, Vite |
| Backend  | Node.js, Express 4      |
| Database | MySQL (via mysql2)      |
| Auth     | JWT + bcryptjs          |

---

## 🚀 Setup Instructions

### 1. Database Setup (MySQL Workbench)

1. Open MySQL Workbench
2. Open `database/schema.sql`
3. Run the entire script — it creates the `job_tracker` database and tables

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env and set your MySQL password + a strong JWT_SECRET
npm install
npm run dev
```

The API will run on **http://localhost:5000**

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app will run on **http://localhost:5173**

---

## 📁 Project Structure

```
job-tracker/
├── database/
│   └── schema.sql              # Run this first in MySQL Workbench
├── backend/
│   ├── server.js               # Express app entry point
│   ├── .env.example            # Copy to .env and fill in values
│   ├── config/
│   │   └── db.js               # MySQL connection pool
│   ├── middleware/
│   │   └── auth.js             # JWT auth middleware
│   └── routes/
│       ├── auth.js             # POST /register, POST /login, GET /me
│       └── jobs.js             # Full CRUD + notes + stats
└── frontend/
    └── src/
        ├── App.jsx             # Router setup + protected routes
        ├── context/
        │   └── AuthContext.jsx # Global auth state
        ├── api/
        │   └── index.js        # Axios helpers + constants
        ├── pages/
        │   ├── Login.jsx
        │   ├── Register.jsx
        │   ├── Dashboard.jsx   # Overview + upcoming interviews
        │   ├── Jobs.jsx        # All applications with filters
        │   ├── JobDetail.jsx   # Detail view + notes
        │   └── Analytics.jsx  # Charts + stats
        └── components/
            ├── Sidebar.jsx
            └── JobModal.jsx    # Add/Edit modal
```

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint           | Description          |
|--------|--------------------|----------------------|
| POST   | /api/auth/register | Register new user    |
| POST   | /api/auth/login    | Login + get JWT      |
| GET    | /api/auth/me       | Get current user     |

### Jobs (all protected — require Bearer token)
| Method | Endpoint                    | Description                 |
|--------|-----------------------------|-----------------------------|
| GET    | /api/jobs                   | Get all jobs (with filters) |
| GET    | /api/jobs/stats             | Get dashboard stats         |
| GET    | /api/jobs/:id               | Get one job                 |
| POST   | /api/jobs                   | Create job                  |
| PUT    | /api/jobs/:id               | Update job                  |
| DELETE | /api/jobs/:id               | Delete job                  |
| GET    | /api/jobs/:id/notes         | Get notes for job           |
| POST   | /api/jobs/:id/notes         | Add note                    |
| DELETE | /api/jobs/:id/notes/:noteId | Delete note                 |

---

## 🧠 Learning Highlights

- **JWT Auth flow** — token stored in localStorage, sent via Authorization header
- **Protected routes** in React Router using a wrapper component
- **Axios defaults** — setting the auth header globally after login
- **MySQL connection pool** — efficient DB connections with mysql2/promise
- **Context API** — global auth state without Redux
- **Recharts** — responsive charts with custom tooltips
