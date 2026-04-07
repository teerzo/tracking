"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Invoice } from "@/lib/hooks/useInvoices"
import { EyeIcon, Trash2Icon } from "lucide-react"

interface InvoicesTableProps {
  invoices: Invoice[]
  onView?: (invoice: Invoice) => void
  onDelete?: (invoice: Invoice) => void
}

function formatDate(s: string) {
  if (!s) return "—"
  try {
    return new Date(s).toLocaleDateString()
  } catch {
    return s
  }
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(n)
}

export function InvoicesTable({ invoices, onView, onDelete }: InvoicesTableProps) {
  if (invoices.length === 0) {
    return (
      <p className="mb-2 text-sm text-muted-foreground">
        No invoices yet. Generate an invoice from the home page to save one here.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table
        className={cn(
          "w-full text-sm",
          "[&_th]:font-medium [&_th]:text-muted-foreground [&_th]:text-start [&_th]:ps-4 [&_th]:pe-4 [&_th]:py-3 [&_th]:bg-muted/50",
          "[&_td]:ps-4 [&_td]:pe-4 [&_td]:py-3 [&_td]:border-t",
        )}
      >
        <thead>
          <tr>
            <th>Invoice number</th>
            <th>Period start</th>
            <th>Period end</th>
            <th>Total hours</th>
            <th>Total amount</th>
            <th>Created at</th>
            {(onView || onDelete) && <th aria-label="Actions" className="w-40" />}
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv) => (
            <tr key={inv.id}>
              <td>{inv.invoiceNumber || "—"}</td>
              <td>{formatDate(inv.periodStart)}</td>
              <td>{formatDate(inv.periodEnd)}</td>
              <td>{inv.totalHours.toFixed(2)}</td>
              <td>{formatCurrency(inv.totalAmount)}</td>
              <td>{formatDate(inv.createdAt)}</td>
              {(onView || onDelete) && (
                <td>
                  <div className="flex items-center gap-2">
                    {onView && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onView(inv)}
                        aria-label="View invoice"
                      >
                        <EyeIcon className="size-4" />
                        View
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(inv)}
                        aria-label="Delete invoice"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2Icon className="size-4" />
                        Delete
                      </Button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
