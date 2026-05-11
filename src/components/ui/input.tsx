import * as React from "react"
import { cn } from "@/utils/cn"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-sm border border-slate-200 bg-white px-3 py-2 text-xs font-semibold file:border-0 file:bg-transparent file:text-xs file:font-bold placeholder:text-slate-300 focus-visible:outline-none focus:border-slate-850 focus:ring-1 focus:ring-slate-850 disabled:cursor-not-allowed disabled:opacity-50 transition-all text-slate-800",
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
