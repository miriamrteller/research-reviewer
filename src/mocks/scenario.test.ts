import { describe, expect, it } from 'vitest'
import { DEFAULT_SLOW_MS, delayFromLocation, scenarioFromLocation } from './scenario'

describe('scenario URL parsing', () => {
  it('reads ?mock=', () => {
    expect(scenarioFromLocation('?mock=flaky')).toBe('flaky')
    expect(scenarioFromLocation('?mock=nonsense')).toBe('ok')
  })

  it('reads ?delay= for the slow scenario, with a default and a cap', () => {
    expect(delayFromLocation('')).toBe(DEFAULT_SLOW_MS)
    expect(delayFromLocation('?delay=4000')).toBe(4000)
    expect(delayFromLocation('?delay=abc')).toBe(DEFAULT_SLOW_MS)
    expect(delayFromLocation('?delay=-5')).toBe(DEFAULT_SLOW_MS)
    expect(delayFromLocation('?delay=999999')).toBe(30_000)
  })
})
