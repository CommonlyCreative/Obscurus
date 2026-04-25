"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "discord" | "secondary" | "ghost" | "primary outlined";
type ButtonSize = "sm" | "md" | "lg" | "xl";

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
  onClick?: () => void;
  fullWidth?: boolean;
  children: React.ReactNode;
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  "primary outlined": "border border-primary text-background font-bold hover:border-primary-dim transition-colors",
  primary:   "bg-primary text-background font-bold hover:bg-primary-dim transition-colors",
  discord:   "bg-discord text-white font-semibold hover:opacity-90 transition-opacity",
  secondary: "border border-edge text-dimmed font-medium hover:text-foreground hover:border-foreground/20 transition-colors",
  ghost:     "text-muted font-medium hover:text-primary transition-colors",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-4 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-sm",
  xl: "px-6 py-3 text-sm",
};

export function Button({
  variant = "primary",
  size = "md",
  href,
  onClick,
  fullWidth = false,
  children,
  className,
  type = "button",
  disabled,
}: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded cursor-pointer disabled:cursor-not-allowed disabled:opacity-50",
    variant !== "ghost" && sizeClasses[size],
    variantClasses[variant],
    fullWidth && "w-full",
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classes} onClick={onClick}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {children}
    </button>
  );
}
