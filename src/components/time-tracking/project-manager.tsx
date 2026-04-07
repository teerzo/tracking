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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Trash2Icon,
  PlusIcon,
} from "lucide-react"
import type { Project } from "@/lib/time-tracking"
import { generateId, formatCurrency } from "@/lib/time-tracking"

interface ProjectManagerProps {
  projects: Project[]
  onProjectsChange: (projects: Project[]) => void
}

export function ProjectManager({
  projects,
  onProjectsChange,
}: ProjectManagerProps) {
  const [name, setName] = React.useState("")
  const [hourlyRate, setHourlyRate] = React.useState("")

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    const rate = parseFloat(hourlyRate)
    if (!trimmed || Number.isNaN(rate) || rate < 0) return
    onProjectsChange([
      ...projects,
      { id: generateId(), name: trimmed, hourlyRate: rate },
    ])
    setName("")
    setHourlyRate("")
  }

  const handleDelete = (id: string) => {
    onProjectsChange(projects.filter((p) => p.id !== id))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Projects</CardTitle>
        <CardDescription>
          Add projects with hourly rates for time tracking and invoicing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleAdd} className="space-y-3">
          <FieldGroup className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <Field className="flex-1">
              <FieldLabel htmlFor="project-name">Project name</FieldLabel>
              <Input
                id="project-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Acme Corp Website"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="project-rate">Hourly rate ($)</FieldLabel>
              <Input
                id="project-rate"
                type="number"
                min={0}
                step={0.01}
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                placeholder="150"
              />
            </Field>
            <Button type="submit">
              <PlusIcon />
              Add
            </Button>
          </FieldGroup>
        </form>

        {projects.length > 0 ? (
          <ul className="space-y-2">
            {projects.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between rounded-md border px-3 py-2"
              >
                <span>
                  <span className="font-medium">{p.name}</span>
                  <span className="text-muted-foreground ms-2">
                    {formatCurrency(p.hourlyRate)}/hr
                  </span>
                </span>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon-xs">
                      <Trash2Icon />
                      <span className="sr-only">Delete project</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent size="sm">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete project?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will remove &quot;{p.name}&quot;. Existing time
                        entries will remain but will not appear in invoices.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(p.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-sm">
            No projects yet. Add one above to start tracking time.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
