
  # Smart Traffic Management System Database Schema

  1. New Tables
    - `traffic_cameras`
      - `id` (uuid, primary key)
      - `name` (text) - Camera/Location name
      - `location` (text) - Address/Location details
      - `latitude` (numeric) - GPS latitude
      - `longitude` (numeric) - GPS longitude
      - `status` (text) - online/offline/maintenance
      - `created_at` (timestamp)
    
    - `traffic_data`
      - `id` (uuid, primary key)
      - `camera_id` (uuid, foreign key)
      - `vehicle_count` (integer) - Number of vehicles detected
      - `density_level` (text) - low/medium/high/critical
      - `average_speed` (numeric) - Average speed in km/h
      - `congestion_score` (integer) - 0-100 score
      - `timestamp` (timestamp)
    
    - `traffic_signals`
      - `id` (uuid, primary key)
      - `camera_id` (uuid, foreign key)
      - `signal_name` (text)
      - `current_state` (text) - red/yellow/green
      - `green_duration` (integer) - seconds
      - `red_duration` (integer) - seconds
      - `last_optimized` (timestamp)
    
    - `traffic_alerts`
      - `id` (uuid, primary key)
      - `camera_id` (uuid, foreign key)
      - `alert_type` (text) - congestion/accident/emergency
      - `severity` (text) - low/medium/high/critical
      - `message` (text)
      - `resolved` (boolean)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access (demo purposes)


CREATE TABLE IF NOT EXISTS traffic_cameras (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  location text NOT NULL,
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  status text DEFAULT 'online',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS traffic_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  camera_id uuid REFERENCES traffic_cameras(id) ON DELETE CASCADE,
  vehicle_count integer DEFAULT 0,
  density_level text DEFAULT 'low',
  average_speed numeric DEFAULT 0,
  congestion_score integer DEFAULT 0,
  timestamp timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS traffic_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  camera_id uuid REFERENCES traffic_cameras(id) ON DELETE CASCADE,
  signal_name text NOT NULL,
  current_state text DEFAULT 'red',
  green_duration integer DEFAULT 60,
  red_duration integer DEFAULT 60,
  last_optimized timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS traffic_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  camera_id uuid REFERENCES traffic_cameras(id) ON DELETE CASCADE,
  alert_type text NOT NULL,
  severity text NOT NULL,
  message text NOT NULL,
  resolved boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE traffic_cameras ENABLE ROW LEVEL SECURITY;
ALTER TABLE traffic_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE traffic_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE traffic_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for cameras"
  ON traffic_cameras FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public read access for traffic data"
  ON traffic_data FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public read access for signals"
  ON traffic_signals FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public read access for alerts"
  ON traffic_alerts FOR SELECT
  TO anon, authenticated
  USING (true);

INSERT INTO traffic_cameras (name, location, latitude, longitude, status) VALUES
  ('MG Road Junction', 'MG Road & Brigade Road Intersection', 12.9716, 77.5946, 'online'),
  ('Silk Board Signal', 'Silk Board Junction, HSR Layout', 12.9177, 77.6238, 'online'),
  ('Marathahalli Bridge', 'Marathahalli Outer Ring Road', 12.9591, 77.7013, 'online'),
  ('Hebbal Flyover', 'Hebbal Junction NH-44', 13.0358, 77.5970, 'online'),
  ('Electronic City', 'Electronic City Phase 1 Tollgate', 12.8456, 77.6603, 'online'),
  ('Koramangala 5th Block', 'Koramangala 80 Feet Road', 12.9352, 77.6193, 'online'),
  ('Surat Junction', 'Surat Main Intersection', 21.1702, 72.8311, 'online'),
  ('Lucknow Junction', 'Lucknow Main Intersection', 26.8467, 80.9462, 'online'),
  ('Kanpur Junction', 'Kanpur Main Intersection', 26.4499, 80.3319, 'online'),
  ('Nagpur Junction', 'Nagpur Main Intersection', 21.1458, 79.0882, 'online'),
  ('Indore Junction', 'Indore Main Intersection', 22.7196, 75.8577, 'online'),
  ('Thane Junction', 'Thane Main Intersection', 19.2183, 72.9781, 'online'),
  ('Bhopal Junction', 'Bhopal Main Intersection', 23.2599, 77.4126, 'online'),
  ('Pimpri-Chinchwad Junction', 'Pimpri-Chinchwad Main Intersection', 18.6298, 73.7997, 'online'),
  ('Patna Junction', 'Patna Main Intersection', 25.5941, 85.1376, 'online'),
  ('Vadodara Junction', 'Vadodara Main Intersection', 22.3072, 73.1812, 'online'),
  ('Ghaziabad Junction', 'Ghaziabad Main Intersection', 28.6692, 77.4538, 'online'),
  ('Ludhiana Junction', 'Ludhiana Main Intersection', 30.9010, 75.8573, 'online'),
  ('Agra Junction', 'Agra Main Intersection', 27.1767, 78.0081, 'online'),
  ('Nashik Junction', 'Nashik Main Intersection', 19.9975, 73.7898, 'online'),
  ('Faridabad Junction', 'Faridabad Main Intersection', 28.4089, 77.3178, 'online'),
  ('Meerut Junction', 'Meerut Main Intersection', 28.9845, 77.7064, 'online'),
  ('Rajkot Junction', 'Rajkot Main Intersection', 22.3039, 70.8022, 'online'),
  ('Kalyan-Dombivli Junction', 'Kalyan-Dombivli Main Intersection', 19.2403, 73.1305, 'online'),
  ('Vasai-Virar Junction', 'Vasai-Virar Main Intersection', 19.3919, 72.8397, 'online'),
  ('Varanasi Junction', 'Varanasi Main Intersection', 25.3176, 82.9739, 'online');
