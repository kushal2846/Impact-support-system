import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, Save, Search, Zap, CheckCircle } from 'lucide-react';
import { api } from '../services/api';

export default function CreateTicketModal({ onClose, onCreated }) {
    const [services, setServices] = useState([]);
    const [formData, setFormData] = useState({
        title: '', description: '', service_id: '', priority: 'Medium'
    });

    // Intelligent Features
    const [deflection, setDeflection] = useState(null);
    const [searching, setSearching] = useState(false);

    useEffect(() => {
        api.getServices().then(setServices);
    }, []);

    // Smart Type-ahead Search
    useEffect(() => {
        if (formData.title.length < 3) {
            setDeflection(null);
            return;
        }

        const timer = setTimeout(() => {
            setSearching(true);
            api.searchDeflection(formData.title).then(data => {
                setDeflection(data);
                setSearching(false);
            });
        }, 500); // 500ms debounce

        return () => clearTimeout(timer);
    }, [formData.title]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.service_id) return alert('Please select a service');
        await api.createTicket(formData);
        onCreated();
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-white/10 rounded-xl w-full max-w-lg shadow-2xl animate-fade-in-up flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-6 border-b border-white/5 bg-slate-800/50 rounded-t-xl">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Zap className="text-brand-500" /> Report New Issue
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">

                    {/* Deflection Area */}
                    {deflection && (deflection.existing_incidents.length > 0 || deflection.suggestions.length > 0) && (
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-2 animate-pulse-fade-in">
                            <div className="flex items-center gap-2 text-blue-300 font-bold text-sm uppercase mb-2">
                                <Search size={14} /> Similar Issues Detected
                            </div>

                            {deflection.existing_incidents.length > 0 && (
                                <div className="mb-3">
                                    <div className="text-xs text-slate-400 mb-1">Active Incidents matching your inquiry:</div>
                                    {deflection.existing_incidents.map(inc => (
                                        <div key={inc.id} className="text-sm text-white bg-slate-900/50 p-2 rounded border border-white/5 mb-1 flex justify-between">
                                            <span>{inc.title}</span>
                                            <span className="text-xs bg-brand-600 px-1 rounded text-white">{inc.status}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {deflection.suggestions.length > 0 && (
                                <div>
                                    <div className="text-xs text-slate-400 mb-1">Try this workaround first:</div>
                                    {deflection.suggestions.map((s, i) => (
                                        <div key={i} className="text-sm text-green-300 flex gap-2">
                                            <CheckCircle size={14} className="mt-0.5 shrink-0" />
                                            {s.description}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <form id="ticket-form" onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Issue Title</label>
                            <input
                                required
                                type="text"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-brand-500 outline-none"
                                placeholder="e.g. VPN Disconnected..."
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Affected Service</label>
                                <select
                                    required
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none"
                                    value={formData.service_id}
                                    onChange={e => setFormData({ ...formData, service_id: e.target.value })}
                                >
                                    <option value="">Select...</option>
                                    {services.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Priority</label>
                                <select
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none"
                                    value={formData.priority}
                                    onChange={e => setFormData({ ...formData, priority: e.target.value })}
                                >
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                    <option value="Critical">Critical</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
                            <textarea
                                required
                                rows={4}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-brand-500 outline-none resize-none"
                                placeholder="Describe the issue in detail..."
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-lg flex gap-3">
                            <AlertTriangle className="text-yellow-500 shrink-0" size={20} />
                            <p className="text-xs text-yellow-200">
                                SLA Warning: Critical tickets are broadcast to the entire Engineering team immediately.
                            </p>
                        </div>
                    </form>
                </div>

                <div className="p-4 border-t border-white/5 bg-slate-800/50 rounded-b-xl flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-slate-300 hover:text-white font-medium">Cancel</button>
                    <button form="ticket-form" type="submit" className="btn-primary flex items-center gap-2">
                        <Save size={18} />
                        Submit Ticket
                    </button>
                </div>
            </div>
        </div>
    );
}
