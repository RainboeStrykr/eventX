const express = require('express');
const router = express.Router();
const { supabase } = require('../supabase');
const { getEventConfig, resolveEventByParticipantId } = require('../utils/events');

// GET /api/qr/:participantId — returns the QR code as a PNG image
router.get('/:participantId', async (req, res) => {
  try {
    const { participantId } = req.params;
    const eventConfig =
      getEventConfig(req.query.event) || resolveEventByParticipantId(participantId);

    if (!participantId || !eventConfig) {
      return res.status(400).json({ error: 'Participant ID and valid event are required' });
    }

    let qrDataUrl = null;

    if (supabase) {
      const { data, error } = await supabase
        .from(eventConfig.table)
        .select('qr_code')
        .eq('participant_id', participantId.toUpperCase())
        .single();

      if (error || !data) {
        return res.status(404).send('QR code not found');
      }

      qrDataUrl = data.qr_code;
    } else {
      // In-memory fallback
      const registerRoute = require('./register');
      const participant = registerRoute.inMemoryStore.find(
        p => p.participant_id === participantId.toUpperCase() && p.event_key === eventConfig.key
      );
      if (!participant) {
        return res.status(404).send('QR code not found');
      }
      qrDataUrl = participant.qr_code;
    }

    // qrDataUrl is "data:image/png;base64,..."
    const base64Data = qrDataUrl.replace(/^data:image\/png;base64,/, '');
    const imgBuffer = Buffer.from(base64Data, 'base64');

    res.set('Content-Type', 'image/png');
    res.set('Cache-Control', 'public, max-age=86400'); // cache 1 day
    res.send(imgBuffer);
  } catch (err) {
    console.error('QR fetch error:', err);
    res.status(500).send('Internal server error');
  }
});

module.exports = router;
