"use client"

import * as React from "react"
import { supabase } from "@/lib/supabaseClient"

export interface Project {
  id: string
  projectName: string
  startDate: string
  endDate: string
  hourlyRate: number
  company: string
  companyId: string
}

export function useProjects() {
  const [projects, setProjects] = React.useState<Project[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const fetchProjects = async () => {
      if (!supabase) {
        setLoading(false)
        return
      }
      setLoading(true)
      setError(null)
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("start_date", { ascending: true })

      if (error) {
        setError(error.message)
        setProjects([])
      } else if (data) {
        console.log("data", data)
        const mapped = data.map((row: any) => ({
          id: row.id as string,
          projectName: row.project_name as string,
          startDate: row.start_date ?? "",
          endDate: row.end_date ?? "",
          hourlyRate: Number(row.hourly_rate ?? 0),
          company: row.company ?? "",
          companyId: (row.company_id as string) ?? "",
        }))
        setProjects(mapped)
      }
      setLoading(false)
    }

    void fetchProjects()
  }, [])

  return { projects, setProjects, loading, error }
}

