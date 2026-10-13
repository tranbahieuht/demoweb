"use client";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ReactNode, KeyboardEventHandler } from "react";
// Selective shadcn/ui pattern: Radix supplies focus trapping, Escape, and focus restoration.
export function Dialog({
  open,
  onOpenChange,
  title,
  children,
  className = "",
  closeLabel = "Close",
  onKeyDown,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
  className?: string;
  closeLabel?: string;
  onKeyDown?: KeyboardEventHandler<HTMLDivElement>;
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="dialog-overlay" />
        <DialogPrimitive.Content
          className={`dialog-content ${className}`}
          aria-describedby={undefined}
          onKeyDown={onKeyDown}
        >
          <DialogPrimitive.Title className="dialog-title">
            {title}
          </DialogPrimitive.Title>
          <DialogPrimitive.Close
            className="dialog-close"
            aria-label={closeLabel}
          >
            <X size={22} />
          </DialogPrimitive.Close>
          {children}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
