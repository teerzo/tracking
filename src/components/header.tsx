"use client"

import * as React from "react"
import { Link, useLocation } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Check, Cog, LogOut, PlusIcon } from "lucide-react"

interface HeaderProps {
  displayName: string | null
  userEmail?: string | null
  extraAction?: React.ReactNode
  onAddTime?: () => void
}

export function Header({
  displayName,
  userEmail,
  extraAction,
  onAddTime,
}: HeaderProps) {
  const { pathname } = useLocation()
  const [theme, setTheme] = React.useState<"light" | "dark">("light")
  const showTimeActions = Boolean(onAddTime)

  React.useEffect(() => {
    const root = document.documentElement
    setTheme(root.classList.contains("dark") ? "dark" : "light")
  }, [])

  const applyTheme = (nextTheme: "light" | "dark") => {
    const root = document.documentElement
    root.classList.toggle("dark", nextTheme === "dark")
    localStorage.setItem("theme", nextTheme)
    setTheme(nextTheme)
  }
  const routeLabel = (() => {
    if (pathname === "/" || pathname === "/home") return "Home"
    if (pathname.startsWith("/manage/projects")) return "Projects"
    if (pathname.startsWith("/manage/companies")) return "Companies"
    if (pathname.startsWith("/manage/invoices")) return "Invoices"
    if (pathname.startsWith("/manage/settings")) return "Settings"
    if (pathname.startsWith("/manage/contracts")) return "Contracts"
    if (pathname.startsWith("/manage")) return "Manage"
    if (pathname.startsWith("/login")) return "Login"
    return "Page"
  })()

  return (
    <header className="mb-4 flex flex-row justify-between gap-4 sm:flex-row sm:items-center sm:justify-between">
      <h1 className="text-xl font-semibold sm:text-2xl">
        <Link to="/" className="hover:opacity-80">
          Tracking
        </Link>
        <span className="text-muted-foreground font-normal">
          {" · "}
          {routeLabel}
        </span>
      </h1>
      <div className="flex items-center gap-2">
        {extraAction}
        {showTimeActions && (
          <Button variant="outline" onClick={onAddTime}>
            <PlusIcon />
            Add Time
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" aria-label="Open menu">
              <Cog />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="leading-tight">
              <div className="text-foreground">{displayName ?? "Signed in"}</div>
              <div className="text-muted-foreground text-xs font-normal">
                {userEmail ?? "No email available"}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/">Home</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Manage</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link to="/manage/projects">Projects</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/manage/companies">Companies</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/manage/invoices">Invoices</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/manage/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Theme</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => applyTheme("light")}>
              Light
              {theme === "light" && <Check className="ml-auto size-4" />}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => applyTheme("dark")}>
              Dark
              {theme === "dark" && <Check className="ml-auto size-4" />}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" asChild>
              <Link to="/logout">
                <LogOut />
                Log out
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
