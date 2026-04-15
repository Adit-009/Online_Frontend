# Third Eye Computer Education — Frontend

React single-page application for the Third Eye Computer Education learning platform.

---

## 📋 Project Overview

This frontend provides:
- **Student & admin authentication** (login/register)
- **Course catalog** and detailed course pages
- **Course player** with watermarked video protection and progress tracking
- **Student dashboard** (enrollments, activity, referral stats)
- **Referral & Earn system** (unique referral links, milestone tracking)
- **Exam booking** with eligibility checks
- **Doubt sessions** scheduling
- **Leaderboard** (Hall of Fame)
- **Admin panel** (courses, students, enrollments, exams, doubt sessions)

---

## ⚙️ Setup Instructions

### 1. Install dependencies
```bash
cd frontend
npm install
```

### 2. Configure environment variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

### 3. Run in development
```bash
npm start
```
> Runs on `http://localhost:3000`. The API is auto-detected — in production it calls the same-origin backend; in development it falls back to `http://localhost:8005`.

### 4. Build for production
```bash
npm run build
```
> Output goes to `/build`. This static folder is served by the backend in production.

---

## 🔑 Environment Variables

| Variable | Description |
|---|---|
| `REACT_APP_API_URL` | Backend API URL for development (e.g. `http://localhost:8005`) |

> In **production**, the frontend is served by the backend itself, so no API URL is needed — all requests go to the same origin automatically.

---

## 🌐 Frontend–Backend Connection

### Development
- Frontend runs on `:3000`, backend on `:8005`
- `api.js` uses `REACT_APP_API_URL` or falls back to `http://localhost:8005`

### Production (Unified Hosting)
- Run `npm run build` in `/frontend`
- The backend (`server.js`) serves the `/frontend/build` folder as static files
- **No separate frontend deployment needed** — deploy only the backend

---

## 🚀 Deployment

### Option A — Unified (Recommended)
Deploy only the **backend** to Render/Railway/VPS:
1. Build the frontend: `cd frontend && npm run build`
2. The backend serves the built files automatically
3. Deploy the backend (see `backend/README.md`)

### Option B — Separate (Vercel/Netlify)
1. Deploy frontend to [Vercel](https://vercel.com) or [Netlify](https://netlify.com)
2. Set environment variable: `REACT_APP_API_URL=https://your-backend.onrender.com`
3. Update `FRONTEND_URL` in your backend env to your frontend URL (for CORS)

---

## 📁 Project Structure

```
frontend/src/
├── components/
│   ├── AdminLayout.js          # Admin sidebar layout wrapper
│   ├── ContentProtection.js    # Right-click / copy protection
│   ├── ProtectedRoute.js       # Auth route guard
│   ├── ProtectedVideoPlayer.js # Watermarked video player
│   ├── ReferralTracker.js      # Captures ?ref= URL param on landing
│   └── ui/
│       └── sonner.js           # Toast notifications
├── context/
│   ├── AuthContext.js          # Global auth state
│   └── ThemeContext.js         # Dark/light mode state
├── hooks/                      # Custom React hooks
├── lib/                        # Utility libraries
├── pages/
│   ├── AdminCourses.js
│   ├── AdminDashboard.js
│   ├── AdminDoubtSessions.js
│   ├── AdminExams.js
│   ├── AdminManagement.js
│   ├── AdminPayments.js
│   ├── AdminStudents.js
│   ├── CourseDetails.js
│   ├── CourseList.js
│   ├── CoursePlayer.js
│   ├── DoubtSessions.js
│   ├── ExamBooking.js
│   ├── HomePage.js
│   ├── Leaderboard.js
│   ├── Loader.js
│   ├── LoginPage.js
│   ├── ReferAndEarn.js
│   ├── RegisterPage.js
│   └── StudentDashboard.js
├── utils/
│   └── api.js                  # Centralised API client
├── App.js                      # Routes
└── index.js                    # Entry point
```

---

## 🔒 Security Notes

- All API calls use `credentials: 'include'` to send HTTP-only cookies
- Video content is watermarked with the student's name for content protection
- Right-click and screenshot shortcuts are disabled on the course player
- Referral codes are captured via URL params and stored in `sessionStorage` only

---

## 📌 Important Notes

- **Dark mode** is supported out of the box via `ThemeContext`
- All pages are **lazy-loaded** (`React.lazy`) for faster initial load
- Toast notifications use the `sonner` library
- Google Fonts (`Outfit`) are loaded via `index.css`
