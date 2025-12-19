import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Clock, CheckCircle, ShieldAlert, Cpu, Activity } from 'lucide-react';

export default function TicketDetail() {
    const { id } = useParams();
    const [ticket, setTicket] = useState(null);

    useEffect(() => {
        api.getTicket(id).then(setTicket).catch(console.error);
    }, [id]);

    if (!ticket) return <div className="p-10 text-center text-slate-500">Loading Ticket Details...</div>;

    const isResolved = ticket.status === 'Resolved';

    return (
        <div className="p-6 max-w-5xl mx-auto animate-fade-in-up">
            <Link to="/tickets" className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors">
                <ArrowLeft size={16} /> Back to Tickets
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Detail */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-panel p-8">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h1 className="text-3xl font-bold text-white mb-2">{ticket.title}</h1>
                                <div className="flex items-center gap-3 text-sm text-slate-400">
                                    <span className="font-mono bg-slate-800 px-2 py-1 rounded text-slate-300">ID: {ticket.incident_id}</span>
                                    <span>&bull;</span>
                                    <span>{new Date(ticket.created_at).toLocaleString()}</span>
                                </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-bold border ${isResolved ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-blue-500/20 text-blue-400 border-blue-500/30'}`}>
                                {ticket.status}
                            </span>
                        </div>

                        <div className="prose prose-invert max-w-none text-slate-300 mb-8 border-t border-white/5 pt-6">
                            <h3 className="text-lg font-semibold text-white mb-2">Issue Description</h3>
                            <p>{ticket.description}</p>
                            <p>Affected Service: <span className="font-semibold text-brand-400">{ticket.service_name}</span></p>
                        </div>

                        {/* Root Cause Section */}
                        <div className="bg-slate-900/50 rounded-xl p-6 border border-white/5">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <Activity size={20} className="text-purple-400" />
                                {isResolved ? 'Diagnostic Report & Root Cause' : 'Preliminary Diagnosis'}
                            </h3>

                            {isResolved ? (
                                <div className="space-y-4">
                                    <div className="bg-green-900/10 border border-green-500/20 p-4 rounded-lg">
                                        <div className="text-sm text-green-400 font-bold uppercase mb-1">Root Cause Identified</div>
                                        <div className="text-slate-200 text-lg">{ticket.root_cause}</div>
                                        <div className="text-slate-500 text-sm mt-1">Category: {ticket.root_cause_category}</div>
                                    </div>
                                    <p className="text-slate-400 text-sm">The issue has been resolved and the service is fully operational.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3 p-4 bg-yellow-900/10 border border-yellow-500/20 rounded-lg">
                                        <AlertTriangle className="text-yellow-500 shrink-0 mt-1" />
                                        <div>
                                            <div className="text-yellow-200 font-medium">Investigation in Progress</div>
                                            <p className="text-slate-400 text-sm mt-1">Engineers are currently analyzing server logs and network traffic. Pattern matches suggest a potential <span className="text-white">High Load</span> event.</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    {/* ETA Widget */}
                    {!isResolved && (
                        <div className="glass-panel p-6 bg-gradient-to-br from-slate-800 to-slate-900">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Estimated Resolution</span>
                                <Clock size={16} className="text-brand-400" />
                            </div>
                            <div className="text-4xl font-bold text-white mb-2">{ticket.eta}</div>
                            <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-brand-500 h-full w-2/3 animate-pulse"></div>
                            </div>
                            <p className="text-xs text-slate-500 mt-2">Based on historical data for <strong>{ticket.priority}</strong> priority issues.</p>
                        </div>
                    )}

                    {/* Impact Score */}
                    <div className="glass-panel p-6">
                        <div className="flex items-center gap-2 mb-4 text-slate-300">
                            <ShieldAlert size={18} />
                            <h3 className="font-semibold">Business Impact</h3>
                        </div>
                        <div className="flex items-end gap-2 mb-2">
                            <span className="text-3xl font-bold text-white">{ticket.impact_score}</span>
                            <span className="text-sm text-slate-500 mb-1">/ 25</span>
                        </div>
                        <div className="flex justify-between text-xs text-slate-500 mb-4">
                            <span>User Count: {ticket.user_count_estimate}</span>
                            <span>Criticality: {ticket.criticality_score}/5</span>
                        </div>
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-200 text-xs text-center">
                            High Priority Issue
                        </div>
                    </div>

                    {/* Alternatives */}
                    <div className="glass-panel p-6 border-l-4 border-l-brand-500">
                        <div className="flex items-center gap-2 mb-4 text-white">
                            <Cpu size={18} className="text-brand-400" />
                            <h3 className="font-semibold">Workarounds</h3>
                        </div>
                        {ticket.alternatives && ticket.alternatives.length > 0 ? (
                            <div className="space-y-3">
                                {ticket.alternatives.map((alt, i) => (
                                    <div key={i} className="text-sm">
                                        <div className="text-slate-400 text-xs uppercase mb-1">{alt.issue_type}</div>
                                        <div className="text-slate-200 bg-slate-800/50 p-2 rounded border border-white/5">
                                            {alt.description}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-500">No workarounds available.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
