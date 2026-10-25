// @vitest-environment node
// Rule: no text on screen smaller than 11px. Every size comes from the M3 type scale,
// so the floor is checked on the scale itself (material + every brand file), and components
// may not set their own font size with an arbitrary Tailwind value.

import { readdirSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { brandFiles } from '../test/brand-files'

const MIN_PX = 11
const ROOT_PX = 16

const read = (file: string) => readFileSync(new URL(`./${file}`, import.meta.url), 'utf8')

function typeSizes(css: string): Array<[token: string, px: number]> {
  return [...css.matchAll(/(--md-sys-typescale-[\w-]+-size):\s*([\d.]+)(rem|px)/g)].map(
    ([, token, value, unit]) => [token!, Number(value) * (unit === 'rem' ? ROOT_PX : 1)],
  )
}

describe('text size floor', () => {
  for (const file of ['material.css', ...brandFiles()]) {
    it(`${file}: every type-scale size is at least ${MIN_PX}px`, () => {
      for (const [token, px] of typeSizes(read(file))) {
        expect(px, token).toBeGreaterThanOrEqual(MIN_PX)
      }
    })
  }

  it('material.css defines the type scale this test reads', () => {
    expect(typeSizes(read('material.css')).length).toBeGreaterThan(10)
  })

  it('components never set an arbitrary font size outside the type scale', () => {
    const src = new URL('../', import.meta.url)
    const files = readdirSync(src, { recursive: true, encoding: 'utf8' }).filter(
      (f) => f.endsWith('.tsx') && !f.includes('.test.'),
    )
    expect(files.length).toBeGreaterThan(0)
    for (const file of files) {
      const code = readFileSync(new URL(file, src), 'utf8')
      expect(code, file).not.toMatch(/\btext-\[\d|\btext-\[length:|font-size/)
    }
  })
})
