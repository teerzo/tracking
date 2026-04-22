"use client"

import * as React from "react"
import { supabase } from "@/lib/supabaseClient"
import type { TimeEntry } from "@/lib/time-tracking"

export function useTimeEntries() {
  const [entries, setEntries] = React.useState<TimeEntry[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchEntries = React.useCallback(async () => {
    if (!supabase) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from("time")
      .select("id, project_id, date, hours, notes, travelled_to_office")
      .order("date", { ascending: false })

    if (err) {
      setError(err.message)
      setEntries([])
    } else if (data) {
      setEntries(
        data.map((row) => ({
          id: row.id,
          projectId: row.project_id,
          date: row.date,
          hours: Number(row.hours),
          notes: (row.notes as string) ?? undefined,
          travelledToOffice: Boolean(row.travelled_to_office),
        }))
      )
    }
    setLoading(false)
  }, [])

  React.useEffect(() => {
    void fetchEntries()
  }, [fetchEntries])

  const addEntry = React.useCallback(
    async (input: {
      projectId: string
      date: string
      hours: number
      notes?: string
      travelledToOffice?: boolean
    }) => {
      if (!supabase) return
      const timeZone =
        typeof Intl !== "undefined"
          ? Intl.DateTimeFormat().resolvedOptions().timeZone
          : null
      const offsetMinutes =
        typeof Date !== "undefined"
          ? -new Date().getTimezoneOffset()
          : null
      const { data, error: err } = await supabase.rpc("add_time_entry", {
        p_project_id: input.projectId,
        p_date: input.date,
        p_hours: input.hours,
        p_notes: input.notes ?? null,
        p_time_zone: timeZone,
        p_client_offset_minutes: offsetMinutes,
        p_travelled_to_office: input.travelledToOffice ?? false,
      })

      if (err) {
        setError(err.message)
        return
      }
      // RPC returns array of one row (inserted or updated)
      const row = Array.isArray(data) ? data[0] : data
      if (row) {
        const entry = {
          id: row.id,
          projectId: row.project_id,
          date: row.date,
          hours: Number(row.hours),
          notes: (row.notes as string) ?? undefined,
          travelledToOffice: Boolean(row.travelled_to_office),
        }
        setEntries((prev) => {
          const idx = prev.findIndex((e) => e.id === entry.id)
          if (idx >= 0) {
            const next = [...prev]
            next[idx] = entry
            return next
          }
          return [entry, ...prev]
        })
      }
    },
    []
  )

  const updateEntry = React.useCallback(
    async (
      id: string,
      hours: number,
      notes?: string,
      travelledToOffice?: boolean
    ) => {
      if (!supabase || hours < 0) return
      const updates: {
        hours: number
        notes?: string | null
        travelled_to_office?: boolean
      } = { hours }
      if (notes !== undefined) updates.notes = notes || null
      if (travelledToOffice !== undefined) {
        updates.travelled_to_office = travelledToOffice
      }
      const { data, error: err } = await supabase
        .from("time")
        .update(updates)
        .eq("id", id)
        .select("id, project_id, date, hours, notes, travelled_to_office")
        .single()

      if (err) {
        setError(err.message)
        return
      }
      if (data) {
        const entry = {
          id: data.id,
          projectId: data.project_id,
          date: data.date,
          hours: Number(data.hours),
          notes: (data.notes as string) ?? undefined,
          travelledToOffice: Boolean(data.travelled_to_office),
        }
        setEntries((prev) =>
          prev.map((e) => (e.id === entry.id ? entry : e))
        )
      }
    },
    []
  )

  const deleteEntry = React.useCallback(async (id: string) => {
    if (!supabase) return
    const { error: err } = await supabase.from("time").delete().eq("id", id)
    if (err) {
      setError(err.message)
      return
    }
    setEntries((prev) => prev.filter((e) => e.id !== id))
  }, [])

  return {
    entries,
    loading,
    error,
    addEntry,
    updateEntry,
    deleteEntry,
    refetch: fetchEntries,
  }
}
