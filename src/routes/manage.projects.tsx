"use client"

import * as React from "react"
import { createFileRoute } from "@tanstack/react-router"
import { PlusIcon } from "lucide-react"
import type { Project } from "@/lib/hooks/useProjects"
import type { ProjectRow } from "@/lib/projects"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabaseClient"
import { useCompanies } from "@/lib/hooks/useCompanies"
import { useProjects } from "@/lib/hooks/useProjects"
import {
  emptyProjectForm,
  toProject,
  toProjectMutation,
} from "@/lib/projects"
import { ProjectsTable } from "@/components/projects/projects-table"
import { ProjectsModals } from "@/components/projects/projects-modals"
import { useManageHeaderAction } from "@/components/manage-header-action"

export const Route = createFileRoute("/manage/projects")({
  component: ManageProjectsPage,
})

function ManageProjectsPage() {
  const { projects, setProjects, error: loadError } = useProjects()
  const { companies } = useCompanies()
  const [addOpen, setAddOpen] = React.useState(false)
  const [editProject, setEditProject] = React.useState<Project | null>(null)
  const [deleteProject, setDeleteProject] = React.useState<Project | null>(null)
  const [deleteConfirmStep, setDeleteConfirmStep] = React.useState<1 | 2>(1)
  const [projectError, setProjectError] = React.useState<string | null>(null)

  const companyNameById = React.useMemo(
    () => new Map(companies.map((company) => [company.id, company.name])),
    [companies],
  )

  const openEdit = (p: Project) => {
    setProjectError(null)
    setEditProject({ ...p })
  }
  const closeEdit = () => {
    setProjectError(null)
    setEditProject(null)
  }

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editProject) return
    const payload = toProjectMutation(editProject)

    if (!payload) {
      setProjectError("Enter a project name and select a company.")
      return
    }

    let updated = editProject

    if (supabase) {
      const { data, error: updateError } = await supabase
        .from("projects")
        .update(payload)
        .eq("id", editProject.id)
        .select("*, company:companies(name)")
        .single()

      if (updateError) {
        console.error("Failed to update project", updateError)
        setProjectError(updateError.message)
        return
      }

      if (data) {
        updated = toProject(data as ProjectRow, companyNameById)
      }
    }

    setProjects((prev) =>
      prev.map((p) => (p.id === editProject.id ? updated : p)),
    )
    closeEdit()
  }

  const [newProject, setNewProject] =
    React.useState<Omit<Project, "id">>(emptyProjectForm)

  const openAdd = () => {
    setProjectError(null)
    setNewProject(emptyProjectForm())
    setAddOpen(true)
  }

  const handleAddOpenChange = (open: boolean) => {
    if (!open) {
      setProjectError(null)
    }
    setAddOpen(open)
  }

  useManageHeaderAction(
    <Button variant="outline" onClick={openAdd}>
      <PlusIcon />
      Add
    </Button>
  )

  const saveAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = toProjectMutation(newProject)

    if (!payload) {
      setProjectError("Enter a project name and select a company.")
      return
    }

    let created: Project = {
      ...newProject,
      projectName: payload.project_name,
      id: String(Date.now()),
    }

    if (supabase) {
      const { data, error: insertError } = await supabase
        .from("projects")
        .insert(payload)
        .select("*, company:companies(name)")
        .single()

      if (insertError) {
        console.error("Failed to create project", insertError)
        setProjectError(insertError.message)
        return
      }

      if (data) {
        created = toProject(data as ProjectRow, companyNameById)
      }
    }

    setProjects((prev) => [...prev, created])
    setProjectError(null)
    setAddOpen(false)
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
        onAddOpenChange={handleAddOpenChange}
        newProject={newProject}
        setNewProject={setNewProject}
        onAddSubmit={saveAdd}
        projectError={projectError}
        editProject={editProject}
        onEditClose={closeEdit}
        setEditProject={setEditProject}
        onEditSubmit={saveEdit}
        deleteProject={deleteProject}
        deleteConfirmStep={deleteConfirmStep}
        onDeleteBackToStep1={confirmDeleteStep1}
        onDeleteConfirm={confirmDeleteStep2}
        onDeleteClose={closeDelete}
      />
      {loadError && (
        <p className="mb-2 text-sm text-destructive">
          Failed to load projects from Supabase: {loadError}
        </p>
      )}
      <ProjectsTable projects={projects} onEdit={openEdit} onDelete={openDelete} />
    </div>
  )
}
