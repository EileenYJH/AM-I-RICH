const MONTHS: Record<string, string> = {
  jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
  jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
}

/** "02 Jun 2026" | "2 Jun 2026" | "02/06/2026" | "02-06-2026" → "2026-06-02" */
export function parseDate(input: string): string | null {
  const named = input.match(/(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})/)
  if (named) {
    const month = MONTHS[named[2].toLowerCase()]
    if (month) return `${named[3]}-${month}-${named[1].padStart(2, '0')}`
  }
  const slashed = input.match(/(\d{2})[\/\-](\d{2})[\/\-](\d{4})/)
  if (slashed) return `${slashed[3]}-${slashed[2]}-${slashed[1]}`
  return null
}

/** "RM 4,210.00" | "-RM 8.50" | "+RM 3,500.00" → signed float */
export function parseAmount(input: string): number | null {
  const m = input.match(/([+-]?)\s*RM\s*([\d,]+\.\d{2})/)
  if (!m) return null
  return (m[1] === '-' ? -1 : 1) * parseFloat(m[2].replace(/,/g, ''))
}

/** First RM or MYR amount found anywhere in text */
export function firstRM(text: string): number | null {
  const m = text.match(/(?:RM|MYR)\s*([\d,]+\.\d{2})/)
  return m ? parseFloat(m[1].replace(/,/g, '')) : null
}
