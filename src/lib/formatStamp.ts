// Readable local date and time for a { by, at } stamp, e.g. "25 Oct 2026, 11:32".
const format = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' })

export function formatAt(iso: string): string {
  return format.format(new Date(iso))
}
