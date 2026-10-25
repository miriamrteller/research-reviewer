import 'vitest'

declare module 'vitest' {
  interface Matchers<T = unknown> {
    toHaveNoViolations(): T
  }
}
