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

export interface ProjectRate {
  id: string
  projectId: string
  startDate: string
  endDate: string | null
  hourlyRate: number
}

export interface InvoiceSummary {
  lines: InvoiceLine[]
  totalHours: number
  totalAmount: number
  unmatchedEntryCount: number
}

const ID_CHARS = "abcdefghijklmnopqrstuvwxyz0123456789"

export function generateId(): string {
  return Array.from(
    { length: 12 },
    () => ID_CHARS[Math.floor(Math.random() * ID_CHARS.length)]
  ).join("")
}

export function parseDate(dateStr: string): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [y, m, d] = dateStr.split("-").map(Number)
    const date = new Date(y!, m! - 1, d!)
    date.setHours(0, 0, 0, 0)
    return date
  }
  const d = new Date(dateStr)
  d.setHours(0, 0, 0, 0)
  return d
}

export function formatDateLocal(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

export function todayDateString(): string {
  return formatDateLocal(new Date())
}

export function addOneDay(dateStr: string): string {
  const d = parseDate(dateStr)
  d.setDate(d.getDate() + 1)
  return formatDateLocal(d)
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

function ratePeriodEndTime(endDate: string | null): number {
  if (endDate === null) return Number.POSITIVE_INFINITY
  return parseDate(endDate).getTime()
}

export function isDateInRatePeriod(
  dateStr: string,
  rate: Pick<ProjectRate, "startDate" | "endDate">
): boolean {
  const d = parseDate(dateStr).getTime()
  const start = parseDate(rate.startDate).getTime()
  const end = ratePeriodEndTime(rate.endDate)
  return d >= start && d <= end
}

export function getRateForDate(
  projectId: string,
  dateStr: string,
  rates: ProjectRate[],
  fallbackRate: number
): { rate: number; matched: boolean } {
  const matching = rates
    .filter((r) => r.projectId === projectId && isDateInRatePeriod(dateStr, r))
    .sort(
      (a, b) =>
        parseDate(b.startDate).getTime() - parseDate(a.startDate).getTime()
    )

  if (matching.length > 0) {
    return { rate: matching[0]!.hourlyRate, matched: true }
  }

  return { rate: fallbackRate, matched: false }
}

function periodsOverlap(
  a: Pick<ProjectRate, "startDate" | "endDate">,
  b: Pick<ProjectRate, "startDate" | "endDate">
): boolean {
  const aStart = parseDate(a.startDate).getTime()
  const aEnd = ratePeriodEndTime(a.endDate)
  const bStart = parseDate(b.startDate).getTime()
  const bEnd = ratePeriodEndTime(b.endDate)
  return aStart <= bEnd && bStart <= aEnd
}

export function validateRatePeriods(
  rates: ProjectRate[],
  projectId?: string
): string | null {
  const scoped = projectId
    ? rates.filter((r) => r.projectId === projectId)
    : rates

  const ongoing = scoped.filter((r) => r.endDate === null)
  if (ongoing.length > 1) {
    return "Only one ongoing rate period is allowed per project."
  }

  for (const rate of scoped) {
    if (rate.endDate !== null && parseDate(rate.endDate) < parseDate(rate.startDate)) {
      return "End date must be on or after start date."
    }
  }

  for (let i = 0; i < scoped.length; i++) {
    for (let j = i + 1; j < scoped.length; j++) {
      if (periodsOverlap(scoped[i]!, scoped[j]!)) {
        return "Rate periods cannot overlap."
      }
    }
  }

  return null
}

export function subtractOneDay(dateStr: string): string {
  const d = parseDate(dateStr)
  d.setDate(d.getDate() - 1)
  return formatDateLocal(d)
}

export function suggestedNewRateStartDate(rates: ProjectRate[]): string {
  const today = todayDateString()
  const ongoing = rates.find((r) => r.endDate === null)
  if (!ongoing) return today

  const dayAfterOngoingStart = addOneDay(ongoing.startDate)
  return dayAfterOngoingStart > today ? dayAfterOngoingStart : today
}

export function aggregateEntriesForInvoice(
  entries: TimeEntry[],
  projects: Project[],
  rates: ProjectRate[] = []
): InvoiceSummary {
  const projectMap = new Map(projects.map((p) => [p.id, p]))
  const agg = new Map<
    string,
    { projectId: string; projectName: string; hourlyRate: number; hours: number }
  >()
  let unmatchedEntryCount = 0

  for (const e of entries) {
    const p = projectMap.get(e.projectId)
    if (!p) continue

    const { rate, matched } = getRateForDate(
      e.projectId,
      e.date,
      rates,
      p.hourlyRate
    )
    if (!matched) unmatchedEntryCount++

    const key = `${e.projectId}:${rate}`
    const cur = agg.get(key)
    if (cur) {
      cur.hours += e.hours
    } else {
      agg.set(key, {
        projectId: p.id,
        projectName: p.name,
        hourlyRate: rate,
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

  return { lines, totalHours, totalAmount, unmatchedEntryCount }
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
