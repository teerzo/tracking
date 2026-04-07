"use client"

import * as React from "react"
import { useNavigate } from "@tanstack/react-router"
import { supabase } from "@/lib/supabaseClient"

export interface CurrentUserProfile {
  givenName: string | null
  familyName: string | null
}

export function useUser() {
  const navigate = useNavigate()
  const [profile, setProfile] = React.useState<CurrentUserProfile | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const load = async () => {
      if (!supabase) {
        setLoading(false)
        return
      }
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error?.status === 403) {
        navigate({
          to: "/login",
          search: { redirect: window.location.pathname },
        })
        setLoading(false)
        return
      }
      if (!user) {
        setProfile(null)
        setLoading(false)
        return
      }
      const { data: row } = await supabase
        .from("users")
        .select("given_name, family_name")
        .eq("id", user.id)
        .single()
      setProfile({
        givenName: row?.given_name ?? null,
        familyName: row?.family_name ?? null,
      })
      setLoading(false)
    }
    void load()
  }, [])

  const displayName =
    profile?.givenName || profile?.familyName
      ? [profile?.givenName, profile?.familyName].filter(Boolean).join(" ")
      : null

  return { profile, displayName, loading }
}
