import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import TicketList from './pages/TicketList';
import TicketDetail from './pages/TicketDetail';
import ResolutionCenter from './pages/ResolutionCenter';

function App() {
  return (
    <Router>
      <div className="flex h-screen bg-slate-950 text-white overflow-hidden font-sans selection:bg-brand-500/30">
        <Sidebar />
        <main className="flex-1 overflow-auto relative scrollbar-thin scrollbar-thumb-slate-700 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/resolution" element={<ResolutionCenter />} />
            <Route path="/tickets" element={<TicketList />} />
            <Route path="/tickets/:id" element={<TicketDetail />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
