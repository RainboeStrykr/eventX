const express = require('express');
const router = express.Router();
const { supabase } = require('../supabase');
const { generateQRCode } = require('../utils/qr');
const { sendWhatsAppConfirmation } = require('../utils/whatsapp');

// In-memory fallback when Supabase is not configured
const inMemoryStore = [];

function generateParticipantId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'EVT-';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

router.post('/', async (req, res) => {
  try {
    const { fullName, whatsappNumber, email, numGuests, foodPreference, specialRequests } = req.body;

    // Validation
    if (!fullName || !fullName.trim()) {
      return res.status(400).json({ error: 'Full name is required' });
    }
    if (!whatsappNumber || !whatsappNumber.trim()) {
      return res.status(400).json({ error: 'WhatsApp number is required' });
    }

    const phoneRegex = /^\+\d{10,15}$/;
    if (!phoneRegex.test(whatsappNumber.replace(/\s/g, ''))) {
      return res.status(400).json({ error: 'Invalid WhatsApp number format. Include country code e.g. +919876543210' });
    }

    const participantId = generateParticipantId();
    const qrCode = await generateQRCode(participantId);

    const participantData = {
      participant_id: participantId,
      full_name: fullName.trim(),
      whatsapp_number: whatsappNumber.trim(),
      email: email ? email.trim() : null,
      num_guests: parseInt(numGuests) || 0,
      food_preference: foodPreference || 'veg',
      special_requests: specialRequests ? specialRequests.trim() : null,
      qr_code: qrCode,
    };

    let participant = participantData;

    if (supabase) {
      const { data, error } = await supabase
        .from('participants')
        .insert([participantData])
        .select()
        .single();

      if (error) {
        console.error('Supabase insert error:', JSON.stringify(error, null, 2));
        return res.status(500).json({ error: `Failed to save registration: ${error.message || error.code}` });
      }
      participant = data;
    } else {
      participant.id = inMemoryStore.length + 1;
      participant.checked_in = false;
      participant.created_at = new Date().toISOString();
      inMemoryStore.push(participant);
    }

    // Send WhatsApp confirmation (non-blocking)
    sendWhatsAppConfirmation({
      to: whatsappNumber.trim(),
      participantId,
      participantName: fullName.trim(),
    }).catch(err => console.error('WhatsApp error:', err));

    res.status(201).json({
      message: 'Registration successful',
      participant: {
        participantId: participant.participant_id,
        fullName: participant.full_name,
        qrCode: participant.qr_code,
      },
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Export inMemoryStore for use by other routes
router.inMemoryStore = inMemoryStore;

module.exports = router;
