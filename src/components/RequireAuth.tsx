"use client"

import * as React from "react"
import { useLocation, useNavigate } from "@tanstack/react-router"
import { useAuth } from "@/lib/AuthProvider"

interface RequireAuthProps {
  children: React.ReactNode
}

export function RequireAuth({ children }: RequireAuthProps) {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  React.useEffect(() => {
    if (loading) return
    if (!user) {
      navigate({ to: "/login", search: { redirect: location.pathname } })
    }
  }, [loading, user, navigate, location.pathname])

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center p-6">
        <p className="text-muted-foreground text-sm">Loading…</p>
      </div>
    )
  }
  if (!user) {
    return null
  }
  return <>{children}</>
}
