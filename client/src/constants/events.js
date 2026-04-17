export const EVENTS = [
  { key: 'marriage', label: 'Marriage' },
  { key: 'reception', label: 'Reception' },
  { key: 'birthday_party', label: 'Birthday Party' },
]

export const EVENT_BY_KEY = EVENTS.reduce((acc, event) => {
  acc[event.key] = event
  return acc
}, {})
