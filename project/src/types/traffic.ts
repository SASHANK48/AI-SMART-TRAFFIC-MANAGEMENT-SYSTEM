export interface TrafficCamera {
  id: string;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  status: 'online' | 'offline' | 'maintenance';
  created_at: string;
}

export interface TrafficData {
  id: string;
  camera_id: string;
  vehicle_count: number;
  density_level: 'low' | 'medium' | 'high' | 'critical';
  average_speed: number;
  congestion_score: number;
  timestamp: string;
}

export interface TrafficSignal {
  id: string;
  camera_id: string;
  signal_name: string;
  current_state: 'red' | 'yellow' | 'green';
  green_duration: number;
  red_duration: number;
  last_optimized: string;
}

export interface TrafficAlert {
  id: string;
  camera_id: string;
  alert_type: 'congestion' | 'accident' | 'emergency';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  resolved: boolean;
  created_at: string;
}
