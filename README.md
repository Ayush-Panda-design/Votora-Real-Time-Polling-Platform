# 📊 Votora - Real-Time Polling & Live Feedback Platform



**Votora** is a production-grade, full-stack platform that allows creators, educators, and event hosts to run immersive, real-time polls and quizzes. Built with modern web technologies, it features live analytics, advanced anti-cheat mechanisms, and a dual-timing system, delivering a seamless experience for both creators and respondents.

---

## 🌟 Key Features

### 🚀 **For Creators**
- **Dynamic Poll Creation**: Build standard polls or full quizzes (with correct answers and scoring).
- **Dual Time Management**: 
  - *Auto-Expiry*: Set a precise date/time for the poll to close automatically.
  - *Manual Live Timer*: A synchronized timer you control. Respondents are held in a "Waiting" room until you click *Start*, ensuring a perfectly synchronized competitive environment.
- **Advanced Anti-Cheat System**: In Quiz Mode, tab switching or window defocusing instantly disqualifies the user and auto-submits their current progress.
- **Live Dashboard & Analytics**: Watch votes come in real-time. View high-performance charts (Bar/Pie) powered by MongoDB Aggregation Pipelines.
- **Presentation Mode**: A clean, distraction-free view designed for screen-sharing in classrooms or meetings.
- **Publish Results**: Optionally expose the final analytics to the public via the original poll link.
- **CSV Export**: Download response data for deeper external analysis.

### 👥 **For Respondents**
- **Frictionless Participation**: Anonymous polls require no login.
- **Live Sync**: No page refreshes needed. Updates happen instantly via WebSockets.
- **Cross-Device Ready**: Beautiful, glassmorphic UI optimized for mobile, tablet, and desktop.
- **Smart Redirection**: If a poll requires authentication, logging in seamlessly redirects the user back to the poll they were trying to access.

---

## 🛠️ Tech Stack & Architecture

Votora is built using the **MERN** stack, augmented with modern tooling for real-time capabilities and enterprise-grade security.

### **Frontend**
- **Framework**: React.js (Vite)
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS + Vanilla CSS (for custom utility classes)
- **Animations**: Framer Motion for highly fluid, 60fps micro-interactions
- **Charts**: Recharts
- **Routing**: React Router DOM (v6)

### **Backend**
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose)
- **Real-Time**: Socket.io (with dedicated rooms for poll isolation)
- **Authentication**: JWT (JSON Web Tokens) via `httpOnly` cookies + Google OAuth2.0
- **Validation**: `express-validator` for robust backend data integrity

### **Security & Architecture Highlights**
- **Clean Architecture**: Strong separation of concerns (Routes → Controllers → Services → Models).
- **XSS Protection**: JWT tokens are stored exclusively in `httpOnly` cookies — never in localStorage.
- **Rate Limiting**: Custom limits (`express-rate-limit`) on general API endpoints and strict limits on Auth endpoints to prevent brute-force attacks.
- **Atomic Operations**: MongoDB `$inc` operators prevent race conditions and double-voting during high-concurrency traffic spikes.
- **Global Error Handling**: Standardized `ApiError` class ensuring consistent JSON error responses across the entire application.

---

## ⚙️ Local Development Setup

Follow these steps to run Votora locally.

### **1. Prerequisites**
- Node.js (v18+ recommended)
- MongoDB (Local instance or MongoDB Atlas cluster)
- Google Cloud Console account (for Google OAuth credentials)

### **2. Clone the Repository**
```bash
git clone https://github.com/yourusername/votora.git
cd votora
```

### **3. Backend Setup**
```bash
cd server
npm install
```
Create a `.env` file in the `server/` directory (or run `npm run setup` from the project root):
```env
PORT=5013
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Database
MONGO_URI=mongodb://localhost:27017/votora

# JWT Security
JWT_SECRET=your_highly_secure_random_string
JWT_EXPIRES_IN=7d

# Google OAuth (client-side ID token verification)
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```
Run the backend:
```bash
npm run dev
```

### **4. Frontend Setup**
Open a new terminal window:
```bash
cd client
npm install
```
Create a `.env` file in the `client/` directory:
```env
VITE_API_URL=http://localhost:5013/api
VITE_SOCKET_URL=http://localhost:5013

# To enable Google Sign-In, provide your Client ID.
# Leaving it blank or as 'your_google_client_id_here' will gracefully hide the Google buttons.
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```
Run the frontend:
```bash
npm run dev
```

### **Quick start (both apps)**

From the project root:

```bash
npm install
npm run setup      # copies .env.example → .env for server & client
npm run install:all
npm run dev        # starts server (5013) + client (5173)
```

### **Docker**

```bash
docker compose up --build
```

The application will be running at `http://localhost:5173` (client) with the API at `http://localhost:5013`.

---

## 🏗️ Folder Structure

```text
poll-platform/
├── client/                     # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/         # Reusable UI elements (Buttons, Inputs, Spinners)
│   │   ├── features/           # Feature-based modular structure
│   │   │   ├── auth/           # Login, Signup, Landing pages
│   │   │   ├── polls/          # Dashboard, Creation, Editing
│   │   │   ├── publicPoll/     # The respondent voting interface
│   │   │   ├── analytics/      # Charts and data visualization
│   │   │   └── help/           # Built-in documentation
│   │   ├── layouts/            # Page wrappers (e.g., Dashboard Sidebar)
│   │   ├── services/           # Axios API configurations
│   │   ├── socket/             # Socket.io client setup
│   │   ├── store/              # Redux configuration
│   │   └── utils/              # Helper functions & constants
│   └── .env
│
└── server/                     # Node.js/Express Backend
    ├── src/
    │   ├── config/             # DB, Socket, Multer configurations
    │   ├── constants/          # Application-wide enumerations
    │   ├── controllers/        # Request handling and response mapping
    │   ├── middleware/         # Auth, Error handling, Rate limiting
    │   ├── models/             # Mongoose schemas (Poll, User, Response, Analytics)
    │   ├── routes/             # Express routing
    │   ├── services/           # Core business logic and DB interactions
    │   ├── sockets/            # Socket.io event listeners and emitters
    │   ├── utils/              # Helpers (Token generation, Aggregations)
    │   └── validators/         # express-validator schemas
    ├── .env
    └── server.js               # Entry point
```

---

## 🛡️ Hackathon Requirements Compliance Checklist

This project was built to exceed standard hackathon requirements:

- [x] **Full-Stack Implementation**: Seamless integration between React, Node, and MongoDB.
- [x] **Poll Creation**: Multi-question support with descriptions.
- [x] **Mandatory/Optional Flags**: Strict validation enforced on both frontend and backend.
- [x] **Anonymous/Auth Modes**: Supported natively. Unauthenticated users are hard-blocked on the backend from restricted quizzes.
- [x] **Expiry System**: Includes scheduled expiry dates *plus* manual synchronized live timers.
- [x] **Single Option Selection**: Standardized UI and schema constraints for MCQ formats.
- [x] **Analytics Dashboard**: Aggregation-pipeline powered stats yielding instant option counts and participation insights.
- [x] **Result Publishing**: Creator-controlled toggle to make final results public on the original URL.
- [x] **WebSockets**: Live participant counters and instant chart updates via `socket.io`.
- [x] **Code Quality**: Strict separation of concerns, global error handling, robust authentication (httpOnly cookies), and comprehensive documentation.

---
