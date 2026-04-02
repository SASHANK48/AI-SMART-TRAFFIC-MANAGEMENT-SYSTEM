import React, { useState, useMemo, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, TrafficLayer, Marker, InfoWindow } from '@react-google-maps/api';
import { MapPin, Search, AlertTriangle, X } from 'lucide-react';
import type { TrafficState } from '../hooks/useTrafficData';

interface MapPageProps {
  data: TrafficState;
  isDarkMode: boolean;
}

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const defaultCenter = {
  lat: 20.5937,
  lng: 78.9629,
};

// Map options for Dark and Light modes
const getMapOptions = (isDarkMode: boolean) => ({
  disableDefaultUI: true,
  zoomControl: true,
  styles: isDarkMode
    ? [
        { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
        { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
        { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
        { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
        { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
        { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#263c3f' }] },
        { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#6b9a76' }] },
        { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#38414e' }] },
        { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#212a37' }] },
        { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#9ca5b3' }] },
        { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#746855' }] },
        { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#1f2835' }] },
        { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#f3d19c' }] },
        { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#2f3948' }] },
        { featureType: 'transit.station', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
        { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#17263c' }] },
        { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#515c6d' }] },
        { featureType: 'water', elementType: 'labels.text.stroke', stylers: [{ color: '#17263c' }] },
      ]
    : [],
});

function getDensityColor(level?: string): string {
  switch (level) {
    case 'low': return '#22c55e';
    case 'medium': return '#eab308';
    case 'high': return '#f97316';
    case 'critical': return '#ef4444';
    default: return '#6b7280';
  }
}

export function MapPage({ data, isDarkMode }: MapPageProps) {
  const { cameras, trafficData } = data;
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    // In a real application, replace this with your actual Google Maps API key
    // For demo purposes and since there's no env key provided in the prompt, placing a dummy or relying on env var
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  });

  const [, setMap] = useState<google.maps.Map | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [simulatingMode, setSimulatingMode] = useState(false);
  const [incidents, setIncidents] = useState<{ id: string; lat: number; lng: number; title: string }[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null);

  const onLoad = useCallback(function callback(map: google.maps.Map) {
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback() {
    setMap(null);
  }, []);

  const filteredCameras = useMemo(() => {
    return cameras.filter((camera) => {
      const td = trafficData.get(camera.id);
      const matchesSearch =
        camera.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        camera.location.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (activeFilter) {
        if (activeFilter === 'critical_high') {
          return td?.density_level === 'critical' || td?.density_level === 'high';
        }
        return td?.density_level === activeFilter;
      }
      return true;
    });
  }, [cameras, trafficData, searchQuery, activeFilter]);

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (simulatingMode && e.latLng) {
      const newIncident = {
        id: Math.random().toString(36).substr(2, 9),
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
        title: 'Reported Roadblock / Accident',
      };
      setIncidents((prev) => [...prev, newIncident]);
      setSimulatingMode(false);
    }
  };

  return (
    <div className={`flex flex-col h-[calc(100vh-80px)] relative overflow-hidden ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <div className="flex-1 w-full relative z-0">
        {!isLoaded ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/60 z-[1000] backdrop-blur-sm">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-2xl text-center flex flex-col items-center">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-sm font-medium text-gray-300">Loading Google Maps...</p>
            </div>
          </div>
        ) : (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={defaultCenter}
            zoom={5}
            onLoad={onLoad}
            onUnmount={onUnmount}
            options={getMapOptions(isDarkMode)}
            onClick={handleMapClick}
          >
            <TrafficLayer />

            {filteredCameras.map((camera) => {
              if (!camera.latitude || !camera.longitude) return null;
              const td = trafficData.get(camera.id);
              const color = getDensityColor(td?.density_level);

              return (
                <Marker
                  key={camera.id}
                  position={{ lat: camera.latitude, lng: camera.longitude }}
                  onClick={() => setSelectedCamera(camera.id)}
                  icon={{
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 8,
                    fillColor: color,
                    fillOpacity: 1,
                    strokeColor: '#ffffff',
                    strokeWeight: 2,
                  }}
                >
                  {selectedCamera === camera.id && (
                    <InfoWindow onCloseClick={() => setSelectedCamera(null)}>
                      <div className="p-2 min-w-[200px] text-gray-900">
                        <strong className="text-base">{camera.name}</strong>
                        <p className="text-xs text-gray-500 mt-1">{camera.location}</p>
                        {td ? (
                          <div className="mt-3 space-y-2">
                            <div className="grid grid-cols-2 gap-2 text-center">
                              <div className="bg-gray-100 p-2 rounded-md">
                                <span className="text-xs text-gray-500 block font-semibold">Vehicles</span>
                                <span className="text-lg font-bold">{td.vehicle_count}</span>
                              </div>
                              <div className="bg-gray-100 p-2 rounded-md">
                                <span className="text-xs text-gray-500 block font-semibold">Avg Speed</span>
                                <span className="text-lg font-bold">{Math.round(td.average_speed)} km/h</span>
                              </div>
                            </div>
                            <div className="pt-2">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-xs text-gray-600 font-semibold">Congestion</span>
                                <span className="text-xs font-bold capitalize" style={{ color }}>{td.density_level}</span>
                              </div>
                              <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                                <div className="h-full" style={{ width: `${td.congestion_score}%`, backgroundColor: color }} />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-orange-500 mt-2">Loading data...</p>
                        )}
                      </div>
                    </InfoWindow>
                  )}
                </Marker>
              );
            })}

            {incidents.map((incident) => (
              <Marker
                key={incident.id}
                position={{ lat: incident.lat, lng: incident.lng }}
                icon={{
                  path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
                  scale: 6,
                  fillColor: '#ef4444',
                  fillOpacity: 1,
                  strokeColor: '#ffffff',
                  strokeWeight: 2,
                }}
              />
            ))}
          </GoogleMap>
        )}

        {/* UI Overlays */}
        <div className="absolute top-4 left-4 right-4 flex flex-col md:flex-row gap-4 justify-between pointer-events-none z-10">
          <div className="flex flex-col gap-3 pointer-events-auto w-full md:w-[420px]">
             <div className={`rounded-xl shadow-lg backdrop-blur-md p-3 flex items-center gap-3 border transition-colors ${
                 isDarkMode ? 'bg-gray-900/80 border-gray-700 text-white' : 'bg-white/80 border-gray-200 text-gray-900'
             }`}>
                 <Search className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                 <input 
                     type="text" 
                     placeholder="Search Traffic Network..." 
                     className="bg-transparent border-none focus:outline-none w-full text-base placeholder:text-gray-400"
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                 />
                 {searchQuery && (
                     <button onClick={() => setSearchQuery('')} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                         <X className="w-5 h-5 text-gray-500" />
                     </button>
                 )}
             </div>

             <div className="flex items-center flex-wrap gap-2">
                 <FilterButton isDarkMode={isDarkMode} active={activeFilter === null} onClick={() => setActiveFilter(null)} label="All" />
                 <FilterButton isDarkMode={isDarkMode} active={activeFilter === 'critical_high'} onClick={() => setActiveFilter('critical_high')} label="Critical" color="text-red-500 bg-red-500/10 border-red-500/30" activeColor="bg-red-500 text-white border-red-500" />
                 <FilterButton isDarkMode={isDarkMode} active={activeFilter === 'low'} onClick={() => setActiveFilter('low')} label="Smooth" color="text-green-500 bg-green-500/10 border-green-500/30" activeColor="bg-green-500 text-white border-green-500" />
                 <FilterButton isDarkMode={isDarkMode} active={activeFilter === 'medium'} onClick={() => setActiveFilter('medium')} label="Moderate" color="text-yellow-500 bg-yellow-500/10 border-yellow-500/30" activeColor="bg-yellow-500 text-white border-yellow-500" />
             </div>
          </div>

          <div className="pointer-events-auto flex flex-col items-end gap-3 pr-2">
             <button 
                 onClick={() => setSimulatingMode(!simulatingMode)}
                 className={`flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg backdrop-blur-md font-semibold text-sm transition-all border ${
                     simulatingMode 
                     ? 'bg-red-500 text-white border-red-500 shadow-red-500/30 scale-105' 
                     : isDarkMode
                         ? 'bg-gray-900/80 text-gray-300 border-gray-700 hover:bg-gray-800'
                         : 'bg-white/90 text-gray-700 border-gray-200 hover:bg-white'
                 }`}
             >
                 <AlertTriangle className="w-4 h-4" />
                 <span>{simulatingMode ? 'Click Map...' : 'Report Incident'}</span>
             </button>

             <div className={`rounded-2xl shadow-xl backdrop-blur-md border p-5 w-[240px] ${
                 isDarkMode ? 'bg-gray-900/80 border-gray-700' : 'bg-white/80 border-gray-200'
             }`}>
                 <h3 className={`text-xs font-bold uppercase tracking-wider mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Traffic Legends</h3>
                 <div className="flex flex-col gap-3">
                     <LegendItem color="#22c55e" label="Low (Smooth)" isDarkMode={isDarkMode} />
                     <LegendItem color="#eab308" label="Moderate" isDarkMode={isDarkMode} />
                     <LegendItem color="#f97316" label="High" isDarkMode={isDarkMode} />
                     <LegendItem color="#ef4444" label="Critical" isDarkMode={isDarkMode} />
                 </div>
                 
                 <div className={`mt-5 pt-4 flex flex-col gap-3 border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                     <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2">
                             <MapPin className="w-4 h-4 text-indigo-500" />
                             <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Cameras</span>
                         </div>
                         <span className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{filteredCameras.length}</span>
                     </div>
                     {incidents.length > 0 && (
                         <div className="flex items-center justify-between">
                             <div className="flex items-center gap-2">
                                 <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
                                 <span className="text-sm text-red-500 font-medium">Incidents</span>
                             </div>
                             <span className="text-base font-bold text-red-500">{incidents.length}</span>
                         </div>
                     )}
                 </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterButton({ isDarkMode, active, onClick, label, color = "", activeColor = "" }: { isDarkMode: boolean, active: boolean, onClick: () => void, label: string, color?: string, activeColor?: string }) {
  const defaultColor = isDarkMode ? "text-gray-300 bg-gray-800/50 border-gray-700" : "text-gray-700 bg-white/80 border-gray-200";
  const defaultActiveColor = "bg-indigo-600 text-white border-indigo-600 shadow-indigo-500/30";
  const baseClasses = "px-4 py-1.5 rounded-full text-sm font-semibold transition-all border backdrop-blur-sm";
  const appliedClasses = active 
      ? `${baseClasses} shadow-md ${activeColor || defaultActiveColor}`
      : `${baseClasses} hover:-translate-y-0.5 shadow-sm ${color || defaultColor}`;

  return (
      <button onClick={onClick} className={appliedClasses}>
          {label}
      </button>
  );
}

function LegendItem({ color, label, isDarkMode }: { color: string, label: string, isDarkMode: boolean }) {
  return (
      <div className="flex items-center gap-3">
          <span 
              className="w-3.5 h-3.5 rounded-full shadow-[0_0_8px_currentColor] opacity-90" 
              style={{ backgroundColor: color, color: color }} 
          />
          <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{label}</span>
      </div>
  );
}
