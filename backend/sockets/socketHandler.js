/**
 * Socket.IO handler for real-time traffic updates.
 * Backend simulates traffic, updates MongoDB, and broadcasts "trafficUpdate".
 */

function setupSocket(io) {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
}

module.exports = { setupSocket };
