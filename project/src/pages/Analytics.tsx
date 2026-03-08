import { TrendingUp } from 'lucide-react';
import { CameraCard } from '../components/CameraCard';
import { TrafficChart } from '../components/TrafficChart';
import type { TrafficState } from '../hooks/useTrafficData';

interface AnalyticsProps {
    data: TrafficState;
    isDarkMode: boolean;
}

export function Analytics({ data, isDarkMode }: AnalyticsProps) {
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
                <TrendingUp className={`w-7 h-7 ${isDarkMode ? 'text-indigo-400' : 'text-blue-600'}`} />
                <div>
                    <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Traffic Analytics</h2>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Real-time analysis across all monitored intersections</p>
                </div>
            </div>

            {/* Density Breakdown Bar */}
            <div className={`rounded-xl border p-6 shadow-lg mb-8 ${isDarkMode ? 'bg-gray-800/50 border-gray-700/50 backdrop-blur-md' : 'bg-white border-gray-200'}`}>
                <h3 className={`font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Network Density Breakdown</h3>
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
                            <span className={`w-3.5 h-3.5 rounded-full shadow-[0_0_8px_currentColor] opacity-90 ${color}`} style={{ color: color.replace('bg-', 'text-') }} />
                            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{level}</span>
                            <span className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>({count})</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chart */}
            <div className={`mb-8 ${isDarkMode ? 'opacity-90' : ''}`}>
                <TrafficChart data={chartData} color="#4F46E5" label="Network-wide Traffic Density Over Time" isDarkMode={isDarkMode} />
            </div>

            {/* Camera Cards Grid */}
            <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Live Camera Feeds</h3>
            {cameras.length === 0 ? (
                <div className={`text-center py-16 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    Loading camera data...
                </div>
            ) : (
                <div className="grid grid-cols-3 gap-6">
                    {cameras.map(camera => (
                        <CameraCard key={camera.id} camera={camera} trafficData={trafficData.get(camera.id)} isDarkMode={isDarkMode} />
                    ))}
                </div>
            )}
        </main>
    );
}
