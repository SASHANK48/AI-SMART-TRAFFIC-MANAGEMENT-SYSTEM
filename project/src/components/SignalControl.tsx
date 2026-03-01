import { Circle, Clock } from 'lucide-react';
import type { TrafficSignal } from '../types/traffic';

interface SignalControlProps {
  signal: TrafficSignal;
}

export function SignalControl({ signal }: SignalControlProps) {
  const getSignalColors = (state: string) => {
    return {
      red: state === 'red' ? 'bg-red-500' : 'bg-gray-300',
      yellow: state === 'yellow' ? 'bg-yellow-400' : 'bg-gray-300',
      green: state === 'green' ? 'bg-green-500' : 'bg-gray-300',
    };
  };

  const colors = getSignalColors(signal.current_state);
  const timeSinceOptimized = Math.floor((Date.now() - new Date(signal.last_optimized).getTime()) / 1000);

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 p-4 shadow-lg hover:shadow-xl transition-all">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-gray-900">{signal.signal_name}</h3>
          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Optimized {timeSinceOptimized}s ago
          </p>
        </div>
        <div className="flex flex-col gap-1.5 bg-gray-900 rounded-lg p-2">
          <Circle className={`w-4 h-4 ${colors.red} rounded-full`} />
          <Circle className={`w-4 h-4 ${colors.yellow} rounded-full`} />
          <Circle className={`w-4 h-4 ${colors.green} rounded-full`} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-green-50 rounded-lg p-2 border border-green-200">
          <p className="text-xs text-green-600 font-medium">Green</p>
          <p className="text-lg font-bold text-green-700">{signal.green_duration}s</p>
        </div>
        <div className="bg-red-50 rounded-lg p-2 border border-red-200">
          <p className="text-xs text-red-600 font-medium">Red</p>
          <p className="text-lg font-bold text-red-700">{signal.red_duration}s</p>
        </div>
      </div>
    </div>
  );
}
