"use client"

import * as React from "react"
import { useProjectNameMap } from "@/lib/hooks/useProjectNameMap"
import { useUser } from "@/lib/hooks/useUser"
import { useProjects } from "@/lib/hooks/useProjects"
import { useTimeEntries } from "@/lib/hooks/useTimeEntries"
import { createFileRoute, redirect } from "@tanstack/react-router"
import { supabase } from "@/lib/supabaseClient"
import { RequireAuth } from "@/components/RequireAuth"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { ChevronLeft, ChevronRight, Cog } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { formatHours } from "@/lib/time-tracking"
import type { TimeEntry } from "@/lib/time-tracking"
import { AddTimeDialog } from "@/components/home/add-time-dialog"
import { DatePicker } from "@/components/home/date-picker"
import { Header } from "@/components/header"

export const Route = createFileRoute("/home")({
    beforeLoad: async ({ location }) => {
        if (typeof window === "undefined") return
        if (!supabase) return
        const {
            data: { user },
        } = await supabase.auth.getUser()
        console.log(user);
        if (!user) {
            throw redirect({
                to: "/login",
                search: { redirect: location.pathname },
            })
        }
    },
    component: HomePage,
})

export function HomePage() {
    const { projects } = useProjects()
    const { entries, addEntry, updateEntry, deleteEntry } = useTimeEntries()
    const { displayName } = useUser()
    const { projectNameMap } = useProjectNameMap()

    const toLocalDateString = (d: Date) => {
        const year = d.getFullYear()
        const month = String(d.getMonth() + 1).padStart(2, "0")
        const day = String(d.getDate()).padStart(2, "0")
        return `${year}-${month}-${day}`
    }

    const [selectedDate, setSelectedDate] = React.useState(() => new Date())
    const [addTimeOpen, setAddTimeOpen] = React.useState(false)
    const [calendarOpen, setCalendarOpen] = React.useState(false)
    const [editEntry, setEditEntry] = React.useState<TimeEntry | null>(null)
    const [editHours, setEditHours] = React.useState("")
    const [editNotes, setEditNotes] = React.useState("")
    const [deleteConfirmStep, setDeleteConfirmStep] = React.useState<1 | 2>(1)

    const handleAddEntry = (entry: {
    projectId: string
    date: string
    hours: number
    notes?: string
  }) => {
        void addEntry(entry)
    }

    const openAddTimeModal = () => setAddTimeOpen(true)

    const formattedDate = selectedDate.toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
        year: "numeric",
    })

    const goPrevDay = () => {
        setSelectedDate((d) => {
            const next = new Date(d)
            next.setDate(next.getDate() - 1)
            return next
        })
    }

    const goNextDay = () => {
        setSelectedDate((d) => {
            const next = new Date(d)
            next.setDate(next.getDate() + 1)
            return next
        })
    }

    const openCalendar = () => setCalendarOpen(true)

    const openEditEntry = (e: TimeEntry) => {
        setEditEntry(e)
        setEditHours(String(e.hours))
        setEditNotes(e.notes ?? "")
    }
    const closeEditEntry = () => {
        setEditEntry(null)
        setEditHours("")
        setEditNotes("")
        setDeleteConfirmStep(1)
    }
    const handleSaveEditEntry = async (ev: React.FormEvent) => {
        ev.preventDefault()
        if (!editEntry) return
        const h = parseFloat(editHours)
        if (Number.isNaN(h) || h < 0) return
        await updateEntry(editEntry.id, h, editNotes.trim() || undefined)
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
    const projectsForHeader = projects.map((p) => ({
        id: p.id,
        name: p.projectName,
        hourlyRate: p.hourlyRate,
        companyId: p.companyId,
    }))

    return (
        <RequireAuth>
            <div className="mx-auto max-w-4xl space-y-8 p-6">
                <Header
                    displayName={displayName}
                    onAddTime={openAddTimeModal}
                    projects={projectsForHeader}
                    entries={entries}
                    selectedDateStr={selectedDateStr}
                />

                <div className="flex items-center justify-center gap-2">
                    <Button variant="outline" size="icon" onClick={goPrevDay} aria-label="Previous day">
                        <ChevronLeft />
                    </Button>
                    <button
                        type="button"
                        onClick={openCalendar}
                        className="min-w-[220px] rounded-md px-2 py-1.5 text-center font-medium hover:bg-muted"
                        aria-label="Open calendar"
                    >
                        {formattedDate}
                    </button>
                    <Button variant="outline" size="icon" onClick={goNextDay} aria-label="Next day">
                        <ChevronRight />
                    </Button>
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

                <div className="rounded-lg border p-4">
                    {entriesForDay.length > 0 ? (
                        <>
                            <div className="mb-3 flex items-center justify-between gap-2 border-b pb-3 text-sm font-medium text-muted-foreground">
                                <span className="min-w-0 flex-1 truncate">Project name</span>
                                <span className="min-w-0 flex-1 truncate px-2 text-center">
                                    Notes
                                </span>
                                <span className="flex w-24 shrink-0 items-center justify-end text-nowrap">
                                    Total:   {formatHours(entriesForDay.reduce((sum, e) => sum + e.hours, 0))} hrs
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
                                            {e.notes ?? "—"}
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
                            <p className="text-muted-foreground text-center text-sm">No hours recorded</p>
                        </>
                    )}
                </div>

                <Dialog open={!!editEntry} onOpenChange={(open) => !open && closeEditEntry()}>
                    <DialogContent className="max-w-sm">
                        {deleteConfirmStep === 2 ? (
                            <>
                                <DialogHeader>
                                    <DialogTitle>Delete time entry</DialogTitle>
                                </DialogHeader>
                                <p className="py-4 text-sm text-muted-foreground">
                                    Are you sure you want to delete this time entry? This cannot be
                                    undone.
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
                                                    editEntry.projectId}{" "}
                                                · {editEntry.date}
                                            </p>
                                            <Field>
                                                <FieldLabel htmlFor="edit-notes">
                                                    Notes
                                                </FieldLabel>
                                                <Textarea
                                                    id="edit-notes"
                                                    value={editNotes}
                                                    onChange={(ev) =>
                                                        setEditNotes(ev.target.value)
                                                    }
                                                    placeholder="Optional notes"
                                                    rows={3}
                                                    className="resize-none"
                                                />
                                            </Field>
                                            <Field>
                                                <FieldLabel htmlFor="edit-hours">
                                                    Hours
                                                </FieldLabel>
                                                <Input
                                                    id="edit-hours"
                                                    type="number"
                                                    min={0}
                                                    step={0.25}
                                                    value={editHours}
                                                    onChange={(ev) =>
                                                        setEditHours(ev.target.value)
                                                    }
                                                    required
                                                />
                                            </Field>
                                        </>
                                    )}
                                </FieldGroup>
                                <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        onClick={handleDeleteEditEntry}
                                        className="sm:mr-auto"
                                    >
                                        Delete
                                    </Button>
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={closeEditEntry}
                                        >
                                            Cancel
                                        </Button>
                                        <Button type="submit">Save</Button>
                                    </div>
                                </DialogFooter>
                            </form>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </RequireAuth>
    )
}
