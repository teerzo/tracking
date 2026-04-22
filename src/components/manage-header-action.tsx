"use client"

import * as React from "react"

const ManageHeaderActionContext = React.createContext<
  React.Dispatch<React.SetStateAction<React.ReactNode>> | null
>(null)

export function ManageHeaderActionProvider({
  children,
  setHeaderAction,
}: {
  children: React.ReactNode
  setHeaderAction: React.Dispatch<React.SetStateAction<React.ReactNode>>
}) {
  return (
    <ManageHeaderActionContext.Provider value={setHeaderAction}>
      {children}
    </ManageHeaderActionContext.Provider>
  )
}

export function useManageHeaderAction(action: React.ReactNode | null) {
  const setHeaderAction = React.useContext(ManageHeaderActionContext)

  React.useEffect(() => {
    if (!setHeaderAction) return
    setHeaderAction(action)
    return () => {
      setHeaderAction(null)
    }
  }, [action, setHeaderAction])
}
