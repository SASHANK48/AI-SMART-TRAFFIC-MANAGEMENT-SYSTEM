import { useState } from 'react';
import { Ambulance, Route, Clock, AlertTriangle, CheckCircle, Navigation, Radio } from 'lucide-react';
import type { TrafficState } from '../hooks/useTrafficData';

interface EmergencyResponseProps {
  data: TrafficState;
  isDarkMode: boolean;
}

interface ActiveMission {
  id: string;
  type: 'ambulance' | 'fire' | 'police';
  status: 'routing' | 'en_route' | 'arrived';
  eta: number;
  destination: string;
  priority: 'critical' | 'high';
}

export function EmergencyResponse({ data, isDarkMode }: EmergencyResponseProps) {
  const { alerts } = data;
  const [missions, setMissions] = useState<ActiveMission[]>([
    {
      id: 'MIS-7A92',
      type: 'ambulance',
      status: 'en_route',
      eta: 4,
      destination: 'Central Hospital via Main St',
      priority: 'critical'
    }
  ]);

  const emergencyAlerts = alerts.filter(a => a.alert_type === 'emergency' || a.severity === 'critical');

  const startMission = () => {
    const newMission: ActiveMission = {
      id: `MIS-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      type: 'fire',
      status: 'routing',
      eta: 8,
      destination: 'Downtown Industrial Park',
      priority: 'high'
    };
    setMissions([newMission, ...missions]);

    // Simulate routing to en_route
    setTimeout(() => {
        setMissions(current => current.map(m => m.id === newMission.id ? { ...m, status: 'en_route', eta: 7 } : m));
    }, 2000);
  };

  return (
    <main className="max-w-[1600px] mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="bg-red-500/10 p-3 rounded-2xl border border-red-500/30">
            <Ambulance className="w-8 h-8 text-red-500" />
          </div>
          <div>
            <h2 className={`text-3xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Emergency Override
            </h2>
            <p className={`text-sm mt-1 font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              AI pre-emption of traffic signals for rapid emergency response routing
            </p>
          </div>
        </div>
        <button 
          onClick={startMission}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-red-600/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
        >
          <Radio className="w-5 h-5" />
          Dispatch Unit
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Active Missions */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className={`text-xl font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <Navigation className="w-5 h-5 text-indigo-500" /> 
            Active AI Corridors
          </h3>

          {missions.length === 0 ? (
            <div className={`text-center py-16 rounded-2xl border ${isDarkMode ? 'bg-gray-800/50 border-gray-700/50' : 'bg-gray-50 border-gray-200'}`}>
              <CheckCircle className={`w-12 h-12 mx-auto mb-3 ${isDarkMode ? 'text-green-500/50' : 'text-green-400'}`} />
              <p className={`font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No active emergency corridors</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {missions.map(mission => (
                <div key={mission.id} className={`rounded-2xl border p-5 relative overflow-hidden shadow-lg ${
                  isDarkMode ? 'bg-gray-800/80 border-gray-700/50' : 'bg-white border-gray-200'
                }`}>
                  {/* Decorative glowing background pulse */}
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-500/10 blur-3xl rounded-full pointer-events-none animate-pulse"></div>
                  
                  <div className="flex items-start justify-between relative z-10">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${
                        mission.status === 'routing' ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' : 
                        'bg-red-500/20 text-red-500 border border-red-500/30'
                      }`}>
                        <Ambulance className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold uppercase tracking-wider text-xs text-red-500">{mission.id}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide ${
                            mission.status === 'routing' ? 'bg-yellow-500/20 text-yellow-600' : 
                            'bg-green-500/20 text-green-600'
                          }`}>
                            {mission.status.replace('_', ' ')}
                          </span>
                        </div>
                        <h4 className={`text-lg font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{mission.destination}</h4>
                      </div>
                    </div>

                    <div className={`text-right ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      <div className="flex items-center gap-1.5 justify-end text-sm mb-1 font-medium">
                        <Clock className="w-4 h-4" />
                        ETA
                      </div>
                      <p className={`text-3xl font-extrabold ${
                        mission.eta <= 5 ? 'text-red-500' : isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {mission.eta} <span className="text-sm font-normal opacity-70">min</span>
                      </p>
                    </div>
                  </div>

                  {/* Route progress */}
                  <div className="mt-6">
                    <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider mb-2 text-gray-500">
                      <span>Dispatch</span>
                      <span>En Route</span>
                      <span>Arrival</span>
                    </div>
                    <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="absolute top-0 left-0 h-full bg-red-500 transition-all duration-1000 w-1/2"></div>
                      <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.4)_50%,transparent_100%)] animate-[shimmer_2s_infinite]"></div>
                    </div>
                    <p className={`text-xs mt-3 flex items-center gap-1.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      <Route className="w-3.5 h-3.5" />
                      AI has forced green lights on 4 upcoming intersections.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Priority Queue Sidebar */}
        <div>
          <h3 className={`text-xl font-bold flex items-center gap-2 mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Priority Queue
          </h3>
          <div className={`rounded-2xl border p-5 shadow-lg ${isDarkMode ? 'bg-gray-800/50 border-gray-700/50 backdrop-blur-md' : 'bg-white border-gray-200'}`}>
            {emergencyAlerts.length === 0 ? (
              <p className={`text-sm text-center py-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No high-priority alerts awaiting dispatch.</p>
            ) : (
              <div className="space-y-4">
                {emergencyAlerts.map(alert => (
                  <div key={alert.id} className={`p-4 rounded-xl border-l-4 ${
                    alert.severity === 'critical' ? 'border-l-red-500 bg-red-500/5 text-red-500' : 'border-l-orange-500 bg-orange-500/5 text-orange-500'
                  }`}>
                     <div className="flex items-start justify-between">
                        <strong className="text-sm capitalize font-bold">{alert.alert_type}</strong>
                        <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">{alert.severity}</span>
                     </div>
                     <p className={`text-xs mt-1.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{alert.message}</p>
                     <button className="text-xs font-bold uppercase mt-3 hover:underline">Route Vehicle →</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}
