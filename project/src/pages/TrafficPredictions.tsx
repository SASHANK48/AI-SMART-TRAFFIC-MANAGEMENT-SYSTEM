import { BrainCircuit, TrendingDown, Clock, MoveRight, CalendarRange, AreaChart } from 'lucide-react';
import { TrafficChart } from '../components/TrafficChart';
import type { TrafficState } from '../hooks/useTrafficData';

interface TrafficPredictionsProps {
  data: TrafficState;
  isDarkMode: boolean;
}

export function TrafficPredictions({ data, isDarkMode }: TrafficPredictionsProps) {
  const { chartData } = data; // We repurpose chartData as the "recent past" to lead into the prediction

  // Mock prediction data for the next 24 hours
  const predictionData = chartData.map((d, i) => ({
    time: `+${i + 1}h`,
    value: Math.max(20, d.value + (Math.sin(i) * 20)) // Slight variation on current data
  }));

  const topCorridors = [
    { name: 'Downtown Main St', peakTime: '17:30', maxDensity: 'Critical', confidence: 94 },
    { name: 'North Hwy 42', peakTime: '08:15', maxDensity: 'High', confidence: 88 },
    { name: 'University Ave', peakTime: '12:00', maxDensity: 'Medium', confidence: 91 },
  ];

  return (
    <main className="max-w-[1600px] mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-purple-500/10 p-3 rounded-2xl border border-purple-500/30">
          <BrainCircuit className="w-8 h-8 text-purple-500" />
        </div>
        <div>
          <h2 className={`text-3xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            AI Traffic Forecasting
          </h2>
          <p className={`text-sm mt-1 font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            24-Hour predictive congestion modeling & proactive signal optimization
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Main Chart Span */}
        <div className={`col-span-2 rounded-2xl border p-6 shadow-lg ${
            isDarkMode ? 'bg-gray-800/50 border-gray-700/50 backdrop-blur-md' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-lg font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              <AreaChart className="w-5 h-5 text-purple-500" />
              Network Congestion Forecast
            </h3>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium ${
              isDarkMode ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' : 'bg-purple-50 text-purple-700 border-purple-200'
            }`}>
              <CalendarRange className="w-4 h-4" />
              Next 24 Hours
            </div>
          </div>
          
          <div className={isDarkMode ? 'opacity-90' : ''}>
             <TrafficChart data={predictionData} color="#A855F7" label="" isDarkMode={isDarkMode} />
          </div>
        </div>

        {/* Prediction Insights */}
        <div className="flex flex-col gap-6">
            <div className={`rounded-2xl border p-6 shadow-lg flex-1 ${
                isDarkMode ? 'bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border-purple-500/30 backdrop-blur-md' : 'bg-gradient-to-br from-indigo-50 to-purple-50 border-purple-200'
            }`}>
              <h3 className={`font-bold text-lg mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>AI Insights</h3>
              
              <div className="space-y-4">
                <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-black/40 border-gray-700/50' : 'bg-white border-white/50 shadow-sm'}`}>
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Predicted Network Peak
                  </p>
                  <p className={`text-2xl font-extrabold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    17:30 <span className={`text-base font-normal ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>today</span>
                  </p>
                </div>
                
                <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-black/40 border-gray-700/50' : 'bg-white border-white/50 shadow-sm'}`}>
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Recommended Action
                  </p>
                  <p className={`text-sm mt-2 font-medium flex items-start gap-2 ${isDarkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                    <TrendingDown className="w-5 h-5 shrink-0" />
                    Extend Green cycles on North-South corridors starting at 16:00 to pre-emptively flush routes.
                  </p>
                </div>
              </div>
            </div>
        </div>
      </div>

      {/* Corridor Forecasts */}
      <div>
        <h3 className={`text-xl font-bold flex items-center gap-2 mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <MoveRight className="w-5 h-5 text-purple-500" />
            Top Predicted Bottlenecks
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topCorridors.map((corridor, idx) => (
                <div key={idx} className={`rounded-2xl border p-5 shadow-lg relative overflow-hidden transition-transform hover:-translate-y-1 ${
                    isDarkMode ? 'bg-gray-800/80 border-gray-700/50 backdrop-blur-md' : 'bg-white border-gray-200'
                }`}>
                    {/* Confidence score badge */}
                    <div className="absolute top-4 right-4 text-xs font-bold px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-500 border border-purple-500/20">
                        {corridor.confidence}% Confidence
                    </div>
                    
                    <h4 className={`text-lg font-bold pr-24 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{corridor.name}</h4>
                    
                    <div className="mt-6 flex items-center justify-between">
                        <div>
                            <p className={`text-xs uppercase tracking-wider font-semibold mb-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Peak Time</p>
                            <p className={`text-xl font-bold flex items-center gap-1.5 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                <Clock className="w-4 h-4 text-purple-500" />
                                {corridor.peakTime}
                            </p>
                        </div>
                        <div className="text-right">
                             <p className={`text-xs uppercase tracking-wider font-semibold mb-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Density</p>
                             <p className={`text-lg font-bold ${
                                 corridor.maxDensity === 'Critical' ? 'text-red-500' :
                                 corridor.maxDensity === 'High' ? 'text-orange-500' :
                                 'text-yellow-500'
                             }`}>
                                 {corridor.maxDensity}
                             </p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>

    </main>
  );
}
