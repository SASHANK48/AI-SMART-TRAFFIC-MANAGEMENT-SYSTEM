const Traffic = require('../models/Traffic');

/**
 * Get status string from congestion level (0-100)
 * 0–40 → Smooth, 41–70 → Moderate, 71–100 → Heavy
 */
function getStatusFromLevel(level) {
  const clamped = Math.max(0, Math.min(100, Math.round(level)));
  if (clamped <= 40) return 'Smooth';
  if (clamped <= 70) return 'Moderate';
  return 'Heavy';
}

/**
 * Haversine distance in km (approximate) - for "repulsion" weight
 */
function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Anti-gravity inspired congestion dispersion:
 * - High density at node A "repels" traffic → reduces effective density at A, increases at others
 * - Nearby high-congestion nodes push flow away (dispersion)
 * Returns new congestion level for one node given all nodes' current levels and positions.
 */
function computeDispersion(cityIndex, nodes, congestionLevels) {
  const node = nodes[cityIndex];
  let repulsion = 0;
  let attraction = 0;
  const kRepel = 0.15;   // how much neighboring congestion "pushes" traffic away
  const kAttract = 0.08; // baseline drift toward mean
  const meanLevel = congestionLevels.reduce((a, b) => a + b, 0) / congestionLevels.length;

  for (let i = 0; i < nodes.length; i++) {
    if (i === cityIndex) continue;
    const other = nodes[i];
    const distKm = haversineKm(node.latitude, node.longitude, other.latitude, other.longitude);
    if (distKm < 1) continue; // avoid div by zero
    // Repulsion: high congestion elsewhere pushes flow away from that area (so this node gets some "pushed" flow)
    const weight = 1 / (distKm * distKm);
    repulsion += congestionLevels[i] * weight * kRepel;
    attraction += meanLevel * (1 / nodes.length) * kAttract;
  }

  const current = congestionLevels[cityIndex];
  // Dispersion: current level decreases when repulsion is high (traffic leaves), increases when others repel toward us
  const dispersion = repulsion * 2.5 - current * 0.02;
  const drift = (meanLevel - current) * kAttract;
  let next = current + dispersion + drift;
  // Add small randomness (traffic fluctuation)
  next += (Math.random() - 0.5) * 8;
  return Math.max(0, Math.min(100, next));
}

/**
 * Run one simulation tick: load all traffic nodes, apply anti-gravity dispersion, save and return updates.
 */
async function runSimulationTick(io) {
  const nodes = await Traffic.find().lean();
  if (nodes.length === 0) return [];

  const congestionLevels = nodes.map((n) => n.congestionLevel);
  const updates = [];

  for (let i = 0; i < nodes.length; i++) {
    const newLevel = computeDispersion(i, nodes, congestionLevels);
    const status = getStatusFromLevel(newLevel);

    const updated = await Traffic.findOneAndUpdate(
      { city: nodes[i].city },
      {
        congestionLevel: Math.round(newLevel * 10) / 10,
        status,
        updatedAt: new Date(),
      },
      { new: true }
    ).lean();

    if (updated) {
      updates.push({
        city: updated.city,
        location: updated.location,
        latitude: updated.latitude,
        longitude: updated.longitude,
        congestionLevel: updated.congestionLevel,
        status: updated.status,
        updatedAt: updated.updatedAt,
      });
      congestionLevels[i] = updated.congestionLevel;
    }
  }

  if (io && updates.length > 0) {
    io.emit('trafficUpdate', updates);
  }

  return updates;
}

/**
 * Start periodic traffic simulation (every 5 seconds by default).
 */
function startSimulation(io, intervalMs = 5000) {
  const interval = setInterval(async () => {
    try {
      await runSimulationTick(io);
    } catch (err) {
      console.error('Traffic simulation error:', err);
    }
  }, intervalMs);
  return () => clearInterval(interval);
}

module.exports = {
  getStatusFromLevel,
  runSimulationTick,
  startSimulation,
};
