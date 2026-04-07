import * as React from "react"
import { createFileRoute } from "@tanstack/react-router"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group"
import { supabase } from "@/lib/supabaseClient"

export const Route = createFileRoute("/manage/settings")({
  component: ManageSettingsPage,
})

function ManageSettingsPage() {
  const [invoiceLoading, setInvoiceLoading] = React.useState(true)
  const [invoiceError, setInvoiceError] = React.useState<string | null>(null)
  const [invoiceSaved, setInvoiceSaved] = React.useState(false)
  const [invoiceSaving, setInvoiceSaving] = React.useState(false)
  const [chargeGst, setChargeGst] = React.useState(false)
  const [gstAmount, setGstAmount] = React.useState("10")

  const [userLoading, setUserLoading] = React.useState(true)
  const [userData, setUserData] = React.useState<{
    email: string
    givenName: string
    familyName: string
    address: string
    mobile: string
    abn: string
    accountNumber: string
    bsb: string
  } | null>(null)
  const [userError, setUserError] = React.useState<string | null>(null)
  const [userSaved, setUserSaved] = React.useState(false)
  const [userSaving, setUserSaving] = React.useState(false)

  React.useEffect(() => {
    const load = async () => {
      if (!supabase) {
        setUserLoading(false)
        setInvoiceLoading(false)
        return
      }
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setUserLoading(false)
        setInvoiceLoading(false)
        return
      }
      const [usersRes, settingsRes] = await Promise.all([
        supabase
          .from("users")
          .select("email, given_name, family_name, address, mobile, abn, account_number, bsb")
          .eq("id", user.id)
          .single(),
        supabase
          .from("user_settings")
          .select("charge_gst, gst_amount")
          .eq("user_id", user.id)
          .maybeSingle(),
      ])
      if (usersRes.error) {
        setUserError(usersRes.error.message)
      } else if (usersRes.data) {
        setUserData({
          email: usersRes.data.email ?? "",
          givenName: usersRes.data.given_name ?? "",
          familyName: usersRes.data.family_name ?? "",
          address: usersRes.data.address ?? "",
          mobile: usersRes.data.mobile ?? "",
          abn: usersRes.data.abn ?? "",
          accountNumber: usersRes.data.account_number ?? "",
          bsb: usersRes.data.bsb ?? "",
        })
      }
      if (settingsRes.error) {
        setInvoiceError(settingsRes.error.message)
      } else if (settingsRes.data) {
        setChargeGst(settingsRes.data.charge_gst ?? false)
        setGstAmount(String(settingsRes.data.gst_amount ?? 10))
      }
      setUserLoading(false)
      setInvoiceLoading(false)
    }
    void load()
  }, [])

  const saveInvoiceSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabase) return
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return
    const amount = parseFloat(gstAmount)
    const gst = Number.isNaN(amount) ? 10 : Math.min(100, Math.max(0, amount))
    setInvoiceError(null)
    setInvoiceSaved(false)
    setInvoiceSaving(true)
    await new Promise((r) => setTimeout(r, 0))
    const { error } = await supabase.from("user_settings").upsert(
      {
        user_id: user.id,
        charge_gst: chargeGst,
        gst_amount: gst,
      },
      { onConflict: "user_id" }
    )
    setInvoiceSaving(false)
    if (error) {
      setInvoiceError(error.message)
    } else {
      setTimeout(() => {
        setInvoiceSaved(true)
        setTimeout(() => setInvoiceSaved(false), 3000)
      }, 500)
    }
  }

  const saveUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabase || !userData) return
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return
    setUserError(null)
    setUserSaved(false)
    setUserSaving(true)
    await new Promise((r) => setTimeout(r, 0))
    const { error } = await supabase
      .from("users")
      .update({
        given_name: userData.givenName || null,
        family_name: userData.familyName || null,
        address: userData.address || null,
        mobile: userData.mobile || null,
        abn: userData.abn || null,
        account_number: userData.accountNumber || null,
        bsb: userData.bsb || null,
      })
      .eq("id", user.id)
    setUserSaving(false)
    if (error) {
      setUserError(error.message)
    } else {
      setTimeout(() => {
        setUserSaved(true)
        setTimeout(() => setUserSaved(false), 3000)
      }, 500)
    }
  }

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold">Settings</h2>
      <p className="mb-8 text-muted-foreground">
        Configure your preferences and account settings.
      </p>

      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Invoice settings</h3>
          </CardHeader>
          <CardContent>
            <FieldSet>
              {invoiceLoading ? (
                <p className="text-muted-foreground text-sm">Loading…</p>
              ) : (
                <form onSubmit={saveInvoiceSettings} className="space-y-4">
                  <FieldGroup>
                    <Field orientation="horizontal">
                      <input
                        id="charge-gst"
                        type="checkbox"
                        checked={chargeGst}
                        onChange={(e) => setChargeGst(e.target.checked)}
                        className="h-4 w-4 rounded border-input"
                      />
                      <FieldLabel htmlFor="charge-gst">Charge GST</FieldLabel>
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="gst-amount">GST Amount</FieldLabel>
                      <InputGroup>
                        <InputGroupInput
                          id="gst-amount"
                          type="number"
                          min={0}
                          max={100}
                          step={0.1}
                          value={gstAmount}
                          onChange={(e) => setGstAmount(e.target.value)}
                          placeholder="0"
                        />
                        <InputGroupAddon align="inline-end">
                          <InputGroupText>%</InputGroupText>
                        </InputGroupAddon>
                      </InputGroup>
                    </Field>
                  </FieldGroup>
                  {invoiceError && (
                    <p className="text-destructive text-sm">{invoiceError}</p>
                  )}
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      size="sm"
                      disabled={invoiceSaving}
                    >
                      {invoiceSaving ? "Saving" : invoiceSaved ? "Saved" : "Save"}
                    </Button>
                  </div>
                </form>
              )}
            </FieldSet>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">User settings</h3>
          </CardHeader>
          <CardContent>
            <FieldSet>
              {userLoading ? (
                <p className="text-muted-foreground text-sm">Loading…</p>
              ) : (
                <form onSubmit={saveUser} className="space-y-4">
                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="user-email">Email</FieldLabel>
                      <Input
                        id="user-email"
                        type="email"
                        value={userData?.email ?? ""}
                        disabled
                        readOnly
                        className="bg-muted"
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="user-given-name">
                        Given name
                      </FieldLabel>
                      <Input
                        id="user-given-name"
                        value={userData?.givenName ?? ""}
                        onChange={(e) =>
                          setUserData((u) =>
                            u ? { ...u, givenName: e.target.value } : null
                          )
                        }
                        placeholder="First name"
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="user-family-name">
                        Family name
                      </FieldLabel>
                      <Input
                        id="user-family-name"
                        value={userData?.familyName ?? ""}
                        onChange={(e) =>
                          setUserData((u) =>
                            u ? { ...u, familyName: e.target.value } : null
                          )
                        }
                        placeholder="Last name"
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="user-address">Address</FieldLabel>
                      <Input
                        id="user-address"
                        value={userData?.address ?? ""}
                        onChange={(e) =>
                          setUserData((u) =>
                            u ? { ...u, address: e.target.value } : null
                          )
                        }
                        placeholder="Street, suburb, state, postcode"
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="user-mobile">Mobile</FieldLabel>
                      <Input
                        id="user-mobile"
                        type="tel"
                        value={userData?.mobile ?? ""}
                        onChange={(e) =>
                          setUserData((u) =>
                            u ? { ...u, mobile: e.target.value } : null
                          )
                        }
                        placeholder="0400 000 000"
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="user-abn">ABN</FieldLabel>
                      <Input
                        id="user-abn"
                        value={userData?.abn ?? ""}
                        onChange={(e) =>
                          setUserData((u) =>
                            u ? { ...u, abn: e.target.value } : null
                          )
                        }
                        placeholder="12 345 678 901"
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="user-account-number">
                        Account number
                      </FieldLabel>
                      <Input
                        id="user-account-number"
                        value={userData?.accountNumber ?? ""}
                        onChange={(e) =>
                          setUserData((u) =>
                            u ? { ...u, accountNumber: e.target.value } : null
                          )
                        }
                        placeholder="12345678"
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="user-bsb">BSB</FieldLabel>
                      <Input
                        id="user-bsb"
                        value={userData?.bsb ?? ""}
                        onChange={(e) =>
                          setUserData((u) =>
                            u ? { ...u, bsb: e.target.value } : null
                          )
                        }
                        placeholder="062-000"
                      />
                    </Field>
                  </FieldGroup>
                  {userError && (
                    <p className="text-destructive text-sm">{userError}</p>
                  )}
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      size="sm"
                      disabled={userSaving}
                    >
                      {userSaving ? "Saving" : userSaved ? "Saved" : "Save"}
                    </Button>
                  </div>
                </form>
              )}
            </FieldSet>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
