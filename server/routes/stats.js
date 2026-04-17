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

router.get('/detailed', async (req, res) => {
  try {
    const eventConfig = getEventConfig(req.query.event);
    if (!eventConfig) {
      return res.status(400).json({ error: 'Invalid event selection' });
    }

    if (supabase) {
      const { data: participants, error } = await supabase
        .from(eventConfig.table)
        .select('veg_guests, non_veg_guests, meal_preferences, chauffeur_coming, chauffeur_food_preference, checked_in');

      if (error) {
        console.error('Detailed stats error:', error);
        return res.status(500).json({ error: 'Failed to fetch detailed stats' });
      }

      const totalVegGuests = participants.reduce((sum, p) => sum + (p.veg_guests || 0), 0);
      const totalNonVegGuests = participants.reduce((sum, p) => sum + (p.non_veg_guests || 0), 0);
      
      const mealPreferencesCount = {};
      participants.forEach(p => {
        if (p.meal_preferences && Array.isArray(p.meal_preferences)) {
          p.meal_preferences.forEach(meal => {
            mealPreferencesCount[meal] = (mealPreferencesCount[meal] || 0) + 1;
          });
        }
      });

      const chauffeurComing = participants.filter(p => p.chauffeur_coming).length;
      const chauffeurNotComing = participants.length - chauffeurComing;
      const chauffeurVeg = participants.filter(p => p.chauffeur_coming && p.chauffeur_food_preference === 'veg').length;
      const chauffeurNonVeg = participants.filter(p => p.chauffeur_coming && p.chauffeur_food_preference === 'non-veg').length;

      return res.json({
        totalVegGuests,
        totalNonVegGuests,
        mealPreferences: mealPreferencesCount,
        chauffeurStats: {
          coming: chauffeurComing,
          notComing: chauffeurNotComing,
          veg: chauffeurVeg,
          nonVeg: chauffeurNonVeg,
        },
      });
    } else {
      const registerRoute = require('./register');
      const store = registerRoute.inMemoryStore;
      const eventStore = store.filter(p => p.event_key === eventConfig.key);

      const totalVegGuests = eventStore.reduce((sum, p) => sum + (p.veg_guests || 0), 0);
      const totalNonVegGuests = eventStore.reduce((sum, p) => sum + (p.non_veg_guests || 0), 0);
      
      const mealPreferencesCount = {};
      eventStore.forEach(p => {
        if (p.meal_preferences && Array.isArray(p.meal_preferences)) {
          p.meal_preferences.forEach(meal => {
            mealPreferencesCount[meal] = (mealPreferencesCount[meal] || 0) + 1;
          });
        }
      });

      const chauffeurComing = eventStore.filter(p => p.chauffeur_coming).length;
      const chauffeurNotComing = eventStore.length - chauffeurComing;
      const chauffeurVeg = eventStore.filter(p => p.chauffeur_coming && p.chauffeur_food_preference === 'veg').length;
      const chauffeurNonVeg = eventStore.filter(p => p.chauffeur_coming && p.chauffeur_food_preference === 'non-veg').length;

      return res.json({
        totalVegGuests,
        totalNonVegGuests,
        mealPreferences: mealPreferencesCount,
        chauffeurStats: {
          coming: chauffeurComing,
          notComing: chauffeurNotComing,
          veg: chauffeurVeg,
          nonVeg: chauffeurNonVeg,
        },
      });
    }
  } catch (err) {
    console.error('Detailed stats error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
