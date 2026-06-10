import * as React from "react"
import { cn } from "@/utils/cn"

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-sm border border-input bg-background px-3 py-2 text-xs font-semibold text-foreground file:border-0 file:bg-transparent file:text-xs file:font-bold placeholder:text-muted-foreground/55 focus-visible:outline-none focus:border-ring focus:ring-1 focus:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 transition-all",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
