"use client";

import { ThemeToggle } from "./ThemeToggle";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-6 gap-3">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[var(--foreground)]">{title}</h1>
        {subtitle && (
          <p className="text-[var(--color-muted)] mt-1 text-sm sm:text-base">{subtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <ThemeToggle />
        {action}
      </div>
    </div>
  );
}