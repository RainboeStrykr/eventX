const express = require('express');
const router = express.Router();
const { supabase } = require('../supabase');
const { generateQRCode } = require('../utils/qr');
const { getEventConfig } = require('../utils/events');

// In-memory fallback when Supabase is not configured
const inMemoryStore = [];

function generateParticipantId(eventPrefix) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = `${eventPrefix}-`;
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

router.post('/', async (req, res) => {
  try {
    const {
      eventKey,
      fullName,
      phoneNumber,
      whatsappNumber,
      email,
      numGuests,
      mealPreferences,
      vegGuests,
      nonVegGuests,
      chauffeurComing,
      chauffeurFoodPreference,
      specialRequests,
    } = req.body;
    const eventConfig = getEventConfig(eventKey);

    if (!eventConfig) {
      return res.status(400).json({ error: 'Invalid event selection' });
    }

    // Validation
    if (!fullName || !fullName.trim()) {
      return res.status(400).json({ error: 'Full name is required' });
    }
    if (!phoneNumber || !phoneNumber.trim()) {
      return res.status(400).json({ error: 'Phone number is required' });
    }
    if (!whatsappNumber || !whatsappNumber.trim()) {
      return res.status(400).json({ error: 'WhatsApp number is required' });
    }

    const phoneRegex = /^\+\d{10,15}$/;
    if (!phoneRegex.test(phoneNumber.replace(/\s/g, ''))) {
      return res.status(400).json({ error: 'Invalid phone number format. Include country code e.g. +919876543210' });
    }
    if (!phoneRegex.test(whatsappNumber.replace(/\s/g, ''))) {
      return res.status(400).json({ error: 'Invalid WhatsApp number format. Include country code e.g. +919876543210' });
    }

    const participantId = generateParticipantId(eventConfig.idPrefix);
    const qrCode = await generateQRCode(participantId);

    const participantData = {
      participant_id: participantId,
      full_name: fullName.trim(),
      phone_number: phoneNumber.trim(),
      whatsapp_number: whatsappNumber.trim(),
      email: email ? email.trim() : null,
      num_guests: parseInt(numGuests) || 0,
      meal_preferences: Array.isArray(mealPreferences) ? mealPreferences : [],
      veg_guests: parseInt(vegGuests) || 0,
      non_veg_guests: parseInt(nonVegGuests) || 0,
      chauffeur_coming: Boolean(chauffeurComing),
      chauffeur_food_preference: chauffeurComing ? chauffeurFoodPreference || null : null,
      special_requests: specialRequests ? specialRequests.trim() : null,
      qr_code: qrCode,
    };

    let participant = participantData;

    if (supabase) {
      const { data, error } = await supabase
        .from(eventConfig.table)
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
      participant.event_key = eventConfig.key;
      participant.checked_in = false;
      participant.created_at = new Date().toISOString();
      inMemoryStore.push(participant);
    }

    res.status(201).json({
      message: 'Registration successful',
      participant: {
        participantId: participant.participant_id,
        fullName: participant.full_name,
        qrCode: participant.qr_code,
        eventKey: eventConfig.key,
        eventName: eventConfig.label,
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
