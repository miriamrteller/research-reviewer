import { describe, expect, it } from 'vitest'
import { axe } from './axe'

/**
 * Proves the accessibility harness itself works in both directions.
 * A suite that only ever passes cannot distinguish "compliant" from "broken".
 */
describe('accessibility harness', () => {
  it('reports no violations for a compliant tree', async () => {
    const root = document.createElement('div')
    root.innerHTML = `
      <main>
        <h1>Title</h1>
        <label for="name">Name</label>
        <input id="name" type="text" />
        <button type="button">Save</button>
      </main>`
    document.body.append(root)

    expect(await axe(root)).toHaveNoViolations()
    root.remove()
  })

  it('detects known WCAG violations', async () => {
    // Deliberately broken markup, built as a string so static a11y linting
    // (which is correct to reject this in JSX) does not fire here.
    const root = document.createElement('div')
    root.innerHTML = `
      <img src="chart.png" />
      <button type="button"></button>
      <input type="text" />`
    document.body.append(root)

    const results = await axe(root)
    const ids = results.violations.map((violation) => violation.id)

    expect(ids).toEqual(expect.arrayContaining(['image-alt', 'button-name', 'label']))
    expect(() => expect(results).toHaveNoViolations()).toThrow()
    root.remove()
  })
})
