import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/manage/contracts")({
  component: ManageContractsPage,
})

function ManageContractsPage() {
  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold">Manage Contracts</h2>
      <p className="text-muted-foreground">Manage your contracts.</p>
    </div>
  )
}
