'use client'

import * as React from 'react'
import { useProjectNameMap } from '@/lib/hooks/useProjectNameMap'
import { useUser } from '@/lib/hooks/useUser'
import { useTimeEntries } from '@/lib/hooks/useTimeEntries'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { supabase } from '@/lib/supabaseClient'
import { RequireAuth } from '@/components/RequireAuth'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Cog,
  List,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Textarea } from '@/components/ui/textarea'
import { formatHours } from '@/lib/time-tracking'
import type { TimeEntry } from '@/lib/time-tracking'
import { AddTimeDialog } from '@/components/home/add-time-dialog'
import { DatePicker } from '@/components/home/date-picker'
import { Header } from '@/components/header'

export const Route = createFileRoute('/home')({
  beforeLoad: async ({ location }) => {
    if (typeof window === 'undefined') return
    if (!supabase) return
    const {
      data: { user },
    } = await supabase.auth.getUser()
    console.log(user)
    if (!user) {
      throw redirect({
        to: '/login',
        search: { redirect: location.pathname },
      })
    }
  },
  component: HomePage,
})

export function HomePage() {
  const { entries, addEntry, updateEntry, deleteEntry } = useTimeEntries()
  const { displayName, email } = useUser()
  const { projectNameMap } = useProjectNameMap()

  const toLocalDateString = (d: Date) => {
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const [selectedDate, setSelectedDate] = React.useState(() => new Date())
  const [calendarView, setCalendarView] = React.useState<'day' | 'month'>('day')
  const [addTimeOpen, setAddTimeOpen] = React.useState(false)
  const [calendarOpen, setCalendarOpen] = React.useState(false)
  const [editEntry, setEditEntry] = React.useState<TimeEntry | null>(null)
  const [editHours, setEditHours] = React.useState('')
  const [editNotes, setEditNotes] = React.useState('')
  const [editTravelledToOffice, setEditTravelledToOffice] = React.useState(false)
  const [deleteConfirmStep, setDeleteConfirmStep] = React.useState<1 | 2>(1)

  const handleAddEntry = (entry: {
    projectId: string
    date: string
    hours: number
    notes?: string
    travelledToOffice?: boolean
  }) => {
    void addEntry(entry)
  }

  const openAddTimeModal = () => setAddTimeOpen(true)

  const formattedDate = selectedDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  const formattedMonthYear = selectedDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  const goPrev = () => {
    setSelectedDate((d) => {
      const next = new Date(d)
      if (calendarView === 'month') {
        next.setMonth(next.getMonth() - 1)
      } else {
        next.setDate(next.getDate() - 1)
      }
      return next
    })
  }

  const goNext = () => {
    setSelectedDate((d) => {
      const next = new Date(d)
      if (calendarView === 'month') {
        next.setMonth(next.getMonth() + 1)
      } else {
        next.setDate(next.getDate() + 1)
      }
      return next
    })
  }

  const hoursByDate = React.useMemo(() => {
    const m = new Map<string, number>()
    for (const e of entries) {
      m.set(e.date, (m.get(e.date) ?? 0) + e.hours)
    }
    return m
  }, [entries])

  const monthGridCells = React.useMemo(() => {
    const y = selectedDate.getFullYear()
    const mo = selectedDate.getMonth()
    const first = new Date(y, mo, 1)
    const startPad = first.getDay()
    const daysInMonth = new Date(y, mo + 1, 0).getDate()
    const totalCells =
      Math.ceil((startPad + daysInMonth) / 7) * 7
    const cells: Date[] = []
    for (let idx = 0; idx < totalCells; idx++) {
      cells.push(new Date(y, mo, 1 + (idx - startPad)))
    }
    return cells
  }, [selectedDate])

  const monthWeekRows = React.useMemo(() => {
    const rows: Date[][] = []
    for (let i = 0; i < monthGridCells.length; i += 7) {
      rows.push(monthGridCells.slice(i, i + 7))
    }
    return rows
  }, [monthGridCells])

  const monthWeekTotals = React.useMemo(() => {
    const y = selectedDate.getFullYear()
    const mo = selectedDate.getMonth()
    const first = new Date(y, mo, 1)
    const startPad = first.getDay()
    const toKey = (d: Date) => {
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, "0")
      const day = String(d.getDate()).padStart(2, "0")
      return `${year}-${month}-${day}`
    }
    const numRows = Math.ceil(monthGridCells.length / 7)
    const totals: number[] = []
    for (let r = 0; r < numRows; r++) {
      let sum = 0
      for (let c = 0; c < 7; c++) {
        const idx = r * 7 + c
        const d = new Date(y, mo, 1 + (idx - startPad))
        sum += hoursByDate.get(toKey(d)) ?? 0
      }
      totals.push(sum)
    }
    return totals
  }, [selectedDate, monthGridCells, hoursByDate])

  const openCalendar = () => setCalendarOpen(true)

  const openEditEntry = (e: TimeEntry) => {
    setEditEntry(e)
    setEditHours(String(e.hours))
    setEditNotes(e.notes ?? '')
    setEditTravelledToOffice(Boolean(e.travelledToOffice))
  }
  const closeEditEntry = () => {
    setEditEntry(null)
    setEditHours('')
    setEditNotes('')
    setEditTravelledToOffice(false)
    setDeleteConfirmStep(1)
  }
  const handleSaveEditEntry = async (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!editEntry) return
    const h = parseFloat(editHours)
    if (Number.isNaN(h) || h < 0) return
    await updateEntry(
      editEntry.id,
      h,
      editNotes.trim() || undefined,
      editTravelledToOffice
    )
    closeEditEntry()
  }
  const handleDeleteEditEntry = async () => {
    if (!editEntry) return
    if (deleteConfirmStep === 1) {
      setDeleteConfirmStep(2)
      return
    }
    await deleteEntry(editEntry.id)
    closeEditEntry()
  }

  const selectedDateStr = toLocalDateString(selectedDate)
  const entriesForDay = entries.filter((e) => e.date === selectedDateStr)
  return (
    <RequireAuth>
      <div className="mx-auto max-w-4xl space-y-8 p-6 sm:p-6">
        <Header
          displayName={displayName}
          userEmail={email}
          onAddTime={openAddTimeModal}
        />

        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-center">
          <div className="hidden md:flex md:flex-1">
            <div className="invisible flex gap-1">
              <Button
                variant={calendarView === 'day' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setCalendarView('day')}
                aria-label="Day view"
                title="Day view"
              >
                <List className="size-4" />
              </Button>
              <Button
                variant={calendarView === 'month' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setCalendarView('month')}
                aria-label="Month view"
                title="Month view"
              >
                <CalendarDays className="size-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-center gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={goPrev}
              aria-label={
                calendarView === 'month' ? 'Previous month' : 'Previous day'
              }
            >
              <ChevronLeft />
            </Button>
            <button
              type="button"
              onClick={openCalendar}
              className="min-w-[220px] rounded-md px-2 py-1.5 text-center font-medium hover:bg-muted"
              aria-label="Open calendar"
            >
              {calendarView === 'month' ? formattedMonthYear : formattedDate}
            </button>
            <Button
              variant="outline"
              size="icon"
              onClick={goNext}
              aria-label={calendarView === 'month' ? 'Next month' : 'Next day'}
            >
              <ChevronRight />
            </Button>
          </div>

          <div className="hidden md:flex md:flex-1 md:justify-end">
            <div className="flex gap-1">
              <Button
                variant={calendarView === 'day' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setCalendarView('day')}
                aria-label="Day view"
                title="Day view"
              >
                <List className="size-4" />
              </Button>
              <Button
                variant={calendarView === 'month' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setCalendarView('month')}
                aria-label="Month view"
                title="Month view"
              >
                <CalendarDays className="size-4" />
              </Button>
            </div>
          </div>

          <div className="flex justify-center gap-1 md:hidden">
            <Button
              variant={calendarView === 'day' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setCalendarView('day')}
              aria-label="Day view"
              title="Day view"
            >
              <List className="size-4" />
            </Button>
            <Button
              variant={calendarView === 'month' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setCalendarView('month')}
              aria-label="Month view"
              title="Month view"
            >
              <CalendarDays className="size-4" />
            </Button>
          </div>
        </div>

        <DatePicker
          open={calendarOpen}
          onOpenChange={setCalendarOpen}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />

        <AddTimeDialog
          open={addTimeOpen}
          onOpenChange={setAddTimeOpen}
          initialDate={selectedDate}
          onSubmit={handleAddEntry}
        />

        <div className="rounded-lg border p-1">
          {calendarView === 'month' ? (
            <div>
              <div className="grid grid-cols-8 gap-1 text-center text-xs font-medium text-muted-foreground">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                  <div key={d} className="py-1">
                    {d}
                  </div>
                ))}
                <div className="py-1 font-semibold text-foreground">Week</div>
              </div>
              <div className="mt-1 space-y-1">
                {monthWeekRows.map((weekRow, rowIdx) => (
                  <div
                    key={rowIdx}
                    className="grid grid-cols-8 gap-1"
                  >
                    {weekRow.map((cell) => {
                      const cellKey = toLocalDateString(cell)
                      const inCurrentMonth =
                        cell.getMonth() === selectedDate.getMonth() &&
                        cell.getFullYear() === selectedDate.getFullYear()
                      return (
                        <button
                          key={`${rowIdx}-${cellKey}`}
                          type="button"
                          onClick={() => setSelectedDate(new Date(cell))}
                          className={cn(
                            'flex min-h-14 flex-col items-center justify-center rounded-md border border-transparent px-1 py-2 text-sm transition-colors hover:bg-muted',
                            inCurrentMonth ? 'text-foreground' : 'text-muted-foreground/80',
                            cellKey === selectedDateStr &&
                              'border-primary bg-primary/5 font-medium text-foreground',
                          )}
                        >
                          <span>{cell.getDate()}</span>
                          {(hoursByDate.get(cellKey) ?? 0) > 0 && (
                            <span
                              className={cn(
                                'text-[10px] leading-tight',
                                inCurrentMonth
                                  ? 'text-muted-foreground'
                                  : 'text-muted-foreground/70',
                              )}
                            >
                              {formatHours(hoursByDate.get(cellKey) ?? 0)} h
                            </span>
                          )}
                        </button>
                      )
                    })}
                    <div
                      className="flex min-h-14 flex-col items-center justify-center rounded-md border border-border/60 bg-muted/40 px-1 py-2 text-xs font-medium tabular-nums text-muted-foreground sm:text-sm"
                      aria-label={`Week total: ${formatHours(monthWeekTotals[rowIdx] ?? 0)} hours`}
                    >
                      {formatHours(monthWeekTotals[rowIdx] ?? 0)} h
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-center text-sm text-muted-foreground">
                Selected: {formattedDate} ·{' '}
                {formatHours(
                  entriesForDay.reduce((sum, e) => sum + e.hours, 0),
                )}{' '}
                hrs ·{' '}
                <button
                  type="button"
                  className="font-medium text-foreground underline-offset-4 hover:underline"
                  onClick={() => setCalendarView('day')}
                >
                  Open day view
                </button>
              </p>
            </div>
          ) : entriesForDay.length > 0 ? (
            <>
              <div className="mb-3 flex items-center justify-between gap-2 border-b pb-3 text-sm font-medium text-muted-foreground">
                <span className="min-w-0 flex-1 truncate">Project name</span>
                <span className="min-w-0 flex-1 truncate px-2 text-center">
                  Notes
                </span>
                <span className="flex w-24 shrink-0 items-center justify-end text-nowrap">
                  Total:{' '}
                  {formatHours(
                    entriesForDay.reduce((sum, e) => sum + e.hours, 0),
                  )}{' '}
                  hrs
                </span>
              </div>
              <ul className="space-y-2">
                {entriesForDay.map((e) => (
                  <li
                    key={e.id}
                    className="flex items-center justify-between gap-2 text-sm"
                  >
                    <span className="min-w-0 flex-1 truncate">
                      {projectNameMap.get(e.projectId) ?? e.projectId}
                    </span>
                    <span className="min-w-0 flex-1 truncate px-2 text-center text-muted-foreground">
                      {e.notes ?? '—'}
                    </span>
                    <span className="flex w-24 shrink-0 items-center justify-end gap-1 font-medium">
                      {formatHours(e.hours)} hrs
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openEditEntry(e)}
                        aria-label="Edit hours"
                      >
                        <Cog className="size-4" />
                      </Button>
                    </span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <>
              <div className="mb-3 flex items-center justify-between gap-2 border-b pb-3 text-sm font-medium text-muted-foreground">
                <span className="min-w-0 flex-1 truncate">Project name</span>
                <span className="min-w-0 flex-1 truncate px-2 text-center">
                  Notes
                </span>
                <span className="flex w-24 shrink-0 items-center justify-end">
                  Total: {formatHours(0)} hrs
                </span>
              </div>
              <p className="text-muted-foreground text-center text-sm">
                No hours recorded
              </p>
            </>
          )}
        </div>

        <Dialog
          open={!!editEntry}
          onOpenChange={(open) => !open && closeEditEntry()}
        >
          <DialogContent className="max-h-[85vh] max-w-sm overflow-y-auto">
            {deleteConfirmStep === 2 ? (
              <>
                <DialogHeader>
                  <DialogTitle>Delete time entry</DialogTitle>
                </DialogHeader>
                <p className="py-4 text-sm text-muted-foreground">
                  Are you sure you want to delete this time entry? This cannot
                  be undone.
                </p>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDeleteConfirmStep(1)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleDeleteEditEntry}
                  >
                    Yes, delete
                  </Button>
                </DialogFooter>
              </>
            ) : (
              <form onSubmit={handleSaveEditEntry}>
                <DialogHeader>
                  <DialogTitle>Edit hours</DialogTitle>
                </DialogHeader>
                <FieldGroup className="gap-4 py-4">
                  {editEntry && (
                    <>
                      <p className="text-sm text-muted-foreground">
                        {projectNameMap.get(editEntry.projectId) ??
                          editEntry.projectId}{' '}
                        · {editEntry.date}
                      </p>
                      <Field>
                        <FieldLabel htmlFor="edit-notes">Notes</FieldLabel>
                        <Textarea
                          id="edit-notes"
                          value={editNotes}
                          onChange={(ev) => setEditNotes(ev.target.value)}
                          placeholder="Optional notes"
                          rows={3}
                          className="resize-none"
                        />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="edit-hours">Hours</FieldLabel>
                        <Input
                          id="edit-hours"
                          type="number"
                          min={0}
                          step={0.25}
                          value={editHours}
                          onChange={(ev) => setEditHours(ev.target.value)}
                          required
                        />
                      </Field>
                      <Field orientation="horizontal">
                        <input
                          id="edit-travelled-to-office"
                          type="checkbox"
                          checked={editTravelledToOffice}
                          onChange={(ev) =>
                            setEditTravelledToOffice(ev.target.checked)
                          }
                          className="h-4 w-4 rounded border-input"
                        />
                        <FieldLabel htmlFor="edit-travelled-to-office">
                          Travelled to office
                        </FieldLabel>
                      </Field>
                    </>
                  )}
                </FieldGroup>
                <DialogFooter className="flex flex-row justify-end gap-2">
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleDeleteEditEntry}
                  >
                    Delete
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeEditEntry}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Save</Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </RequireAuth>
  )
}
