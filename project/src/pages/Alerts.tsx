import { useState } from 'react';
import { Bell, Filter, CheckCircle, AlertCircle } from 'lucide-react';
import { AlertCard } from '../components/AlertCard';
import type { TrafficState } from '../hooks/useTrafficData';

interface AlertsProps {
    data: TrafficState;
}

type SeverityFilter = 'all' | 'critical' | 'high' | 'medium' | 'low';
type StatusFilter = 'all' | 'active' | 'resolved';

export function Alerts({ data }: AlertsProps) {
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
                    <Bell className="w-7 h-7 text-orange-500" />
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Traffic Alerts</h2>
                        <p className="text-sm text-gray-500">All system alerts with filtering by severity and status</p>
                    </div>
                </div>

                {/* Summary badges */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
                        <AlertCircle className="w-4 h-4 text-red-500" />
                        <span className="text-sm font-bold text-red-700">{activeCount} Active</span>
                    </div>
                    <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-bold text-green-700">{resolvedCount} Resolved</span>
                    </div>
                    {criticalCount > 0 && (
                        <div className="flex items-center gap-2 bg-red-600 px-3 py-2 rounded-lg">
                            <span className="text-sm font-bold text-white">{criticalCount} Critical ⚠️</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border-2 border-gray-200 p-4 shadow-sm mb-6 flex items-center gap-6 flex-wrap">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Filter className="w-4 h-4" />
                    <span className="font-medium">Filter by:</span>
                </div>

                {/* Severity Filter */}
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 font-medium">Severity:</span>
                    <div className="flex gap-1">
                        {(['all', 'critical', 'high', 'medium', 'low'] as SeverityFilter[]).map(s => (
                            <button
                                key={s}
                                onClick={() => setSeverityFilter(s)}
                                className={`px-3 py-1 rounded-full text-xs font-medium transition-all capitalize ${severityFilter === s
                                        ? s === 'critical' ? 'bg-red-500 text-white' :
                                            s === 'high' ? 'bg-orange-500 text-white' :
                                                s === 'medium' ? 'bg-yellow-500 text-white' :
                                                    s === 'low' ? 'bg-green-500 text-white' :
                                                        'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 font-medium">Status:</span>
                    <div className="flex gap-1">
                        {(['all', 'active', 'resolved'] as StatusFilter[]).map(s => (
                            <button
                                key={s}
                                onClick={() => setStatusFilter(s)}
                                className={`px-3 py-1 rounded-full text-xs font-medium transition-all capitalize ${statusFilter === s
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                <span className="ml-auto text-sm text-gray-500 font-medium">
                    {filtered.length} of {alerts.length} alerts
                </span>
            </div>

            {/* Alerts Grid */}
            {filtered.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border-2 border-gray-200">
                    <CheckCircle className="w-14 h-14 text-green-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-600">No alerts match your filters</h3>
                    <p className="text-sm text-gray-400 mt-1">Try adjusting the severity or status filters above.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4">
                    {filtered.map(alert => (
                        <div key={alert.id} className="flex flex-col gap-1">
                            <AlertCard alert={alert} />
                            {cameraMap.has(alert.camera_id) && (
                                <p className="text-xs text-gray-400 pl-1">📍 {cameraMap.get(alert.camera_id)}</p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}
