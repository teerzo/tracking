"use client"

import * as React from "react"
import { createFileRoute } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import { useCompanies, type Company } from "@/lib/hooks/useCompanies"
import { CompaniesTable } from "@/components/companies/companies-table"
import { CompaniesModals } from "@/components/companies/companies-modals"
import { useManageHeaderAction } from "@/components/manage-header-action"

export const Route = createFileRoute("/manage/companies")({
  component: ManageCompaniesPage,
})

function ManageCompaniesPage() {
  const { companies, setCompanies, error } = useCompanies()
  const [addOpen, setAddOpen] = React.useState(false)
  const [editCompany, setEditCompany] = React.useState<Company | null>(null)
  const [deleteCompany, setDeleteCompany] = React.useState<Company | null>(null)
  const [deleteConfirmStep, setDeleteConfirmStep] = React.useState<1 | 2>(1)

  const openEdit = (c: Company) => setEditCompany({ ...c })
  const closeEdit = () => setEditCompany(null)

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editCompany) return
    try {
      if (supabase) {
        const { error } = await supabase
          .from("companies")
          .update({
            name: editCompany.name,
            address: editCompany.address || null,
            abn: editCompany.abn || null,
            phone: editCompany.phone || null,
            email: editCompany.email || null,
            contact_name: editCompany.contactName || null,
            billing_email: editCompany.billingEmail || null,
            billing_contact: editCompany.billingContact || null,
            remote_only: editCompany.remoteOnly,
            distance: editCompany.distance || null,
          })
          .eq("id", editCompany.id)

        if (error) {
          console.error("Failed to update company", error)
        }
      }
    } finally {
      setCompanies((prev) =>
        prev.map((c) => (c.id === editCompany.id ? editCompany : c))
      )
      closeEdit()
    }
  }

  const [newCompany, setNewCompany] = React.useState<Omit<Company, "id">>({
    name: "",
    address: "",
    abn: "",
    phone: "",
    email: "",
    contactName: "",
    billingEmail: "",
    billingContact: "",
    remoteOnly: false,
    distance: "",
  })

  const openAdd = () => {
    setNewCompany({
      name: "",
      address: "",
      abn: "",
      phone: "",
      email: "",
      contactName: "",
      billingEmail: "",
      billingContact: "",
      remoteOnly: false,
      distance: "",
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
    if (!newCompany.name.trim()) return
    let created: Company | null = null

    try {
      if (supabase) {
        const { data, error } = await supabase
          .from("companies")
          .insert({
            name: newCompany.name,
            address: newCompany.address || null,
            abn: newCompany.abn || null,
            phone: newCompany.phone || null,
            email: newCompany.email || null,
            contact_name: newCompany.contactName || null,
            billing_email: newCompany.billingEmail || null,
            billing_contact: newCompany.billingContact || null,
            remote_only: newCompany.remoteOnly,
            distance: newCompany.distance || null,
          })
          .select("*")
          .single()

        if (error) {
          console.error("Failed to create company", error)
        } else if (data) {
          created = {
            id: data.id as string,
            name: data.name ?? "",
            address: data.address ?? "",
            abn: data.abn ?? "",
            phone: data.phone ?? "",
            email: data.email ?? "",
            contactName: data.contact_name ?? "",
            billingEmail: data.billing_email ?? "",
            billingContact: data.billing_contact ?? "",
            remoteOnly: data.remote_only ?? false,
            distance: data.distance ?? "",
          }
        }
      }
    } finally {
      setCompanies((prev) => [
        ...prev,
        created ?? {
          ...newCompany,
          id: String(Date.now()),
        },
      ])
      setAddOpen(false)
    }
  }

  const openDelete = (c: Company) => {
    setDeleteCompany(c)
    setDeleteConfirmStep(1)
  }
  const closeDelete = () => {
    setDeleteCompany(null)
    setDeleteConfirmStep(1)
  }
  const confirmDeleteStep1 = () => setDeleteConfirmStep(2)
  const confirmDeleteStep2 = () => {
    if (deleteCompany) {
      setCompanies((prev) => prev.filter((c) => c.id !== deleteCompany.id))
      if (supabase) {
        void supabase.from("companies").delete().eq("id", deleteCompany.id)
      }
      closeDelete()
    }
  }

  return (
    <div>
      <CompaniesModals
        addOpen={addOpen}
        onAddOpenChange={setAddOpen}
        newCompany={newCompany}
        setNewCompany={setNewCompany}
        onAddSubmit={saveAdd}
        editCompany={editCompany}
        onEditClose={closeEdit}
        setEditCompany={setEditCompany}
        onEditSubmit={saveEdit}
        deleteCompany={deleteCompany}
        deleteConfirmStep={deleteConfirmStep}
        onDeleteBackToStep1={confirmDeleteStep1}
        onDeleteConfirm={confirmDeleteStep2}
        onDeleteClose={closeDelete}
      />
      {error && (
        <p className="mb-2 text-sm text-destructive">
          Failed to load companies from Supabase: {error}
        </p>
      )}
      <CompaniesTable companies={companies} onEdit={openEdit} onDelete={openDelete} />
    </div>
  )
}
