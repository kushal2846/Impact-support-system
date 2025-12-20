import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';
import { AlertCircle, CheckCircle, Clock, Zap, ArrowRight, Plus, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import CreateTicketModal from '../components/CreateTicketModal';
import { formatDate } from '../utils/format';

const StatCard = ({ title, value, sub, icon: Icon, color }) => (
    <div className="glass-panel p-6 relative overflow-hidden group hover:bg-slate-800 transition-colors">
        <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity`}>
            <Icon size={64} className={color} />
        </div>
        <div className="relative z-10">
            <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">{title}</h3>
            <div className="text-4xl font-bold mt-2 text-white">{value}</div>
            <div className="text-xs text-slate-500 mt-2">{sub}</div>
        </div>
    </div>
);

const ActivityFeed = () => {
    const [activities, setActivities] = useState([]);

    useEffect(() => {
        api.getActivityLog().then(setActivities);
    }, []);

    return (
        <div className="glass-panel p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Activity size={18} className="text-brand-400" /> Recent Activity
            </h3>
            <div className="space-y-4">
                {activities.map((act, i) => (
                    <div key={i} className="flex gap-3 relative pb-4 last:pb-0 border-l border-white/10 pl-4 last:border-0">
                        <div className={`absolute -left-[5px] top-1 h-2.5 w-2.5 rounded-full ${act.type === 'system' ? 'bg-purple-500' : 'bg-brand-500'}`}></div>
                        <div>
                            <p className="text-sm text-slate-200">
                                {act.type === 'system' ? act.title : (
                                    <span>Created new ticket: <span className="text-white font-medium">{act.incident_id}</span></span>
                                )}
                            </p>
                            {act.type !== 'system' && <p className="text-xs text-slate-400">{act.title}</p>}
                            <p className="text-[10px] text-slate-600 uppercase mt-1">{formatDate(act.time)}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreate, setShowCreate] = useState(false);

    const loadData = () => {
        api.getDashboardStats().then(data => {
            if (data.error) throw new Error(data.error);
            setStats(data);
            setError(null);
        }).catch(err => {
            console.error("Dashboard Load Error:", err);
            setError("Unable to connect to live services.");
        }).finally(() => {
            setLoading(false);
        });
    };

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 10000);
        return () => clearInterval(interval);
    }, []);

    if (loading && !stats) return <div className="p-10 text-center text-slate-500 animate-pulse">Initializing Dashboard Link...</div>;

    // Error State / Empty State to prevent Crash
    if (error || !stats || !stats.affectedServices) {
        return (
            <div className="p-10 text-center animate-fade-in">
                <div className="inline-flex bg-red-500/10 p-4 rounded-full mb-4 text-red-500">
                    <AlertCircle size={48} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">System Status: Reconnecting</h3>
                <p className="text-slate-400 max-w-md mx-auto">
                    The dashboard is attempting to establish a secure link with the cloud database.
                    This typically resolves in 10-30 seconds after a cold boot.
                </p>
                <div className="mt-8">
                    <button onClick={() => window.location.reload()} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 transition-colors">
                        Force Refresh
                    </button>
                </div>
            </div>
        );
    }

    const COLORS = ['#0ea5e9', '#ef4444', '#eab308', '#22c55e', '#a855f7'];

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <header className="flex justify-between items-end mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-white">Operational Overview</h2>
                    <p className="text-slate-400">Real-time impact analysis and support metrics.</p>
                </div>
                <button
                    onClick={() => setShowCreate(true)}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus size={20} />
                    Report Issue
                </button>
            </header>

            {/* Key Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Active Incidents"
                    value={stats.totalOpen || 0}
                    sub="Currently affecting operations"
                    icon={AlertCircle}
                    color="text-red-500"
                />
                <StatCard
                    title="Avg Resolution"
                    value={`${stats.avgResolutionHours || 0}h`}
                    sub="Rolling 30-day average"
                    icon={Clock}
                    color="text-blue-500"
                />
                <StatCard
                    title="Critical Impact"
                    value={stats.criticalTickets}
                    sub="High priority tickets"
                    icon={Zap}
                    color="text-yellow-500"
                />
                <StatCard
                    title="System Health"
                    value="91.4%"
                    sub="Service uptime estimate"
                    icon={CheckCircle}
                    color="text-green-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Chart */}
                <div className="glass-panel p-6 lg:col-span-2 min-h-[400px]">
                    <h3 className="text-lg font-semibold text-white mb-6">Service Impact Distribution</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.affectedServices}>
                                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                    itemStyle={{ color: '#e2e8f0' }}
                                />
                                <Bar dataKey="ticket_count" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                                    {stats.affectedServices.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Activity Feed */}
                <ActivityFeed />
            </div>

            {showCreate && <CreateTicketModal onClose={() => setShowCreate(false)} onCreated={loadData} />}
        </div>
    );
}
