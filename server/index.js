require('dotenv').config({ path: '../.env' });

const express = require('express');
const cors = require('cors');
const path = require('path');

const registerRoute = require('./routes/register');
const checkinRoute = require('./routes/checkin');
const participantsRoute = require('./routes/participants');
const statsRoute = require('./routes/stats');

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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 EventX Server running on http://localhost:${PORT}`);
});
