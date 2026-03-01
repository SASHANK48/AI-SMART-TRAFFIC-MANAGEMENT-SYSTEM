import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { TrafficCamera, TrafficData, TrafficSignal, TrafficAlert } from '../types/traffic';

export interface TrafficState {
  cameras: TrafficCamera[];
  trafficData: Map<string, TrafficData>;
  signals: TrafficSignal[];
  alerts: TrafficAlert[];
  chartData: { time: string; value: number }[];
  totalVehicles: number;
  averageSpeed: number;
  activeAlerts: number;
  criticalLocations: number;
}

function buildInitialData(camerasList: TrafficCamera[]) {
  const newTrafficData = new Map<string, TrafficData>();
  const newSignals: TrafficSignal[] = [];
  const newAlerts: TrafficAlert[] = [];
  const densityLevels: ('low' | 'medium' | 'high' | 'critical')[] = ['low', 'medium', 'high', 'critical'];

  camerasList.forEach((camera, index) => {
    const densityLevel: 'low' | 'medium' | 'high' | 'critical' =
      densityLevels[Math.floor(Math.random() * densityLevels.length)] ?? 'low';
    const congestionScore =
      densityLevel === 'low' ? 20 + Math.random() * 20 :
        densityLevel === 'medium' ? 40 + Math.random() * 20 :
          densityLevel === 'high' ? 60 + Math.random() * 20 :
            80 + Math.random() * 20;

    newTrafficData.set(camera.id, {
      id: `td-${index}`,
      camera_id: camera.id,
      vehicle_count: Math.floor(Math.random() * 150) + 10,
      density_level: densityLevel,
      average_speed: Math.floor(Math.random() * 60) + 10,
      congestion_score: Math.floor(congestionScore),
      timestamp: new Date().toISOString(),
    });

    const signalStates: ('red' | 'green')[] = ['red', 'green'];
    newSignals.push({
      id: `sig-${index}`,
      camera_id: camera.id,
      signal_name: camera.name,
      current_state: signalStates[Math.floor(Math.random() * signalStates.length)] ?? 'red',
      green_duration: 45 + Math.floor(Math.random() * 60),
      red_duration: 45 + Math.floor(Math.random() * 60),
      last_optimized: new Date(Date.now() - Math.random() * 300000).toISOString(),
    });

    if (densityLevel === 'critical' || densityLevel === 'high') {
      newAlerts.push({
        id: `alert-${index}`,
        camera_id: camera.id,
        alert_type: 'congestion',
        severity: densityLevel === 'critical' ? 'critical' : 'high',
        message: `Heavy traffic detected at ${camera.name}. Consider alternate routes.`,
        resolved: Math.random() > 0.7,
        created_at: new Date(Date.now() - Math.random() * 1800000).toISOString(),
      });
    }
  });

  const chartData = Array.from({ length: 12 }, (_, i) => ({
    time: `${String(Math.max(1, 12 - i)).padStart(2, '0')}:00`,
    value: Math.floor(Math.random() * 100) + 20,
  }));

  return { newTrafficData, newSignals, newAlerts, chartData };
}

export function useTrafficData(): TrafficState {
  const [cameras, setCameras] = useState<TrafficCamera[]>([]);
  const [trafficData, setTrafficData] = useState<Map<string, TrafficData>>(new Map());
  const [signals, setSignals] = useState<TrafficSignal[]>([]);
  const [alerts, setAlerts] = useState<TrafficAlert[]>([]);
  const [chartData, setChartData] = useState<{ time: string; value: number }[]>([]);

  // Load initial data once on mount, then start 3-second simulation interval
  useEffect(() => {
    let mounted = true;

    // Load cameras from Supabase, then seed simulated data
    supabase
      .from('traffic_cameras')
      .select('*')
      .order('created_at')
      .then(({ data: camerasData }: { data: TrafficCamera[] | null; error: unknown }) => {
        if (!mounted || !camerasData) return;
        const { newTrafficData, newSignals, newAlerts, chartData: newChartData } = buildInitialData(camerasData);
        setCameras(camerasData);
        setTrafficData(newTrafficData);
        setSignals(newSignals);
        setAlerts(newAlerts);
        setChartData(newChartData);
      });

    // Simulation tick
    const interval = setInterval(() => {
      setTrafficData(prev => {
        const updated = new Map(prev);
        updated.forEach((data, cameraId) => {
          const variation = (Math.random() - 0.5) * 20;
          const newCount = Math.max(10, Math.min(200, data.vehicle_count + variation));
          const newSpeed = Math.max(5, Math.min(80, data.average_speed + (Math.random() - 0.5) * 10));
          const newScore = Math.max(0, Math.min(100, data.congestion_score + (Math.random() - 0.5) * 15));

          let newLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
          if (newScore < 30) newLevel = 'low';
          else if (newScore < 50) newLevel = 'medium';
          else if (newScore < 75) newLevel = 'high';
          else newLevel = 'critical';

          updated.set(cameraId, {
            ...data,
            vehicle_count: Math.floor(newCount),
            average_speed: Math.floor(newSpeed),
            congestion_score: Math.floor(newScore),
            density_level: newLevel,
            timestamp: new Date().toISOString(),
          });
        });
        return updated;
      });

      setSignals(prev =>
        prev.map(signal => ({
          ...signal,
          current_state: Math.random() > 0.7
            ? (signal.current_state === 'red' ? 'green' : 'red')
            : signal.current_state,
        }))
      );

      setChartData(prev => [
        ...prev.slice(1),
        {
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          value: Math.floor(Math.random() * 100) + 20,
        },
      ]);
    }, 3000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []); // stable: no external deps, all setters are stable references

  const totalVehicles = Array.from(trafficData.values()).reduce((sum, d) => sum + d.vehicle_count, 0);
  const averageSpeed = Array.from(trafficData.values()).reduce((sum, d) => sum + d.average_speed, 0) / Math.max(trafficData.size, 1);
  const activeAlerts = alerts.filter(a => !a.resolved).length;
  const criticalLocations = Array.from(trafficData.values()).filter(
    d => d.density_level === 'critical' || d.density_level === 'high'
  ).length;

  return { cameras, trafficData, signals, alerts, chartData, totalVehicles, averageSpeed, activeAlerts, criticalLocations };
}
