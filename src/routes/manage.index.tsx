import { createFileRoute, Link } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export const Route = createFileRoute("/manage/")({
  component: ManageIndexPage,
})

const tiles = [
  { to: "/manage/invoices" as const, label: "Invoices" },
  { to: "/manage/projects" as const, label: "Projects" },
  { to: "/manage/companies" as const, label: "Companies" },
  { to: "/manage/settings" as const, label: "Settings" },
  // { to: "/manage/contracts" as const, label: "Contracts" },
  // { to: "/logout" as const, label: "Logout" },
]

function ManageIndexPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 pt-8">
      <div className="grid shrink-0 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map(({ to, label }) => (
          <Link key={to} to={to}>
            <Card className="h-full transition-colors hover:bg-muted/50">
              <CardContent className="flex min-h-[80px] items-center justify-center p-6">
                <span className="font-medium">{label}</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      <div className="min-h-0 flex-1" aria-hidden />
      <div className="flex shrink-0 justify-center pt-4">
        <Link to="/logout" className="w-full sm:max-w-xs">
          <Button size="lg" variant="secondary" className="w-full">
            Logout
          </Button>
        </Link>
      </div>
    </div>
  )
}
