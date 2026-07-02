"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { clsx } from "clsx"
import { LayoutDashboard, TrendingUp, Heart, UtensilsCrossed, Settings, X, ClipboardList } from "lucide-react"
import { useState, useEffect } from "react"

const navItems = [
  { href: "/app", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app/predictions", label: "Forecasts", icon: TrendingUp },
  { href: "/app/food-batches", label: "Production", icon: ClipboardList },
  { href: "/app/donations", label: "Donations", icon: Heart },
  { href: "/app/menu", label: "Menu", icon: UtensilsCrossed },
  { href: "/app/settings", label: "Settings", icon: Settings },
]

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const [userInfo, setUserInfo] = useState<{ name: string; orgName: string } | null>(null)

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data) {
          setUserInfo({
            name: data.user.name,
            orgName: data.user.organization.name,
          })
        }
      })
      .catch(() => {})
  }, [])

  const initials = userInfo?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "??"

  const sidebarContent = (
    <>
      <div className="flex h-16 items-center justify-between border-b border-bmw-hairline px-5">
        <Link href="/app" className="flex items-center gap-2.5">
          <img src="/icon.svg" alt="ZeroWaste AI" className="h-8 w-8" />
          <span className="text-sm font-bold text-bmw-ink">ZeroWaste AI</span>
        </Link>
      </div>

      <nav className="flex flex-col gap-1 p-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={clsx(
                "flex items-center gap-3 rounded-btn px-3 py-2.5 text-sm transition-all duration-200",
                isActive
                  ? "font-bold text-white"
                  : "font-normal text-bmw-muted hover:text-bmw-ink",
              )}
              style={isActive ? { background: "linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))" } : undefined}
            >
              <item.icon size={17} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto border-t border-bmw-hairline p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-btn" style={{ background: "var(--color-bg-strong)" }}>
            <span className="text-xs font-bold text-bmw-ink">{initials}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-bmw-ink">{userInfo?.orgName || "Loading..."}</span>
            <span className="text-xs text-bmw-muted">Free Plan</span>
          </div>
        </div>
      </div>
    </>
  )

  return (
    <>
      <aside className="hidden w-56 flex-col border-r border-bmw-hairline bg-bmw-canvas lg:flex">
        {sidebarContent}
      </aside>

      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
          <aside className="relative flex h-full w-64 flex-col border-r border-bmw-hairline bg-bmw-canvas shadow-card-hover">
            <div className="flex h-16 items-center justify-between border-b border-bmw-hairline px-5">
              <div className="flex items-center gap-2.5">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-btn"
                  style={{ background: "linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))" }}
                >
                  <span className="text-xs font-bold text-white">Z</span>
                </div>
                <span className="text-sm font-bold text-bmw-ink">ZeroWaste AI</span>
              </div>
              <button onClick={onClose} className="rounded-btn p-1.5 text-bmw-muted transition-colors hover:text-bmw-ink">
                <X size={18} />
              </button>
            </div>
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  )
}

export const mobileNavItems = navItems
