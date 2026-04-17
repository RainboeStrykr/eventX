try { require('dotenv').config({ path: '../.env' }); } catch (e) { /* dotenv not needed in production */ }

const express = require('express');
const cors = require('cors');
const path = require('path');

const registerRoute = require('./routes/register');
const checkinRoute = require('./routes/checkin');
const participantsRoute = require('./routes/participants');
const statsRoute = require('./routes/stats');
const qrRoute = require('./routes/qr');
const { listEvents } = require('./utils/events');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// API Routes
app.use('/api/register', registerRoute);
app.use('/api/checkin', checkinRoute);
app.use('/api/participants', participantsRoute);
app.use('/api/stats', statsRoute);
app.use('/api/qr', qrRoute);
app.get('/api/events', (req, res) => {
  res.json({ events: listEvents() });
});

app.post('/api/admin/verify', (req, res) => {
  const { password } = req.body || {};
  const adminPassword = process.env.ADMIN;

  if (!adminPassword) {
    return res.status(500).json({ error: 'Admin password is not configured' });
  }

  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }

  if (password === adminPassword) {
    return res.json({ success: true });
  }

  return res.status(401).json({ success: false, error: 'Invalid password' });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve React frontend in production
const clientBuildPath = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientBuildPath));

// Catch-all: serve index.html for client-side routing
app.get('/*path', (req, res) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 EventX Server running on http://localhost:${PORT}`);
});
