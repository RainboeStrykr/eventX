const express = require('express');
const router = express.Router();
const { supabase } = require('../supabase');

router.post('/', async (req, res) => {
  try {
    const { participantId } = req.body;

    if (!participantId) {
      return res.status(400).json({ error: 'Participant ID is required' });
    }

    if (supabase) {
      // Look up the participant
      const { data: participant, error: fetchError } = await supabase
        .from('participants')
        .select('*')
        .eq('participant_id', participantId)
        .single();

      if (fetchError || !participant) {
        return res.status(404).json({ status: 'invalid', message: 'Invalid QR Code' });
      }

      if (participant.checked_in) {
        return res.status(200).json({
          status: 'already_checked_in',
          message: 'Already Checked In',
          participant: {
            name: participant.full_name,
            participantId: participant.participant_id,
          },
        });
      }

      // Mark as checked in
      const { error: updateError } = await supabase
        .from('participants')
        .update({ checked_in: true })
        .eq('participant_id', participantId);

      if (updateError) {
        return res.status(500).json({ error: 'Failed to update check-in status' });
      }

      return res.status(200).json({
        status: 'success',
        message: 'Entry Allowed',
        participant: {
          name: participant.full_name,
          participantId: participant.participant_id,
          numGuests: participant.num_guests,
          foodPreference: participant.food_preference,
        },
      });
    } else {
      // In-memory fallback
      const registerRoute = require('./register');
      const store = registerRoute.inMemoryStore;
      const participant = store.find(p => p.participant_id === participantId);

      if (!participant) {
        return res.status(404).json({ status: 'invalid', message: 'Invalid QR Code' });
      }

      if (participant.checked_in) {
        return res.status(200).json({
          status: 'already_checked_in',
          message: 'Already Checked In',
          participant: {
            name: participant.full_name,
            participantId: participant.participant_id,
          },
        });
      }

      participant.checked_in = true;

      return res.status(200).json({
        status: 'success',
        message: 'Entry Allowed',
        participant: {
          name: participant.full_name,
          participantId: participant.participant_id,
          numGuests: participant.num_guests,
          foodPreference: participant.food_preference,
        },
      });
    }
  } catch (err) {
    console.error('Check-in error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
