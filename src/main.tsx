import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import { queryClient } from './api/queryClient'
import App from './App.tsx'
import { applyColorScheme, applyTheme, readInitialColorScheme, readInitialTheme } from './lib/theme'
import { enableMocking } from './mocks/enable'

// Theme and scheme come from the URL only (?theme=brand&scheme=dark); there is no switcher.
applyTheme(readInitialTheme())
applyColorScheme(readInitialColorScheme())

// The mock worker must be registered before the first query fires.
await enableMocking()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      {import.meta.env.DEV ? <ReactQueryDevtools initialIsOpen={false} /> : null}
    </QueryClientProvider>
  </StrictMode>,
)
