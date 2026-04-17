const express = require('express');
const router = express.Router();
const { supabase } = require('../supabase');
const { getEventConfig } = require('../utils/events');

function convertToCSV(data) {
  if (!data || data.length === 0) return '';
  
  const headers = [
    'Participant ID',
    'Full Name',
    'Phone Number',
    'WhatsApp Number',
    'Email',
    'Number of Guests',
    'Veg Guests',
    'Non-Veg Guests',
    'Meal Preferences',
    'Chauffeur Coming',
    'Chauffeur Food Preference',
    'Special Requests',
    'Checked In',
    'Registration Date'
  ];
  
  const csvRows = [headers.join(',')];
  
  for (const row of data) {
    const values = [
      row.participant_id || '',
      row.full_name || '',
      row.phone_number || '',
      row.whatsapp_number || '',
      row.email || '',
      row.num_guests || 0,
      row.veg_guests || 0,
      row.non_veg_guests || 0,
      row.meal_preferences ? `"${row.meal_preferences.join(', ')}"` : '',
      row.chauffeur_coming ? 'Yes' : 'No',
      row.chauffeur_food_preference || '',
      row.special_requests ? `"${row.special_requests.replace(/"/g, '""')}"` : '',
      row.checked_in ? 'Yes' : 'No',
      row.created_at || ''
    ];
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
}

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

router.get('/export', async (req, res) => {
  try {
    const { event } = req.query;
    const eventConfig = getEventConfig(event);
    if (!eventConfig) {
      return res.status(400).json({ error: 'Invalid event selection' });
    }

    let data = [];

    if (supabase) {
      const { data: participants, error } = await supabase
        .from(eventConfig.table)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Export participants error:', error);
        return res.status(500).json({ error: 'Failed to export participants' });
      }
      data = participants;
    } else {
      const registerRoute = require('./register');
      data = registerRoute.inMemoryStore
        .filter(p => p.event_key === eventConfig.key)
        .map(({ qr_code, ...rest }) => rest);
    }

    const csv = convertToCSV(data);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${eventConfig.label}_participants_${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csv);
  } catch (err) {
    console.error('Export error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
