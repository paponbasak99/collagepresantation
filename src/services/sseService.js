/**
 * DocBook Real-Time Server-Sent Events (SSE) Service
 * Manages live chamber queue streams, token calls, and status broadcasts.
 */

const clients = new Set();

/**
 * Register a client for live SSE queue updates
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
export function subscribeQueueClient(req, res) {
  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no'
  });

  const doctorId = req.query.doctor_id ? parseInt(req.query.doctor_id, 10) : null;
  const clientInfo = {
    id: Math.random().toString(36).substring(2, 9),
    res,
    doctorId,
    connectedAt: new Date()
  };

  clients.add(clientInfo);

  // Send initial connected payload
  res.write(`event: connected\ndata: ${JSON.stringify({
    status: 'connected',
    clientId: clientInfo.id,
    subscribedDoctorId: doctorId,
    timestamp: new Date().toISOString()
  })}\n\n`);

  // Periodic heartbeat every 20s to prevent reverse proxy timeouts
  const heartbeat = setInterval(() => {
    try {
      res.write(': keep-alive ping\n\n');
    } catch (_) {
      clearInterval(heartbeat);
      clients.delete(clientInfo);
    }
  }, 20000);

  // Cleanup on client disconnect
  req.on('close', () => {
    clearInterval(heartbeat);
    clients.delete(clientInfo);
  });

  req.on('error', () => {
    clearInterval(heartbeat);
    clients.delete(clientInfo);
  });
}

/**
 * Broadcast event to relevant clients
 * @param {Object} param0
 * @param {number|null} param0.doctorId - Targeted doctor or null for all
 * @param {string} param0.eventType - e.g. 'TOKEN_CALLED', 'QUEUE_UPDATED', 'DELAY_BROADCAST'
 * @param {Object} param0.data - Event payload
 */
export function broadcastQueueEvent({ doctorId = null, eventType = 'QUEUE_UPDATED', data = {} }) {
  const payload = JSON.stringify({
    ...data,
    doctorId,
    timestamp: new Date().toISOString()
  });

  const message = `event: ${eventType}\ndata: ${payload}\n\n`;

  for (const client of clients) {
    try {
      // Send if client is listening to all or specifically to this doctor
      if (!client.doctorId || !doctorId || client.doctorId === doctorId) {
        client.res.write(message);
      }
    } catch (_) {
      clients.delete(client);
    }
  }
}

/**
 * Get active SSE subscriber count
 */
export function getActiveSseCount() {
  return clients.size;
}
