import {
  createFileRoute,
  Outlet,
  redirect,
} from "@tanstack/react-router"
import * as React from "react"
import { supabase } from "@/lib/supabaseClient"
import { RequireAuth } from "@/components/RequireAuth"
import { Header } from "@/components/header"
import { ManageHeaderActionProvider } from "@/components/manage-header-action"
import { useUser } from "@/lib/hooks/useUser"

export const Route = createFileRoute("/manage")({
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
  component: ManageLayout,
})

function ManageLayout() {
  const { displayName, email } = useUser()
  const [headerAction, setHeaderAction] = React.useState<React.ReactNode>(null)

  return (
    <RequireAuth>
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col p-6">
        <ManageHeaderActionProvider setHeaderAction={setHeaderAction}>
          <Header
            displayName={displayName}
            userEmail={email}
            extraAction={headerAction}
          />
          <div className="flex min-h-0 flex-1 flex-col">
            <Outlet />
          </div>
        </ManageHeaderActionProvider>
      </div>
    </RequireAuth>
  )
}
