"use client"

import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { Badge } from "@/components/ui/Badge"
import { StatsCard } from "@/components/ui/StatsCard"
import { Button } from "@/components/ui/Button"
import { FadeUp, StaggerContainer, StaggerItem, HoverCard } from "@/components/motion/MotionComponents"
import { motion } from "framer-motion"
import { TrendingUp, UtensilsCrossed, BarChart3, Zap } from "lucide-react"

export default function PredictionsPage() {
  const { data: pred, isLoading: loadingPred } = useQuery({
    queryKey: ["predictions-demand"],
    queryFn: () => api.predictions.demand(),
  })

  const { data: cooking } = useQuery({
    queryKey: ["predictions-cooking", pred?.predictedCustomers],
    queryFn: () => api.predictions.cooking(undefined, pred?.predictedCustomers),
    enabled: !!pred?.predictedCustomers,
  })

  const { data: surplus } = useQuery({
    queryKey: ["predictions-surplus"],
    queryFn: () => api.predictions.surplus(),
  })

  const { data: history } = useQuery({
    queryKey: ["predictions-history"],
    queryFn: () => api.predictions.history(),
  })

  return (
    <div className="flex flex-col gap-6 pb-20">
      <FadeUp>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-display-sm text-bmw-ink">AI Predictions</h1>
            <p className="mt-1 text-sm font-light text-bmw-muted">
              Demand forecasting · Cooking recommendations · Inventory
            </p>
          </div>
          <Button variant="secondary">View History</Button>
        </div>
      </FadeUp>

      <StaggerContainer className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StaggerItem>
          <StatsCard
            label="Demand Prediction"
            value={loadingPred ? "..." : String(pred?.predictedCustomers ?? "—")}
            sublabel={pred ? `${Math.round(pred.confidence * 100)}% confidence` : ""}
            trend="up"
          />
        </StaggerItem>
        <StaggerItem>
          <StatsCard
            label="Walk-ins Expected"
            value={pred ? `~${Math.round(pred.predictedCustomers * 0.4)}` : "—"}
            sublabel="40% of total estimated"
            trend="neutral"
          />
        </StaggerItem>
        <StaggerItem>
          <StatsCard
            label="Surplus Forecast"
            value={surplus ? `${surplus.expectedSurplus} kg` : "—"}
            sublabel={surplus ? `After ${surplus.readyAt}` : ""}
            trend="down"
          />
        </StaggerItem>
      </StaggerContainer>

      <FadeUp>
        <div className="rounded-card border border-bmw-hairline bg-bmw-canvas p-5 shadow-card transition-all duration-300 hover:shadow-card-hover">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-title-sm text-bmw-ink">Demand Forecast Factors</h2>
            <Badge variant="info">AI Active</Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {pred?.factors?.map((f, i) => (
              <motion.div
                key={i}
                className="flex items-center justify-between rounded-btn border border-bmw-hairline bg-bmw-surface-soft px-4 py-3"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <span className="text-sm text-bmw-ink">{f.label}</span>
                <span className="text-xs font-bold text-bmw-muted">{f.impact}</span>
              </motion.div>
            ))}
          </div>
          <div className="mt-4 rounded-btn p-4" style={{ background: "color-mix(in srgb, var(--color-accent) 8%, transparent)" }}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[1.2px] text-accent">
                Final Prediction
              </span>
              <span className="text-display-sm text-accent">
                {pred?.predictedCustomers ?? "—"} customers
              </span>
            </div>
            <p className="mt-1 text-xs font-light text-bmw-muted">
              Nobody typed this. The AI calculated it.
            </p>
          </div>
        </div>
      </FadeUp>

      <FadeUp delay={0.1}>
        <div className="rounded-card border border-bmw-hairline bg-bmw-canvas p-5 shadow-card transition-all duration-300 hover:shadow-card-hover">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-title-sm text-bmw-ink">Cooking Recommendations</h2>
            <Badge variant="info">Cost Optimized</Badge>
          </div>
          <div className="flex flex-col gap-2">
            {cooking?.recommendations?.map((rec, i) => (
              <motion.div
                key={rec.dishId}
                className="flex items-center justify-between rounded-btn border border-bmw-hairline bg-bmw-surface-soft px-4 py-3 transition-all duration-200 hover:border-accent/30"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-bmw-ink">{rec.dishName}</span>
                  <span className="text-xs font-light text-bmw-muted">
                    {rec.planned} → {rec.recommended} servings
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-12 overflow-hidden rounded-full" style={{ background: "var(--color-bg-strong)" }}>
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: "var(--color-accent)" }}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.round(rec.confidence * 100)}%` }}
                        transition={{ duration: 0.6, delay: i * 0.05 }}
                      />
                    </div>
                    <span className="text-xs text-bmw-muted">{Math.round(rec.confidence * 100)}%</span>
                  </div>
                  <span className="text-xs font-bold text-success">₹{Math.round(rec.savings)}</span>
                </div>
              </motion.div>
            ))}
          </div>
          {cooking?.totalSavings && (
            <div className="mt-4 rounded-btn p-4" style={{ background: "color-mix(in srgb, var(--color-success) 8%, var(--color-bg-soft))" }}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-light text-bmw-muted">Total Estimated Savings</span>
                <span className="text-title-sm text-success">₹{cooking.totalSavings}</span>
              </div>
            </div>
          )}
        </div>
      </FadeUp>

      <FadeUp delay={0.15}>
        <div className="rounded-card border border-bmw-hairline bg-bmw-canvas p-5 shadow-card transition-all duration-300 hover:shadow-card-hover">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-title-sm text-bmw-ink">Weekly Accuracy Trend</h2>
            <Badge variant={history?.accuracyOverTime?.length ? "success" : "default"}>
              {history?.accuracyOverTime?.length ? "Improving" : "No data"}
            </Badge>
          </div>
          {history?.accuracyOverTime?.length ? (
            <div className="flex items-end justify-between gap-2">
              {history.accuracyOverTime.slice(-8).map((h, i) => {
                const pct = h.actual ? Math.round(100 - (Math.abs(h.predicted - h.actual) / h.actual) * 100) : 50
                return (
                  <motion.div
                    key={i}
                    className="flex flex-1 flex-col items-center gap-1"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <motion.div
                      className="w-full rounded-t"
                      style={{
                        background: pct > 80 ? "var(--color-success)" : pct > 60 ? "var(--color-warning)" : "var(--color-error)"
                      }}
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(pct * 0.6, 8)}px` }}
                      transition={{ duration: 0.5, delay: i * 0.05 }}
                    />
                    <span className="text-[10px] text-bmw-muted">{h.date.slice(5)}</span>
                  </motion.div>
                )
              })}
            </div>
          ) : (
            <div className="py-8 text-center text-sm font-light text-bmw-muted">Collect data over time</div>
          )}
        </div>
      </FadeUp>

      <FadeUp delay={0.2}>
        <div className="rounded-card border border-bmw-hairline bg-bmw-canvas p-5 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-title-sm text-bmw-ink">What If Scenarios</h2>
            <Badge variant="default">Simulation</Badge>
          </div>
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 gap-4" delay={0.05}>
            <StaggerItem>
              <HoverCard className="rounded-btn border border-bmw-hairline bg-bmw-surface-soft p-4 transition-all duration-200">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm font-bold text-bmw-ink">No Rain</span>
                  <span className="text-sm font-bold text-success">+18%</span>
                </div>
                <span className="text-xs font-bold text-bmw-ink">~368 customers</span>
                <p className="mt-1 text-xs font-light text-bmw-muted">Without rain, walk-ins return to normal</p>
              </HoverCard>
            </StaggerItem>
            <StaggerItem>
              <HoverCard className="rounded-btn border border-bmw-hairline bg-bmw-surface-soft p-4">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm font-bold text-bmw-ink">Rain + No Match</span>
                  <span className="text-sm font-bold text-error">−25%</span>
                </div>
                <span className="text-xs font-bold text-bmw-ink">~260 customers</span>
                <p className="mt-1 text-xs font-light text-bmw-muted">Heavy rain and no event offset</p>
              </HoverCard>
            </StaggerItem>
            <StaggerItem>
              <HoverCard className="rounded-btn border border-bmw-hairline bg-bmw-surface-soft p-4">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm font-bold text-bmw-ink">Weekend Promotion</span>
                  <span className="text-sm font-bold text-success">+22%</span>
                </div>
                <span className="text-xs font-bold text-bmw-ink">~380 customers</span>
                <p className="mt-1 text-xs font-light text-bmw-muted">If you run the 20% off offer</p>
              </HoverCard>
            </StaggerItem>
            <StaggerItem>
              <HoverCard className="rounded-btn border border-bmw-hairline bg-bmw-surface-soft p-4">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm font-bold text-bmw-ink">Match Day + Good Weather</span>
                  <span className="text-sm font-bold text-success">+35%</span>
                </div>
                <span className="text-xs font-bold text-bmw-ink">~420 customers</span>
                <p className="mt-1 text-xs font-light text-bmw-muted">Best case: all factors positive</p>
              </HoverCard>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </FadeUp>
    </div>
  )
}
