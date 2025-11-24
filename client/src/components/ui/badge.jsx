import * as React from "react"

// Simple class merger helper
// (If you already have a 'cn' utility in @/lib/utils, you can import that instead)
function cn(...inputs) {
  return inputs.filter(Boolean).join(" ");
}

const Badge = React.forwardRef(({ className, variant = "default", ...props }, ref) => {
  
  // 1. Base Layout Styles
  const baseClass = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";

  // 2. Variant Styles (Using standard Slate colors as safe defaults)
  const variants = {
    default: "border-transparent bg-slate-900 text-white hover:bg-slate-700 shadow",
    secondary: "border-transparent bg-slate-100 text-slate-900 hover:bg-slate-200",
    destructive: "border-transparent bg-red-500 text-white shadow hover:bg-red-600",
    outline: "text-slate-950 border-slate-200",
  };

  const variantClass = variants[variant] || variants.default;

  return (
    <div
      ref={ref}
      // className prop is put last to allow overriding colors (e.g. bg-blue-100)
      className={cn(baseClass, variantClass, className)}
      {...props}
    />
  )
})

Badge.displayName = "Badge"

export { Badge }