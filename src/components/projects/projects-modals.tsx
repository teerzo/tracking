"use client"

import * as React from "react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Company } from "@/lib/hooks/useCompanies"
import type { Project } from "@/lib/hooks/useProjects"

const EMPTY_COMPANY_VALUE = "__none__"

interface ProjectsModalsProps {
  companies: Company[]
  // Add
  addOpen: boolean
  onAddOpenChange: (open: boolean) => void
  newProject: Omit<Project, "id">
  setNewProject: React.Dispatch<React.SetStateAction<Omit<Project, "id">>>
  onAddSubmit: (e: React.FormEvent) => void

  // Edit
  editProject: Project | null
  onEditClose: () => void
  setEditProject: React.Dispatch<React.SetStateAction<Project | null>>
  onEditSubmit: (e: React.FormEvent) => void

  // Delete
  deleteProject: Project | null
  deleteConfirmStep: 1 | 2
  onDeleteBackToStep1: () => void
  onDeleteConfirm: () => void
  onDeleteClose: () => void
}

export function ProjectsModals(props: ProjectsModalsProps) {
  const {
    companies,
    addOpen,
    onAddOpenChange,
    newProject,
    setNewProject,
    onAddSubmit,
    editProject,
    onEditClose,
    setEditProject,
    onEditSubmit,
    deleteProject,
    deleteConfirmStep,
    onDeleteBackToStep1,
    onDeleteConfirm,
    onDeleteClose,
  } = props

  return (
    <>
      {/* Add project */}
      <Dialog open={addOpen} onOpenChange={onAddOpenChange}>
        <DialogContent className="max-h-[85vh] max-w-sm overflow-y-auto">
          <form onSubmit={onAddSubmit}>
            <DialogHeader>
              <DialogTitle>Add project</DialogTitle>
            </DialogHeader>
            <FieldGroup className="gap-4 py-4">
              <Field>
                <FieldLabel htmlFor="add-project-name">Project name</FieldLabel>
                <Input
                  id="add-project-name"
                  value={newProject.projectName}
                  onChange={(e) =>
                    setNewProject((p) => ({ ...p, projectName: e.target.value }))
                  }
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="add-start-date">Start date</FieldLabel>
                <Input
                  id="add-start-date"
                  type="date"
                  value={newProject.startDate}
                  onChange={(e) =>
                    setNewProject((p) => ({ ...p, startDate: e.target.value }))
                  }
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="add-end-date">End date</FieldLabel>
                <Input
                  id="add-end-date"
                  type="date"
                  value={newProject.endDate}
                  onChange={(e) =>
                    setNewProject((p) => ({ ...p, endDate: e.target.value }))
                  }
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="add-hourly-rate">Hourly rate</FieldLabel>
                <Input
                  id="add-hourly-rate"
                  type="number"
                  min={0}
                  value={newProject.hourlyRate || ""}
                  onChange={(e) =>
                    setNewProject((p) => ({
                      ...p,
                      hourlyRate: Number(e.target.value) || 0,
                    }))
                  }
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="add-company">Company</FieldLabel>
                <Select
                  value={newProject.company || EMPTY_COMPANY_VALUE}
                  onValueChange={(value) =>
                    setNewProject((p) => ({
                      ...p,
                      company: value === EMPTY_COMPANY_VALUE ? "" : value,
                    }))
                  }
                >
                  <SelectTrigger id="add-company" className="w-full">
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={EMPTY_COMPANY_VALUE}>
                      —
                    </SelectItem>
                    {companies.map((c) => (
                      <SelectItem key={c.id} value={c.name}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </FieldGroup>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onAddOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                <span>Add</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit project */}
      <Dialog open={!!editProject} onOpenChange={(open) => !open && onEditClose()}>
        <DialogContent className="max-h-[85vh] max-w-sm overflow-y-auto">
          <form onSubmit={onEditSubmit}>
            <DialogHeader>
              <DialogTitle>Edit project</DialogTitle>
            </DialogHeader>
            {editProject && (
              <FieldGroup className="gap-4 py-4">
                <Field>
                  <FieldLabel htmlFor="edit-project-name">Project name</FieldLabel>
                  <Input
                    id="edit-project-name"
                    value={editProject.projectName}
                    onChange={(e) =>
                      setEditProject((p) =>
                        p ? { ...p, projectName: e.target.value } : null,
                      )
                    }
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="edit-start-date">Start date</FieldLabel>
                  <Input
                    id="edit-start-date"
                    type="date"
                    value={editProject.startDate}
                    onChange={(e) =>
                      setEditProject((p) =>
                        p ? { ...p, startDate: e.target.value } : null,
                      )
                    }
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="edit-end-date">End date</FieldLabel>
                  <Input
                    id="edit-end-date"
                    type="date"
                    value={editProject.endDate}
                    onChange={(e) =>
                      setEditProject((p) =>
                        p ? { ...p, endDate: e.target.value } : null,
                      )
                    }
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="edit-hourly-rate">Hourly rate</FieldLabel>
                  <Input
                    id="edit-hourly-rate"
                    type="number"
                    min={0}
                    value={editProject.hourlyRate}
                    onChange={(e) =>
                      setEditProject((p) =>
                        p ? { ...p, hourlyRate: Number(e.target.value) || 0 } : null,
                      )
                    }
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="edit-company">Company</FieldLabel>
                  <Select
                    value={editProject.company || EMPTY_COMPANY_VALUE}
                    onValueChange={(value) =>
                      setEditProject((p) =>
                        p
                          ? {
                              ...p,
                              company:
                                value === EMPTY_COMPANY_VALUE ? "" : value,
                            }
                          : null,
                      )
                    }
                  >
                    <SelectTrigger id="edit-company" className="w-full">
                      <SelectValue placeholder="Select company" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={EMPTY_COMPANY_VALUE}>
                        —
                      </SelectItem>
                      {companies.map((c) => (
                        <SelectItem key={c.id} value={c.name}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </FieldGroup>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onEditClose}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete project */}
      <Dialog
        open={!!deleteProject}
        onOpenChange={(open) => {
          if (!open) onDeleteClose()
        }}
      >
        <DialogContent className="max-h-[85vh] max-w-sm overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {deleteProject && deleteConfirmStep === 1
                ? "Delete project?"
                : "Permanently delete?"}
            </DialogTitle>
          </DialogHeader>
          {deleteProject && (
            <p className="text-muted-foreground text-sm">
              {deleteConfirmStep === 1 ? (
                <>Are you sure you want to delete &quot;{deleteProject.projectName}&quot;?</>
              ) : (
                <>This action cannot be undone. The project will be permanently removed.</>
              )}
            </p>
          )}
          <DialogFooter>
            {deleteProject && deleteConfirmStep === 2 ? (
              <>
                <Button variant="outline" onClick={onDeleteBackToStep1}>
                  Back
                </Button>
                <Button variant="destructive" onClick={onDeleteConfirm}>
                  Delete permanently
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={onDeleteClose}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={onDeleteBackToStep1}>
                  Continue
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

