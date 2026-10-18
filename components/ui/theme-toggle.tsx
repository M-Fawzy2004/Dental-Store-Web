"use client";

import * as React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className = "", showLabel = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`h-9 w-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 ${className}`} />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`group relative flex items-center gap-2 p-2 rounded-xl border transition-all duration-200 cursor-pointer ${
        isDark
          ? "border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-amber-400 hover:text-amber-300"
          : "border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900"
      } ${className}`}
      title={isDark ? "التبديل إلى الوضع الفاتح (Light Mode)" : "التبديل إلى الوضع الليلي (Dark Mode)"}
      aria-label="تبديل مظهر الموقع"
    >
      {isDark ? (
        <Sun className="h-4 w-4 transition-transform group-hover:rotate-45" />
      ) : (
        <Moon className="h-4 w-4 transition-transform group-hover:-rotate-12" />
      )}
      {showLabel && (
        <span className="text-xs font-bold">
          {isDark ? "الوضع الفاتح" : "الوضع الليلي"}
        </span>
      )}
    </button>
  );
}
