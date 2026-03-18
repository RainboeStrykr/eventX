const express = require('express');
const router = express.Router();
const { supabase } = require('../supabase');

router.get('/', async (req, res) => {
  try {
    if (supabase) {
      const { count: totalRegistrations, error: regError } = await supabase
        .from('participants')
        .select('*', { count: 'exact', head: true });

      const { count: totalCheckedIn, error: checkinError } = await supabase
        .from('participants')
        .select('*', { count: 'exact', head: true })
        .eq('checked_in', true);

      if (regError || checkinError) {
        return res.status(500).json({ error: 'Failed to fetch stats' });
      }

      return res.json({
        totalRegistrations: totalRegistrations || 0,
        totalCheckedIn: totalCheckedIn || 0,
      });
    } else {
      const registerRoute = require('./register');
      const store = registerRoute.inMemoryStore;

      return res.json({
        totalRegistrations: store.length,
        totalCheckedIn: store.filter(p => p.checked_in).length,
      });
    }
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
