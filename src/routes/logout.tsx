import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"

export const Route = createFileRoute("/logout")({
  component: LogoutPage,
})

function LogoutPage() {
  const navigate = useNavigate()

  useEffect(() => {
    let cancelled = false
    async function logout() {
      if (supabase) {
        await supabase.auth.signOut()
      }
      if (!cancelled) {
        navigate({ to: "/" })
      }
    }
    logout()
    return () => {
      cancelled = true
    }
  }, [navigate])

  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <p className="text-muted-foreground">Logging out…</p>
    </div>
  )
}
