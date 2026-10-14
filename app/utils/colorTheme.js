// Keep in sync with the appearance radio buttons in preferences.html.
export const colorThemes = [
  '#478484', // Green clouds
  '#633738', // Autumn be blessed
  '#ffffff', // Snow white
  '#1d1f21', // Graphite crystal
  '#a49898', // Coffee kisses
  '#567890' // Morning swim
]

// Stored in the settings when the user wants a different color for every break.
export const randomTheme = 'random'

// Resolves the stored setting to a concrete color.
export function resolveColor (color, random = Math.random) {
  if (color !== randomTheme) return color
  return colorThemes[Math.floor(random() * colorThemes.length)]
}
