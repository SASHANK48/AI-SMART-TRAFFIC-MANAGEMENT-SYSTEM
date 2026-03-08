import { Camera, Circle } from 'lucide-react';
import type { TrafficCamera, TrafficData } from '../types/traffic';

interface CameraCardProps {
  camera: TrafficCamera;
  trafficData?: TrafficData;
  isDarkMode: boolean;
}

export function CameraCard({ camera, trafficData, isDarkMode }: CameraCardProps) {
  const getDensityColor = (level?: string) => {
    switch (level) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-orange-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const getDensityBg = (level?: string) => {
    if (isDarkMode) {
        switch (level) {
          case 'low': return 'bg-gray-800/80 border-green-500/30';
          case 'medium': return 'bg-gray-800/80 border-yellow-500/30';
          case 'high': return 'bg-gray-800/80 border-orange-500/30';
          case 'critical': return 'bg-gray-800/80 border-red-500/30';
          default: return 'bg-gray-800/80 border-gray-700/50';
        }
    } else {
        switch (level) {
          case 'low': return 'bg-green-50 border-green-200';
          case 'medium': return 'bg-yellow-50 border-yellow-200';
          case 'high': return 'bg-orange-50 border-orange-200';
          case 'critical': return 'bg-red-50 border-red-200';
          default: return 'bg-gray-50 border-gray-200';
        }
    }
  };

  return (
    <div className={`rounded-xl border overflow-hidden shadow-lg transition-all hover:shadow-xl backdrop-blur-md ${getDensityBg(trafficData?.density_level)}`}>
      <div className="relative bg-gray-900 aspect-video flex items-center justify-center">
        <div className="absolute top-3 right-3 flex items-center gap-2">
          <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${camera.status === 'online' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
            <Circle className="w-2 h-2 fill-current" />
            {camera.status}
          </span>
        </div>
        <Camera className="w-16 h-16 text-gray-600" />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent"></div>
      </div>

      <div className="p-4">
        <h3 className={`font-bold text-lg mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{camera.name}</h3>
        <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{camera.location}</p>

        {trafficData && (
          <div className="grid grid-cols-2 gap-3">
            <div className={`rounded-lg p-3 border ${isDarkMode ? 'bg-black/40 border-gray-700/50' : 'bg-white border-gray-200'}`}>
              <p className={`text-xs mb-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>Vehicles</p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{trafficData.vehicle_count}</p>
            </div>
            <div className={`rounded-lg p-3 border ${isDarkMode ? 'bg-black/40 border-gray-700/50' : 'bg-white border-gray-200'}`}>
              <p className={`text-xs mb-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>Avg Speed</p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{trafficData.average_speed}<span className="text-sm ml-1 font-normal opacity-70">km/h</span></p>
            </div>
            <div className={`col-span-2 rounded-lg p-3 border ${isDarkMode ? 'bg-black/40 border-gray-700/50' : 'bg-white border-gray-200'}`}>
              <p className={`text-xs mb-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>Congestion Level</p>
              <div className="flex items-center gap-2">
                <div className={`flex-1 rounded-full h-2 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
                  <div
                    className={`h-2 rounded-full ${getDensityColor(trafficData.density_level)}`}
                    style={{ width: `${trafficData.congestion_score}%` }}
                  ></div>
                </div>
                <span className={`text-sm font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{trafficData.congestion_score}%</span>
              </div>
              <p className={`text-xs font-semibold mt-1 capitalize shadow-sm ${
                trafficData.density_level === 'critical' ? (isDarkMode ? 'text-red-400' : 'text-red-600') :
                trafficData.density_level === 'high' ? (isDarkMode ? 'text-orange-400' : 'text-orange-600') :
                trafficData.density_level === 'medium' ? (isDarkMode ? 'text-yellow-400' : 'text-yellow-600') :
                (isDarkMode ? 'text-green-400' : 'text-green-600')
              }`}>
                {trafficData.density_level} density
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
