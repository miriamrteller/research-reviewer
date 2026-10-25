/**
 * Derive a complete Material Design 3 color scheme from a few brand seeds and
 * write it as a brand stylesheet.
 *
 *   node --import ./scripts/lib/register-extensionless.mjs \
 *        scripts/derive-m3-scheme.mjs scripts/brands/<theme>.json
 *
 * This is the same HCT tonal-palette derivation Material Theme Builder uses
 * (Google's @material/material-color-utilities), so the output is a
 * spec-conformant scheme rather than hand-picked approximations:
 *   - primary keeps the seed's own hue and chroma
 *   - secondary follows the M3 "tonal spot" rule: its seed's hue, muted to chroma 16
 *   - tertiary follows the same rule: primary hue + 60°, chroma 24
 *   - neutral / neutral-variant are low-chroma (6 / 8) palettes on the PRIMARY hue,
 *     as M3 specifies — a dark neutral seed is pinned as on-surface, not used as
 *     the neutral hue (a warm near-black would tint every surface pink)
 *   - every role is read for light and dark at standard contrast
 *
 * `pins` then force exact brand hexes onto specific roles. Pins are a design
 * decision, not a derivation; src/styles/tokens.test.ts is what proves each
 * pinned pair still meets WCAG AA.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  argbFromHex,
  DynamicScheme,
  Hct,
  hexFromArgb,
  MaterialDynamicColors,
  TonalPalette,
  Variant,
} from '@material/material-color-utilities'

const ROLES = [
  'primary',
  'on-primary',
  'primary-container',
  'on-primary-container',
  'secondary',
  'on-secondary',
  'secondary-container',
  'on-secondary-container',
  'tertiary',
  'on-tertiary',
  'tertiary-container',
  'on-tertiary-container',
  'error',
  'on-error',
  'error-container',
  'on-error-container',
  'surface',
  'on-surface',
  'surface-variant',
  'on-surface-variant',
  'surface-dim',
  'surface-bright',
  'surface-container-lowest',
  'surface-container-low',
  'surface-container',
  'surface-container-high',
  'surface-container-highest',
  'surface-tint',
  'background',
  'on-background',
  'outline',
  'outline-variant',
  'inverse-surface',
  'inverse-on-surface',
  'inverse-primary',
  'scrim',
  'shadow',
  'primary-fixed',
  'primary-fixed-dim',
  'on-primary-fixed',
  'on-primary-fixed-variant',
  'secondary-fixed',
  'secondary-fixed-dim',
  'on-secondary-fixed',
  'on-secondary-fixed-variant',
  'tertiary-fixed',
  'tertiary-fixed-dim',
  'on-tertiary-fixed',
  'on-tertiary-fixed-variant',
]

const camel = (kebab) => kebab.replace(/-([a-z])/g, (_, c) => c.toUpperCase())
const hex = (argb) => hexFromArgb(argb).toLowerCase()

function buildScheme(seeds, isDark) {
  const primary = Hct.fromInt(argbFromHex(seeds.primary))
  const secondary = Hct.fromInt(argbFromHex(seeds.secondary ?? seeds.primary))
  const tertiaryHue = (primary.hue + 60) % 360

  return new DynamicScheme({
    sourceColorHct: primary,
    variant: Variant.TONAL_SPOT,
    contrastLevel: 0,
    isDark,
    primaryPalette: TonalPalette.fromHct(primary),
    secondaryPalette: TonalPalette.fromHueAndChroma(secondary.hue, 16),
    tertiaryPalette: TonalPalette.fromHueAndChroma(tertiaryHue, 24),
    neutralPalette: TonalPalette.fromHueAndChroma(primary.hue, 6),
    neutralVariantPalette: TonalPalette.fromHueAndChroma(primary.hue, 8),
  })
}

function readRoles(scheme) {
  const colors = new MaterialDynamicColors()
  return Object.fromEntries(ROLES.map((role) => [role, hex(colors[camel(role)]().getArgb(scheme))]))
}

const configPath = process.argv[2]
if (!configPath) {
  console.error('usage: derive-m3-scheme.mjs <brand-config.json>')
  process.exit(1)
}
const config = JSON.parse(readFileSync(configPath, 'utf8'))
const { theme, label, seeds, typeface = {}, pins = {}, both = {} } = config

const lower = (map) => Object.fromEntries(Object.entries(map).map(([k, v]) => [k, v.toLowerCase()]))
const light = {
  ...readRoles(buildScheme(seeds, false)),
  ...lower(both),
  ...lower(pins.light ?? {}),
}
const dark = { ...readRoles(buildScheme(seeds, true)), ...lower(both), ...lower(pins.dark ?? {}) }

const value = (role) =>
  light[role] === dark[role] ? light[role] : `light-dark(${light[role]}, ${dark[role]})`

const pinList = (scheme) =>
  Object.entries(pins[scheme] ?? {})
    .map(([role, v]) => `     ${scheme.padEnd(5)} ${role.padEnd(26)} ${v}`)
    .join('\n')

const header = `/* ==========================================================================
   Brand theme: ${label} — reference tokens only (color roles + typefaces)
   --------------------------------------------------------------------------
   GENERATED — do not edit by hand. Regenerate with:
     npm run brand:derive -- ${configPath}

   Activated with data-theme="${theme}" on <html>. Overrides the M3 color
   roles and the two reference typefaces defined in material.css and nothing
   else (enforced by src/styles/brand-contract.test.ts). Every on-X / X pair
   is contrast-tested in src/styles/tokens.test.ts.

   Seeds (brand guidance)
${Object.entries(seeds)
  .map(([k, v]) => `     ${k.padEnd(10)} ${v}`)
  .join('\n')}

   Derivation: HCT tonal palettes via @material/material-color-utilities
   (the engine behind Material Theme Builder). Secondary = seed hue at
   chroma 16; tertiary = primary hue + 60°; neutrals = primary hue, chroma 6/8.

   Pins — exact brand hexes forced onto roles (each must pass WCAG AA)
${[pinList('light'), pinList('dark')].filter(Boolean).join('\n') || '     (none)'}
   ========================================================================== */
`

const groups = [
  ['primary', 'on-primary', 'primary-container', 'on-primary-container'],
  ['secondary', 'on-secondary', 'secondary-container', 'on-secondary-container'],
  ['tertiary', 'on-tertiary', 'tertiary-container', 'on-tertiary-container'],
  ['error', 'on-error', 'error-container', 'on-error-container'],
  [
    'surface',
    'on-surface',
    'surface-variant',
    'on-surface-variant',
    'surface-dim',
    'surface-bright',
    'surface-container-lowest',
    'surface-container-low',
    'surface-container',
    'surface-container-high',
    'surface-container-highest',
    'surface-tint',
  ],
  ['background', 'on-background'],
  ['outline', 'outline-variant'],
  ['inverse-surface', 'inverse-on-surface', 'inverse-primary'],
  ['scrim', 'shadow'],
  [
    'primary-fixed',
    'primary-fixed-dim',
    'on-primary-fixed',
    'on-primary-fixed-variant',
    'secondary-fixed',
    'secondary-fixed-dim',
    'on-secondary-fixed',
    'on-secondary-fixed-variant',
    'tertiary-fixed',
    'tertiary-fixed-dim',
    'on-tertiary-fixed',
    'on-tertiary-fixed-variant',
  ],
]

const typefaceBlock = Object.keys(typeface).length
  ? `\n  /* Reference typefaces */\n${Object.entries(typeface)
      .map(([k, v]) => `  --md-ref-typeface-${k}: ${v};`)
      .join('\n')}\n`
  : ''

const body = groups
  .map((group) => group.map((role) => `  --md-sys-color-${role}: ${value(role)};`).join('\n'))
  .join('\n\n')

const css = `${header}\n:root[data-theme='${theme}'] {${typefaceBlock}\n${body}\n}\n`

const outPath = resolve('src/styles', `brand-${theme}.css`)
writeFileSync(outPath, css)
console.log(`wrote ${outPath} — ${ROLES.length} roles, ${Object.keys(typeface).length} typefaces`)
