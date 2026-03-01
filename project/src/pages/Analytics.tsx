import { TrendingUp } from 'lucide-react';
import { CameraCard } from '../components/CameraCard';
import { TrafficChart } from '../components/TrafficChart';
import type { TrafficState } from '../hooks/useTrafficData';

interface AnalyticsProps {
    data: TrafficState;
}

export function Analytics({ data }: AnalyticsProps) {
    const { cameras, trafficData, chartData } = data;

    const densityBreakdown = {
        low: Array.from(trafficData.values()).filter(d => d.density_level === 'low').length,
        medium: Array.from(trafficData.values()).filter(d => d.density_level === 'medium').length,
        high: Array.from(trafficData.values()).filter(d => d.density_level === 'high').length,
        critical: Array.from(trafficData.values()).filter(d => d.density_level === 'critical').length,
    };

    const total = trafficData.size || 1;

    return (
        <main className="max-w-[1600px] mx-auto px-6 py-8">
            {/* Section header */}
            <div className="flex items-center gap-3 mb-6">
                <TrendingUp className="w-7 h-7 text-blue-600" />
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Traffic Analytics</h2>
                    <p className="text-sm text-gray-500">Real-time analysis across all monitored intersections</p>
                </div>
            </div>

            {/* Density Breakdown Bar */}
            <div className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-lg mb-8">
                <h3 className="font-bold text-gray-900 mb-4">Network Density Breakdown</h3>
                <div className="flex rounded-full overflow-hidden h-6 mb-4">
                    {densityBreakdown.low > 0 && (
                        <div className="bg-green-500 flex items-center justify-center text-white text-xs font-bold transition-all" style={{ width: `${(densityBreakdown.low / total) * 100}%` }}>
                            {Math.round((densityBreakdown.low / total) * 100)}%
                        </div>
                    )}
                    {densityBreakdown.medium > 0 && (
                        <div className="bg-yellow-400 flex items-center justify-center text-white text-xs font-bold transition-all" style={{ width: `${(densityBreakdown.medium / total) * 100}%` }}>
                            {Math.round((densityBreakdown.medium / total) * 100)}%
                        </div>
                    )}
                    {densityBreakdown.high > 0 && (
                        <div className="bg-orange-500 flex items-center justify-center text-white text-xs font-bold transition-all" style={{ width: `${(densityBreakdown.high / total) * 100}%` }}>
                            {Math.round((densityBreakdown.high / total) * 100)}%
                        </div>
                    )}
                    {densityBreakdown.critical > 0 && (
                        <div className="bg-red-500 flex items-center justify-center text-white text-xs font-bold transition-all" style={{ width: `${(densityBreakdown.critical / total) * 100}%` }}>
                            {Math.round((densityBreakdown.critical / total) * 100)}%
                        </div>
                    )}
                </div>
                <div className="flex gap-6 flex-wrap">
                    {[
                        { level: 'Low', count: densityBreakdown.low, color: 'bg-green-500' },
                        { level: 'Medium', count: densityBreakdown.medium, color: 'bg-yellow-400' },
                        { level: 'High', count: densityBreakdown.high, color: 'bg-orange-500' },
                        { level: 'Critical', count: densityBreakdown.critical, color: 'bg-red-500' },
                    ].map(({ level, count, color }) => (
                        <div key={level} className="flex items-center gap-2">
                            <span className={`w-3 h-3 rounded-full ${color}`} />
                            <span className="text-sm text-gray-700 font-medium">{level}</span>
                            <span className="text-sm text-gray-400">({count})</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chart */}
            <div className="mb-8">
                <TrafficChart data={chartData} color="#3B82F6" label="Network-wide Traffic Density Over Time" />
            </div>

            {/* Camera Cards Grid */}
            <h3 className="text-xl font-bold text-gray-900 mb-4">Live Camera Feeds</h3>
            {cameras.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    Loading camera data...
                </div>
            ) : (
                <div className="grid grid-cols-3 gap-6">
                    {cameras.map(camera => (
                        <CameraCard key={camera.id} camera={camera} trafficData={trafficData.get(camera.id)} />
                    ))}
                </div>
            )}
        </main>
    );
}
