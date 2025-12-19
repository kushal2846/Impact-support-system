import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Link } from 'react-router-dom';
import { AlertTriangle, CheckCircle, Clock, Search } from 'lucide-react';

export default function TicketList() {
    const [tickets, setTickets] = useState([]);
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        api.getTickets(100).then(setTickets);
    }, []);

    const filtered = tickets.filter(t => filter === 'All' || t.status === filter);

    const PriorityBadges = {
        'Critical': 'bg-red-500/20 text-red-400 border-red-500/30',
        'High': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
        'Medium': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        'Low': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <header className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white">Ticket Management</h2>
                    <p className="text-slate-400">View and manage support requests.</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setFilter('All')} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === 'All' ? 'bg-brand-600 text-white' : 'bg-slate-800 text-slate-400'}`}>All</button>
                    <button onClick={() => setFilter('Open')} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === 'Open' ? 'bg-brand-600 text-white' : 'bg-slate-800 text-slate-400'}`}>Open</button>
                    <button onClick={() => setFilter('Resolved')} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === 'Resolved' ? 'bg-brand-600 text-white' : 'bg-slate-800 text-slate-400'}`}>Resolved</button>
                </div>
            </header>

            <div className="glass-panel overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/5 bg-slate-800/50 text-slate-400 text-xs uppercase tracking-wider">
                            <th className="p-4 font-medium">Incident ID</th>
                            <th className="p-4 font-medium">Service</th>
                            <th className="p-4 font-medium">Title</th>
                            <th className="p-4 font-medium">Priority</th>
                            <th className="p-4 font-medium">Status</th>
                            <th className="p-4 font-medium">Created</th>
                            <th className="p-4"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {filtered.map(ticket => (
                            <tr key={ticket.id} className="hover:bg-white/5 transition-colors group">
                                <td className="p-4 text-slate-400 font-mono text-sm">{ticket.incident_id}</td>
                                <td className="p-4 text-slate-300">{ticket.service_name}</td>
                                <td className="p-4 text-white font-medium">{ticket.title}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold border ${PriorityBadges[ticket.priority]}`}>
                                        {ticket.priority}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        {ticket.status === 'Resolved' ? <CheckCircle size={14} className="text-green-500" /> : <Clock size={14} className="text-blue-500" />}
                                        <span className={`text-sm ${ticket.status === 'Resolved' ? 'text-green-400' : 'text-blue-400'}`}>{ticket.status}</span>
                                    </div>
                                </td>
                                <td className="p-4 text-slate-500 text-sm">
                                    {new Date(ticket.created_at).toLocaleDateString()}
                                </td>
                                <td className="p-4">
                                    <Link to={`/tickets/${ticket.id}`} className="text-brand-400 hover:text-brand-300 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                        View Details &rarr;
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
