// @vitest-environment node

import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { brandFiles, themeOf } from '../test/brand-files'
import { collectColorRoles, parseRules } from './parse-tokens'

/**
 * The theming contract:
 *   material.css owns every SYSTEM token (shape, elevation, type scale,
 *   motion, state, layout, focus) and the baseline palette.
 *   A brand file may set REFERENCE tokens only — the 49 color roles and the
 *   two typefaces — inside its own [data-theme] scope. M3 itself draws the
 *   line there: md.ref.* is brand input, md.sys.* is system structure.
 * These tests turn that convention into a guarantee for every brand file.
 */

const material = readFileSync(new URL('./material.css', import.meta.url), 'utf8')
const materialRules = parseRules(material)
const materialRoles = Object.keys(
  collectColorRoles(material, (selector) => !selector.includes('data-theme')),
).sort()

const BRAND_MAY_SET = [/^--md-sys-color-/, /^--md-ref-typeface-(brand|plain)$/]

describe.each(brandFiles())('%s contract', (file) => {
  const theme = themeOf(file)
  const brand = readFileSync(new URL(`./${file}`, import.meta.url), 'utf8')
  const brandRules = parseRules(brand)

  it('declares only color roles and brand typefaces (reference tokens)', () => {
    const offenders = brandRules
      .flatMap((rule) => rule.declarations)
      .map((declaration) => declaration.property)
      .filter((property) => !BRAND_MAY_SET.some((pattern) => pattern.test(property)))
    expect(offenders).toEqual([])
  })

  it(`scopes every rule to [data-theme='${theme}']`, () => {
    const unscoped = brandRules
      .filter((rule) => rule.declarations.length > 0)
      .map((rule) => rule.selector)
      .filter((selector) => !selector.includes(`[data-theme='${theme}']`))
    expect(unscoped).toEqual([])
  })

  it('overrides the complete role set — no partial palettes, no invented roles', () => {
    const brandRoles = Object.keys(
      collectColorRoles(brand, (selector) => selector.includes('[data-theme=')),
    ).sort()
    expect(brandRoles).toEqual(materialRoles)
  })
})

describe('material.css contract', () => {
  it('contains no brand scopes', () => {
    const themed = materialRules.map((rule) => rule.selector).filter((s) => /data-theme/.test(s))
    expect(themed).toEqual([])
  })

  it('declares every non-color token namespace exactly once (structure lives here only)', () => {
    const namespaces = new Set(
      materialRules
        .flatMap((rule) => rule.declarations)
        .map((declaration) => declaration.property.match(/^--md-(?:sys|ref)-([a-z]+)/)?.[1])
        .filter((namespace): namespace is string => Boolean(namespace)),
    )
    expect([...namespaces].sort()).toEqual(
      [
        'color',
        'elevation',
        'focus',
        'layout',
        'motion',
        'shape',
        'state',
        'typeface',
        'typescale',
      ].sort(),
    )
  })
})
