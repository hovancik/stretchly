const dangerColors = {
  '#478484': [255, 36, 36, 1.5],
  '#633738': [255, 50, 80, 1.5],
  '#ffffff': [200, 30, 30, 2.0],
  '#1d1f21': [255, 70, 70, 1.0],
  '#a49898': [255, 36, 36, 1.5],
  '#567890': [255, 36, 36, 1.4]
}

const defaultDangerColor = [255, 36, 36, 1.0]

export function dangerColorForTheme (themeColor) {
  if (!themeColor) return defaultDangerColor
  return dangerColors[themeColor.toLowerCase()] || defaultDangerColor
}

export default function applyBreakHealthEffect (danger, breakHealthMode, themeColor) {
  if (!breakHealthMode || danger <= 2) return
  const strength = Math.min(danger - 2, 8) / 8
  const [r, g, b, opacityMultiplier] = dangerColorForTheme(themeColor)
  const opacity = ((0.1 + strength * 0.15) * opacityMultiplier).toFixed(3)
  const blur = Math.round(80 + strength * 40)
  const spread = Math.round(12 + strength * 18)
  document.body.classList.add('break-health-mode')
  document.body.style.setProperty(
    '--break-health-shadow',
    `inset 0 0 ${blur}px ${spread}px rgba(${r}, ${g}, ${b}, ${opacity})`
  )
}
