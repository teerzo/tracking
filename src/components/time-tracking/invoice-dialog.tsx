"use client"

import * as React from "react"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FileTextIcon } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import type { Project, TimeEntry, InvoiceSummary } from "@/lib/time-tracking"
import {
  filterEntriesByDateRange,
  filterEntriesByProjects,
  aggregateEntriesForInvoice,
  formatHours,
  formatCurrency,
} from "@/lib/time-tracking"
import { buildInvoiceHtml, openInvoicePdf } from "@/lib/build-invoice-html"
import { useCompanies } from "@/lib/hooks/useCompanies"
import { useUserSettings } from "@/lib/hooks/useUserSettings"
import { cn } from "@/lib/utils"

interface InvoiceDialogProps {
  projects: Project[]
  entries: TimeEntry[]
  selectedDateStr: string
}

const ALL_COMPANIES_VALUE = "__all__"

export function InvoiceDialog({
  projects,
  entries,
  selectedDateStr,
}: InvoiceDialogProps) {
  const { settings } = useUserSettings()
  const { companies } = useCompanies()
  const [open, setOpen] = React.useState(false)
  const [start, setStart] = React.useState(selectedDateStr)
  const [end, setEnd] = React.useState(selectedDateStr)

  React.useEffect(() => {
    if (open) {
      setStart(selectedDateStr)
      setEnd(selectedDateStr)
    }
  }, [open, selectedDateStr])
  const [selectedCompanyId, setSelectedCompanyId] =
    React.useState<string>(ALL_COMPANIES_VALUE)
  const [selectedProjectIds, setSelectedProjectIds] = React.useState<string[]>(
    []
  )

  const filteredProjects = React.useMemo(() => {
    if (selectedCompanyId === ALL_COMPANIES_VALUE) return projects
    return projects.filter((p) => p.companyId === selectedCompanyId)
  }, [projects, selectedCompanyId])

  const invoiceEntries = React.useMemo(() => {
    if (!start || !end) return [] as TimeEntry[]
    let filtered = filterEntriesByDateRange(entries, start, end)
    if (selectedProjectIds.length > 0) {
      filtered = filterEntriesByProjects(filtered, selectedProjectIds)
    }
    return filtered
  }, [entries, start, end, selectedProjectIds])

  const summary = React.useMemo<InvoiceSummary | null>(() => {
    if (!start || !end) return null
    if (invoiceEntries.length === 0) return null
    return aggregateEntriesForInvoice(invoiceEntries, projects)
  }, [invoiceEntries, projects, start, end])

  const weeklyBreakdown = React.useMemo(() => {
    if (invoiceEntries.length === 0) return [] as { weekStart: string; days: number[] }[]

    const dailyMap = new Map<string, number>()
    for (const entry of invoiceEntries) {
      dailyMap.set(entry.date, (dailyMap.get(entry.date) ?? 0) + entry.hours)
    }

    const dates = Array.from(dailyMap.keys()).sort()
    if (dates.length === 0) return [] as { weekStart: string; days: number[] }[]

    const firstDate = new Date(dates[0]!)
    const lastDate = new Date(dates[dates.length - 1]!)

    const firstMonday = new Date(firstDate)
    const firstDay = firstMonday.getDay()
    const diffToMonday = (firstDay + 6) % 7
    firstMonday.setDate(firstMonday.getDate() - diffToMonday)

    const lastSunday = new Date(lastDate)
    const lastDay = lastSunday.getDay()
    const diffToSunday = (7 - lastDay) % 7
    lastSunday.setDate(lastSunday.getDate() + diffToSunday)

    const weeks: { weekStart: string; days: number[] }[] = []
    for (
      let cursor = new Date(firstMonday);
      cursor <= lastSunday;
      cursor.setDate(cursor.getDate() + 7)
    ) {
      const weekStart = new Date(cursor)
      const days: number[] = []
      for (let i = 0; i < 7; i++) {
        const d = new Date(weekStart)
        d.setDate(weekStart.getDate() + i)
        const iso = d.toISOString().slice(0, 10)
        days.push(dailyMap.get(iso) ?? 0)
      }
      weeks.push({
        weekStart: weekStart.toISOString().slice(0, 10),
        days,
      })
    }

    return weeks
  }, [invoiceEntries])

  const toggleProject = (id: string) => {
    setSelectedProjectIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const selectAll = () => {
    setSelectedProjectIds(filteredProjects.map((p) => p.id))
  }

  const handleCompanyChange = (value: string) => {
    setSelectedCompanyId(value)
    setSelectedProjectIds([])
  }

  const selectNone = () => {
    setSelectedProjectIds([])
  }

  const handlePrint = async () => {
    if (!summary) return

    const invoiceDate = new Date().toISOString().slice(0, 10)
    const invoiceDueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10)
    const invoiceNumber = invoiceDate.replace(/-/g, "")

    let userData: {
      address?: string
      mobile?: string
      email?: string
      billing_email?: string | null
      abn?: string
      account_number?: string
      bsb?: string
    } | null = null
    let companyData: {
      name?: string
      address?: string
      email?: string
      abn?: string
    } | null = null

    if (supabase) {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()
      if (authUser?.id) {
        const { data: userRow } = await supabase
          .from("users")
          .select(
            "address, mobile, email, billing_email, abn, account_number, bsb"
          )
          .eq("id", authUser.id)
          .single()
        userData = userRow ?? null
      }

      const firstProjectId = summary.lines[0]?.projectId
      const firstProject = projects.find((p) => p.id === firstProjectId)
      const companyId = firstProject?.companyId
      if (companyId) {
        const { data: companyRow } = await supabase
          .from("companies")
          .select("name, address, email, abn")
          .eq("id", companyId)
          .single()
        companyData = companyRow ?? null
      }
    }

    const user = userData
    const company = companyData

    const subtotal = summary.totalAmount
    const chargeGst = settings.chargeGst
    const gstAmount = settings.gstAmount
    const gst = chargeGst
      ? Math.round(subtotal * (gstAmount / 100) * 100) / 100
      : 0
    const total = chargeGst
      ? Math.round((subtotal + gst) * 100) / 100
      : Math.round(subtotal * 100) / 100

    if (supabase) {
      const { error } = await supabase.from("invoices").insert({
        invoice_number: invoiceNumber,
        period_start: start,
        period_end: end,
        total_hours: summary.totalHours,
        total_amount: total,
        status: "draft",
      })
      if (error) {
        console.error("Failed to save invoice", error)
        return
      }
    }

    const html = buildInvoiceHtml({
      summary,
      start,
      end,
      invoiceNumber,
      invoiceDate,
      invoiceDueDate,
      user,
      company,
      chargeGst,
      gstAmount,
    })
    openInvoicePdf(html, { printAndClose: true })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FileTextIcon />
          Generate invoice
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto print:block print:max-h-none print:overflow-visible">
        <div className="space-y-4">
          <DialogHeader>
            <DialogTitle>Generate invoice</DialogTitle>
            <DialogDescription>
              Choose a company to filter projects, date range, and projects.
              Leave projects unselected to include all.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="gap-4">
            <div className="grid gap-4 sm:grid-cols-2">

              <Field>
                <FieldLabel htmlFor="invoice-start">Start date</FieldLabel>
                <Input
                  id="invoice-start"
                  type="date"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="invoice-end">End date</FieldLabel>
                <Input
                  id="invoice-end"
                  type="date"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="invoice-company">Company</FieldLabel>
                <Select
                  value={selectedCompanyId}
                  onValueChange={handleCompanyChange}
                >
                  <SelectTrigger id="invoice-company">
                    <SelectValue placeholder="Filter by company" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_COMPANIES_VALUE}>
                      All companies
                    </SelectItem>
                    {companies.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              {filteredProjects.length > 0 && (
                <Field className="sm:col-span-2">
                  <FieldLabel>Projects (optional)</FieldLabel>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        {selectedProjectIds.length === 0
                          ? "Select projects..."
                          : `${selectedProjectIds.length} project${selectedProjectIds.length === 1 ? "" : "s"} selected`}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      className="max-h-64 w-(--radix-dropdown-menu-trigger-width) overflow-y-auto"
                    >
                      <DropdownMenuCheckboxItem
                        onSelect={(e) => e.preventDefault()}
                        onCheckedChange={(checked) =>
                          checked ? selectAll() : selectNone()
                        }
                        checked={
                          filteredProjects.length > 0 &&
                          selectedProjectIds.length === filteredProjects.length
                        }
                      >
                        Select all
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        onSelect={(e) => e.preventDefault()}
                        onCheckedChange={() => selectNone()}
                        checked={selectedProjectIds.length === 0}
                      >
                        None
                      </DropdownMenuCheckboxItem>
                      {filteredProjects.map((p) => (
                        <DropdownMenuCheckboxItem
                          key={p.id}
                          onSelect={(e) => e.preventDefault()}
                          checked={selectedProjectIds.includes(p.id)}
                          onCheckedChange={() => toggleProject(p.id)}
                        >
                          {p.name}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </Field>
              )}
            </div>
          </FieldGroup>

          <div
            id="invoice-preview"
            className="rounded-md border bg-muted/30 p-4 print:border-0 print:bg-transparent"
          >
            <h3 className="mb-3 font-medium">Invoice preview</h3>
            {summary ? (
              <>
                <div className="overflow-x-auto">
                  <table
                    className={cn(
                      "w-full text-sm",
                      "[&_th]:font-medium [&_th]:text-muted-foreground [&_th]:text-start [&_th]:pe-4 [&_th]:pb-2",
                      "[&_td]:pe-4 [&_td]:py-1.5"
                    )}
                  >
                    <thead>
                      <tr>
                        <th>Project</th>
                        <th>Rate</th>
                        <th>Hours</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summary.lines.map((line) => (
                        <tr key={line.projectId} className="border-t">
                          <td>{line.projectName}</td>
                          <td>{formatCurrency(line.hourlyRate)}/hr</td>
                          <td>{formatHours(line.hours)}</td>
                          <td>{formatCurrency(line.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t">
                        <td colSpan={2}>Subtotal</td>
                        <td>{formatHours(summary.totalHours)}</td>
                        <td>{formatCurrency(summary.totalAmount)}</td>
                      </tr>
                      <tr>
                        <td colSpan={2}>GST ({settings.gstAmount}%)</td>
                        <td></td>
                        <td>
                          {formatCurrency(
                            Math.round(
                              summary.totalAmount *
                                (settings.gstAmount / 100) *
                                100
                            ) / 100
                          )}
                        </td>
                      </tr>
                      <tr className="border-t font-medium">
                        <td colSpan={2}>Total</td>
                        <td>{formatHours(summary.totalHours)}</td>
                        <td>
                          {formatCurrency(
                            Math.round(
                              (summary.totalAmount +
                                summary.totalAmount *
                                  (settings.gstAmount / 100)) *
                                100
                            ) / 100
                          )}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {weeklyBreakdown.length > 0 && (
                  <div className="mt-6 overflow-x-auto">
                    <h4 className="mb-2 text-sm font-medium">
                      Weekly breakdown (Mon–Sun)
                    </h4>
                    <table
                      className={cn(
                        "w-full text-xs",
                        "[&_th]:font-medium [&_th]:text-muted-foreground [&_th]:text-center [&_th]:pe-2 [&_th]:pb-1",
                        "[&_td]:pe-2 [&_td]:py-1 text-center"
                      )}
                    >
                      <thead>
                        <tr>
                          <th className="text-left">Week starting</th>
                          <th>Mon</th>
                          <th>Tue</th>
                          <th>Wed</th>
                          <th>Thu</th>
                          <th>Fri</th>
                          <th>Sat</th>
                          <th>Sun</th>
                        </tr>
                      </thead>
                      <tbody>
                        {weeklyBreakdown.map((week) => (
                          <tr key={week.weekStart} className="border-t">
                            <td className="text-left">{week.weekStart}</td>
                            {week.days.map((hours, idx) => (
                              <td key={idx}>
                                {hours > 0 ? formatHours(hours) : "—"}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            ) : (
              <p className="text-muted-foreground text-sm">
                No entries in this date range for the selected projects.
              </p>
            )}
          </div>

          <DialogFooter className="print:hidden">
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
            <Button
              onClick={handlePrint}
              disabled={!summary}
            >
              Print / Save as PDF
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
