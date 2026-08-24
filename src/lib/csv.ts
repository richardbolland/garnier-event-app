/**
 * Minimal RFC-4180-ish CSV parser: handles quoted fields, escaped quotes
 * ("") inside quoted fields, commas/newlines inside quotes, and \r\n or \n
 * line endings. Good enough for a Google Sheets "publish to web" CSV export
 * without pulling in a dependency.
 */
export function parseCsv(input: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false

  const text = input.replace(/\r\n/g, '\n').replace(/\r/g, '\n')

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    const next = text[i + 1]

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"'
        i++
      } else if (char === '"') {
        inQuotes = false
      } else {
        field += char
      }
      continue
    }

    if (char === '"') {
      inQuotes = true
    } else if (char === ',') {
      row.push(field)
      field = ''
    } else if (char === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else {
      field += char
    }
  }

  // Flush trailing field/row (file may or may not end with a newline).
  if (field.length > 0 || row.length > 0) {
    row.push(field)
    rows.push(row)
  }

  return rows.filter((r) => r.some((cell) => cell.trim().length > 0))
}

/** Parses CSV rows into objects keyed by the (trimmed, lowercased) header row. */
export function csvToRecords(input: string): Record<string, string>[] {
  const rows = parseCsv(input)
  if (rows.length === 0) return []
  const [header, ...body] = rows
  const keys = header.map((h) => h.trim().toLowerCase())
  return body.map((r) => {
    const record: Record<string, string> = {}
    keys.forEach((key, idx) => {
      record[key] = (r[idx] ?? '').trim()
    })
    return record
  })
}
