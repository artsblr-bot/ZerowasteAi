import { clsx } from "clsx"

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
  bordered?: boolean
}

export function Card({ children, className, hover = false, onClick, bordered = false }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        "bg-bmw-canvas",
        bordered && "border border-bmw-hairline",
        hover && "cursor-pointer transition-shadow hover:shadow-sm",
        className,
      )}
    >
      {children}
    </div>
  )
}
