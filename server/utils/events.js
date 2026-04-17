const EVENT_CONFIG = {
  marriage: {
    key: 'marriage',
    label: 'Marriage',
    table: 'marriage',
    idPrefix: 'MAR',
  },
  reception: {
    key: 'reception',
    label: 'Reception',
    table: 'reception',
    idPrefix: 'REC',
  },
  birthday_party: {
    key: 'birthday_party',
    label: 'Birthday Party',
    table: 'birthday_party',
    idPrefix: 'BDP',
  },
}

function normalizeEventKey(eventKey) {
  if (!eventKey) return null
  const normalized = String(eventKey).trim().toLowerCase()
  return EVENT_CONFIG[normalized] ? normalized : null
}

function getEventConfig(eventKey) {
  const normalized = normalizeEventKey(eventKey)
  return normalized ? EVENT_CONFIG[normalized] : null
}

function listEvents() {
  return Object.values(EVENT_CONFIG).map(({ key, label }) => ({ key, label }))
}

function resolveEventByParticipantId(participantId) {
  if (!participantId) return null
  const upperId = String(participantId).toUpperCase()
  return Object.values(EVENT_CONFIG).find(cfg => upperId.startsWith(`${cfg.idPrefix}-`)) || null
}

module.exports = {
  EVENT_CONFIG,
  getEventConfig,
  listEvents,
  resolveEventByParticipantId,
}
