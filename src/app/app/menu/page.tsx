"use client"

import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { FadeUp, StaggerContainer, StaggerItem, HoverCard } from "@/components/motion/MotionComponents"
import { motion } from "framer-motion"
import { Plus, AlertTriangle, Clock, DollarSign } from "lucide-react"

export default function MenuPage() {
  const { data: menuData } = useQuery({
    queryKey: ["menu"],
    queryFn: () => api.menu.list(),
  })

  const { data: inventory } = useQuery({
    queryKey: ["inventory"],
    queryFn: () => api.inventory.list(),
  })

  const dishes = menuData?.menus?.flatMap((m) => m.dishes) ?? []

  return (
    <div className="flex flex-col gap-6 pb-20">
      <FadeUp>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-display-sm text-bmw-ink">Menu & Inventory</h1>
            <p className="mt-1 text-sm font-light text-bmw-muted">
              Dish management · Stock levels · Supplier tracking
            </p>
          </div>
          <Button variant="primary">
            <Plus size={15} className="mr-1" />
            Add Dish
          </Button>
        </div>
      </FadeUp>

      <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StaggerItem>
          <HoverCard className="rounded-card border border-bmw-hairline bg-bmw-canvas p-5 shadow-card">
            <UtensilsIcon />
            <span className="text-[11px] font-bold uppercase tracking-[1.2px] text-bmw-muted">Active Dishes</span>
            <div className="text-[clamp(1.25rem,2.5vw,1.75rem)] font-bold tracking-tight text-bmw-ink">{dishes.length}</div>
          </HoverCard>
        </StaggerItem>
        <StaggerItem>
          <HoverCard className="rounded-card border border-bmw-hairline bg-bmw-canvas p-5 shadow-card">
            <AlertIcon />
            <span className="text-[11px] font-bold uppercase tracking-[1.2px] text-bmw-muted">Low Stock</span>
            <div className="text-[clamp(1.25rem,2.5vw,1.75rem)] font-bold tracking-tight text-warning">{inventory?.totals?.lowStockCount ?? 0}</div>
          </HoverCard>
        </StaggerItem>
        <StaggerItem>
          <HoverCard className="rounded-card border border-bmw-hairline bg-bmw-canvas p-5 shadow-card">
            <ClockIcon />
            <span className="text-[11px] font-bold uppercase tracking-[1.2px] text-bmw-muted">Expiring</span>
            <div className="text-[clamp(1.25rem,2.5vw,1.75rem)] font-bold tracking-tight text-error">{inventory?.totals?.expiringCount ?? 0}</div>
          </HoverCard>
        </StaggerItem>
        <StaggerItem>
          <HoverCard className="rounded-card border border-bmw-hairline bg-bmw-canvas p-5 shadow-card">
            <DollarIcon />
            <span className="text-[11px] font-bold uppercase tracking-[1.2px] text-bmw-muted">Inventory Value</span>
            <div className="text-[clamp(1.25rem,2.5vw,1.75rem)] font-bold tracking-tight text-bmw-ink">₹{Math.round(inventory?.totals?.totalValue ?? 0)}</div>
          </HoverCard>
        </StaggerItem>
      </StaggerContainer>

      <FadeUp delay={0.1}>
        <div className="rounded-card border border-bmw-hairline bg-bmw-canvas p-5 shadow-card transition-all duration-300 hover:shadow-card-hover">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-title-sm text-bmw-ink">Today&apos;s Menu</h2>
            <Badge variant="success">{menuData?.menus?.length ? "Active" : "No menu"}</Badge>
          </div>
          <div className="flex flex-col gap-2">
            {dishes.map((dish, i) => (
              <motion.div
                key={dish.id}
                className="flex items-center justify-between rounded-btn border border-bmw-hairline bg-bmw-surface-soft px-4 py-3 transition-all duration-200 hover:border-accent/30"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-bmw-ink">{dish.name}</span>
                    {dish.isSignature && <Badge variant="info">Signature</Badge>}
                  </div>
                  <span className="text-xs font-light text-bmw-muted">
                    {dish.category} · ₹{dish.avgPrice ?? "—"} · {dish.prepTime ?? "—"}min
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-16 overflow-hidden rounded-full" style={{ background: "var(--color-bg-strong)" }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: "var(--color-accent)" }}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.round((dish.popularityScore ?? 0) * 100)}%` }}
                      transition={{ duration: 0.6, delay: i * 0.04 }}
                    />
                  </div>
                  <span className="text-xs font-bold text-accent">
                    {Math.round((dish.popularityScore ?? 0) * 100)}%
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </FadeUp>

      {inventory?.lowStock?.length ? (
        <FadeUp delay={0.15}>
          <div className="rounded-card border border-bmw-hairline bg-bmw-canvas p-5 shadow-card transition-all duration-300 hover:shadow-card-hover">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-title-sm text-bmw-ink">Low Inventory Alerts</h2>
              <Badge variant="warning">{inventory.totals.lowStockCount} Items</Badge>
            </div>
            <div className="flex flex-col gap-2">
              {inventory.lowStock.slice(0, 4).map((item: Record<string, unknown>) => {
                const qty = item.quantity as number
                const thresh = item.threshold as number
                const pct = Math.round((qty / thresh) * 100)
                return (
                  <motion.div
                    key={item.id as string}
                    className="flex items-center justify-between rounded-btn border border-bmw-hairline bg-bmw-surface-soft px-4 py-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <span className="text-sm text-bmw-ink">{item.ingredientName as string}</span>
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-16 overflow-hidden rounded-full" style={{ background: "var(--color-bg-strong)" }}>
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${pct}%`,
                            background: pct < 30 ? "var(--color-error)" : "var(--color-warning)"
                          }}
                        />
                      </div>
                      <span className={`text-xs font-bold ${pct < 30 ? "text-error" : "text-warning"}`}>
                        {qty}/{thresh} {item.unit as string}
                      </span>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </FadeUp>
      ) : null}
    </div>
  )
}

function UtensilsIcon() {
  return (
    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-btn" style={{ background: "color-mix(in srgb, var(--color-accent) 10%, transparent)" }}>
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
        <path d="M7 2v20" />
        <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
      </svg>
    </div>
  )
}

function AlertIcon() {
  return (
    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-btn" style={{ background: "color-mix(in srgb, var(--color-warning) 10%, transparent)" }}>
      <AlertTriangle size={17} style={{ color: "var(--color-warning)" }} />
    </div>
  )
}

function ClockIcon() {
  return (
    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-btn" style={{ background: "color-mix(in srgb, var(--color-error) 10%, transparent)" }}>
      <Clock size={17} style={{ color: "var(--color-error)" }} />
    </div>
  )
}

function DollarIcon() {
  return (
    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-btn" style={{ background: "color-mix(in srgb, var(--color-accent) 10%, transparent)" }}>
      <DollarSign size={17} style={{ color: "var(--color-accent)" }} />
    </div>
  )
}
