import { Camera, Circle } from 'lucide-react';
import type { TrafficCamera, TrafficData } from '../types/traffic';

interface CameraCardProps {
  camera: TrafficCamera;
  trafficData?: TrafficData;
}

export function CameraCard({ camera, trafficData }: CameraCardProps) {
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
    switch (level) {
      case 'low': return 'bg-green-50 border-green-200';
      case 'medium': return 'bg-yellow-50 border-yellow-200';
      case 'high': return 'bg-orange-50 border-orange-200';
      case 'critical': return 'bg-red-50 border-red-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className={`rounded-xl border-2 overflow-hidden shadow-lg transition-all hover:shadow-xl ${getDensityBg(trafficData?.density_level)}`}>
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
        <h3 className="font-bold text-lg text-gray-900 mb-1">{camera.name}</h3>
        <p className="text-sm text-gray-600 mb-3">{camera.location}</p>

        {trafficData && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Vehicles</p>
              <p className="text-2xl font-bold text-gray-900">{trafficData.vehicle_count}</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Avg Speed</p>
              <p className="text-2xl font-bold text-gray-900">{trafficData.average_speed}<span className="text-sm ml-1">km/h</span></p>
            </div>
            <div className="col-span-2 bg-white rounded-lg p-3 border border-gray-200">
              <p className="text-xs text-gray-500 mb-2">Congestion Level</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getDensityColor(trafficData.density_level)}`}
                    style={{ width: `${trafficData.congestion_score}%` }}
                  ></div>
                </div>
                <span className="text-sm font-bold text-gray-900">{trafficData.congestion_score}%</span>
              </div>
              <p className={`text-xs font-medium mt-1 capitalize ${
                trafficData.density_level === 'critical' ? 'text-red-600' :
                trafficData.density_level === 'high' ? 'text-orange-600' :
                trafficData.density_level === 'medium' ? 'text-yellow-600' :
                'text-green-600'
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
