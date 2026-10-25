/**
 * Theme and color-scheme switching.
 *
 * Both are driven by attributes on <html> that the stylesheets react to:
 *   data-theme="brand"           → brand.css palette (absent = M3 baseline)
 *   data-color-scheme="light|dark" → forced scheme (absent = OS preference)
 *
 * Values are read from the URL (`?theme=brand&scheme=dark`) once at startup; there is no
 * switcher on the page. The browser test matrix drives them the same way.
 */

export const THEMES = ['material', 'brand'] as const
export type Theme = (typeof THEMES)[number]

export const COLOR_SCHEMES = ['system', 'light', 'dark'] as const
export type ColorScheme = (typeof COLOR_SCHEMES)[number]

function isTheme(value: string | null | undefined): value is Theme {
  return THEMES.includes(value as Theme)
}

function isColorScheme(value: string | null | undefined): value is ColorScheme {
  return COLOR_SCHEMES.includes(value as ColorScheme)
}

export function readInitialTheme(): Theme {
  const fromUrl = new URLSearchParams(window.location.search).get('theme')
  if (isTheme(fromUrl)) return fromUrl
  const fromDom = document.documentElement.dataset.theme
  return isTheme(fromDom) ? fromDom : 'material'
}

export function readInitialColorScheme(): ColorScheme {
  const fromUrl = new URLSearchParams(window.location.search).get('scheme')
  if (isColorScheme(fromUrl)) return fromUrl
  const fromDom = document.documentElement.dataset.colorScheme
  return isColorScheme(fromDom) ? fromDom : 'system'
}

export function applyTheme(theme: Theme): void {
  if (theme === 'material') delete document.documentElement.dataset.theme
  else document.documentElement.dataset.theme = theme
}

export function applyColorScheme(scheme: ColorScheme): void {
  if (scheme === 'system') delete document.documentElement.dataset.colorScheme
  else document.documentElement.dataset.colorScheme = scheme
}
