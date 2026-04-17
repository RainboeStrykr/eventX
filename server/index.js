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
