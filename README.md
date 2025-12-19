# Impact-Aware IT Support System

> **Created by Kushal P**

An enterprise-grade, intelligent IT Support Ticket system featuring real-time "Smart Impact" analysis, active incident resolution centers, and automated ticket deflection strategies.

## 🚀 Project Overview

The Impact-Aware Support System revolutionizes traditional helpdesk workflows by moving from "First-In-First-Out" to **"Highest-Business-Impact-First"**. It uses a sophisticated logic engine to prioritize issues based on service criticality and affected user count, ensuring that major outages (like Email or Payroll) are always handled before minor individual issues.

### Key Features:

*   **⚡ Smart Impact Prioritization**: Automatically calculates impact scores (`Criticality` × `User Count`) to prioritize tickets dynamically.
*   **🛡️ Resolution Center**: A dedicated "War Room" interface for DevOps teams to monitor active, high-severity incidents in real-time.
*   **🧠 Intelligent Ticket Deflection**: As users type their issue, the system instantly suggests known solutions and detects duplicate incidents, reducing ticket volume by up to 30%.
*   **⏱️ Real-Time ETA Prediction**: Uses historical data to predict resolution times for specific failure types.
*   **📊 Live Operational Dashboard**: Visualizes service health, active/critical ticket ratios, and system uptime.
*   **🔔 SLA Awareness**: Proactive warnings for critical-priority submissions to prevent alarm fatigue.

## 🛠️ Tech Stack

This project works as a monolithic full-stack application separated into a clean client-server architecture:

### Frontend
- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS (Glassmorphism / Enterprise Dark Theme)
- **Visualization**: Recharts for data analytics
- **Icons**: Lucide React
- **Routing**: React Router DOM

### Backend
- **Runtime**: Node.js (v18+)
- **Server**: Express.js
- **Database**: SQLite (with `better-sqlite3` for high-performance synchronous I/O)
- **Containerization**: Docker support included

## 📂 Folder Structure

```
impact_support_system/
├── backend/              # Node.js API Server
│   ├── db.js             # Self-healing database initialization
│   ├── server.js         # REST API endpoints & business logic
│   ├── database.db       # SQLite Database (auto-generated)
│   └── Dockerfile        # Container configuration
│
├── frontend/             # React Client Application
│   ├── src/
│   │   ├── components/   # Reusable UI widgets (Modals, Sidebar)
│   │   ├── pages/        # Main views (Dashboard, Resolution Center)
│   │   ├── services/     # API integration layer
│   │   └── hooks/        # Custom React hooks
│   └── tailwind.config.js
│
├── .gitignore            # Git configuration
├── LICENSE               # MIT License
└── README.md             # Project Documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js installed on your machine.
- Git (optional, for version control).

### 1. Installation

Clone the repository and install dependencies for both subsystems:

```bash
# Setup Backend
cd backend
npm install

# Setup Frontend (in a new terminal)
cd ../frontend
npm install
```

### 2. Running Locally

**Start the Backend API:**
```bash
cd backend
node server.js
# Server runs on http://localhost:3000
```
*Note: The database will automatically seed itself with demo data on the first run.*

**Start the Frontend App:**
```bash
cd frontend
npm run dev
# App runs on http://localhost:5173
```

## ☁️ Deployment Guide

### Backend (Railway / Render / Fly.io)
The `backend/` folder constitutes a complete Docker-ready service.
1. Link your GitHub repository to your host of choice.
2. Point the "Root Directory" to `backend`.
3. The host will auto-detect the `Dockerfile` and build the service.

### Frontend (Vercel / Netlify)
1. Import the repository into Vercel/Netlify.
2. Set the "Root Directory" to `frontend`.
3. Set the "Build Command" to `npm run build` and "Output Directory" to `dist`.
4. **Important**: You must update `frontend/src/services/api.js` to point to your live backend URL (replace `http://localhost:3000`).

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
*Built with ❤️ by Kushal P*
