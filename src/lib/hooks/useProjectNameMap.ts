"use client"

import * as React from "react"
import { useProjects } from "@/lib/hooks/useProjects"

/**
 * Returns a map of project id -> project name from the projects table,
 * for use when displaying entries or other data that references project IDs.
 */
export function useProjectNameMap() {
  const { projects, loading, error } = useProjects()
  const projectNameMap = React.useMemo(
    () => new Map(projects.map((p) => [p.id, p.projectName])),
    [projects]
  )
  return { projectNameMap, loading, error }
}
