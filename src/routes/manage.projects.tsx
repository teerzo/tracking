"use client"

import * as React from "react"
import { createFileRoute } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import { useCompanies } from "@/lib/hooks/useCompanies"
import { useProjects, type Project } from "@/lib/hooks/useProjects"
import { ProjectsTable } from "@/components/projects/projects-table"
import { ProjectsModals } from "@/components/projects/projects-modals"
import { useManageHeaderAction } from "@/components/manage-header-action"

export const Route = createFileRoute("/manage/projects")({
  component: ManageProjectsPage,
})

function ManageProjectsPage() {
  const { projects, setProjects, error } = useProjects()
  const { companies } = useCompanies()
  const [addOpen, setAddOpen] = React.useState(false)
  const [editProject, setEditProject] = React.useState<Project | null>(null)
  const [deleteProject, setDeleteProject] = React.useState<Project | null>(null)
  const [deleteConfirmStep, setDeleteConfirmStep] = React.useState<1 | 2>(1)

  const openEdit = (p: Project) => setEditProject({ ...p })
  const closeEdit = () => setEditProject(null)

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editProject) return
    try {
      if (supabase) {
        const { error } = await supabase
          .from("projects")
          .update({
            project_name: editProject.projectName,
            start_date: editProject.startDate || null,
            end_date: editProject.endDate || null,
            hourly_rate: editProject.hourlyRate,
            company: editProject.company,
          })
          .eq("id", editProject.id)

        if (error) {
          console.error("Failed to update project", error)
        }
      }
    } finally {
      setProjects((prev) =>
        prev.map((p) => (p.id === editProject.id ? editProject : p))
      )
      closeEdit()
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
      Add project
    </Button>
  )

  const saveAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newProject.projectName.trim()) return
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
            company: newProject.company,
          })
          .select("*")
          .single()

        if (error) {
          console.error("Failed to create project", error)
        } else if (data) {
          created = {
            id: data.id as string,
            projectName: data.project_name as string,
            startDate: data.start_date ?? "",
            endDate: data.end_date ?? "",
            hourlyRate: Number(data.hourly_rate ?? 0),
            company: data.company ?? "",
            companyId: data.company_id ?? "",
          }
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
