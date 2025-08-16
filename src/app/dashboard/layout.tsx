"use client"

import React from "use client"
import { usePathname, useRouter } from "next/navigation"
import { Loader2, LogOut } from "lucide-react"

import { useAuth } from "@/hooks/use-auth"
import { DashboardNav, navItems } from "@/components/dashboard-nav"
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, isLoading, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const currentPage = navItems.find((item) => item.href === pathname)
  const pageTitle = currentPage ? currentPage.label : ""

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login")
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
           <div className="flex items-center gap-2">
            <SidebarTrigger className="md:hidden" />
            <h1 className="text-2xl font-bold text-sidebar-primary group-data-[collapsible=icon]:hidden">
              Nisarga
            </h1>
           </div>
        </SidebarHeader>
        <SidebarContent>
          <DashboardNav />
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => logout()} tooltip="Sign Out">
                <LogOut />
                <span>Sign Out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
           <div className="flex items-center mb-6">
             <h1 className="text-2xl font-bold">{pageTitle}</h1>
           </div>
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
