"use client";

import { forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const styles: Record<Variant, string> = {
  primary:
    "bg-terracotta text-bone hover:bg-terra-deep shadow-rest hover:shadow-raised",
  secondary:
    "bg-transparent text-bone border border-oxidized hover:bg-oxidized/10",
  ghost: "bg-transparent text-travertine hover:text-bone",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", className = "", ...props }, ref) => (
    <button
      ref={ref}
      className={`min-h-[44px] px-6 py-2.5 rounded-sm font-sans text-sm tracking-wide uppercase transition-all duration-200 ease-out disabled:opacity-40 disabled:cursor-not-allowed ${styles[variant]} ${className}`}
      {...props}
    />
  ),
);
Button.displayName = "Button";
