"use client"

import * as React from "react"
import { createFileRoute } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import { useCompanies } from "@/lib/hooks/useCompanies"
import { useProjectRates } from "@/lib/hooks/useProjectRates"
import { useProjects, type Project } from "@/lib/hooks/useProjects"
import type { ProjectRate } from "@/lib/time-tracking"
import { ProjectsTable } from "@/components/projects/projects-table"
import { ProjectsModals } from "@/components/projects/projects-modals"
import { useManageHeaderAction } from "@/components/manage-header-action"

export const Route = createFileRoute("/manage/projects")({
  component: ManageProjectsPage,
})

function ManageProjectsPage() {
  const { projects, setProjects, error } = useProjects()
  const {
    getRatesForProject,
    insertRate,
    updateRate,
    deleteRate,
    refetch: refetchRates,
  } = useProjectRates()
  const { companies } = useCompanies()
  const [addOpen, setAddOpen] = React.useState(false)
  const [editProject, setEditProject] = React.useState<Project | null>(null)
  const [deleteProject, setDeleteProject] = React.useState<Project | null>(null)
  const [deleteConfirmStep, setDeleteConfirmStep] = React.useState<1 | 2>(1)

  const openEdit = (p: Project) => setEditProject({ ...p })
  const closeEdit = () => setEditProject(null)

  const editProjectRates = React.useMemo(
    () => (editProject ? getRatesForProject(editProject.id) : []),
    [editProject, getRatesForProject]
  )

  const handleRatesChanged = React.useCallback(
    (newRate?: ProjectRate) => {
      if (!editProject) return

      const ongoing =
        newRate ??
        getRatesForProject(editProject.id).find((r) => r.endDate === null)

      if (ongoing) {
        const hourlyRate = ongoing.hourlyRate
        setEditProject((p) => (p ? { ...p, hourlyRate } : null))
        setProjects((prev) =>
          prev.map((p) =>
            p.id === editProject.id ? { ...p, hourlyRate } : p
          )
        )
      }

      void refetchRates()
    },
    [editProject, getRatesForProject, refetchRates, setProjects]
  )

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editProject?.companyId) return
    try {
      if (supabase) {
        const { error } = await supabase
          .from("projects")
          .update({
            project_name: editProject.projectName,
            start_date: editProject.startDate || null,
            end_date: editProject.endDate || null,
            company_id: editProject.companyId,
          })
          .eq("id", editProject.id)

        if (error) {
          console.error("Failed to update project", error)
          return
        }
      }

      setProjects((prev) =>
        prev.map((p) => (p.id === editProject.id ? editProject : p))
      )
      closeEdit()
    } catch (err) {
      console.error("Failed to update project", err)
    }
  }

  const [newProject, setNewProject] = React.useState<Omit<Project, "id">>({
    projectName: "",
    startDate: "",
    endDate: "",
    hourlyRate: 0,
    company: "",
    companyId: "",
  })

  const companyNameById = React.useMemo(
    () => new Map(companies.map((c) => [c.id, c.name])),
    [companies]
  )

  const openAdd = () => {
    setNewProject({
      projectName: "",
      startDate: "",
      endDate: "",
      hourlyRate: 0,
      company: "",
      companyId: "",
    })
    setAddOpen(true)
  }

  useManageHeaderAction(
    <Button variant="outline" onClick={openAdd}>
      <PlusIcon />
      Add
    </Button>
  )

  const saveAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newProject.projectName.trim() || !newProject.companyId) return
    let created: Project | null = null

    try {
      if (supabase) {
        const { data, error } = await supabase
          .from("projects")
          .insert({
            project_name: newProject.projectName,
            start_date: newProject.startDate || null,
            end_date: newProject.endDate || null,
            hourly_rate: newProject.hourlyRate,
            company_id: newProject.companyId,
          })
          .select(
            `
            id,
            project_name,
            start_date,
            end_date,
            hourly_rate,
            company_id,
            companies (
              name
            )
          `
          )
          .single()

        if (error) {
          console.error("Failed to create project", error)
        } else if (data) {
          const company = data.companies as { name?: string } | null
          created = {
            id: data.id as string,
            projectName: data.project_name as string,
            startDate: data.start_date ?? "",
            endDate: data.end_date ?? "",
            hourlyRate: Number(data.hourly_rate ?? 0),
            company:
              company?.name ??
              companyNameById.get(data.company_id as string) ??
              "",
            companyId: data.company_id as string,
          }

          await supabase.from("project_rates").insert({
            project_id: created.id,
            start_date:
              newProject.startDate ||
              data.start_date ||
              new Date().toISOString().slice(0, 10),
            end_date: null,
            hourly_rate: newProject.hourlyRate,
          })
          void refetchRates()
        }
      }
    } finally {
      setProjects((prev) => [
        ...prev,
        created ?? {
          ...newProject,
          id: String(Date.now()),
        },
      ])
      setAddOpen(false)
    }
  }

  const openDelete = (p: Project) => {
    setDeleteProject(p)
    setDeleteConfirmStep(1)
  }
  const closeDelete = () => {
    setDeleteProject(null)
    setDeleteConfirmStep(1)
  }
  const confirmDeleteStep1 = () => setDeleteConfirmStep(2)
  const confirmDeleteStep2 = () => {
    if (deleteProject) {
      setProjects((prev) => prev.filter((p) => p.id !== deleteProject.id))
      if (supabase) {
        void supabase.from("projects").delete().eq("id", deleteProject.id)
      }
      closeDelete()
    }
  }

  // if (!hasHydrated) {
  //   // Render nothing on the server and on the first client render
  //   // to avoid SSR/client markup mismatches while we rely on
  //   // client-only Supabase data.
  //   return null
  // }

  return (
    <div className="container mx-auto margin-top-5">
      <ProjectsModals
        companies={companies}
        addOpen={addOpen}
        onAddOpenChange={setAddOpen}
        newProject={newProject}
        setNewProject={setNewProject}
        onAddSubmit={saveAdd}
        editProject={editProject}
        onEditClose={closeEdit}
        setEditProject={setEditProject}
        onEditSubmit={saveEdit}
        editProjectRates={editProjectRates}
        onInsertRate={insertRate}
        onUpdateRate={updateRate}
        onDeleteRate={deleteRate}
        onRatesChanged={handleRatesChanged}
        deleteProject={deleteProject}
        deleteConfirmStep={deleteConfirmStep}
        onDeleteBackToStep1={confirmDeleteStep1}
        onDeleteConfirm={confirmDeleteStep2}
        onDeleteClose={closeDelete}
      />
      {error && (
        <p className="mb-2 text-sm text-destructive">
          Failed to load projects from Supabase: {error}
        </p>
      )}
      <ProjectsTable projects={projects} onEdit={openEdit} onDelete={openDelete} />
    </div>
  )
}
