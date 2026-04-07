"use client"

import * as React from "react"
import type { Session, User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabaseClient"

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
}

const AuthContext = React.createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false)
  const [state, setState] = React.useState<AuthState>({
    user: null,
    session: null,
    loading: true,
  })

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    if (!mounted) return
    if (!supabase) {
      setState({ user: null, session: null, loading: false })
      return
    }

    const setAuth = (session: Session | null) => {
      setState({
        user: session?.user ?? null,
        session,
        loading: false,
      })
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuth(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuth(session)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [mounted])

  const value: AuthState = {
    ...state,
    loading: state.loading || !mounted,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthState {
  const ctx = React.useContext(AuthContext)
  if (ctx === null) {
    return {
      user: null,
      session: null,
      loading: true,
    }
  }
  return ctx
}
