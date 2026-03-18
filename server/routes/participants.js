const express = require('express');
const router = express.Router();
const { supabase } = require('../supabase');

router.get('/', async (req, res) => {
  try {
    const { food, search } = req.query;

    if (supabase) {
      let query = supabase
        .from('participants')
        .select('participant_id, full_name, whatsapp_number, email, num_guests, food_preference, special_requests, checked_in, created_at')
        .order('created_at', { ascending: false });

      if (food && (food === 'veg' || food === 'non-veg')) {
        query = query.eq('food_preference', food);
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
      let store = [...registerRoute.inMemoryStore];

      if (food && (food === 'veg' || food === 'non-veg')) {
        store = store.filter(p => p.food_preference === food);
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
