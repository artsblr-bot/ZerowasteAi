"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { clsx } from "clsx"
import { motion, AnimatePresence } from "framer-motion"
import { Sidebar, mobileNavItems } from "@/components/ui/Sidebar"
import { Moon, Sun, LogOut } from "lucide-react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [dark, setDark] = useState(false)

  useEffect(() => {
    setMounted(true)
    fetch("/api/auth/me", { credentials: "include" })
      .then((res) => {
        if (!res.ok) router.push("/login")
      })
      .catch(() => router.push("/login"))
    const stored = localStorage.getItem("theme")
    if (stored === "dark" || (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      setDark(true)
      document.documentElement.classList.add("dark")
    }
  }, [router])

  function toggleDark() {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle("dark", next)
    localStorage.setItem("theme", next ? "dark" : "light")
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" })
    router.push("/login")
  }

  if (!mounted) return null

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--color-bg-soft)" }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex h-14 items-center justify-between border-b border-bmw-hairline bg-bmw-canvas/80 px-4 backdrop-blur-xl lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="text-bmw-ink">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <img src="/icon.svg" alt="ZeroWaste AI" className="h-6 w-6" />
            <span className="text-sm font-bold text-bmw-ink">ZeroWaste AI</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleDark} className="flex h-7 w-7 items-center justify-center rounded-btn text-bmw-muted transition-colors hover:text-bmw-ink">
              {dark ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            <div className="flex h-7 w-7 items-center justify-center rounded-btn" style={{ background: "var(--color-bg-strong)" }}>
              <span className="text-[10px] font-bold text-bmw-ink">RS</span>
            </div>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        <div className="hidden h-14 items-center justify-between border-t border-bmw-hairline bg-bmw-canvas/80 px-6 backdrop-blur-xl lg:flex">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-btn" style={{ background: "linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))" }}>
              <span className="text-[10px] font-bold text-white">AI</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-bmw-ink">Today&apos;s Prediction</span>
              <span className="text-xs text-bmw-muted">Request prediction from Dashboard</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              onClick={toggleDark}
              className="flex h-9 w-9 items-center justify-center rounded-btn text-bmw-muted transition-colors hover:text-bmw-ink hover:bg-bmw-bg-strong"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {dark ? <Sun size={14} /> : <Moon size={14} />}
            </motion.button>
            <motion.button
              onClick={handleLogout}
              className="flex h-9 w-9 items-center justify-center rounded-btn text-bmw-muted transition-colors hover:text-error hover:bg-error/10"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <LogOut size={14} />
            </motion.button>
          </div>
        </div>

        <nav className="flex h-16 items-center justify-around border-t border-bmw-hairline bg-bmw-canvas/80 backdrop-blur-xl lg:hidden">
          {mobileNavItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] transition-colors",
                  isActive ? "text-accent" : "text-bmw-muted",
                )}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
