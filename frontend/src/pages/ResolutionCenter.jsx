import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Clock, AlertTriangle, ShieldCheck, Activity, Terminal } from 'lucide-react';

export default function ResolutionCenter() {
    const [impacts, setImpacts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.getActiveImpacts().then(setImpacts).finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="p-10 text-center text-slate-500">Loading Active Analysis...</div>;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <header className="mb-6">
                <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                    <ShieldCheck className="text-brand-500" size={32} />
                    Resolution Center
                </h2>
                <p className="text-slate-400 mt-1">Live Root Cause Analysis & Alternative Solutions for Active Incidents.</p>
            </header>

            <div className="space-y-6">
                {impacts.length === 0 ? (
                    <div className="text-center py-20 bg-slate-800/50 rounded-xl border border-white/5">
                        <ShieldCheck size={48} className="mx-auto text-green-500 mb-4" />
                        <h3 className="text-xl font-medium text-white">All Systems Operational</h3>
                        <p className="text-slate-500">No active incidents requiring manual intervention.</p>
                    </div>
                ) : (
                    impacts.map(impact => (
                        <div key={impact.id} className="glass-panel overflow-hidden border-l-4 border-l-brand-500 relative">
                            {/* Header */}
                            <div className="p-6 bg-slate-800/50 border-b border-white/5 flex flex-col md:flex-row justify-between md:items-center gap-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="font-mono text-xs bg-slate-900 text-slate-400 px-2 py-1 rounded border border-white/10">{impact.incident_id}</span>
                                        <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${impact.priority === 'Critical' ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'
                                            }`}>
                                            {impact.priority}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-white">{impact.title}</h3>
                                    <p className="text-sm text-slate-400">Affected Service: <span className="text-brand-400">{impact.service_name}</span></p>
                                </div>
                                <div className="flex items-center gap-4 bg-slate-900/80 p-3 rounded-xl border border-white/10">
                                    <div className="text-right">
                                        <div className="text-xs text-slate-500 uppercase font-bold">Estimated Resolution</div>
                                        <div className="text-2xl font-mono text-white font-bold">{impact.eta_display}</div>
                                    </div>
                                    <div className="h-10 w-10 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400">
                                        <Clock size={20} />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/5">
                                {/* Root Cause Section */}
                                <div className="p-6">
                                    <h4 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <Terminal size={16} /> Root Cause Analysis
                                    </h4>
                                    <div className="bg-slate-950 rounded-lg p-4 font-mono text-sm border border-white/10">
                                        <div className="text-green-400 mb-1">$ diag --service "{impact.service_name}"</div>
                                        <div className="text-slate-300">Analysis complete. Primary failure detected.</div>
                                        <div className="mt-3 pt-3 border-t border-dashed border-white/10">
                                            <span className="text-red-400 font-bold">FAILURE_CAUSE:</span> {impact.root_cause_display}
                                        </div>
                                        <div className="text-slate-500 text-xs mt-1">Confidence Score: 94%</div>
                                    </div>
                                    <p className="text-slate-400 text-sm mt-4 px-1">
                                        Engineering is currently working on applying fix patches to the affected nodes.
                                    </p>
                                </div>

                                {/* Alternatives Section */}
                                <div className="p-6 bg-brand-900/5">
                                    <h4 className="text-sm font-bold text-brand-300 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <Activity size={16} /> Recommended Workarounds
                                    </h4>

                                    {impact.alternatives && impact.alternatives.length > 0 ? (
                                        <ul className="space-y-3">
                                            {impact.alternatives.map((alt, i) => (
                                                <li key={i} className="flex items-start gap-3 bg-slate-800/80 p-3 rounded-lg border border-brand-500/20 shadow-sm">
                                                    <div className="mt-0.5">
                                                        <div className="h-5 w-5 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-xs font-bold">
                                                            {i + 1}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="text-slate-200 text-sm font-medium">{alt.description}</div>
                                                        <div className="text-slate-500 text-xs mt-0.5">{alt.issue_type} workaround</div>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="text-slate-500 italic text-sm">No specific workarounds available. Please contact support via phone.</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
