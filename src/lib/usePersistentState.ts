"use client"

import { useCallback, useEffect, useState } from "react"
import type { Project, TimeEntry } from "./time-tracking"

const PROJECTS_KEY = "time-tracking-projects"
const ENTRIES_KEY = "time-tracking-entries"

function load<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function save<T>(key: string, value: T): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore
  }
}

export function usePersistentState() {
  const [projects, setProjectsState] = useState<Project[]>(() =>
    load(PROJECTS_KEY, [])
  )
  const [entries, setEntriesState] = useState<TimeEntry[]>(() =>
    load(ENTRIES_KEY, [])
  )

  useEffect(() => {
    save(PROJECTS_KEY, projects)
  }, [projects])

  useEffect(() => {
    save(ENTRIES_KEY, entries)
  }, [entries])

  const setProjects = useCallback((value: Project[] | ((prev: Project[]) => Project[])) => {
    setProjectsState((prev) => (typeof value === "function" ? value(prev) : value))
  }, [])

  const setEntries = useCallback((value: TimeEntry[] | ((prev: TimeEntry[]) => TimeEntry[])) => {
    setEntriesState((prev) => (typeof value === "function" ? value(prev) : value))
  }, [])

  return { projects, setProjects, entries, setEntries }
}
