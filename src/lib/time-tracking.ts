export interface Project {
  id: string
  name: string
  hourlyRate: number
  companyId?: string
}

export interface TimeEntry {
  id: string
  projectId: string
  date: string
  hours: number
  notes?: string
  travelledToOffice?: boolean
}

export interface InvoiceLine {
  projectId: string
  projectName: string
  hourlyRate: number
  hours: number
  amount: number
}

export interface InvoiceSummary {
  lines: InvoiceLine[]
  totalHours: number
  totalAmount: number
}

const ID_CHARS = "abcdefghijklmnopqrstuvwxyz0123456789"

export function generateId(): string {
  return Array.from(
    { length: 12 },
    () => ID_CHARS[Math.floor(Math.random() * ID_CHARS.length)]
  ).join("")
}

export function parseDate(dateStr: string): Date {
  const d = new Date(dateStr)
  d.setHours(0, 0, 0, 0)
  return d
}

export function isInDateRange(
  dateStr: string,
  start: string,
  end: string
): boolean {
  const d = parseDate(dateStr).getTime()
  const s = parseDate(start).getTime()
  const e = parseDate(end).getTime()
  return d >= s && d <= e
}

export function filterEntriesByDateRange(
  entries: TimeEntry[],
  start: string,
  end: string
): TimeEntry[] {
  return entries.filter((e) => isInDateRange(e.date, start, end))
}

export function filterEntriesByProjects(
  entries: TimeEntry[],
  projectIds: string[]
): TimeEntry[] {
  const set = new Set(projectIds)
  return entries.filter((e) => set.has(e.projectId))
}

export function aggregateEntriesForInvoice(
  entries: TimeEntry[],
  projects: Project[]
): InvoiceSummary {
  const projectMap = new Map(projects.map((p) => [p.id, p]))
  const agg = new Map<
    string,
    { projectId: string; projectName: string; hourlyRate: number; hours: number }
  >()

  for (const e of entries) {
    const p = projectMap.get(e.projectId)
    if (!p) continue
    const cur = agg.get(e.projectId)
    if (cur) {
      cur.hours += e.hours
    } else {
      agg.set(e.projectId, {
        projectId: p.id,
        projectName: p.name,
        hourlyRate: p.hourlyRate,
        hours: e.hours,
      })
    }
  }

  const lines: InvoiceLine[] = []
  let totalHours = 0
  let totalAmount = 0

  for (const [, v] of agg) {
    const amount = Math.round(v.hours * v.hourlyRate * 100) / 100
    lines.push({
      projectId: v.projectId,
      projectName: v.projectName,
      hourlyRate: v.hourlyRate,
      hours: v.hours,
      amount,
    })
    totalHours += v.hours
    totalAmount += amount
  }

  totalAmount = Math.round(totalAmount * 100) / 100

  return { lines, totalHours, totalAmount }
}

export function formatHours(hours: number): string {
  return hours.toFixed(2)
}

export function formatCurrency(amount: number, locale = "en-US"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "USD",
  }).format(amount)
}
