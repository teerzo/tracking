"use client"

import * as React from "react"
import { Link } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { Cog, PlusIcon } from "lucide-react"
import type { Project, TimeEntry } from "@/lib/time-tracking"
import { InvoiceDialog } from "@/components/time-tracking/invoice-dialog"

interface HeaderProps {
  displayName: string | null
  onAddTime: () => void
  projects: Project[]
  entries: TimeEntry[]
  selectedDateStr: string
}

export function Header({
  displayName,
  onAddTime,
  projects,
  entries,
  selectedDateStr,
}: HeaderProps) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <h1 className="text-2xl font-semibold">
        Tracking
        {displayName && (
          <span className="text-muted-foreground font-normal">
            {" · "}
            {displayName}
          </span>
        )}
      </h1>
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={onAddTime}>
          <PlusIcon />
          Add Time
        </Button>
        <InvoiceDialog
          projects={projects}
          entries={entries}
          selectedDateStr={selectedDateStr}
        />
        <Button variant="outline" size="icon" asChild>
          <Link to="/manage" title="Manage">
            <Cog />
            <span className="sr-only">Manage</span>
          </Link>
        </Button>
      </div>
    </header>
  )
}
