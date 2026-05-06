"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4 text-success" />,
        info: <InfoIcon className="size-4 text-primary" />,
        warning: <TriangleAlertIcon className="size-4 text-amber-400" />,
        error: <OctagonXIcon className="size-4 text-danger" />,
        loading: <Loader2Icon className="size-4 animate-spin text-dimmed" />,
      }}
      style={
        {
          "--normal-bg": "#222222",
          "--normal-text": "#f0f0f0",
          "--normal-border": "#2c2c2c",
          "--border-radius": "0.75rem",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "!shadow-2xl !shadow-black/60",
          title: "!text-[#f0f0f0] !font-semibold !text-sm",
          description: "!text-[#9a9a9a] !text-xs !leading-relaxed",
          actionButton:
            "!bg-primary !text-background !text-xs !font-semibold !rounded-md !px-3 !py-1.5 hover:!opacity-90 !border-0",
          cancelButton:
            "!bg-transparent !text-dimmed !text-xs !border !border-edge !rounded-md !px-3 !py-1.5 hover:!text-foreground",
          closeButton:
            "!bg-surface-2 !border-edge !text-muted hover:!text-foreground hover:!bg-surface",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
