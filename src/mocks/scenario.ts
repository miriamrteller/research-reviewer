/**
 * Mock API scenarios — one switch that every handler consults.
 *
 *   ok        normal responses
 *   slow      2 s latency, or `?delay=<ms>` (exercises loading states)
 *   flaky     the first two requests to each endpoint fail with 503, then it
 *             recovers (exercises the retry policy end to end)
 *   down      always 503 with Retry-After: 1
 *   notfound  always 404 (not retryable)
 *   invalid   200 with a body that fails validation (not retryable)
 *
 * In the browser the scenario comes from the page URL (`?mock=flaky`); in
 * tests it is set explicitly with `setScenario()`.
 */

export const SCENARIOS = ['ok', 'slow', 'flaky', 'down', 'notfound', 'invalid'] as const
export type Scenario = (typeof SCENARIOS)[number]

let current: Scenario = 'ok'
const flakyCounts = new Map<string, number>()

export function getScenario(): Scenario {
  return current
}

export function setScenario(scenario: Scenario): void {
  current = scenario
  slowMs = DEFAULT_SLOW_MS
  flakyCounts.clear()
}

export function resetScenario(): void {
  setScenario('ok')
}

export function isScenario(value: string | null | undefined): value is Scenario {
  return SCENARIOS.includes(value as Scenario)
}

/** Latency for the `slow` scenario. `?delay=4000` in the URL overrides the 2 s default. */
export const DEFAULT_SLOW_MS = 2_000
let slowMs = DEFAULT_SLOW_MS

export function getSlowMs(): number {
  return slowMs
}

export function setSlowMs(ms: number): void {
  slowMs = ms
}

export function delayFromLocation(search = window.location.search): number {
  const value = Number(new URLSearchParams(search).get('delay'))
  return Number.isFinite(value) && value > 0 ? Math.min(value, 30_000) : DEFAULT_SLOW_MS
}

export function scenarioFromLocation(search = window.location.search): Scenario {
  const value = new URLSearchParams(search).get('mock')
  return isScenario(value) ? value : 'ok'
}

/** For `flaky`: true while this endpoint should still fail. */
export function flakyShouldFail(endpoint: string, failuresBeforeRecovery = 2): boolean {
  const seen = flakyCounts.get(endpoint) ?? 0
  flakyCounts.set(endpoint, seen + 1)
  return seen < failuresBeforeRecovery
}
