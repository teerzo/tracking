import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
  useLocation,
} from "@tanstack/react-router"
import { supabase } from "@/lib/supabaseClient"
import { RequireAuth } from "@/components/RequireAuth"

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
  const location = useLocation()
  const isManageIndex =
    location.pathname === "/manage" || location.pathname === "/manage/"

  return (
    <RequireAuth>
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col p-6">
        <header className="flex shrink-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link to="/manage" className="text-2xl font-semibold hover:opacity-80">
            Manage
          </Link>
          <Link to={isManageIndex ? "/" : "/manage"}>
            <span className="text-muted-foreground text-sm hover:text-foreground">
              {isManageIndex ? "Back to Time Tracking" : "Back to Manage"}
            </span>
          </Link>
        </header>
        <div className="flex min-h-0 flex-1 flex-col">
          <Outlet />
        </div>
      </div>
    </RequireAuth>
  )
}
