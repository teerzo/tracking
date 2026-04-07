"use client"

import * as React from "react"
import { DatePickerDialog } from "@/components/time-tracking/date-picker-dialog"

interface DatePickerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedDate: Date
  onSelectDate: (date: Date) => void
}

export function DatePicker({
  open,
  onOpenChange,
  selectedDate,
  onSelectDate,
}: DatePickerProps) {
  return (
    <DatePickerDialog
      open={open}
      onOpenChange={onOpenChange}
      selectedDate={selectedDate}
      onSelectDate={onSelectDate}
    />
  )
}
