require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');
const trafficRoutes = require('./routes/trafficRoutes');
const cameraRoutes = require('./routes/cameraRoutes');
const authRoutes = require('./routes/authRoutes');
const cityRoutes = require('./routes/cityRoutes');
const alertRoutes = require('./routes/alertRoutes');
const { setupSocket } = require('./sockets/socketHandler');
const { startSimulation } = require('./services/trafficSimulator');
const { seedIfEmpty } = require('./scripts/seedData');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';
const TRAFFIC_UPDATE_INTERVAL = Number(process.env.TRAFFIC_UPDATE_INTERVAL) || 5000;

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

app.use(cors({ origin: '*' }));
app.use(express.json());

app.use('/api/traffic', trafficRoutes);
app.use('/api/cameras', cameraRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/cities', cityRoutes);
app.use('/api/alerts', alertRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'Not found' });
});

app.use((err, req, res, next) => {
  console.error('Error:', err.message || err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

async function start() {
  await connectDB();
  await seedIfEmpty();
  setupSocket(io);
  startSimulation(io, TRAFFIC_UPDATE_INTERVAL);

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Traffic simulation every ${TRAFFIC_UPDATE_INTERVAL}ms`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
