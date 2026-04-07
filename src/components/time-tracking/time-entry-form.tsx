"use client"

import * as React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PlusIcon } from "lucide-react"
import type { Project, TimeEntry } from "@/lib/time-tracking"
import { generateId } from "@/lib/time-tracking"

interface TimeEntryFormProps {
  projects: Project[]
  onAddEntry: (entry: TimeEntry) => void
}

export function TimeEntryForm({
  projects,
  onAddEntry,
}: TimeEntryFormProps) {
  const today = new Date().toISOString().slice(0, 10)
  const [projectId, setProjectId] = React.useState("")
  const [date, setDate] = React.useState(today)
  const [hours, setHours] = React.useState("")
  const [notes, setNotes] = React.useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const h = parseFloat(hours)
    if (!projectId || Number.isNaN(h) || h <= 0) return
    onAddEntry({
      id: generateId(),
      projectId,
      date,
      hours: h,
      notes: notes.trim() || undefined,
    })
    setHours("")
    setNotes("")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log time</CardTitle>
        <CardDescription>
          Enter hours for a project on a specific day
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup className="gap-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Field>
                <FieldLabel htmlFor="entry-project">Project</FieldLabel>
                <Select
                  value={projectId}
                  onValueChange={setProjectId}
                  required
                >
                  <SelectTrigger id="entry-project">
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="entry-date">Date</FieldLabel>
                <Input
                  id="entry-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="entry-hours">Hours</FieldLabel>
                <Input
                  id="entry-hours"
                  type="number"
                  min={0.25}
                  step={0.25}
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  placeholder="2.5"
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="entry-notes">Notes (optional)</FieldLabel>
                <Input
                  id="entry-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Brief description"
                />
              </Field>
            </div>
            <Button type="submit" disabled={projects.length === 0}>
              <PlusIcon />
              Add entry
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
