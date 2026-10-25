import { isApiError } from '../api/errors'

/** Turn any thrown value into a sentence a person can act on. */
export function describeError(error: unknown): string {
  if (isApiError(error)) {
    switch (error.kind) {
      case 'timeout':
        return 'The request timed out.'
      case 'network':
        return 'Could not reach the server.'
      case 'validation':
        return 'The server returned data in an unexpected format.'
      case 'abort':
        return 'The request was cancelled.'
      case 'http':
        return error.status === 404
          ? 'The requested resource was not found.'
          : `The server responded with an error (HTTP ${error.status}).`
    }
  }
  return error instanceof Error ? error.message : 'Something went wrong.'
}
