import { useEffect, useRef, useState, useMemo } from 'react';
import { MapPin, Search, AlertTriangle, X } from 'lucide-react';
import type { TrafficState } from '../hooks/useTrafficData';
import type * as Leaflet from 'leaflet';

interface MapPageProps {
    data: TrafficState;
    isDarkMode: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const L: any;

function getDensityColor(level?: string): string {
    switch (level) {
        case 'low': return '#22c55e'; // Green
        case 'medium': return '#eab308'; // Yellow
        case 'high': return '#f97316'; // Orange
        case 'critical': return '#ef4444'; // Red
        default: return '#6b7280'; // Gray
    }
}

export function MapPage({ data, isDarkMode }: MapPageProps) {
    const { cameras, trafficData } = data;
    const mapRef = useRef<Leaflet.Map | null>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const markersRef = useRef<Map<string, Leaflet.CircleMarker>>(new Map());
    const incidentMarkersRef = useRef<Map<string, Leaflet.Marker>>(new Map());
    const polylinesRef = useRef<Leaflet.Polyline[]>([]);
    const tileLayerRef = useRef<Leaflet.TileLayer | null>(null);

    // New Interactive State
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<string | null>(null);
    const [incidents, setIncidents] = useState<{ id: string, lat: number, lng: number, title: string }[]>([]);
    const [simulatingMode, setSimulatingMode] = useState(false);

    // Initial Map Setup
    useEffect(() => {
        if (!mapContainerRef.current || mapRef.current) return;
        if (typeof L === 'undefined') return;

        const map = L.map(mapContainerRef.current, {
            center: [20.5937, 78.9629],
            zoom: 5,
            zoomControl: false, // We will use default or repositioned
        });

        L.control.zoom({ position: 'bottomright' }).addTo(map);

        mapRef.current = map;

        return () => {
            map.remove();
            mapRef.current = null;
        };
    }, []);

    // Tile Layer switch based on Dark Mode
    useEffect(() => {
        const map = mapRef.current;
        if (!map || typeof L === 'undefined') return;

        if (tileLayerRef.current) {
            map.removeLayer(tileLayerRef.current);
        }

        const tileUrl = isDarkMode 
            ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' // CartoDB Dark
            : 'http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'; // Google Light

        const opts = isDarkMode 
            ? { maxZoom: 20, subdomains: 'abcd' }
            : { maxZoom: 20, subdomains: ['mt0', 'mt1', 'mt2', 'mt3'] };

        tileLayerRef.current = L.tileLayer(tileUrl, opts).addTo(map);

    }, [isDarkMode]);

    // Filter Logic
    const filteredCameras = useMemo(() => {
        return cameras.filter(camera => {
            const td = trafficData.get(camera.id);
            const matchesSearch = camera.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
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

    // Handle marker lifecycle
    useEffect(() => {
        const map = mapRef.current;
        if (!map || typeof L === 'undefined') return;

        const currentIds = new Set(filteredCameras.map(c => c.id));

        // Remove old markers
        markersRef.current.forEach((marker, id) => {
            if (!currentIds.has(id)) {
                map.removeLayer(marker);
                markersRef.current.delete(id);
            }
        });

        // Fly to single search result match
        if (searchQuery.length > 2 && filteredCameras.length === 1 && filteredCameras[0].latitude && filteredCameras[0].longitude) {
            map.flyTo([filteredCameras[0].latitude, filteredCameras[0].longitude], 15, { animate: true, duration: 1.5 });
        }

        filteredCameras.forEach(camera => {
            if (!camera.latitude || !camera.longitude) return;
            const td = trafficData.get(camera.id);
            const color = getDensityColor(td?.density_level);

            if (markersRef.current.has(camera.id)) {
                const marker = markersRef.current.get(camera.id);
                if (marker) {
                    marker.setPopupContent(buildPopupContent(camera.name, camera.location, td));
                }
            } else {
                const pinHtml = `
                    <div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 2px 2px 4px rgba(0,0,0,0.3); border: 2px solid white;">
                        <div style="width: 6px; height: 6px; background-color: white; border-radius: 50%;"></div>
                    </div>
                `;

                const pinIcon = L.divIcon({
                    className: 'google-map-pin',
                    html: pinHtml,
                    iconSize: [20, 20],
                    iconAnchor: [10, 20]
                });

                const marker = L.marker([camera.latitude, camera.longitude], {
                    icon: pinIcon
                }).addTo(map);

                marker.bindPopup(buildPopupContent(camera.name, camera.location, td), {
                    maxWidth: 280,
                    className: 'google-popup-style',
                });

                marker.on('mouseover', function () { marker.openPopup(); });
                markersRef.current.set(camera.id, marker);
            }
        });

        // Clear old polylines
        polylinesRef.current.forEach(line => map.removeLayer(line));
        polylinesRef.current = [];

        // Draw connections between nearby cameras to simulate roads
        const maxDistance = 0.5; // Roughly 50km
        
        for (let i = 0; i < filteredCameras.length; i++) {
            const cam1 = filteredCameras[i];
            if (!cam1.latitude || !cam1.longitude) continue;

            const td1 = trafficData.get(cam1.id);
            const color1 = getDensityColor(td1?.density_level);

            for (let j = i + 1; j < filteredCameras.length; j++) {
                const cam2 = filteredCameras[j];
                if (!cam2.latitude || !cam2.longitude) continue;

                // Simple Euclidean distance for visual proximity
                const dist = Math.sqrt(Math.pow(cam1.latitude - cam2.latitude, 2) + Math.pow(cam1.longitude - cam2.longitude, 2));
                
                // If cameras are close enough, draw a connecting traffic line
                if (dist < maxDistance) {
                    const line = L.polyline(
                        [[cam1.latitude, cam1.longitude], [cam2.latitude, cam2.longitude]], 
                        {
                            color: color1,
                            weight: td1?.density_level === 'critical' ? 6 : 4,
                            opacity: td1?.density_level === 'critical' ? 0.9 : 0.6,
                            className: td1?.density_level === 'critical' ? 'critical-traffic-line' : ''
                        }
                    ).addTo(map);
                    polylinesRef.current.push(line);

                    // We only want a few connections per camera so the map doesn't become a solid web
                    if (Math.random() > 0.8) break; 
                }
            }
        }

        // Fit bounds once if not searched
        if (!searchQuery && currentIds.size > 0 && currentIds.size === cameras.length && markersRef.current.size === cameras.length) {
            // only run once at the very beginning when everything matches 1 to 1 to avoid fighting scroll
             // we shouldn't fitbounds continuously
        }

    }, [filteredCameras, trafficData, cameras, searchQuery]);

    // Simulator Incident Logic Mapping
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        const handleMapClick = (e: Leaflet.LeafletMouseEvent) => {
            if (simulatingMode) {
                const newIncident = {
                    id: Math.random().toString(36).substr(2, 9),
                    lat: e.latlng.lat,
                    lng: e.latlng.lng,
                    title: 'Reported Roadblock / Accident'
                };
                setIncidents(prev => [...prev, newIncident]);
                setSimulatingMode(false);
            }
        };

        if (simulatingMode) {
            map.getContainer().style.cursor = 'crosshair';
            map.on('click', handleMapClick);
        } else {
            map.getContainer().style.cursor = '';
            map.off('click', handleMapClick);
        }

        return () => {
            map.off('click', handleMapClick);
        }
    }, [simulatingMode]);

    // Render incident markers
    useEffect(() => {
        const map = mapRef.current;
        if (!map || typeof L === 'undefined') return;

        incidents.forEach(incident => {
            if (!incidentMarkersRef.current.has(incident.id)) {
                 const incidentIcon = L.divIcon({
                    className: 'custom-incident-marker',
                    html: `<div style="background-color: #ef4444; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; display:flex; align-items:center; justify-content:center; box-shadow: 0 0 10px rgba(239, 68, 68, 0.8);"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path></svg></div>`,
                    iconSize: [24, 24],
                    iconAnchor: [12, 12]
                });

                const marker = L.marker([incident.lat, incident.lng], { icon: incidentIcon }).addTo(map);
                marker.bindPopup(`<div style="padding:4px; font-family:sans-serif;"><strong style="color:#ef4444;">🚨 Incident Alert</strong><br/>${incident.title}</div>`, {
                    className: 'traffic-popup-dark'
                });
                
                // Open popup instantly for the new event
                marker.openPopup();
                incidentMarkersRef.current.set(incident.id, marker);
            }
        });
    }, [incidents]);

    return (
        <div className={`flex flex-col h-[calc(100vh-80px)] relative overflow-hidden ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
            {/* Map Container */}
            <div className="flex-1 w-full relative z-0">
                <div 
                    ref={mapContainerRef} 
                    className="w-full h-full"
                />

                {/* Light Floating UI Overlays */}
                <div className="absolute top-4 left-4 right-4 z-[400] flex flex-col md:flex-row gap-4 justify-between pointer-events-none">
                    {/* Left side: Search & Filters */}
                    <div className="flex flex-col gap-3 pointer-events-auto w-full md:w-[420px]">
                        {/* Search Bar */}
                        <div className={`rounded-xl shadow-lg backdrop-blur-md p-3 flex items-center gap-3 border transition-colors ${
                            isDarkMode ? 'bg-gray-900/80 border-gray-700 text-white' : 'bg-white/80 border-gray-200 text-gray-900'
                        }`}>
                            <Search className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                            <input 
                                type="text" 
                                placeholder="Search Traffic Network..." 
                                className={`bg-transparent border-none focus:outline-none w-full text-base placeholder:text-gray-400`}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <button onClick={() => setSearchQuery('')} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            )}
                        </div>

                        {/* Filter Bar */}
                        <div className="flex items-center flex-wrap gap-2">
                            <FilterButton isDarkMode={isDarkMode} active={activeFilter === null} onClick={() => setActiveFilter(null)} label="All" />
                            <FilterButton isDarkMode={isDarkMode} active={activeFilter === 'critical_high'} onClick={() => setActiveFilter('critical_high')} label="Critical" color="text-red-500 bg-red-500/10 border-red-500/30" activeColor="bg-red-500 text-white border-red-500" />
                            <FilterButton isDarkMode={isDarkMode} active={activeFilter === 'low'} onClick={() => setActiveFilter('low')} label="Smooth" color="text-green-500 bg-green-500/10 border-green-500/30" activeColor="bg-green-500 text-white border-green-500" />
                            <FilterButton isDarkMode={isDarkMode} active={activeFilter === 'medium'} onClick={() => setActiveFilter('medium')} label="Moderate" color="text-yellow-500 bg-yellow-500/10 border-yellow-500/30" activeColor="bg-yellow-500 text-white border-yellow-500" />
                        </div>
                    </div>

                    {/* Right side: Simulation & Legend */}
                    <div className="pointer-events-auto flex flex-col items-end gap-3">
                        {/* Simulate Button */}
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

                        {/* Legend */}
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

                {/* Loading / Empty States */}
                {cameras.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900/60 z-[1000] backdrop-blur-sm">
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-2xl text-center">
                            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                            <p className="text-sm font-medium text-gray-300">Syncing live map data...</p>
                        </div>
                    </div>
                )}
                
                {filteredCameras.length === 0 && cameras.length > 0 && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-900/90 border border-gray-700 rounded-2xl p-6 shadow-xl text-center z-[1000] backdrop-blur-md">
                        <Search className="w-10 h-10 text-gray-500 mx-auto mb-3" />
                        <h3 className="font-bold text-white mb-1">No Cameras Found</h3>
                        <p className="text-sm text-gray-400">
                            Try adjusting your filters or search query.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

// Subcomponents
function FilterButton({ isDarkMode, active, onClick, label, color = "", activeColor = "" }: { isDarkMode: boolean, active: boolean, onClick: () => void, label: string, color?: string, activeColor?: string }) {
    
    // Default styles for "All" button
    const defaultColor = isDarkMode ? "text-gray-300 bg-gray-800/50 border-gray-700" : "text-gray-700 bg-white/80 border-gray-200";
    const defaultActiveColor = "bg-indigo-600 text-white border-indigo-600 shadow-indigo-500/30";

    const baseClasses = "px-4 py-1.5 rounded-full text-sm font-semibold transition-all border backdrop-blur-sm";
    
    // If active, use activeColor, else use color. Fallback to default if not provided
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

// Custom specialized popup content builder
function buildPopupContent(name: string, location: string, td?: { density_level: string, vehicle_count: number, average_speed: number, congestion_score: number }): string {
    const bg = '#ffffff';
    const text = '#1f2937';
    const textMuted = '#6b7280';
    const cardBg = '#f3f4f6';
    const border = '#e5e7eb';

    if (!td) {
        return `<div style="min-width:200px;background:${bg};font-family:sans-serif;padding:12px;color:${text}">
            <strong style="font-size:16px;">${name}</strong>
            <p style="color:${textMuted};font-size:12px;margin:4px 0 0;">${location}</p>
            <p style="color:#f59e0b;font-size:12px;margin:12px 0 0;">Loading data...</p>
        </div>`;
    }

    const color = getDensityColor(td.density_level);

    return `<div style="min-width:230px;background:${bg};font-family:sans-serif;padding:12px;color:${text};">
    <div style="border-bottom:1px solid ${border}; padding-bottom:8px; margin-bottom:10px;">
        <strong style="font-size:16px;">${name}</strong>
        <p style="color:${textMuted};font-size:12px;margin:4px 0 0;">${location}</p>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;">
      <div style="background:${cardBg};padding:8px;border-radius:8px;text-align:center;">
        <div style="font-size:11px;color:${textMuted};font-weight:600;">Vehicles</div>
        <div style="font-size:18px;font-weight:bold;margin-top:2px;">${td.vehicle_count}</div>
      </div>
      <div style="background:${cardBg};padding:8px;border-radius:8px;text-align:center;">
        <div style="font-size:11px;color:${textMuted};font-weight:600;">Avg Speed</div>
        <div style="font-size:18px;font-weight:bold;margin-top:2px;">${td.average_speed}<span style="font-size:11px;font-weight:normal;color:${textMuted}"> km/h</span></div>
      </div>
    </div>
    <div style="padding:10px;border:1px solid ${border};border-radius:8px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
        <span style="font-size:12px;color:${textMuted};font-weight:600;">Congestion Level</span>
        <span style="font-size:12px;font-weight:bold;color:${color};text-transform:capitalize;">${td.density_level}</span>
      </div>
      <div style="background:#e5e7eb;height:6px;border-radius:3px;overflow:hidden;">
        <div style="background:${color};width:${td.congestion_score}%;height:100%;transition:width 0.5s ease-in-out;"></div>
      </div>
      <div style="text-align:right;font-size:11px;color:${textMuted};margin-top:6px;">${td.congestion_score}% Capacity</div>
    </div>
  </div>`;
}
