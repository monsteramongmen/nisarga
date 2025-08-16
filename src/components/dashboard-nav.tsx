"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart,
  BookOpen,
  FileText,
  LayoutDashboard,
  Package,
  Users,
} from "lucide-react"

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"

export const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/dashboard/orders",
    label: "Orders",
    icon: Package,
  },
  {
    href: "/dashboard/menu",
    label: "Menu",
    icon: BookOpen,
  },
  {
    href: "/dashboard/customers",
    label: "Customers",
    icon: Users,
  },
  {
    href: "/dashboard/quotations",
    label: "Quotations",
    icon: FileText,
  },
  {
    href: "/dashboard/reports",
    label: "Reports",
    icon: BarChart,
  },
]

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <SidebarMenu>
      {navItems.map((item) => {
        const Icon = item.icon
        return (
          <SidebarMenuItem key={item.label}>
            <SidebarMenuButton
              asChild
              isActive={pathname === item.href}
              tooltip={item.label}
            >
              <Link href={item.href}>
                <Icon />
                <span>{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      })}
    </SidebarMenu>
  )
}
