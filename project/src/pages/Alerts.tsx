import { useState } from 'react';
import { Bell, Filter, CheckCircle, AlertCircle } from 'lucide-react';
import { AlertCard } from '../components/AlertCard';
import type { TrafficState } from '../hooks/useTrafficData';

interface AlertsProps {
    data: TrafficState;
    isDarkMode: boolean;
}

type SeverityFilter = 'all' | 'critical' | 'high' | 'medium' | 'low';
type StatusFilter = 'all' | 'active' | 'resolved';

export function Alerts({ data, isDarkMode }: AlertsProps) {
    const { alerts, cameras } = data;
    const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('all');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

    const cameraMap = new Map(cameras.map(c => [c.id, c.name]));

    const filtered = alerts.filter(alert => {
        const severityOk = severityFilter === 'all' || alert.severity === severityFilter;
        const statusOk =
            statusFilter === 'all' ||
            (statusFilter === 'active' && !alert.resolved) ||
            (statusFilter === 'resolved' && alert.resolved);
        return severityOk && statusOk;
    });

    const activeCount = alerts.filter(a => !a.resolved).length;
    const resolvedCount = alerts.filter(a => a.resolved).length;
    const criticalCount = alerts.filter(a => a.severity === 'critical').length;

    return (
        <main className="max-w-[1600px] mx-auto px-6 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Bell className={`w-7 h-7 ${isDarkMode ? 'text-orange-400' : 'text-orange-500'}`} />
                    <div>
                        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Traffic Alerts</h2>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>All system alerts with filtering by severity and status</p>
                    </div>
                </div>

                {/* Summary badges */}
                <div className="flex items-center gap-3">
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
                        isDarkMode ? 'bg-red-500/20 border-red-500/30' : 'bg-red-50 border-red-200'
                    }`}>
                        <AlertCircle className={`w-4 h-4 ${isDarkMode ? 'text-red-400' : 'text-red-500'}`} />
                        <span className={`text-sm font-bold ${isDarkMode ? 'text-red-400' : 'text-red-700'}`}>{activeCount} Active</span>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
                        isDarkMode ? 'bg-green-500/20 border-green-500/30' : 'bg-green-50 border-green-200'
                    }`}>
                        <CheckCircle className={`w-4 h-4 ${isDarkMode ? 'text-green-400' : 'text-green-500'}`} />
                        <span className={`text-sm font-bold ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>{resolvedCount} Resolved</span>
                    </div>
                    {criticalCount > 0 && (
                        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                            isDarkMode ? 'bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.6)]' : 'bg-red-600'
                        }`}>
                            <span className="text-sm font-bold text-white">{criticalCount} Critical ⚠️</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Filters */}
            <div className={`rounded-xl border p-4 shadow-sm mb-6 flex items-center gap-6 flex-wrap ${
                isDarkMode ? 'bg-gray-800/50 border-gray-700/50 backdrop-blur-md' : 'bg-white border-gray-200'
            }`}>
                <div className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    <Filter className="w-4 h-4" />
                    <span className="font-medium">Filter by:</span>
                </div>

                {/* Severity Filter */}
                <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Severity:</span>
                    <div className="flex gap-1">
                        {(['all', 'critical', 'high', 'medium', 'low'] as SeverityFilter[]).map(s => (
                            <button
                                key={s}
                                onClick={() => setSeverityFilter(s)}
                                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all capitalize ${severityFilter === s
                                        ? s === 'critical' ? 'bg-red-500 text-white shadow-md' :
                                            s === 'high' ? 'bg-orange-500 text-white shadow-md' :
                                                s === 'medium' ? 'bg-yellow-500 text-white shadow-md' :
                                                    s === 'low' ? 'bg-green-500 text-white shadow-md' :
                                                        'bg-indigo-600 text-white shadow-md'
                                        : isDarkMode ? 'bg-gray-700/50 text-gray-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Status:</span>
                    <div className="flex gap-1">
                        {(['all', 'active', 'resolved'] as StatusFilter[]).map(s => (
                            <button
                                key={s}
                                onClick={() => setStatusFilter(s)}
                                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all capitalize ${statusFilter === s
                                        ? 'bg-indigo-600 text-white shadow-md'
                                        : isDarkMode ? 'bg-gray-700/50 text-gray-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                <span className={`ml-auto text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {filtered.length} of {alerts.length} alerts
                </span>
            </div>

            {/* Alerts Grid */}
            {filtered.length === 0 ? (
                <div className={`text-center py-20 rounded-xl border ${
                    isDarkMode ? 'bg-gray-800/30 border-gray-700/30' : 'bg-white border-gray-200'
                }`}>
                    <CheckCircle className={`w-14 h-14 mx-auto mb-4 ${isDarkMode ? 'text-green-500/50' : 'text-green-300'}`} />
                    <h3 className={`text-lg font-bold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>No alerts match your filters</h3>
                    <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Try adjusting the severity or status filters above.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4">
                    {filtered.map(alert => (
                        <div key={alert.id} className="flex flex-col gap-1">
                            <AlertCard alert={alert} isDarkMode={isDarkMode} />
                            {cameraMap.has(alert.camera_id) && (
                                <p className={`text-xs pl-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>📍 {cameraMap.get(alert.camera_id)}</p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}
