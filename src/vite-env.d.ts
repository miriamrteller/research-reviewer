/// <reference types="vite/client" />
/// <reference types="msw/vite/client" />

interface ImportMetaEnv {
  /** "true" when the app should serve itself from MSW handlers (dev, mock builds). */
  readonly VITE_API_MOCK?: string
}
