// Derives a subtle "aurora" gradient from a solid break background colour, so the
// break screen can look less flat when the gradientBreakBackground setting is on.
// Returns a CSS background value (a radial glow layered over a diagonal gradient)
// built from the configured colour, so Mini and Long breaks keep their own hues.
// Falls back to a neutral teal/navy if the input is not a valid #rrggbb string.
export default function auroraBackground (hex) {
  const norm = (typeof hex === 'string' && /^#?[0-9a-fA-F]{6}$/.test(hex.replace('#', '')))
    ? hex.replace('#', '')
    : '203a43'
  const r = parseInt(norm.slice(0, 2), 16)
  const g = parseInt(norm.slice(2, 4), 16)
  const b = parseInt(norm.slice(4, 6), 16)
  const clamp = v => Math.max(0, Math.min(255, Math.round(v)))
  const darken = (v, f) => clamp(v * (1 - f))
  const lighten = (v, f) => clamp(v + (255 - v) * f)
  const toHex = (rr, gg, bb) => '#' + [rr, gg, bb].map(x => x.toString(16).padStart(2, '0')).join('')
  const dark = toHex(darken(r, 0.55), darken(g, 0.55), darken(b, 0.55))
  const base = '#' + norm
  const light = toHex(lighten(r, 0.3), lighten(g, 0.3), lighten(b, 0.3))
  const glow = `radial-gradient(circle at 28% 22%, ${light}40 0%, transparent 46%)`
  const main = `linear-gradient(135deg, ${dark} 0%, ${base} 58%, ${light} 100%)`
  return `${glow}, ${main}`
}
