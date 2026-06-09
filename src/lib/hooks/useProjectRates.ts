"use client"

import * as React from "react"
import { supabase } from "@/lib/supabaseClient"
import {
  subtractOneDay,
  validateRatePeriods,
  type ProjectRate,
} from "@/lib/time-tracking"

function mapRow(row: {
  id: string
  project_id: string
  start_date: string
  end_date: string | null
  hourly_rate: number | string
}): ProjectRate {
  return {
    id: row.id,
    projectId: row.project_id,
    startDate: row.start_date,
    endDate: row.end_date,
    hourlyRate: Number(row.hourly_rate ?? 0),
  }
}

async function syncProjectHourlyRate(projectId: string, hourlyRate: number) {
  if (!supabase) return
  await supabase
    .from("projects")
    .update({ hourly_rate: hourlyRate })
    .eq("id", projectId)
}

export function useProjectRates() {
  const [rates, setRates] = React.useState<ProjectRate[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchRates = React.useCallback(async () => {
    if (!supabase) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    const { data, error: fetchError } = await supabase
      .from("project_rates")
      .select("id, project_id, start_date, end_date, hourly_rate")
      .order("start_date", { ascending: false })

    if (fetchError) {
      setError(fetchError.message)
      setRates([])
    } else {
      setRates((data ?? []).map(mapRow))
    }
    setLoading(false)
  }, [])

  React.useEffect(() => {
    void fetchRates()
  }, [fetchRates])

  const getRatesForProject = React.useCallback(
    (projectId: string) =>
      rates
        .filter((r) => r.projectId === projectId)
        .sort(
          (a, b) =>
            parseDateDesc(b.startDate) - parseDateDesc(a.startDate)
        ),
    [rates]
  )

  const insertRate = React.useCallback(
    async (
      input: Omit<ProjectRate, "id">
    ): Promise<{ rate: ProjectRate | null; error: string | null }> => {
      if (!supabase) {
        return { rate: null, error: "Supabase is not configured." }
      }

      const candidate: ProjectRate = {
        id: "__new__",
        ...input,
      }

      let projectRatesForProject = rates.filter(
        (r) => r.projectId === input.projectId
      )
      const ongoing = projectRatesForProject.find((r) => r.endDate === null)

      if (input.endDate === null && ongoing) {
        const closeEnd = subtractOneDay(input.startDate)
        if (parseDateOnly(closeEnd) < parseDateOnly(ongoing.startDate)) {
          return {
            rate: null,
            error:
              "New rate must start after the current ongoing period start date.",
          }
        }
        projectRatesForProject = projectRatesForProject.map((r) =>
          r.id === ongoing.id ? { ...r, endDate: closeEnd } : r
        )
      }

      const validationError = validateRatePeriods(
        [
          ...rates.filter((r) => r.projectId !== input.projectId),
          ...projectRatesForProject,
          candidate,
        ],
        input.projectId
      )
      if (validationError) {
        return { rate: null, error: validationError }
      }

      if (input.endDate === null && ongoing) {
        const closeEnd = subtractOneDay(input.startDate)
        const { error: closeError } = await supabase
          .from("project_rates")
          .update({ end_date: closeEnd })
          .eq("id", ongoing.id)

        if (closeError) {
          return { rate: null, error: closeError.message }
        }
      }

      const { data, error: insertError } = await supabase
        .from("project_rates")
        .insert({
          project_id: input.projectId,
          start_date: input.startDate,
          end_date: input.endDate,
          hourly_rate: input.hourlyRate,
        })
        .select("id, project_id, start_date, end_date, hourly_rate")
        .single()

      if (insertError || !data) {
        return { rate: null, error: insertError?.message ?? "Insert failed." }
      }

      const created = mapRow(data)
      setRates((prev) => {
        const closed = prev.map((r) => {
          if (
            r.projectId === input.projectId &&
            r.endDate === null &&
            input.endDate === null &&
            r.id !== created.id
          ) {
            return { ...r, endDate: subtractOneDay(input.startDate) }
          }
          return r
        })
        return [...closed, created]
      })

      if (input.endDate === null) {
        await syncProjectHourlyRate(input.projectId, input.hourlyRate)
      }

      return { rate: created, error: null }
    },
    [rates]
  )

  const updateRate = React.useCallback(
    async (
      rate: ProjectRate
    ): Promise<{ error: string | null }> => {
      if (!supabase) {
        return { error: "Supabase is not configured." }
      }

      const nextRates = rates.map((r) => (r.id === rate.id ? rate : r))
      const validationError = validateRatePeriods(nextRates, rate.projectId)
      if (validationError) {
        return { error: validationError }
      }

      const { error: updateError } = await supabase
        .from("project_rates")
        .update({
          start_date: rate.startDate,
          end_date: rate.endDate,
          hourly_rate: rate.hourlyRate,
        })
        .eq("id", rate.id)

      if (updateError) {
        return { error: updateError.message }
      }

      setRates(nextRates)

      if (rate.endDate === null) {
        await syncProjectHourlyRate(rate.projectId, rate.hourlyRate)
      }

      return { error: null }
    },
    [rates]
  )

  const deleteRate = React.useCallback(
    async (rateId: string): Promise<{ error: string | null }> => {
      if (!supabase) {
        return { error: "Supabase is not configured." }
      }

      const { error: deleteError } = await supabase
        .from("project_rates")
        .delete()
        .eq("id", rateId)

      if (deleteError) {
        return { error: deleteError.message }
      }

      setRates((prev) => prev.filter((r) => r.id !== rateId))
      return { error: null }
    },
    []
  )

  return {
    rates,
    setRates,
    loading,
    error,
    refetch: fetchRates,
    getRatesForProject,
    insertRate,
    updateRate,
    deleteRate,
  }
}

function parseDateOnly(dateStr: string): number {
  return new Date(dateStr + "T00:00:00").getTime()
}

function parseDateDesc(dateStr: string): number {
  return parseDateOnly(dateStr)
}
