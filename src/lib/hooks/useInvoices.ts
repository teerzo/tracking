"use client"

import * as React from "react"
import { supabase } from "@/lib/supabaseClient"

export interface Invoice {
  id: string
  invoiceNumber: string
  periodStart: string
  periodEnd: string
  totalHours: number
  totalAmount: number
  status: "draft" | "sent" | "paid"
  createdAt: string
}

export function useInvoices() {
  const [invoices, setInvoices] = React.useState<Invoice[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const fetchInvoices = async () => {
      if (!supabase) {
        setLoading(false)
        return
      }
      setLoading(true)
      setError(null)
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        setError(error.message)
        setInvoices([])
      } else if (data) {
        setInvoices(
          data.map((row: Record<string, unknown>) => ({
            id: row.id as string,
            invoiceNumber: (row.invoice_number as string) ?? "",
            periodStart: (row.period_start as string) ?? "",
            periodEnd: (row.period_end as string) ?? "",
            totalHours: Number(row.total_hours ?? 0),
            totalAmount: Number(row.total_amount ?? 0),
            status: (row.status as Invoice["status"]) ?? "draft",
            createdAt: (row.created_at as string) ?? "",
          }))
        )
      }
      setLoading(false)
    }

    void fetchInvoices()
  }, [])

  return { invoices, setInvoices, loading, error }
}
