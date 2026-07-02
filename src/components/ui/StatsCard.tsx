import { clsx } from "clsx"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface StatsCardProps {
  label: string
  value: string
  sublabel?: string
  trend?: "up" | "down" | "neutral"
  icon?: React.ReactNode
}

export function StatsCard({ label, value, sublabel, trend, icon }: StatsCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-card border border-bmw-hairline bg-bmw-canvas p-5 shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5">
      <div className="absolute right-0 top-0 h-20 w-20 translate-x-6 -translate-y-6 rounded-full opacity-[0.04] transition-all duration-500 group-hover:scale-150 group-hover:opacity-[0.08]" style={{ background: "var(--color-accent)" }} />
      <div className="relative">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-[1.2px] text-bmw-muted">
            {label}
          </span>
          {icon ? (
            <span className="text-bmw-muted-soft transition-colors duration-200 group-hover:text-accent">
              {icon}
            </span>
          ) : trend === "up" ? (
            <TrendingUp size={14} className="text-accent" />
          ) : trend === "down" ? (
            <TrendingDown size={14} className="text-error" />
          ) : trend === "neutral" ? (
            <Minus size={14} className="text-bmw-muted" />
          ) : null}
        </div>
        <div className="text-[clamp(1.25rem,2.5vw,1.75rem)] font-bold tracking-tight text-bmw-ink">
          {value}
        </div>
        {sublabel && (
          <div className="mt-1 text-xs font-light text-bmw-muted">{sublabel}</div>
        )}
      </div>
    </div>
  )
}
