"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ChevronLeft, ChevronRight, PlusIcon } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { useProjects } from "@/lib/hooks/useProjects"

export interface AddTimeEntryInput {
  projectId: string
  date: string
  hours: number
  notes?: string
  travelledToOffice?: boolean
}

interface AddTimeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialDate: Date
  onSubmit: (entry: AddTimeEntryInput) => void | Promise<void>
}

export function AddTimeDialog({
  open,
  onOpenChange,
  initialDate,
  onSubmit,
}: AddTimeDialogProps) {
  const { projects, loading: projectsLoading } = useProjects()
  const [projectId, setProjectId] = React.useState("")
  const [hours, setHours] = React.useState("")
  const [notes, setNotes] = React.useState("")
  const [travelledToOffice, setTravelledToOffice] = React.useState(false)
  const [date, setDate] = React.useState(() => new Date())
  const [calendarMonth, setCalendarMonth] = React.useState(() => new Date())

  const toLocalDateString = (d: Date) => {
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  React.useEffect(() => {
    if (open) {
      setProjectId("")
      setHours("")
      setNotes("")
      setTravelledToOffice(false)
      setDate(new Date(initialDate))
      setCalendarMonth(new Date(initialDate))
    }
  }, [open, initialDate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const h = parseFloat(hours)
    if (!projectId || Number.isNaN(h) || h <= 0) return
    await onSubmit({
      projectId,
      date: toLocalDateString(date),
      hours: h,
      notes: notes.trim() || undefined,
      travelledToOffice,
    })
    onOpenChange(false)
  }

  const dateStr = toLocalDateString(date)
  const calendarMonthLabel = calendarMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  })
  const calendarDays = React.useMemo(() => {
    const year = calendarMonth.getFullYear()
    const month = calendarMonth.getMonth()
    const first = new Date(year, month, 1)
    const last = new Date(year, month + 1, 0)
    const startOffset = first.getDay()
    const daysInMonth = last.getDate()
    const cells: (number | null)[] = []
    for (let i = 0; i < startOffset; i++) cells.push(null)
    for (let d = 1; d <= daysInMonth; d++) cells.push(d)
    const total = Math.ceil(cells.length / 7) * 7
    while (cells.length < total) cells.push(null)
    return cells
  }, [calendarMonth])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-sm overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add time</DialogTitle>
          </DialogHeader>
          <FieldGroup className="gap-4 py-4">
            <Field>
              <FieldLabel htmlFor="add-time-project">
                Project <span className="text-destructive">*</span>
              </FieldLabel>
              <Select value={projectId} onValueChange={setProjectId} required>
                <SelectTrigger id="add-time-project" aria-required="true">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projectsLoading ? (
                    <SelectItem value="" disabled>
                      Loading…
                    </SelectItem>
                  ) : (
                    projects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.projectName}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="add-time-notes">Notes</FieldLabel>
              <Textarea
                id="add-time-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes for this entry"
                rows={2}
                className="resize-none"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="add-time-hours">Hours</FieldLabel>
              <Input
                id="add-time-hours"
                type="number"
                min={0.25}
                step={0.25}
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                placeholder=""
                required
              />
            </Field>
            <Field orientation="horizontal">
              <input
                id="add-time-travelled-to-office"
                type="checkbox"
                checked={travelledToOffice}
                onChange={(e) => setTravelledToOffice(e.target.checked)}
                className="h-4 w-4 rounded border-input"
              />
              <FieldLabel htmlFor="add-time-travelled-to-office">
                Travelled to office
              </FieldLabel>
            </Field>
            <Field>
              <FieldLabel>Date</FieldLabel>
              <div className="rounded-md border p-3">
                <div className="flex items-center justify-between gap-2 pb-3">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() =>
                      setCalendarMonth((m) => {
                        const next = new Date(m)
                        next.setMonth(next.getMonth() - 1)
                        return next
                      })
                    }
                    aria-label="Previous month"
                  >
                    <ChevronLeft />
                  </Button>
                  <span className="text-sm font-medium">{calendarMonthLabel}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() =>
                      setCalendarMonth((m) => {
                        const next = new Date(m)
                        next.setMonth(next.getMonth() + 1)
                        return next
                      })
                    }
                    aria-label="Next month"
                  >
                    <ChevronRight />
                  </Button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-sm">
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                    <div key={d} className="py-1 font-medium text-muted-foreground">
                      {d}
                    </div>
                  ))}
                  {calendarDays.map((dayNum, i) => {
                    if (dayNum === null) {
                      return <div key={`empty-${i}`} className="py-1" />
                    }
                    const d = new Date(
                      calendarMonth.getFullYear(),
                      calendarMonth.getMonth(),
                      dayNum
                    )
                    const dStr = toLocalDateString(d)
                    const isSelected = dStr === dateStr
                    return (
                      <Button
                        key={dayNum}
                        type="button"
                        variant={isSelected ? "default" : "ghost"}
                        size="icon-sm"
                        className="h-8 w-full"
                        onClick={() => setDate(d)}
                      >
                        {dayNum}
                      </Button>
                    )
                  })}
                </div>
              </div>
            </Field>
          </FieldGroup>
          <DialogFooter className="flex flex-row justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={projectsLoading || projects.length === 0}>
              <PlusIcon />
              Add
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
