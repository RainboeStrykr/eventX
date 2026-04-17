const express = require('express');
const router = express.Router();
const { supabase } = require('../supabase');
const { getEventConfig } = require('../utils/events');

router.get('/', async (req, res) => {
  try {
    const eventConfig = getEventConfig(req.query.event);
    if (!eventConfig) {
      return res.status(400).json({ error: 'Invalid event selection' });
    }

    if (supabase) {
      const { count: totalRegistrations, error: regError } = await supabase
        .from(eventConfig.table)
        .select('*', { count: 'exact', head: true });

      const { count: totalCheckedIn, error: checkinError } = await supabase
        .from(eventConfig.table)
        .select('*', { count: 'exact', head: true })
        .eq('checked_in', true);

      if (regError || checkinError) {
        return res.status(500).json({ error: 'Failed to fetch stats' });
      }

      return res.json({
        totalRegistrations: totalRegistrations || 0,
        totalCheckedIn: totalCheckedIn || 0,
        eventName: eventConfig.label,
      });
    } else {
      const registerRoute = require('./register');
      const store = registerRoute.inMemoryStore;
      const eventStore = store.filter(p => p.event_key === eventConfig.key);

      return res.json({
        totalRegistrations: eventStore.length,
        totalCheckedIn: eventStore.filter(p => p.checked_in).length,
        eventName: eventConfig.label,
      });
    }
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
