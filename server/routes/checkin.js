const express = require('express');
const router = express.Router();
const { supabase } = require('../supabase');
const { getEventConfig } = require('../utils/events');

router.post('/', async (req, res) => {
  try {
    const { participantId, eventKey } = req.body;
    const eventConfig = getEventConfig(eventKey);

    if (!eventConfig) {
      return res.status(400).json({ error: 'Invalid event selection' });
    }

    if (!participantId) {
      return res.status(400).json({ error: 'Participant ID is required' });
    }
    const normalizedParticipantId = participantId.trim().toUpperCase();

    if (supabase) {
      // Look up the participant
      const { data: participant, error: fetchError } = await supabase
        .from(eventConfig.table)
        .select('*')
        .eq('participant_id', normalizedParticipantId)
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
            eventName: eventConfig.label,
          },
        });
      }

      // Mark as checked in
      const { error: updateError } = await supabase
        .from(eventConfig.table)
        .update({ checked_in: true })
        .eq('participant_id', normalizedParticipantId);

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
          vegGuests: participant.veg_guests,
          nonVegGuests: participant.non_veg_guests,
          eventName: eventConfig.label,
        },
      });
    } else {
      // In-memory fallback
      const registerRoute = require('./register');
      const store = registerRoute.inMemoryStore;
      const participant = store.find(
        p => p.participant_id === normalizedParticipantId && p.event_key === eventConfig.key
      );

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
            eventName: eventConfig.label,
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
          vegGuests: participant.veg_guests,
          nonVegGuests: participant.non_veg_guests,
          eventName: eventConfig.label,
        },
      });
    }
  } catch (err) {
    console.error('Check-in error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
