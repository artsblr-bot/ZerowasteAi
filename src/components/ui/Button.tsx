import { clsx } from "clsx"
import { motion } from "framer-motion"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "on-dark"
  size?: "sm" | "md" | "lg"
  children: React.ReactNode
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      className={clsx(
        "inline-flex items-center justify-center font-bold transition-all duration-300",
        {
          "rounded-btn text-white": variant === "primary",
          "rounded-btn border border-bmw-hairline-strong bg-bmw-canvas text-bmw-ink": variant === "secondary",
          "rounded-btn text-xs font-bold uppercase tracking-uppercase text-bmw-ink": variant === "ghost",
          "rounded-btn border border-white/20 text-white": variant === "on-dark",
        },
        {
          "px-4 py-2 text-xs": size === "sm",
          "px-6 py-[14px] text-sm leading-none": size === "md",
          "px-12 py-4 text-base": size === "lg",
        },
        variant === "primary" && size === "md" && "h-11",
        className,
      )}
      style={variant === "primary" ? { background: "linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))" } : undefined}
      whileHover={!props.disabled ? { y: -1 } : {}}
      whileTap={!props.disabled ? { y: 0 } : {}}
      {...(props as any)}
    >
      {children}
      {variant === "ghost" && <span className="ml-1">›</span>}
    </motion.button>
  )
}
