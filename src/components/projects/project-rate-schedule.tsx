"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  addOneDay,
  formatCurrency,
  suggestedNewRateStartDate,
  todayDateString,
} from "@/lib/time-tracking"
import type { ProjectRate } from "@/lib/time-tracking"

interface ProjectRateScheduleProps {
  projectId: string
  rates: ProjectRate[]
  onInsert: (
    input: Omit<ProjectRate, "id">
  ) => Promise<{ rate: ProjectRate | null; error: string | null }>
  onUpdate: (rate: ProjectRate) => Promise<{ error: string | null }>
  onDelete: (rateId: string) => Promise<{ error: string | null }>
  onRatesChanged?: (rate?: ProjectRate) => void
}

function buildNewPayRateForm(rates: ProjectRate[]) {
  return {
    startDate: suggestedNewRateStartDate(rates),
    hourlyRate: "",
    ongoing: true,
  }
}

export function ProjectRateSchedule({
  projectId,
  rates,
  onInsert,
  onUpdate,
  onDelete,
  onRatesChanged,
}: ProjectRateScheduleProps) {
  const [newPayRateForm, setNewPayRateForm] = React.useState(() =>
    buildNewPayRateForm(rates)
  )
  const [formError, setFormError] = React.useState<string | null>(null)
  const [saving, setSaving] = React.useState(false)
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [editForm, setEditForm] = React.useState({
    startDate: "",
    endDate: "",
    hourlyRate: "",
    ongoing: true,
  })

  const ongoingRate = rates.find((r) => r.endDate === null)

  React.useEffect(() => {
    setNewPayRateForm(buildNewPayRateForm(rates))
    setFormError(null)
  }, [projectId, rates])

  const sortedRates = React.useMemo(
    () =>
      [...rates].sort(
        (a, b) =>
          new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      ),
    [rates]
  )

  const handleSetNewPayRate = async () => {
    setFormError(null)

    const hourlyRate = Number(newPayRateForm.hourlyRate)
    if (!newPayRateForm.startDate) {
      setFormError("Effective date is required.")
      return
    }
    if (!hourlyRate || hourlyRate <= 0) {
      setFormError("Enter a valid hourly rate.")
      return
    }
    if (
      ongoingRate &&
      newPayRateForm.ongoing &&
      newPayRateForm.startDate <= ongoingRate.startDate
    ) {
      setFormError(
        "New rate must start after the current rate period start date."
      )
      return
    }
    if (ongoingRate && hourlyRate === ongoingRate.hourlyRate) {
      setFormError("New rate must be different from the current rate.")
      return
    }

    setSaving(true)
    const result = await onInsert({
      projectId,
      startDate: newPayRateForm.startDate,
      endDate: newPayRateForm.ongoing ? null : null,
      hourlyRate,
    })
    setSaving(false)

    if (result.error) {
      setFormError(result.error)
      return
    }

    onRatesChanged?.(result.rate ?? undefined)
  }

  const startEdit = (rate: ProjectRate) => {
    setEditingId(rate.id)
    setEditForm({
      startDate: rate.startDate,
      endDate: rate.endDate ?? "",
      hourlyRate: String(rate.hourlyRate),
      ongoing: rate.endDate === null,
    })
    setFormError(null)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setFormError(null)
  }

  const handleSaveEdit = async () => {
    if (!editingId) return
    const rate = rates.find((r) => r.id === editingId)
    if (!rate) return

    const hourlyRate = Number(editForm.hourlyRate)
    if (!editForm.startDate) {
      setFormError("Start date is required.")
      return
    }
    if (!hourlyRate || hourlyRate <= 0) {
      setFormError("Enter a valid hourly rate.")
      return
    }
    if (!editForm.ongoing && !editForm.endDate) {
      setFormError("End date is required unless the rate is ongoing.")
      return
    }
    if (!editForm.ongoing && editForm.endDate < editForm.startDate) {
      setFormError("End date must be on or after start date.")
      return
    }

    setSaving(true)
    const result = await onUpdate({
      ...rate,
      startDate: editForm.startDate,
      endDate: editForm.ongoing ? null : editForm.endDate,
      hourlyRate,
    })
    setSaving(false)

    if (result.error) {
      setFormError(result.error)
      return
    }

    setEditingId(null)
    onRatesChanged?.()
  }

  const handleDelete = async (rateId: string) => {
    setSaving(true)
    const result = await onDelete(rateId)
    setSaving(false)
    if (result.error) {
      setFormError(result.error)
      return
    }
    if (editingId === rateId) setEditingId(null)
    onRatesChanged?.()
  }

  return (
    <div className="space-y-4 border-t pt-4">
      <div>
        <h3 className="text-sm font-medium">Rate schedule</h3>
        <p className="text-muted-foreground text-xs">
          Set a new pay rate with an effective date. The previous ongoing rate
          ends the day before.
        </p>
      </div>

      <div className="space-y-3 rounded-md border border-primary/20 bg-muted/20 p-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-sm font-medium">Set new pay rate</p>
          {ongoingRate ? (
            <p className="text-muted-foreground text-xs">
              Current: {formatCurrency(ongoingRate.hourlyRate)}/hr from{" "}
              {ongoingRate.startDate}
            </p>
          ) : (
            <p className="text-muted-foreground text-xs">
              No ongoing rate — this will become the current rate.
            </p>
          )}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="new-rate-start">Effective from</FieldLabel>
            <Input
              id="new-rate-start"
              type="date"
              value={newPayRateForm.startDate}
              min={ongoingRate ? addOneDay(ongoingRate.startDate) : undefined}
              onChange={(e) =>
                setNewPayRateForm((f) => ({ ...f, startDate: e.target.value }))
              }
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="new-rate-amount">New hourly rate</FieldLabel>
            <Input
              id="new-rate-amount"
              type="number"
              min={0}
              step="0.01"
              placeholder={
                ongoingRate
                  ? String(ongoingRate.hourlyRate)
                  : "e.g. 75.00"
              }
              value={newPayRateForm.hourlyRate}
              onChange={(e) =>
                setNewPayRateForm((f) => ({
                  ...f,
                  hourlyRate: e.target.value,
                }))
              }
            />
          </Field>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            size="sm"
            disabled={saving}
            onClick={() => void handleSetNewPayRate()}
          >
            Set new pay rate
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={saving}
            onClick={() =>
              setNewPayRateForm({
                ...buildNewPayRateForm(rates),
                startDate: todayDateString(),
              })
            }
          >
            Reset
          </Button>
        </div>
      </div>

      {sortedRates.length > 0 ? (
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-left">
                <th className="px-3 py-2 font-medium">Start</th>
                <th className="px-3 py-2 font-medium">End</th>
                <th className="px-3 py-2 font-medium">Rate</th>
                <th className="px-3 py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedRates.map((rate) =>
                editingId === rate.id ? (
                  <tr key={rate.id} className="border-b">
                    <td className="px-3 py-2">
                      <Input
                        type="date"
                        value={editForm.startDate}
                        onChange={(e) =>
                          setEditForm((f) => ({
                            ...f,
                            startDate: e.target.value,
                          }))
                        }
                      />
                    </td>
                    <td className="px-3 py-2">
                      {editForm.ongoing ? (
                        <span className="text-muted-foreground">Ongoing</span>
                      ) : (
                        <Input
                          type="date"
                          value={editForm.endDate}
                          onChange={(e) =>
                            setEditForm((f) => ({
                              ...f,
                              endDate: e.target.value,
                            }))
                          }
                        />
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        value={editForm.hourlyRate}
                        onChange={(e) =>
                          setEditForm((f) => ({
                            ...f,
                            hourlyRate: e.target.value,
                          }))
                        }
                      />
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-col gap-2">
                        <label className="flex items-center gap-2 text-xs">
                          <input
                            type="checkbox"
                            checked={editForm.ongoing}
                            onChange={(e) =>
                              setEditForm((f) => ({
                                ...f,
                                ongoing: e.target.checked,
                                endDate: e.target.checked ? "" : f.endDate,
                              }))
                            }
                          />
                          Ongoing
                        </label>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => void handleSaveEdit()}
                            disabled={saving}
                          >
                            Save
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={cancelEdit}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={rate.id} className="border-b">
                    <td className="px-3 py-2">{rate.startDate}</td>
                    <td className="px-3 py-2">
                      {rate.endDate ?? (
                        <span className="text-muted-foreground">Ongoing</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {formatCurrency(rate.hourlyRate)}/hr
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => startEdit(rate)}
                          disabled={saving}
                        >
                          Edit
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          onClick={() => void handleDelete(rate.id)}
                          disabled={saving}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">No rate periods yet.</p>
      )}

      {formError ? (
        <p className="text-destructive text-sm">{formError}</p>
      ) : null}
    </div>
  )
}
