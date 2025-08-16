"use client"

import { LogOut } from "lucide-react"

import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"

export function UserNav() {
  const { logout } = useAuth()

  return (
    <Button variant="ghost" size="icon" onClick={() => logout()}>
      <LogOut className="h-5 w-5" />
      <span className="sr-only">Sign out</span>
    </Button>
  )
}
