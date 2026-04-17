const express = require('express');
const router = express.Router();
const { supabase } = require('../supabase');
const { getEventConfig } = require('../utils/events');

router.get('/', async (req, res) => {
  try {
    const { food, search, event } = req.query;
    const eventConfig = getEventConfig(event);
    if (!eventConfig) {
      return res.status(400).json({ error: 'Invalid event selection' });
    }

    if (supabase) {
      let query = supabase
        .from(eventConfig.table)
        .select('participant_id, full_name, phone_number, whatsapp_number, email, num_guests, veg_guests, non_veg_guests, special_requests, checked_in, created_at')
        .order('created_at', { ascending: false });

      if (food && (food === 'veg' || food === 'non-veg')) {
        query = food === 'veg' ? query.gt('veg_guests', 0) : query.gt('non_veg_guests', 0);
      }

      if (search) {
        query = query.or(`full_name.ilike.%${search}%,participant_id.ilike.%${search}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Fetch participants error:', error);
        return res.status(500).json({ error: 'Failed to fetch participants' });
      }

      return res.json({ participants: data });
    } else {
      // In-memory fallback
      const registerRoute = require('./register');
      let store = registerRoute.inMemoryStore.filter(p => p.event_key === eventConfig.key);

      if (food && (food === 'veg' || food === 'non-veg')) {
        store = food === 'veg'
          ? store.filter(p => (p.veg_guests || 0) > 0)
          : store.filter(p => (p.non_veg_guests || 0) > 0);
      }

      if (search) {
        const s = search.toLowerCase();
        store = store.filter(
          p =>
            p.full_name.toLowerCase().includes(s) ||
            p.participant_id.toLowerCase().includes(s)
        );
      }

      store.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      const participants = store.map(({ qr_code, ...rest }) => rest);
      return res.json({ participants });
    }
  } catch (err) {
    console.error('Participants error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
