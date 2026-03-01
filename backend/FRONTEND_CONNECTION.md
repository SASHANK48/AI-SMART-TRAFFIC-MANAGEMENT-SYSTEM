# Frontend Connection Guide

Connect your React dashboard to the Smart Traffic Management backend.

## 1. Install dependencies (React + Vite example)

```bash
npm create vite@latest frontend -- --template react
cd frontend
npm install leaflet react-leaflet socket.io-client
npm install
```

## 2. Socket.IO – real-time traffic updates

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000', {
  transports: ['websocket', 'polling'],
});

socket.on('trafficUpdate', (updates) => {
  // updates: array of { city, latitude, longitude, congestionLevel, status, updatedAt }
  setMarkers((prev) => {
    const byCity = new Map(prev.map((m) => [m.city, m]));
    updates.forEach((u) => byCity.set(u.city, u));
    return Array.from(byCity.values());
  });
});

// Optional: request initial data on connect
socket.on('connect', () => {
  fetch('http://localhost:5000/api/traffic')
    .then((r) => r.json())
    .then(({ data }) => setMarkers(data));
});
```

## 3. REST API usage

```javascript
// All cities
const res = await fetch('http://localhost:5000/api/traffic');
const { data } = await res.json();

// Single city
const res = await fetch('http://localhost:5000/api/traffic/Delhi');
const { data } = await res.json();

// Manual update
await fetch('http://localhost:5000/api/traffic/update', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ city: 'Mumbai', congestionLevel: 65 }),
});
```

## 4. Leaflet map – India-centered with colored markers

```jsx
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const getMarkerColor = (status) => {
  if (status === 'Smooth') return '#22c55e';
  if (status === 'Moderate') return '#f97316';
  return '#ef4444'; // Heavy
};

function TrafficMarkers({ markers }) {
  return markers.map((m) => (
    <Marker key={m.city} position={[m.latitude, m.longitude]} icon={customIcon(m.status)}>
      <Popup>
        <b>{m.city}</b><br />
        {m.status} – {m.congestionLevel}%
      </Popup>
    </Marker>
  ));
}

// India center: ~20.5, 78.9; zoom 5
<MapContainer center={[20.5, 78.9]} zoom={5} style={{ height: '100vh' }}>
  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
  <TrafficMarkers markers={markers} />
</MapContainer>
```

Use a custom icon that sets the marker color from `getMarkerColor(status)` (e.g. divIcon with a colored circle).

## 5. Color coding

| Status   | Congestion | Color  |
|----------|------------|--------|
| Smooth   | 0–40       | Green  |
| Moderate | 41–70      | Orange |
| Heavy    | 71–100     | Red    |

Markers update in real time via the `trafficUpdate` Socket.IO event; no refresh needed.
