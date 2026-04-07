"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface DatePickerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedDate: Date
  onSelectDate: (date: Date) => void
}

export function DatePickerDialog({
  open,
  onOpenChange,
  selectedDate,
  onSelectDate,
}: DatePickerDialogProps) {
  const [calendarMonth, setCalendarMonth] = React.useState(() => new Date())

  React.useEffect(() => {
    if (open) {
      setCalendarMonth(new Date(selectedDate))
    }
  }, [open, selectedDate])

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

  const toLocalDateString = (d: Date) => {
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  const selectedDateStr = toLocalDateString(selectedDate)

  const prevMonth = () => {
    setCalendarMonth((m) => {
      const next = new Date(m)
      next.setMonth(next.getMonth() - 1)
      return next
    })
  }

  const nextMonth = () => {
    setCalendarMonth((m) => {
      const next = new Date(m)
      next.setMonth(next.getMonth() + 1)
      return next
    })
  }

  const handleSelectDay = (d: Date) => {
    onSelectDate(d)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Select date</DialogTitle>
        </DialogHeader>
        <div className="flex items-center justify-between gap-2 pb-3">
          <Button variant="ghost" size="icon-sm" onClick={prevMonth} aria-label="Previous month">
            <ChevronLeft />
          </Button>
          <span className="text-sm font-medium">{calendarMonthLabel}</span>
          <Button variant="ghost" size="icon-sm" onClick={nextMonth} aria-label="Next month">
            <ChevronRight />
          </Button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-sm">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
            <div key={d} className="py-1 font-medium text-muted-foreground">
              {d}
            </div>
          ))}
          {calendarDays.map((d, i) => {
            if (d === null) {
              return <div key={`empty-${i}`} className="py-1" />
            }
            const date = new Date(
              calendarMonth.getFullYear(),
              calendarMonth.getMonth(),
              d
            )
            const dateStr = toLocalDateString(date)
            const isSelected = dateStr === selectedDateStr
            return (
              <Button
                key={d}
                variant={isSelected ? "default" : "ghost"}
                size="icon-sm"
                className="h-8 w-full"
                onClick={() => handleSelectDay(date)}
              >
                {d}
              </Button>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
