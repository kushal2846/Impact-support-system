# Impact-Aware IT Support System

An enterprise-grade IT Support Ticket system with 'Smart Impact' analysis, Real-time ETA prediction, and active ticket deflection.

## Features

- **Impact-Aware Prioritization**: Auto-calculates Criticality scores.
- **Resolution Center**: Live monitoring of active incidents with predicted root causes.
- **Smart Deflection**: Suggests solutions before tickets are raised.
- **Activity Feed**: Real-time log of system events.

## Structure

- `frontend/`: React + Vite + Tailwind CSS
- `backend/`: Node.js + Express + SQLite

## Running Locally

1. **Backend**:
   ```bash
   cd backend
   npm install
   node server.js
   ```

2. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Deployment

### Backend (Railway/Render)
The backend includes a `Dockerfile` for containerized deployment. 
It creates a local SQLite database on startup. **Note**: On ephemeral hosting (like free tier Render/Railway), data resets on restart.

### Frontend (Vercel/Netlify)
Deploy the `frontend` folder directly. 
Update `src/services/api.js` to point to your deployed backend URL.

