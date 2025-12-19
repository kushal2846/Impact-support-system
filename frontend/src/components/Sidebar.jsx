import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Ticket, Activity, AlertTriangle, ShieldCheck } from 'lucide-react';

function NavLink({ to, icon, label }) {
    const location = useLocation();
    const active = location.pathname === to;
    return (
        <Link to={to} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${active ? 'bg-brand-600/20 text-brand-500 border border-brand-500/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
            {icon}
            <span className="font-medium">{label}</span>
            {active && <span className="ml-auto w-1 h-1 rounded-full bg-brand-500 shadow-[0_0_10px_rgba(14,165,233,0.5)]"></span>}
        </Link>
    );
}

export default function Sidebar() {
    return (
        <aside className="w-64 bg-slate-900 border-r border-white/5 flex flex-col h-full z-10">
            <div className="p-6 border-b border-white/5">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-2">
                    <Activity size={24} className="text-blue-500" /> ImpactAware
                </h1>
                <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest pl-8">Enterprise IT</p>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                <NavLink to="/" icon={<LayoutDashboard size={20} />} label="Overview" />
                <NavLink to="/resolution" icon={<ShieldCheck size={20} />} label="Resolution Center" />
                <NavLink to="/tickets" icon={<Ticket size={20} />} label="Ticket Center" />
            </nav>

            <div className="p-4">
                <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 p-4 rounded-xl border border-indigo-500/20 shadow-lg backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-indigo-300 mb-2">
                        <AlertTriangle size={16} />
                        <span className="text-xs font-bold uppercase">System Status</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <span className="text-sm text-white/80 font-medium">Operational</span>
                    </div>
                </div>
            </div>
        </aside>
    );
}
