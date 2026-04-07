"use client"

import * as React from "react"
import { supabase } from "@/lib/supabaseClient"

export interface UserSettings {
  chargeGst: boolean
  gstAmount: number
}

const defaults: UserSettings = {
  chargeGst: true,
  gstAmount: 10,
}

export function useUserSettings() {
  const [settings, setSettings] = React.useState<UserSettings>(defaults)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchSettings = async () => {
      if (!supabase) {
        setLoading(false)
        return
      }
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user?.id) {
        setLoading(false)
        return
      }
      const { data } = await supabase
        .from("user_settings")
        .select("charge_gst, gst_amount")
        .eq("user_id", user.id)
        .maybeSingle()

      if (data) {
        setSettings({
          chargeGst: data.charge_gst ?? true,
          gstAmount: Number(data.gst_amount ?? 10),
        })
      }
      setLoading(false)
    }
    void fetchSettings()
  }, [])

  return { settings, loading }
}
