# Smart Traffic Management – Backend

Node.js + Express backend for the AI-Based Smart Traffic Management System. Supports multiple Indian cities, real-time traffic via Socket.IO, MongoDB, and AI-based congestion simulation.

## Quick start

```bash
cd backend
npm install
# Set MONGODB_URI in .env (default: mongodb://localhost:27017/traffic_db)
npm start
```

- **Server:** http://localhost:5000  
- **APIs:** http://localhost:5000/api/traffic  
- **Health:** http://localhost:5000/health  

On first run, if the database is empty, 10 Indian cities are auto-seeded. Traffic is simulated every 5 seconds and broadcast via Socket.IO as `trafficUpdate`.

## Manual seed (optional)

```bash
npm run seed
```

## Environment variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/traffic_db` |
| `PORT` | Server port | `5000` |
| `CORS_ORIGIN` | Allowed origins (comma-separated) | `http://localhost:3000,http://localhost:5173` |
| `TRAFFIC_UPDATE_INTERVAL` | Simulation interval (ms) | `5000` |

Copy `.env.example` to `.env` and adjust as needed.

## API endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/traffic` | All city traffic data |
| GET | `/api/traffic/:city` | Traffic for one city (e.g. Delhi, Mumbai) |
| POST | `/api/traffic/update` | Body: `{ city, congestionLevel }` – update congestion |

## Real-time (Socket.IO)

- **Event:** `trafficUpdate`  
- **Payload:** Array of `{ city, latitude, longitude, congestionLevel, status, updatedAt }`  
- **Frequency:** Every 5 seconds (configurable)

See **FRONTEND_CONNECTION.md** for React + Leaflet + Socket.IO integration and map color coding.
