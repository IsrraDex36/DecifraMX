"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      closeButton={false}
      richColors={false}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-card group-[.toaster]:text-card-foreground group-[.toaster]:border group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:rounded-md",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success:
            "group-[.toaster]:border-primary/30 group-[.toaster]:[--toast-icon-theme:var(--primary)]",
          error:
            "group-[.toaster]:border-destructive/30 group-[.toaster]:[--toast-icon-theme:var(--destructive)]",
          warning:
            "group-[.toaster]:border-border group-[.toaster]:[--toast-icon-theme:var(--muted-foreground)]",
          info:
            "group-[.toaster]:border-primary/20 group-[.toaster]:[--toast-icon-theme:var(--primary)]",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
