import { createFileRoute, redirect } from "@tanstack/react-router"
import { supabase } from "@/lib/supabaseClient"
import { HomePage } from "@/routes/home"

export const Route = createFileRoute("/")({
  beforeLoad: async ({ location }) => {
    if (typeof window === "undefined") return
    if (!supabase) return
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      throw redirect({
        to: "/login",
        search: { redirect: location.pathname },
      })
    }
  },
  component: HomePage,
})