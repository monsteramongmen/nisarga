"use client"

import { LogOut, User } from "lucide-react"
import Link from 'next/link'

import { useAuth } from "@/hooks/use-auth"
import { useSidebar } from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function UserNav() {
  const { logout } = useAuth()
  const { isMobile, state } = useSidebar();
  
  if (state === 'collapsed' && !isMobile) {
    return (
       <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder.svg" alt="@shadcn" />
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">Admin</p>
              <p className="text-xs leading-none text-muted-foreground">
                admin@catering.com
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => logout()}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <div className="flex items-center gap-4 rounded-md border p-2">
      <Link href="/dashboard/profile">
        <Avatar className="h-8 w-8">
          <AvatarImage src="/placeholder.svg" alt="Admin" />
          <AvatarFallback>
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      </Link>
      <div className="flex-1">
        <p className="text-sm font-medium leading-none">Admin</p>
        <p className="text-xs leading-none text-muted-foreground">
          admin@catering.com
        </p>
      </div>
       <Button variant="ghost" size="icon" onClick={() => logout()} className="h-8 w-8">
        <LogOut className="h-4 w-4" />
       </Button>
    </div>
  )
}
