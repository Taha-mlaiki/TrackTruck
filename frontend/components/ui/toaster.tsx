"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        style: {
          background: "hsl(var(--card))",
          color: "hsl(var(--card-foreground))",
          border: "1px solid hsl(var(--border))",
        },
        classNames: {
          success: "!bg-emerald-50 !border-emerald-200 !text-emerald-800 dark:!bg-emerald-950 dark:!border-emerald-800 dark:!text-emerald-200",
          error: "!bg-red-50 !border-red-200 !text-red-800 dark:!bg-red-950 dark:!border-red-800 dark:!text-red-200",
          info: "!bg-cyan-50 !border-cyan-200 !text-cyan-800 dark:!bg-cyan-950 dark:!border-cyan-800 dark:!text-cyan-200",
          warning: "!bg-amber-50 !border-amber-200 !text-amber-800 dark:!bg-amber-950 dark:!border-amber-800 dark:!text-amber-200",
        },
      }}
      richColors
      closeButton
    />
  );
}
