import { clsx } from "clsx"

interface BadgeProps {
  variant?: "success" | "warning" | "error" | "info" | "default"
  children: React.ReactNode
  className?: string
}

export function Badge({ variant = "default", children, className }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[1px]",
        {
          "bg-success/10 text-success": variant === "success",
          "bg-warning/10 text-warning": variant === "warning",
          "bg-error/10 text-error": variant === "error",
          "bg-accent/10 text-accent": variant === "info",
          "bg-bmw-surface-strong text-bmw-muted": variant === "default",
        },
        className,
      )}
    >
      {variant === "info" && <span className="h-1.5 w-1.5 rounded-full bg-accent" />}
      {children}
    </span>
  )
}
