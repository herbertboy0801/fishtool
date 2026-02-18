"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  rightSlot?: ReactNode;
}

export function PageHeader({ title, subtitle, showBack = true, rightSlot }: PageHeaderProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="flex items-center gap-3 px-4 py-3">
        {showBack && (
          <button
            onClick={() => router.back()}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-card touch-feedback"
            aria-label="返回"
          >
            ←
          </button>
        )}
        <div className="flex-1">
          <h1 className="text-lg font-semibold">{title}</h1>
          {subtitle && (
            <p className="text-xs text-muted">{subtitle}</p>
          )}
        </div>
        {rightSlot && <div className="flex items-center">{rightSlot}</div>}
      </div>
    </header>
  );
}
