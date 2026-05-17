"use client"

import * as React from "react"
import { supabase } from "@/lib/supabaseClient"
import { toProject, type Project, type ProjectRow } from "@/lib/projects"

export type { Project } from "@/lib/projects"

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
        .select("*, company:companies(name)")
        .order("start_date", { ascending: true })

      if (error) {
        setError(error.message)
        setProjects([])
      } else if (data) {
        setProjects(data.map((row) => toProject(row as ProjectRow)))
      }
      setLoading(false)
    }

    void fetchProjects()
  }, [])

  return { projects, setProjects, loading, error }
}

