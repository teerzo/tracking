"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Company } from "@/lib/hooks/useCompanies"

interface CompaniesTableProps {
  companies: Company[]
  onEdit: (company: Company) => void
  onDelete: (company: Company) => void
}

export function CompaniesTable({ companies, onEdit, onDelete }: CompaniesTableProps) {
  if (companies.length === 0) {
    return (
      <p className="mb-2 text-sm text-muted-foreground">
        No companies found. Use the Add button above to create your first company.
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
            <th>Name</th>
            <th>Address</th>
            <th>ABN</th>
            <th>Phone</th>
            <th>Email</th>
            <th aria-label="Actions" className="w-24" />
          </tr>
        </thead>
        <tbody>
          {companies.map((c) => (
            <tr key={c.id}>
              <td>{c.name}</td>
              <td>{c.address}</td>
              <td>{c.abn}</td>
              <td>{c.phone}</td>
              <td>{c.email}</td>
              <td>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => onEdit(c)}>
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(c)}
                    className="text-destructive hover:text-destructive"
                  >
                    Delete
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
