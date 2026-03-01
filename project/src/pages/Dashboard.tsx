import { Activity, AlertCircle, Car, TrendingDown, Radio } from 'lucide-react';
import { StatsCard } from '../components/StatsCard';
import { TrafficChart } from '../components/TrafficChart';
import { AlertCard } from '../components/AlertCard';
import { SignalControl } from '../components/SignalControl';
import type { TrafficState } from '../hooks/useTrafficData';

interface DashboardProps {
    data: TrafficState;
}

export function Dashboard({ data }: DashboardProps) {
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
                />
                <StatsCard
                    title="Average Speed"
                    value={`${Math.floor(averageSpeed)} km/h`}
                    icon={Activity}
                    trend={{ value: -5, label: 'from peak hours' }}
                    color="green"
                />
                <StatsCard
                    title="Active Alerts"
                    value={activeAlerts}
                    icon={AlertCircle}
                    color="orange"
                />
                <StatsCard
                    title="Congested Locations"
                    value={criticalLocations}
                    icon={TrendingDown}
                    trend={{ value: -8, label: 'improvement' }}
                    color="red"
                />
            </div>

            {/* Chart + Recent Alerts */}
            <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="col-span-2">
                    <TrafficChart
                        data={chartData}
                        color="#3B82F6"
                        label="Traffic Density Over Time"
                    />
                </div>
                <div className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-lg">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-orange-500" />
                        Recent Alerts
                    </h3>
                    <div className="space-y-3 max-h-[220px] overflow-y-auto">
                        {alerts.slice(0, 5).map(alert => (
                            <AlertCard key={alert.id} alert={alert} />
                        ))}
                        {alerts.length === 0 && (
                            <p className="text-sm text-gray-500 text-center py-8">No alerts at this time</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Signal Snapshot */}
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Radio className="w-6 h-6 text-green-600" />
                    Signal Status Snapshot
                </h2>
                <div className="grid grid-cols-4 gap-4">
                    {signals.slice(0, 8).map(signal => (
                        <SignalControl key={signal.id} signal={signal} />
                    ))}
                </div>
                {signals.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-8">Loading signal data...</p>
                )}
            </div>
        </main>
    );
}
