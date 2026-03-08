import { Circle, Clock } from 'lucide-react';
import type { TrafficSignal } from '../types/traffic';

interface SignalControlProps {
  signal: TrafficSignal;
  isDarkMode: boolean;
}

export function SignalControl({ signal, isDarkMode }: SignalControlProps) {
  const getSignalColors = (state: string) => {
    return {
      red: state === 'red' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]' : 'bg-gray-800',
      yellow: state === 'yellow' ? 'bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.8)]' : 'bg-gray-800',
      green: state === 'green' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]' : 'bg-gray-800',
    };
  };

  const colors = getSignalColors(signal.current_state);
  const timeSinceOptimized = Math.floor((Date.now() - new Date(signal.last_optimized).getTime()) / 1000);

  return (
    <div className={`rounded-xl border p-4 shadow-lg hover:shadow-xl transition-all ${
        isDarkMode ? 'bg-gray-800/50 border-gray-700/50 backdrop-blur-md' : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{signal.signal_name}</h3>
          <p className={`text-xs mt-1 flex items-center gap-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <Clock className="w-3 h-3" />
            Optimized {timeSinceOptimized}s ago
          </p>
        </div>
        <div className={`flex flex-col gap-1.5 rounded-lg p-2 border shadow-inner ${
            isDarkMode ? 'bg-black border-gray-800' : 'bg-gray-900 border-gray-900'
        }`}>
          <Circle className={`w-4 h-4 ${colors.red} rounded-full`} />
          <Circle className={`w-4 h-4 ${colors.yellow} rounded-full`} />
          <Circle className={`w-4 h-4 ${colors.green} rounded-full`} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className={`rounded-xl p-2.5 border backdrop-blur-sm ${
            isDarkMode ? 'bg-green-500/10 border-green-500/30' : 'bg-green-50 border-green-200'
        }`}>
          <p className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>Green</p>
          <p className={`text-xl font-bold mt-0.5 ${isDarkMode ? 'text-white' : 'text-green-700'}`}>{signal.green_duration}s</p>
        </div>
        <div className={`rounded-xl p-2.5 border backdrop-blur-sm ${
            isDarkMode ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-200'
        }`}>
          <p className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>Red</p>
          <p className={`text-xl font-bold mt-0.5 ${isDarkMode ? 'text-white' : 'text-red-700'}`}>{signal.red_duration}s</p>
        </div>
      </div>
    </div>
  );
}
