import defaultSettings from './defaultSettings.js'

export function pauseBreaksDurations (settings) {
  const entries = settings.get('pauseBreaksDurations')
  if (!Array.isArray(entries)) return defaultSettings.pauseBreaksDurations

  return entries.filter(entry =>
    entry && Number.isInteger(entry.duration) && entry.duration > 0 &&
    entry.duration <= 2147483647 && entry.duration % 60000 === 0 &&
    (entry.shortcut === undefined || typeof entry.shortcut === 'string'))
}
