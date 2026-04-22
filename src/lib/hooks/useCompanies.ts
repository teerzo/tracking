"use client"

import * as React from "react"
import { supabase } from "@/lib/supabaseClient"

export interface Company {
  id: string
  name: string
  address: string
  abn: string
  phone: string
  email: string
  contactName: string
  billingEmail: string
  billingContact: string
  remoteOnly: boolean
  distance: string
}

export function useCompanies() {
  const [companies, setCompanies] = React.useState<Company[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const fetchCompanies = async () => {
      if (!supabase) {
        setLoading(false)
        return
      }
      setLoading(true)
      setError(null)
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .order("name", { ascending: true })

      if (error) {
        setError(error.message)
        setCompanies([])
      } else if (data) {
        const mapped = data.map((row: any) => ({
          id: row.id as string,
          name: row.name ?? "",
          address: row.address ?? "",
          abn: row.abn ?? "",
          phone: row.phone ?? "",
          email: row.email ?? "",
          contactName: row.contact_name ?? "",
          billingEmail: row.billing_email ?? "",
          billingContact: row.billing_contact ?? "",
          remoteOnly: row.remote_only ?? false,
          distance: row.distance ?? "",
        }))
        setCompanies(mapped)
      }
      setLoading(false)
    }

    void fetchCompanies()
  }, [])

  return { companies, setCompanies, loading, error }
}
