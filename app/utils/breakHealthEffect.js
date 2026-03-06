export default function applyBreakHealthEffect (danger, breakHealthMode) {
  if (!breakHealthMode || danger <= 2) return
  const strength = Math.min(danger - 2, 8) / 8
  const opacity = (0.1 + strength * 0.15).toFixed(3)
  const blur = Math.round(80 + strength * 40)
  const spread = Math.round(12 + strength * 18)
  document.body.classList.add('break-health-mode')
  document.body.style.setProperty(
    '--break-health-shadow',
    `inset 0 0 ${blur}px ${spread}px rgba(255, 36, 36, ${opacity})`
  )
}
