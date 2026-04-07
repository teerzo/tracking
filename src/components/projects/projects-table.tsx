"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Project } from "@/lib/hooks/useProjects"

interface ProjectsTableProps {
  projects: Project[]
  onEdit: (project: Project) => void
  onDelete: (project: Project) => void
}

export function ProjectsTable({ projects, onEdit, onDelete }: ProjectsTableProps) {
  if (projects.length === 0) {
    return (
      <p className="mb-2 text-sm text-muted-foreground">
        No projects found. Use the Add button above to create your first project.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table
        className={cn(
          "w-full text-sm",
          "[&_th]:font-medium [&_th]:text-muted-foreground [&_th]:text-start [&_th]:ps-4 [&_th]:pe-4 [&_th]:py-3 [&_th]:bg-muted/50",
          "[&_td]:ps-4 [&_td]:pe-4 [&_td]:py-3 [&_td]:border-t",
        )}
      >
        <thead>
          <tr>
            <th>Project name</th>
            <th>Start date</th>
            <th>End date</th>
            <th>Hourly rate</th>
            <th>Company</th>
            <th aria-label="Actions" className="w-24" />
          </tr>
        </thead>
        <tbody>
          {projects.map((p) => (
            <tr key={p.id}>
              <td>{p.projectName}</td>
              <td>{p.startDate}</td>
              <td>{p.endDate}</td>
              <td>${p.hourlyRate}</td>
              <td>{p.company}</td>
              <td>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => onEdit(p)}>
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(p)}
                    className="text-destructive hover:text-destructive"
                  >
                    Delete
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

