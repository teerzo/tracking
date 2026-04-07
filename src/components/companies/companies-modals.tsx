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
import type { Company } from "@/lib/hooks/useCompanies"

interface CompaniesModalsProps {
  // Add
  addOpen: boolean
  onAddOpenChange: (open: boolean) => void
  newCompany: Omit<Company, "id">
  setNewCompany: React.Dispatch<React.SetStateAction<Omit<Company, "id">>>
  onAddSubmit: (e: React.FormEvent) => void

  // Edit
  editCompany: Company | null
  onEditClose: () => void
  setEditCompany: React.Dispatch<React.SetStateAction<Company | null>>
  onEditSubmit: (e: React.FormEvent) => void

  // Delete
  deleteCompany: Company | null
  deleteConfirmStep: 1 | 2
  onDeleteBackToStep1: () => void
  onDeleteConfirm: () => void
  onDeleteClose: () => void
}

export function CompaniesModals(props: CompaniesModalsProps) {
  const {
    addOpen,
    onAddOpenChange,
    newCompany,
    setNewCompany,
    onAddSubmit,
    editCompany,
    onEditClose,
    setEditCompany,
    onEditSubmit,
    deleteCompany,
    deleteConfirmStep,
    onDeleteBackToStep1,
    onDeleteConfirm,
    onDeleteClose,
  } = props

  return (
    <>
      {/* Add company */}
      <Dialog open={addOpen} onOpenChange={onAddOpenChange}>
        <DialogContent className="max-w-sm">
          <form onSubmit={onAddSubmit}>
            <DialogHeader>
              <DialogTitle>Add company</DialogTitle>
            </DialogHeader>
            <FieldGroup className="gap-4 py-4">
              <Field>
                <FieldLabel htmlFor="add-company-name">Name</FieldLabel>
                <Input
                  id="add-company-name"
                  value={newCompany.name}
                  onChange={(e) =>
                    setNewCompany((c) => ({ ...c, name: e.target.value }))
                  }
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="add-company-address">Address</FieldLabel>
                <Input
                  id="add-company-address"
                  value={newCompany.address}
                  onChange={(e) =>
                    setNewCompany((c) => ({ ...c, address: e.target.value }))
                  }
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="add-company-abn">ABN</FieldLabel>
                <Input
                  id="add-company-abn"
                  value={newCompany.abn}
                  onChange={(e) =>
                    setNewCompany((c) => ({ ...c, abn: e.target.value }))
                  }
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="add-company-phone">Phone</FieldLabel>
                <Input
                  id="add-company-phone"
                  type="tel"
                  value={newCompany.phone}
                  onChange={(e) =>
                    setNewCompany((c) => ({ ...c, phone: e.target.value }))
                  }
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="add-company-email">Email</FieldLabel>
                <Input
                  id="add-company-email"
                  type="email"
                  value={newCompany.email}
                  onChange={(e) =>
                    setNewCompany((c) => ({ ...c, email: e.target.value }))
                  }
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="add-company-contact-name">Contact name</FieldLabel>
                <Input
                  id="add-company-contact-name"
                  value={newCompany.contactName}
                  onChange={(e) =>
                    setNewCompany((c) => ({ ...c, contactName: e.target.value }))
                  }
                />
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

      {/* Edit company */}
      <Dialog open={!!editCompany} onOpenChange={(open) => !open && onEditClose()}>
        <DialogContent className="max-w-sm">
          <form onSubmit={onEditSubmit}>
            <DialogHeader>
              <DialogTitle>Edit company</DialogTitle>
            </DialogHeader>
            {editCompany && (
              <FieldGroup className="gap-4 py-4">
                <Field>
                  <FieldLabel htmlFor="edit-company-name">Name</FieldLabel>
                  <Input
                    id="edit-company-name"
                    value={editCompany.name}
                    onChange={(e) =>
                      setEditCompany((c) =>
                        c ? { ...c, name: e.target.value } : null,
                      )
                    }
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="edit-company-address">Address</FieldLabel>
                  <Input
                    id="edit-company-address"
                    value={editCompany.address}
                    onChange={(e) =>
                      setEditCompany((c) =>
                        c ? { ...c, address: e.target.value } : null,
                      )
                    }
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="edit-company-abn">ABN</FieldLabel>
                  <Input
                    id="edit-company-abn"
                    value={editCompany.abn}
                    onChange={(e) =>
                      setEditCompany((c) =>
                        c ? { ...c, abn: e.target.value } : null,
                      )
                    }
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="edit-company-phone">Phone</FieldLabel>
                  <Input
                    id="edit-company-phone"
                    type="tel"
                    value={editCompany.phone}
                    onChange={(e) =>
                      setEditCompany((c) =>
                        c ? { ...c, phone: e.target.value } : null,
                      )
                    }
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="edit-company-email">Email</FieldLabel>
                  <Input
                    id="edit-company-email"
                    type="email"
                    value={editCompany.email}
                    onChange={(e) =>
                      setEditCompany((c) =>
                        c ? { ...c, email: e.target.value } : null,
                      )
                    }
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="edit-company-contact-name">Contact name</FieldLabel>
                  <Input
                    id="edit-company-contact-name"
                    value={editCompany.contactName}
                    onChange={(e) =>
                      setEditCompany((c) =>
                        c ? { ...c, contactName: e.target.value } : null,
                      )
                    }
                  />
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

      {/* Delete company */}
      <Dialog
        open={!!deleteCompany}
        onOpenChange={(open) => {
          if (!open) onDeleteClose()
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {deleteCompany && deleteConfirmStep === 1
                ? "Delete company?"
                : "Permanently delete?"}
            </DialogTitle>
          </DialogHeader>
          {deleteCompany && (
            <p className="text-muted-foreground text-sm">
              {deleteConfirmStep === 1 ? (
                <>Are you sure you want to delete &quot;{deleteCompany.name}&quot;?</>
              ) : (
                <>This action cannot be undone. The company will be permanently removed.</>
              )}
            </p>
          )}
          <DialogFooter>
            {deleteCompany && deleteConfirmStep === 2 ? (
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
