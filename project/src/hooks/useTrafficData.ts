import { useEffect, useState } from 'react';
import { useSocket } from '../contexts/SocketContext';
import type { TrafficCamera, TrafficData, TrafficSignal, TrafficAlert } from '../types/traffic';

interface ApiCity {
  _id: string;
  city_name: string;
  latitude: number;
  longitude: number;
}

interface ApiAlert {
  _id: string;
  city_id: { _id?: string } | string;
  severity: string;
  message: string;
  timestamp: string;
}

interface ApiTrafficUpdate {
  _id: string;
  city_id: string;
  traffic_level: string;
  vehicle_count?: number;
  average_speed?: number;
  congestion_score?: number;
  timestamp: string;
}

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

export function useTrafficData(): TrafficState {
  const { socket, isConnected } = useSocket();
  const [cameras, setCameras] = useState<TrafficCamera[]>([]);
  const [trafficData, setTrafficData] = useState<Map<string, TrafficData>>(new Map());
  const [signals] = useState<TrafficSignal[]>([]);
  const [alerts, setAlerts] = useState<TrafficAlert[]>([]);
  const [chartData, setChartData] = useState<{ time: string; value: number }[]>([]);

  useEffect(() => {
    let mounted = true;

    // Fetch initial cameras/cities
    fetch('http://localhost:5000/api/cities')
      .then(res => res.json())
      .then(data => {
        if (!mounted) return;
        const mappedCameras = data.map((c: ApiCity) => ({
          id: c._id,
          name: c.city_name,
          location: c.city_name,
          latitude: c.latitude,
          longitude: c.longitude,
          status: 'active'
        }));
        setCameras(mappedCameras);
      })
      .catch(console.error);

    // Fetch initial alerts
    fetch('http://localhost:5000/api/alerts')
      .then(res => res.json())
      .then(data => {
        if (!mounted) return;
        const mappedAlerts = data.map((a: ApiAlert) => {
          const cid = typeof a.city_id === 'object' && a.city_id !== null ? a.city_id._id : a.city_id;
          return {
            id: a._id,
            camera_id: cid as string,
            alert_type: 'congestion',
            severity: a.severity.toLowerCase() as 'low' | 'medium' | 'high' | 'critical',
            message: a.message,
            resolved: false,
            created_at: a.timestamp
          };
        });
        setAlerts(mappedAlerts);
      })
      .catch(console.error);

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleTrafficUpdate = (updates: ApiTrafficUpdate[]) => {
      setTrafficData(prev => {
        const next = new Map(prev);
        updates.forEach(u => {
          let density = 'low';
          if (u.traffic_level === 'Moderate') density = 'medium';
          if (u.traffic_level === 'Heavy') density = 'high';
          if (u.traffic_level === 'Severe') density = 'critical';

          next.set(u.city_id, {
            id: u._id,
            camera_id: u.city_id,
            vehicle_count: u.vehicle_count || Math.floor(Math.random() * 100) + 20,
            density_level: density as 'low' | 'medium' | 'high' | 'critical',
            average_speed: u.average_speed || Math.floor(Math.random() * 40) + 20,
            congestion_score: u.congestion_score || (density === 'critical' ? 90 : density === 'high' ? 70 : 40),
            timestamp: u.timestamp
          });
        });
        return next;
      });

      setChartData(prev => {
        const avgScore = updates.reduce((acc, u) => acc + (u.congestion_score || 50), 0) / (updates.length || 1);
        const newPoint = {
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          value: avgScore
        };
        const next = [...prev, newPoint];
        if (next.length > 12) return next.slice(1);
        return next;
      });
    };

    const handleAlertsUpdate = (newAlert: ApiAlert) => {
       const cid = typeof newAlert.city_id === 'object' && newAlert.city_id !== null ? newAlert.city_id._id : newAlert.city_id;
       setAlerts(prev => [{
          id: newAlert._id,
          camera_id: cid as string,
          alert_type: 'congestion',
          severity: newAlert.severity.toLowerCase() as 'low' | 'medium' | 'high' | 'critical',
          message: newAlert.message,
          resolved: false,
          created_at: newAlert.timestamp
       }, ...prev]);
    };

    socket.on('trafficUpdate', handleTrafficUpdate);
    socket.on('newAlert', handleAlertsUpdate);

    return () => {
      socket.off('trafficUpdate', handleTrafficUpdate);
      socket.off('newAlert', handleAlertsUpdate);
    };
  }, [socket, isConnected]);

  const totalVehicles = Array.from(trafficData.values()).reduce((sum, d) => sum + d.vehicle_count, 0);
  const averageSpeed = Array.from(trafficData.values()).reduce((sum, d) => sum + d.average_speed, 0) / Math.max(trafficData.size, 1);
  const activeAlerts = alerts.filter(a => !a.resolved).length;
  const criticalLocations = Array.from(trafficData.values()).filter(
    d => d.density_level === 'critical' || d.density_level === 'high'
  ).length;

  return { cameras, trafficData, signals, alerts, chartData, totalVehicles, averageSpeed, activeAlerts, criticalLocations };
}
