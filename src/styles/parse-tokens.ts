/**
 * Minimal parser for the token stylesheets. Test-only helper.
 *
 * Handles exactly the syntax those files use: flat rule blocks, custom
 * property declarations, hex colors, and `light-dark(#light, #dark)`.
 */

export type Scheme = 'light' | 'dark'
export type ColorValue = Record<Scheme, string>
export type Palette = Record<string, ColorValue>

const HEX = /^#[0-9a-f]{6}$/i

export function stripComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, '')
}

export interface Rule {
  selector: string
  declarations: Array<{ property: string; value: string }>
}

export function parseRules(css: string): Rule[] {
  const rules: Rule[] = []
  const blockPattern = /([^{}]+)\{([^{}]*)\}/g
  for (const match of stripComments(css).matchAll(blockPattern)) {
    const selector = match[1]!.trim()
    const body = match[2]!
    const declarations = [...body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map((declaration) => ({
      property: declaration[1]!,
      value: declaration[2]!.trim().replace(/\s+/g, ' '),
    }))
    rules.push({ selector, declarations })
  }
  return rules
}

export function parseColorValue(value: string): ColorValue | null {
  const lightDark = /^light-dark\(\s*(#[0-9a-f]{6})\s*,\s*(#[0-9a-f]{6})\s*\)$/i.exec(value)
  if (lightDark) return { light: lightDark[1]!, dark: lightDark[2]! }
  if (HEX.test(value)) return { light: value, dark: value }
  return null
}

/** Collect color roles (`--md-sys-color-*` by default) from rules whose selector passes the filter. */
export function collectColorRoles(
  css: string,
  selectorFilter: (selector: string) => boolean,
  prefix = '--md-sys-color-',
): Palette {
  const palette: Palette = {}
  for (const rule of parseRules(css)) {
    if (!selectorFilter(rule.selector)) continue
    for (const { property, value } of rule.declarations) {
      if (!property.startsWith(prefix)) continue
      const parsed = parseColorValue(value)
      if (!parsed) throw new Error(`Unparseable color for ${property}: ${value}`)
      palette[property.replace(prefix, '')] = parsed
    }
  }
  return palette
}

/* ---- WCAG 2.x relative luminance and contrast ratio ---- */

function channel(hexPair: string): number {
  const srgb = parseInt(hexPair, 16) / 255
  return srgb <= 0.03928 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4
}

export function relativeLuminance(hex: string): number {
  const h = hex.replace('#', '')
  return (
    0.2126 * channel(h.slice(0, 2)) +
    0.7152 * channel(h.slice(2, 4)) +
    0.0722 * channel(h.slice(4, 6))
  )
}

export function contrastRatio(foreground: string, background: string): number {
  const l1 = relativeLuminance(foreground)
  const l2 = relativeLuminance(background)
  const [lighter, darker] = l1 > l2 ? [l1, l2] : [l2, l1]
  return (lighter + 0.05) / (darker + 0.05)
}
