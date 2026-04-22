"use client"

import * as React from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useInvoices, type Invoice } from "@/lib/hooks/useInvoices"
import { useTimeEntries } from "@/lib/hooks/useTimeEntries"
import { useProjects } from "@/lib/hooks/useProjects"
import { InvoicesTable } from "@/components/invoices/invoices-table"
import { InvoiceDialog } from "@/components/time-tracking/invoice-dialog"
import { useManageHeaderAction } from "@/components/manage-header-action"
import {
  filterEntriesByDateRange,
  aggregateEntriesForInvoice,
} from "@/lib/time-tracking"
import { buildInvoiceHtml, openInvoicePdf } from "@/lib/build-invoice-html"
import { supabase } from "@/lib/supabaseClient"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export const Route = createFileRoute("/manage/invoices")({
  component: ManageInvoicesPage,
})

function ManageInvoicesPage() {
  const { invoices, setInvoices, loading, error } = useInvoices()
  const { entries } = useTimeEntries()
  const { projects } = useProjects()
  const today = React.useMemo(() => new Date().toISOString().slice(0, 10), [])
  const projectsForHeader = React.useMemo(
    () =>
      projects.map((p) => ({
        id: p.id,
        name: p.projectName,
        hourlyRate: p.hourlyRate,
        companyId: p.companyId,
      })),
    [projects]
  )
  const [deleteInvoice, setDeleteInvoice] = React.useState<Invoice | null>(null)
  const [deleteConfirmStep, setDeleteConfirmStep] = React.useState<1 | 2>(1)

  useManageHeaderAction(
    <InvoiceDialog
      projects={projectsForHeader}
      entries={entries}
      selectedDateStr={today}
    />
  )

  const openDelete = (inv: Invoice) => {
    setDeleteInvoice(inv)
    setDeleteConfirmStep(1)
  }
  const closeDelete = () => {
    setDeleteInvoice(null)
    setDeleteConfirmStep(1)
  }
  const confirmDeleteStep1 = () => setDeleteConfirmStep(2)
  const onDeleteBackToStep1 = () => setDeleteConfirmStep(1)
  const confirmDeleteStep2 = () => {
    if (deleteInvoice) {
      setInvoices((prev) => prev.filter((inv) => inv.id !== deleteInvoice.id))
      if (supabase) {
        void supabase.from("invoices").delete().eq("id", deleteInvoice.id)
      }
      closeDelete()
    }
  }

  const handleView = React.useCallback(
    async (inv: Invoice) => {
      let chargeGst = false
      let gstAmount = 10

      if (supabase) {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser()
        if (authUser?.id) {
          const { data: settingsRow } = await supabase
            .from("user_settings")
            .select("charge_gst, gst_amount")
            .eq("user_id", authUser.id)
            .maybeSingle()
          if (settingsRow) {
            chargeGst = settingsRow.charge_gst ?? false
            gstAmount = Number(settingsRow.gst_amount ?? 10)
          }
        }
      }

      const projectsForInvoice = projects.map((p) => ({
        id: p.id,
        name: p.projectName,
        hourlyRate: p.hourlyRate,
        companyId: p.companyId,
      }))
      const filtered = filterEntriesByDateRange(
        entries,
        inv.periodStart,
        inv.periodEnd
      )
      const summary = aggregateEntriesForInvoice(filtered, projectsForInvoice)

      if (summary.lines.length === 0) {
        const subtotal = chargeGst
          ? Math.round(
              (inv.totalAmount / (1 + gstAmount / 100)) * 100
            ) / 100
          : inv.totalAmount
        summary.lines.push({
          projectId: "",
          projectName: "No project breakdown available",
          hourlyRate: 0,
          hours: inv.totalHours,
          amount: subtotal,
        })
        summary.totalHours = inv.totalHours
        summary.totalAmount = subtotal
      }

      let userData: {
        address?: string
        mobile?: string
        email?: string
        billing_email?: string | null
        abn?: string
        account_number?: string
        bsb?: string
      } | null = null
      let companyData: {
        name?: string
        address?: string
        email?: string
        abn?: string
      } | null = null

      if (supabase) {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser()
        if (authUser?.id) {
          const { data: userRow } = await supabase
            .from("users")
            .select(
              "address, mobile, email, billing_email, abn, account_number, bsb"
            )
            .eq("id", authUser.id)
            .single()
          userData = userRow ?? null
        }

        const firstProjectId = summary.lines[0]?.projectId
        const firstProject = projects.find((p) => p.id === firstProjectId)
        const companyId = firstProject?.companyId
        if (companyId) {
          const { data: companyRow } = await supabase
            .from("companies")
            .select("name, address, email, abn")
            .eq("id", companyId)
            .single()
          companyData = companyRow ?? null
        }
      }

      const createdDate = inv.createdAt
        ? new Date(inv.createdAt).toISOString().slice(0, 10)
        : inv.periodStart
      const invoiceDate = createdDate
      const dueDate = new Date(
        new Date(createdDate).getTime() + 14 * 24 * 60 * 60 * 1000
      )
        .toISOString()
        .slice(0, 10)
      const invoiceNumber = inv.invoiceNumber || invoiceDate.replace(/-/g, "")

      const html = buildInvoiceHtml({
        summary,
        start: inv.periodStart,
        end: inv.periodEnd,
        invoiceNumber,
        invoiceDate,
        invoiceDueDate: dueDate,
        user: userData,
        company: companyData,
        chargeGst,
        gstAmount,
      })
      openInvoicePdf(html, { printAndClose: true })
    },
    [entries, projects]
  )

  return (
    <div>
      {error && (
        <p className="mb-2 text-sm text-destructive">{error}</p>
      )}
      {loading ? (
        <p className="text-muted-foreground">Loading invoices…</p>
      ) : (
        <InvoicesTable
          invoices={invoices}
          onView={handleView}
          onDelete={openDelete}
        />
      )}

      <Dialog
        open={!!deleteInvoice}
        onOpenChange={(open) => {
          if (!open) closeDelete()
        }}
      >
        <DialogContent className="max-h-[85vh] max-w-sm overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {deleteInvoice && deleteConfirmStep === 1
                ? "Delete invoice?"
                : "Permanently delete?"}
            </DialogTitle>
          </DialogHeader>
          {deleteInvoice && (
            <p className="text-muted-foreground text-sm">
              {deleteConfirmStep === 1 ? (
                <>
                  Are you sure you want to delete invoice{" "}
                  &quot;{deleteInvoice.invoiceNumber || deleteInvoice.id}&quot;?
                </>
              ) : (
                <>
                  This action cannot be undone. The invoice will be permanently
                  removed.
                </>
              )}
            </p>
          )}
          <DialogFooter>
            {deleteInvoice && deleteConfirmStep === 2 ? (
              <>
                <Button variant="outline" onClick={onDeleteBackToStep1}>
                  Back
                </Button>
                <Button variant="destructive" onClick={confirmDeleteStep2}>
                  Delete permanently
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={closeDelete}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={confirmDeleteStep1}>
                  Continue
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
