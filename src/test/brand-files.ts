import { readdirSync } from 'node:fs'

/**
 * Brand stylesheets are `brand.css` or `brand-<theme>.css`; the theme name is
 * the `data-theme` value the file scopes to (`brand.css` → `brand`).
 * Test-only helper so the token suites cover every brand automatically.
 */
export function brandFiles(): string[] {
  return readdirSync(new URL('../styles/', import.meta.url))
    .filter((file) => /^brand(-[a-z0-9-]+)?\.css$/.test(file))
    .sort()
}

/** `brand.css` → `brand`; `brand-acme.css` → `acme`. */
export function themeOf(file: string): string {
  return file.replace(/^brand-?/, '').replace(/\.css$/, '') || 'brand'
}
