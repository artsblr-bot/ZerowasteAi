"use client"

import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { StatsCard } from "@/components/ui/StatsCard"
import { Badge } from "@/components/ui/Badge"
import { AccuracyChart } from "@/components/charts/AccuracyChart"
import { WastePieChart } from "@/components/charts/WastePieChart"
import { FadeUp, StaggerContainer, StaggerItem } from "@/components/motion/MotionComponents"
import Link from "next/link"
import { RefreshCw, Users, ChefHat, Heart, Leaf, TrendingUp, ArrowRight, AlertTriangle, Clock, Utensils, ClipboardList, Play, Mail, Database, Cloud, ExternalLink } from "lucide-react"
import { motion } from "framer-motion"
import { useQueryClient } from "@tanstack/react-query"

export default function DashboardPage() {
  const queryClient = useQueryClient()

  const { data: pred, isLoading: loadingPred } = useQuery({
    queryKey: ["predictions-demand"],
    queryFn: () => api.predictions.demand(),
  })

  const { data: cooking, isLoading: loadingCooking } = useQuery({
    queryKey: ["predictions-cooking", pred?.predictedCustomers],
    queryFn: () => api.predictions.cooking(undefined, pred?.predictedCustomers),
    enabled: !!pred?.predictedCustomers,
  })

  const { data: surplus } = useQuery({
    queryKey: ["predictions-surplus"],
    queryFn: () => api.predictions.surplus(),
  })

  const { data: stats } = useQuery({
    queryKey: ["restaurant-stats"],
    queryFn: () => api.restaurants.stats(),
  })

  const { data: history } = useQuery({
    queryKey: ["predictions-history"],
    queryFn: () => api.predictions.history(),
  })

  const { data: donations } = useQuery({
    queryKey: ["donations"],
    queryFn: () => api.donations.list(),
  })

  const { data: inventory } = useQuery({
    queryKey: ["inventory"],
    queryFn: () => api.inventory.list(),
  })

  const { data: connStatus } = useQuery({
    queryKey: ["connectors-status"],
    queryFn: () => api.connectors.status(),
  })

  const { data: connGmail } = useQuery({
    queryKey: ["connectors-gmail"],
    queryFn: () => api.connectors.gmail(),
    enabled: !!connStatus?.services?.find((s) => s.service === "gmail" && s.connected),
  })

  const { data: connDrive } = useQuery({
    queryKey: ["connectors-drive"],
    queryFn: () => api.connectors.drive(),
    enabled: !!connStatus?.services?.find((s) => s.service === "drive" && s.connected),
  })

  const today = new Date()
  const dayName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][today.getDay()]

  function handleRefresh() {
    const keys = [
      "predictions-demand", "predictions-cooking", "predictions-surplus",
      "restaurant-stats", "predictions-history", "donations", "inventory",
      "connectors-status", "connectors-gmail", "connectors-drive",
    ]
    keys.forEach((k) => queryClient.invalidateQueries({ queryKey: [k] }))
  }

  return (
    <div className="flex flex-col gap-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-sm text-bmw-ink">Dashboard</h1>
          <p className="mt-1 text-sm font-light text-bmw-muted">
            {dayName}, {today.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <motion.button
          onClick={handleRefresh}
          className="btn-primary !h-10 !px-5 !py-0 gap-2 text-sm"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <RefreshCw size={14} />
          Update Forecast
        </motion.button>
      </div>

      <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StaggerItem>
          <StatsCard
            label="Guests Expected Today"
            value={loadingPred ? "..." : String(pred?.predictedCustomers ?? "—")}
            sublabel={pred ? `${Math.round(pred.confidence * 100)}% sure` : "No data yet"}
            icon={<Users size={14} />}
          />
        </StaggerItem>
        <StaggerItem>
          <StatsCard
            label="Items to Prepare"
            value={loadingCooking ? "..." : cooking?.recommendations.length ? `${cooking.recommendations.reduce((a, r) => a + r.recommended, 0)}` : "—"}
            sublabel={cooking?.totalSavings ? `Save ₹${cooking.totalSavings}` : ""}
            icon={<ChefHat size={14} />}
          />
        </StaggerItem>
        <StaggerItem>
          <StatsCard
            label="Meals Saved (Month)"
            value={String(stats?.mealsSaved ?? 0)}
            sublabel={stats?.monthlyDonations ? `${stats.monthlyDonations} donations` : ""}
            icon={<Heart size={14} />}
          />
        </StaggerItem>
        <StaggerItem>
          <StatsCard
            label="CO₂ Avoided"
            value={String(stats?.co2Avoided ?? 0) + " kg"}
            sublabel="This month"
            icon={<Leaf size={14} />}
          />
        </StaggerItem>
      </StaggerContainer>

      {connStatus?.services?.length ? (
        <FadeUp>
          <div className="rounded-card border border-bmw-hairline bg-bmw-canvas p-5 shadow-card">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database size={16} className="text-accent" />
                <h2 className="text-title-sm text-bmw-ink">Connected Data Sources</h2>
              </div>
              <Badge variant="success">{connStatus.services.length} Connected</Badge>
            </div>
            <div className="flex flex-wrap gap-3">
              {connStatus.services.map((svc) => (
                <div key={svc.service} className="flex items-center gap-2 rounded-xl border border-green-500/20 bg-green-500/5 px-3 py-2">
                  {svc.service === "gmail" ? <Mail size={14} className="text-green-400" /> : <Cloud size={14} className="text-green-400" />}
                  <span className="text-xs font-medium text-green-400 capitalize">{svc.service}</span>
                  {svc.service === "gmail" && connGmail && (
                    <span className="text-[10px] text-bmw-muted-soft">
                      {connGmail.zomatoOrders + connGmail.swiggyOrders + connGmail.otherOrders} emails
                    </span>
                  )}
                  {svc.service === "drive" && connDrive && (
                    <span className="text-[10px] text-bmw-muted-soft">
                      {connDrive.files.length} files
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </FadeUp>
      ) : null}

      {!stats?.totalPrepared && !surplus && (
        <FadeUp>
          <div className="rounded-card border border-accent/20 bg-accent/5 p-6 shadow-card">
            <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10">
                <Play size={24} className="text-accent" />
              </div>
              <div className="flex-1">
                <h2 className="text-title-sm text-bmw-ink">Ready to prevent food waste?</h2>
                <p className="text-sm text-bmw-muted">
                  Add your menu, record what you cook, and let AI predict demand — all in under 5 minutes.
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  href="/app/menu"
                  className="flex h-10 items-center gap-2 rounded-xl border border-bmw-hairline px-4 text-sm font-medium text-bmw-ink transition-all hover:bg-bmw-surface-soft"
                >
                  Add Menu
                </Link>
                <Link
                  href="/app/food-batches"
                  className="flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-bold text-black"
                  style={{ background: "#22c55e" }}
                >
                  <ClipboardList size={14} />
                  Record Today
                </Link>
              </div>
            </div>
          </div>
        </FadeUp>
      )}

      {surplus && (
        <FadeUp>
          <div className="relative overflow-hidden rounded-card border border-bmw-hairline bg-bmw-canvas p-5 shadow-card transition-all duration-300 hover:shadow-card-hover">
            <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full opacity-[0.03]" style={{ background: "var(--color-accent)" }} />
            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-btn" style={{ background: "color-mix(in srgb, var(--color-accent) 10%, transparent)" }}>
                  <TrendingUp size={20} className="text-accent" />
                </div>
                <div>
                <span className="text-xs font-bold uppercase tracking-[1.2px] text-bmw-muted">Extra Food Expected Today</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-display-sm text-bmw-ink">{surplus.expectedSurplus} kg</span>
                  <Badge variant="info">AI Estimate</Badge>
                </div>
                <span className="text-xs font-light text-bmw-muted">Ready around {surplus.readyAt}</span>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <span className="text-xs font-light text-bmw-muted">Cooked</span>
                  <p className="text-title-sm text-bmw-ink">{surplus.totalPrepared}</p>
                </div>
                <div className="h-8 w-px" style={{ background: "var(--color-border)" }} />
                <div className="text-right">
                  <span className="text-xs font-light text-bmw-muted">Sold</span>
                  <p className="text-title-sm text-bmw-ink">{surplus.totalSold}</p>
                </div>
                <div className="h-8 w-px" style={{ background: "var(--color-border)" }} />
                <div className="text-right">
                  <span className="text-xs font-light text-bmw-muted">How Sure</span>
                  <p className="text-title-sm text-accent">{Math.round(surplus.confidence * 100)}%</p>
                </div>
              </div>
            </div>
            <div className="relative mt-4 h-2 overflow-hidden rounded-full" style={{ background: "var(--color-bg-strong)" }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, var(--color-accent), var(--color-accent-hover))" }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((surplus.totalSold / Math.max(surplus.totalPrepared, 1)) * 100, 100)}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
            <div className="relative mt-1 flex justify-between text-[10px] text-bmw-muted-soft">
              <span>0%</span>
              <span>{Math.round((surplus.totalSold / Math.max(surplus.totalPrepared, 1)) * 100)}% sold so far</span>
              <span>100%</span>
            </div>
          </div>
        </FadeUp>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="col-span-1 lg:col-span-2 rounded-card border border-bmw-hairline bg-bmw-canvas p-5 shadow-card transition-all duration-300 hover:shadow-card-hover">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ChefHat size={16} className="text-accent" />
              <div>
                <h2 className="text-title-sm text-bmw-ink">What to Cook Today</h2>
                <p className="text-[10px] text-bmw-muted-soft">AI recommends exact quantities so nothing goes to waste</p>
              </div>
            </div>
            <Badge variant={loadingCooking ? "default" : "success"}>
              {loadingCooking ? "Analyzing" : "Ready"}
            </Badge>
          </div>
          {loadingCooking ? (
            <div className="flex flex-col gap-3">
              {[1,2,3].map((i) => (
                <div key={i} className="skeleton h-14 rounded-btn" />
              ))}
            </div>
          ) : cooking?.recommendations?.length ? (
            <div className="flex flex-col gap-2">
              {cooking.recommendations.map((rec) => (
                <motion.div
                  key={rec.dishId}
                  className="flex items-center justify-between rounded-btn border border-bmw-hairline bg-bmw-surface-soft px-4 py-3 transition-all duration-200 hover:border-accent/30"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-bmw-ink">{rec.dishName}</span>
                    <span className="text-xs font-light text-bmw-muted">
                      Planned: {rec.planned} → Recommended: <span className="font-semibold text-accent">{rec.recommended}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-bold text-accent">
                      {Math.round(rec.confidence * 100)}%
                    </span>
                    <span className="text-xs font-bold text-success">
                      ₹{Math.round(rec.savings)}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center py-8 text-sm font-light text-bmw-muted">
              Click "Run Prediction" to get started
            </div>
          )}
        </div>

        <div className="rounded-card border border-bmw-hairline bg-bmw-canvas p-5 shadow-card transition-all duration-300 hover:shadow-card-hover">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-accent" />
              <div>
                <h2 className="text-title-sm text-bmw-ink">What Affects Today</h2>
                <p className="text-[10px] text-bmw-muted-soft">Weather, events, and past trends that shaped this forecast</p>
              </div>
            </div>
            <Badge variant="info">AI</Badge>
          </div>
          {loadingPred ? (
            <div className="flex flex-col gap-3">
              {[1,2,3].map((i) => (
                <div key={i} className="skeleton h-8 rounded-btn" />
              ))}
            </div>
          ) : pred?.factors?.length ? (
            <div className="flex flex-col gap-3">
              {pred.factors.map((f, i) => (
                <motion.div
                  key={i}
                  className="flex items-center justify-between border-b border-bmw-hairline pb-2 last:border-0"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <span className="text-xs text-bmw-muted">{f.label}</span>
                  <span className="text-right text-xs font-bold text-bmw-ink">{f.impact}</span>
                </motion.div>
              ))}
              <div className="mt-2 rounded-btn p-3" style={{ background: "color-mix(in srgb, var(--color-accent) 8%, transparent)" }}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-[1.2px] text-accent">
                    Today's Estimate
                  </span>
                  <span className="text-title-sm text-accent">{pred.predictedCustomers}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-4 text-sm font-light text-bmw-muted">No prediction yet</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-card border border-bmw-hairline bg-bmw-canvas p-5 shadow-card transition-all duration-300 hover:shadow-card-hover">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-accent" />
              <div>
                <h2 className="text-title-sm text-bmw-ink">How Accurate We've Been</h2>
                <p className="text-[10px] text-bmw-muted-soft">Our estimated vs actual customers — we improve every week</p>
              </div>
            </div>
            <Badge variant={history?.accuracyOverTime?.length ? "success" : "default"}>
              {history?.accuracyOverTime?.length ? "Tracking" : "No data"}
            </Badge>
          </div>
          {history?.accuracyOverTime?.length ? (
            <AccuracyChart data={history.accuracyOverTime} />
          ) : (
            <div className="flex h-64 items-center justify-center text-sm font-light text-bmw-muted">
              Collect data to see accuracy trends
            </div>
          )}
        </div>

        <div className="rounded-card border border-bmw-hairline bg-bmw-canvas p-5 shadow-card transition-all duration-300 hover:shadow-card-hover">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Utensils size={16} className="text-accent" />
              <div>
                <h2 className="text-title-sm text-bmw-ink">Where Food Went</h2>
                <p className="text-[10px] text-bmw-muted-soft">Breakdown of what was sold, leftover, and wasted today</p>
              </div>
            </div>
            <Badge variant="info">Today</Badge>
          </div>
          {stats?.totalPrepared ? (
            <WastePieChart
              data={[
                { name: "Sold", value: Math.max(stats.totalSold, 0), color: "#22c55e" },
                { name: "Leftover", value: Math.max(stats.totalPrepared - stats.totalSold - (stats as any).totalWasted || 0, 0), color: "var(--color-accent)" },
                { name: "Wasted", value: Math.max((stats as any).totalWasted || 0, 0), color: "#dc2626" },
              ]}
            />
          ) : (
            <div className="flex h-48 items-center justify-center text-sm font-light text-bmw-muted">
              No data available
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-card border border-bmw-hairline bg-bmw-canvas p-5 shadow-card transition-all duration-300 hover:shadow-card-hover">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart size={16} className="text-accent" />
              <div>
                <h2 className="text-title-sm text-bmw-ink">Active Donations</h2>
                <p className="text-[10px] text-bmw-muted-soft">Extra food matched with NGOs for pickup</p>
              </div>
            </div>
            <Badge variant="warning">
              {donations?.donations?.filter((d) => d.status === "pending" || d.status === "matched").length || 0} Active
            </Badge>
          </div>
          {donations?.donations?.length ? (
            <div className="flex flex-col gap-2">
              {donations.donations.slice(0, 3).map((d, i) => (
                <motion.div
                  key={d.id}
                  className="flex items-center justify-between rounded-btn border border-bmw-hairline bg-bmw-surface-soft px-4 py-3 transition-all duration-200 hover:border-accent/30"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-bmw-ink">{d.ngo?.name || "Unassigned"}</span>
                    <span className="text-xs font-light text-bmw-muted">
                      {d.weightKg}kg · {d.mealEquivalent} meals
                    </span>
                  </div>
                  <Badge
                    variant={d.status === "delivered" ? "success" : d.status === "matched" ? "info" : "warning"}
                  >
                    {d.status}
                  </Badge>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-sm font-light text-bmw-muted">No donations yet</div>
          )}
        </div>

        <div className="rounded-card border border-bmw-hairline bg-bmw-canvas p-5 shadow-card transition-all duration-300 hover:shadow-card-hover">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-accent" />
              <div>
                <h2 className="text-title-sm text-bmw-ink">Accuracy Over Time</h2>
                <p className="text-[10px] text-bmw-muted-soft">How close our estimates were to actual customers</p>
              </div>
            </div>
            <Badge variant={history?.latestAccuracy?.count ? "success" : "default"}>
              {history?.latestAccuracy?.count ? "Improving" : "No data"}
            </Badge>
          </div>
          {history?.accuracyOverTime?.length ? (
            <div className="flex flex-col gap-2">
              {history.accuracyOverTime.slice(-8).map((h, i) => {
                const pct = h.actual ? Math.round(100 - (Math.abs(h.predicted - h.actual) / h.actual) * 100) : 0
                return (
                  <motion.div
                    key={i}
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <span className="w-16 text-xs text-bmw-muted">{h.date.slice(5)}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full" style={{ background: "var(--color-bg-strong)" }}>
                      <motion.div
                        className="h-full rounded-full transition-all"
                        style={{
                          background: pct > 80
                            ? "var(--color-success)"
                            : pct > 60
                            ? "var(--color-warning)"
                            : "var(--color-error)"
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(pct, 5)}%` }}
                        transition={{ duration: 0.8, delay: i * 0.05, ease: "easeOut" }}
                      />
                    </div>
                    <span className={`text-xs font-bold ${
                      pct > 80 ? "text-success" : pct > 60 ? "text-warning" : "text-error"
                    }`}>
                      {pct}%
                    </span>
                  </motion.div>
                )
              })}
            </div>
          ) : (
            <div className="py-8 text-center text-sm font-light text-bmw-muted">Collect data to see accuracy</div>
          )}
        </div>
      </div>

      {inventory?.lowStock?.length ? (
        <FadeUp>
          <div className="rounded-card border border-bmw-hairline bg-bmw-canvas p-5 shadow-card transition-all duration-300 hover:shadow-card-hover">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-warning" />
                <div>
                  <h2 className="text-title-sm text-bmw-ink">Running Low</h2>
                  <p className="text-[10px] text-bmw-muted-soft">These ingredients need restocking soon</p>
                </div>
              </div>
              <Badge variant="warning">{inventory.totals.lowStockCount} Items</Badge>
            </div>
            <div className="flex flex-col gap-2">
              {inventory.lowStock.slice(0, 4).map((item: Record<string, unknown>) => (
                <motion.div
                  key={item.id as string}
                  className="flex items-center justify-between rounded-btn border border-bmw-hairline bg-bmw-surface-soft px-4 py-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <span className="text-sm text-bmw-ink">{item.ingredientName as string}</span>
                  <span className="text-xs font-bold text-warning">
                    {item.quantity as number} {item.unit as string} / {(item.threshold as number)} threshold
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </FadeUp>
      ) : null}
    </div>
  )
}
