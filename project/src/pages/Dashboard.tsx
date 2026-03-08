import { Activity, AlertCircle, Car, TrendingDown, Radio } from 'lucide-react';
import { StatsCard } from '../components/StatsCard';
import { TrafficChart } from '../components/TrafficChart';
import { AlertCard } from '../components/AlertCard';
import { SignalControl } from '../components/SignalControl';
import type { TrafficState } from '../hooks/useTrafficData';

interface DashboardProps {
    data: TrafficState;
    isDarkMode: boolean;
}

export function Dashboard({ data, isDarkMode }: DashboardProps) {
    const { totalVehicles, averageSpeed, activeAlerts, criticalLocations, chartData, alerts, signals } = data;

    return (
        <main className="max-w-[1600px] mx-auto px-6 py-8">
            {/* Stats Row */}
            <div className="grid grid-cols-4 gap-6 mb-8">
                <StatsCard
                    title="Total Vehicles Monitored"
                    value={totalVehicles.toLocaleString()}
                    icon={Car}
                    trend={{ value: 12, label: 'from last hour' }}
                    color="blue"
                    isDarkMode={isDarkMode}
                />
                <StatsCard
                    title="Average Speed"
                    value={`${Math.floor(averageSpeed)} km/h`}
                    icon={Activity}
                    trend={{ value: -5, label: 'from peak hours' }}
                    color="green"
                    isDarkMode={isDarkMode}
                />
                <StatsCard
                    title="Active Alerts"
                    value={activeAlerts}
                    icon={AlertCircle}
                    color="orange"
                    isDarkMode={isDarkMode}
                />
                <StatsCard
                    title="Congested Locations"
                    value={criticalLocations}
                    icon={TrendingDown}
                    trend={{ value: -8, label: 'improvement' }}
                    color="red"
                    isDarkMode={isDarkMode}
                />
            </div>

            {/* Chart + Recent Alerts */}
            <div className="grid grid-cols-3 gap-6 mb-8">
                <div className={`col-span-2 ${isDarkMode ? 'opacity-90' : ''}`}>
                    <TrafficChart
                        data={chartData}
                        color="#4F46E5"
                        label="Traffic Density Over Time"
                        isDarkMode={isDarkMode}
                    />
                </div>
                <div className={`rounded-xl border p-6 shadow-lg ${
                    isDarkMode ? 'bg-gray-800/50 border-gray-700/50 backdrop-blur-md text-white' : 'bg-white border-gray-200 text-gray-900'
                }`}>
                    <h3 className="font-bold mb-4 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-orange-500" />
                        Recent Alerts
                    </h3>
                    <div className="space-y-3 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                        {alerts.slice(0, 5).map(alert => (
                            <AlertCard key={alert.id} alert={alert} isDarkMode={isDarkMode} />
                        ))}
                        {alerts.length === 0 && (
                            <p className={`text-sm text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No alerts at this time</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Signal Snapshot */}
            <div>
                <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    <Radio className="w-6 h-6 text-green-500" />
                    Signal Status Snapshot
                </h2>
                <div className="grid grid-cols-4 gap-4">
                    {signals.slice(0, 8).map(signal => (
                        <SignalControl key={signal.id} signal={signal} isDarkMode={isDarkMode} />
                    ))}
                </div>
                {signals.length === 0 && (
                    <p className={`text-sm text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Loading signal data...</p>
                )}
            </div>
        </main>
    );
}
