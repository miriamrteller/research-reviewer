import { delayFromLocation, scenarioFromLocation, setScenario, setSlowMs } from './scenario'

/**
 * Start the mock API in the browser when the build asks for it.
 *
 * `VITE_API_MOCK` is "true" in development (.env.development) and in the
 * dedicated mock build (.env.mock) the browser tests run against. In a normal
 * production build it is undefined, the branch below is dead code, and MSW,
 * the handlers and the worker script are all left out of the bundle.
 */
export async function enableMocking(): Promise<void> {
  if (import.meta.env.VITE_API_MOCK !== 'true') return

  const [{ network }, { handlers }] = await Promise.all([
    import('virtual:msw'),
    import('./handlers'),
  ])

  setScenario(scenarioFromLocation())
  setSlowMs(delayFromLocation())
  network.configure({ handlers })
  await network.enable()
}
