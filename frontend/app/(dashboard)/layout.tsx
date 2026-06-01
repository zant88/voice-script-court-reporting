"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  DashboardSquareIcon,
  TeamWorkIcon,
  ClipboardListIcon,
  DoorOpenIcon,
  BadgeCheckIcon,
} from "@hugeicons/core-free-icons"
import { api } from "@/lib/api"

interface UserInfo {
  id: string
  name: string
  email: string
  role: string
  isAvailable?: boolean
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<UserInfo | null>(null)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.replace("/auth/login")
      return
    }
    const stored = localStorage.getItem("user")
    if (stored) setUser(JSON.parse(stored))
  }, [router])

  async function handleToggleAvailability() {
    try {
      const updated = await api.toggleMyAvailability() as { isAvailable: boolean }
      const stored = JSON.parse(localStorage.getItem("user") || "{}")
      stored.isAvailable = updated.isAvailable
      localStorage.setItem("user", JSON.stringify(stored))
      setUser((prev) => prev ? { ...prev, isAvailable: updated.isAvailable } : null)
    } catch (err: any) {
      alert(err.message)
    }
  }

  function handleLogout() {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.replace("/auth/login")
  }

  if (!user) return null

  const visibleNav = user.role === "ADMIN"
    ? [
        { href: "/", label: "Dashboard", icon: DashboardSquareIcon },
        { href: "/users", label: "Users", icon: TeamWorkIcon },
        { href: "/jobs", label: "Jobs", icon: ClipboardListIcon },
      ]
    : [
        { href: "/jobs", label: "Jobs", icon: ClipboardListIcon },
      ]

  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar>
        <SidebarHeader className="border-b px-4 py-3">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            {/* <HugeiconsIcon icon={DashboardSquareIcon} size={20} /> */}
            Court Reporting
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {visibleNav.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  render={<Link href={item.href} />}
                  isActive={item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)}
                >
                  <HugeiconsIcon icon={item.icon} size={16} />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <div className="border-t p-4 space-y-3">
          <div className="text-sm">
            <p className="font-medium">{user.name}</p>
            <p className="text-muted-foreground text-xs">{user.role}</p>
          </div>

          {(user.role === "REPORTER" || user.role === "EDITOR") && (
            <button
              onClick={handleToggleAvailability}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <HugeiconsIcon icon={BadgeCheckIcon} size={16} />
              {user.isAvailable ? "Set Unavailable" : "Set Available"}
            </button>
          )}

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <HugeiconsIcon icon={DoorOpenIcon} size={16} />
            Logout
          </button>
        </div>
      </Sidebar>
      <SidebarInset>
        <header className="flex items-center border-b px-4 py-2">
          <SidebarTrigger />
        </header>
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
