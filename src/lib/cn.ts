import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Compose class names and resolve Tailwind conflicts (last one wins).
 * `cn('p-2', isLarge && 'p-4')` → `'p-4'` when `isLarge` is true.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
