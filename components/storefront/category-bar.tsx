"use client";

import * as React from "react";
import { Sparkles, Scissors, Syringe, ShieldAlert, Eye, Package } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  icon?: React.ReactNode;
}

export const defaultCategories: CategoryItem[] = [
  { id: "all", name: "جميع الأقسام", slug: "all", icon: <Sparkles className="h-4 w-4" /> },
  { id: "surgical-instruments", name: "أدوات جراحة وخلع", slug: "surgical-instruments", icon: <Scissors className="h-4 w-4" /> },
  { id: "restorative-instruments", name: "حشوات وترميم", slug: "restorative-instruments", icon: <Syringe className="h-4 w-4" /> },
  { id: "sterilization-infection-control", name: "تعقيم ومكافحة عدوى", slug: "sterilization-infection-control", icon: <ShieldAlert className="h-4 w-4" /> },
  { id: "diagnostic-instruments", name: "فحص وتشخيص", slug: "diagnostic-instruments", icon: <Eye className="h-4 w-4" /> },
  { id: "disposables", name: "مستهلكات العيادة", slug: "disposables", icon: <Package className="h-4 w-4" /> },
];

interface CategoryBarProps {
  categories?: CategoryItem[];
  selectedSlug: string;
  onSelectCategory: (slug: string) => void;
  className?: string;
}

export function CategoryBar({
  categories = defaultCategories,
  selectedSlug,
  onSelectCategory,
  className,
}: CategoryBarProps) {
  return (
    <div className={cn("w-full overflow-x-auto pb-2 scrollbar-none", className)}>
      <div className="flex items-center gap-2 min-w-max px-1">
        {categories.map((category) => {
          const isSelected = selectedSlug === category.slug;
          return (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category.slug)}
              className={cn(
                "flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all duration-200 cursor-pointer select-none",
                isSelected
                  ? "bg-cyan-700 text-white shadow-md shadow-cyan-900/20 scale-[1.02]"
                  : "bg-white text-slate-700 hover:bg-slate-100 hover:text-cyan-800 border border-slate-200/80 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800 dark:hover:bg-slate-800"
              )}
            >
              {category.icon && (
                <span className={cn(isSelected ? "text-cyan-200" : "text-slate-400")}>
                  {category.icon}
                </span>
              )}
              <span>{category.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
