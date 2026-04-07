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
import { Trash2Icon } from "lucide-react"
import type { Project, TimeEntry } from "@/lib/time-tracking"
import { formatHours, formatCurrency } from "@/lib/time-tracking"
import { cn } from "@/lib/utils"

interface EntriesTableProps {
  entries: TimeEntry[]
  projects: Project[]
  onRemoveEntry: (id: string) => void
}

export function EntriesTable({
  entries,
  projects,
  onRemoveEntry,
}: EntriesTableProps) {
  const projectMap = new Map(projects.map((p) => [p.id, p]))

  const byDate = React.useMemo(() => {
    const map = new Map<string, TimeEntry[]>()
    const sorted = [...entries].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    for (const e of sorted) {
      const list = map.get(e.date) ?? []
      list.push(e)
      map.set(e.date, list)
    }
    return map
  }, [entries])

  const sortedDates = React.useMemo(
    () => Array.from(byDate.keys()).sort((a, b) => b.localeCompare(a)),
    [byDate]
  )

  if (entries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Time entries</CardTitle>
          <CardDescription>
            Logged hours will appear here, grouped by date
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            No entries yet. Use the form above to log time.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Time entries</CardTitle>
        <CardDescription>
          Logged hours grouped by date. Total:{" "}
          {formatHours(entries.reduce((s, e) => s + e.hours, 0))} hrs
        </CardDescription>
      </CardHeader>
      <CardContent>
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
                <th>Date</th>
                <th>Project</th>
                <th>Hours</th>
                <th>Notes</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {sortedDates.map((date) =>
                (byDate.get(date) ?? []).map((e) => {
                  const p = projectMap.get(e.projectId)
                  return (
                    <tr key={e.id} className="border-t">
                      <td>{date}</td>
                      <td>{p?.name ?? e.projectId}</td>
                      <td>{formatHours(e.hours)}</td>
                      <td className="text-muted-foreground max-w-48 truncate">
                        {e.notes ?? "—"}
                      </td>
                      <td>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon-xs">
                              <Trash2Icon />
                              <span className="sr-only">Delete entry</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent size="sm">
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete time entry?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                {formatHours(e.hours)} hrs on {date} for{" "}
                                {p?.name ?? "project"} will be removed.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => onRemoveEntry(e.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
