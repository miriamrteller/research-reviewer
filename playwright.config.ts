import { defineConfig, devices } from '@playwright/test'
import { THEMES, type Theme } from './src/lib/theme'

/**
 * Browser accessibility matrix.
 *
 * axe scans run across every combination of
 *   theme          every entry of THEMES (material, brand, …)
 *   color scheme   light | dark
 *   window class   compact (360) | medium (768) | expanded (1280)   ← M3 size classes
 * so a palette that only fails contrast in, say, brand + dark is caught.
 *
 * Keyboard/focus behaviour and the screen-reader (accessibility tree) checks are
 * theme-independent and run on two viewports only.
 */

const themes: readonly Theme[] = THEMES
const schemes = ['light', 'dark'] as const
const windowClasses = {
  compact: { width: 360, height: 800 },
  medium: { width: 768, height: 1024 },
  expanded: { width: 1280, height: 800 },
} as const

/** Local containers may ship a Chromium that predates Playwright's pinned build. */
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
const launchOptions = executablePath ? { executablePath } : {}

const PORT = 4173
const isCI = Boolean(process.env.CI)

export default defineConfig<{ theme: Theme }>({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  workers: isCI ? 2 : undefined,
  reporter: isCI
    ? [['github'], ['html', { open: 'never' }], ['list']]
    : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
    launchOptions,
  },
  webServer: {
    // The mock build keeps MSW in the bundle, so browser tests make real network calls
    // that the same handlers used by Vitest answer.
    command: `npm run build:mock && npm run preview:mock -- --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !isCI,
    timeout: 120_000,
  },
  projects: [
    ...themes.flatMap((theme) =>
      schemes.flatMap((colorScheme) =>
        (Object.keys(windowClasses) as Array<keyof typeof windowClasses>).map((windowClass) => ({
          name: `a11y · ${theme} · ${colorScheme} · ${windowClass}`,
          testMatch: /a11y\.spec\.ts/,
          use: {
            ...devices['Desktop Chrome'],
            viewport: windowClasses[windowClass],
            colorScheme,
            theme,
          },
        })),
      ),
    ),
    {
      name: 'keyboard · expanded',
      testMatch: /keyboard\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], viewport: windowClasses.expanded, theme: 'material' },
    },
    {
      name: 'keyboard · compact',
      testMatch: /keyboard\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], viewport: windowClasses.compact, theme: 'brand' },
    },
    {
      name: 'screen-reader · expanded',
      testMatch: /screen-reader\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], viewport: windowClasses.expanded, theme: 'material' },
    },
    {
      name: 'screen-reader · compact',
      testMatch: /screen-reader\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], viewport: windowClasses.compact, theme: 'brand' },
    },
  ],
})
