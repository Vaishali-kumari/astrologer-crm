# 🔮 Astrologer CRM

A full-stack Customer Relationship Management system built for astrologers to manage clients, track consultations, and schedule follow-ups.

---

## 📋 Project Overview

**Astrologer CRM** helps practicing astrologers manage their client base efficiently. It provides a clean dashboard to view upcoming appointments, track consultation history with detailed session notes, manage payments, and never miss a client follow-up.

---

## ✨ Features

- **🔐 Authentication** — JWT-based login with secure bcrypt password hashing
- **📊 Dashboard** — At-a-glance stats, upcoming consultations, overdue follow-ups, revenue summary
- **👤 Client Management** — Full client profiles with birth details (DOB, time, place), zodiac/rising/moon signs, contact info, and notes
- **📅 Consultation Tracking** — Log sessions with type, duration, status, fees, session notes, and recommendations
- **💰 Payment Tracking** — Mark fees as paid/unpaid, view collected vs pending revenue
- **🔔 Follow-up Manager** — Schedule and track follow-ups, visual overdue alerts
- **🔍 Search & Filter** — Search clients by name/email/phone, filter by zodiac sign, filter consultations by status/type

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Tailwind CSS |
| Routing | React Router v6 |
| HTTP Client | Axios |
| Icons | Lucide React |
| Date Handling | date-fns |
| Build Tool | Vite |
| Backend | Node.js, Express.js |
| Database | LowDB (JSON file-based, no native compilation) |
| Auth | JWT (jsonwebtoken) + bcryptjs |

---

## 📁 Project Structure

```
astrologer-crm/
├── backend/
│   ├── src/
│   │   ├── index.js              # Express server entry
│   │   ├── db.js                 # LowDB setup + seeding
│   │   ├── middleware/
│   │   │   └── auth.js           # JWT middleware
│   │   └── routes/
│   │       ├── auth.js           # Login / Register
│   │       ├── clients.js        # Client CRUD
│   │       ├── consultations.js  # Consultation CRUD
│   │       ├── followups.js      # Follow-up management
│   │       └── dashboard.js      # Stats & aggregates
│   ├── data/                     # Auto-created JSON DB
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/axios.ts          # Axios instance
│   │   ├── context/AuthContext.tsx
│   │   ├── types/index.ts        # TypeScript types
│   │   ├── components/
│   │   │   ├── Layout.tsx        # Sidebar + shell
│   │   │   ├── Modal.tsx         # Reusable modal
│   │   │   └── ClientForm.tsx    # Reusable client form
│   │   └── pages/
│   │       ├── LoginPage.tsx
│   │       ├── DashboardPage.tsx
│   │       ├── ClientsPage.tsx
│   │       ├── ClientDetailPage.tsx
│   │       ├── ConsultationsPage.tsx
│   │       └── FollowupsPage.tsx
│   └── package.json
│
├── README.md
└── AI_USAGE.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+ 
- npm v9+

### 1. Clone / Download

```bash
git clone <your-repo-url>
cd astrologer-crm
```

### 2. Start the Backend

```bash
cd backend
npm install
npm start
```

The API will run on **http://localhost:5000**

On first run, a default user is created:
- **Email:** `admin@astrologer.com`
- **Password:** `admin123`

### 3. Start the Frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The app will be available at **http://localhost:3000**

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/register` | Register new user |
| GET | `/api/clients` | List clients (search, zodiac filter) |
| POST | `/api/clients` | Create client |
| GET | `/api/clients/:id` | Client detail + consultations |
| PUT | `/api/clients/:id` | Update client |
| DELETE | `/api/clients/:id` | Delete client |
| GET | `/api/consultations` | List consultations (filter by status, type, upcoming) |
| POST | `/api/consultations` | Create consultation |
| PUT | `/api/consultations/:id` | Update consultation |
| GET | `/api/followups` | List follow-ups |
| POST | `/api/followups` | Create follow-up |
| PATCH | `/api/followups/:id/toggle` | Toggle follow-up done |
| DELETE | `/api/followups/:id` | Delete follow-up |
| GET | `/api/dashboard/stats` | Dashboard stats |

---

## 🏗️ Architecture & Design Decisions

- **LowDB** was chosen over SQLite to avoid native compilation dependencies (node-gyp) on Windows. The JSON file acts as a lightweight persistent store — sufficient for a demo/single-user CRM.
- **JWT auth** with 24h expiry stored in localStorage; interceptors auto-attach the token on every request.
- **Vite proxy** routes `/api/*` to the backend in dev, avoiding CORS issues.
- The frontend is intentionally structured with small, focused components and pages for clarity during review.

---

## 🔮 Future Improvements

- [ ] Kundli / birth chart generation and display
- [ ] WhatsApp/SMS reminder integration for follow-ups
- [ ] Calendar view for consultations
- [ ] PDF report generation per client
- [ ] Multi-user support with role-based access
- [ ] Recurring consultation templates
- [ ] Export client data to CSV
- [ ] Mobile-responsive improvements + PWA support
- [ ] Real database (PostgreSQL/MySQL) for production
