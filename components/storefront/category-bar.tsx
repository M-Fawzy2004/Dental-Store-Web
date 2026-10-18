"use client";

import * as React from "react";
import {
  Sparkles,
  Scissors,
  Syringe,
  ShieldCheck,
  Eye,
  Package,
  Wrench,
  Smile,
  Activity,
  Layers,
  Zap,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  icon?: React.ReactNode;
}

export const defaultCategories: CategoryItem[] = [
  { id: "all", name: "جميع أصناف ومستلزمات الأسنان", slug: "all", icon: <Sparkles className="h-4 w-4" /> },
  { id: "surgical-instruments", name: "أدوات جراحة وخلع", slug: "surgical-instruments", icon: <Scissors className="h-4 w-4" /> },
  { id: "restorative-endodontics", name: "حشوات وعلاج جذور", slug: "restorative-endodontics", icon: <Syringe className="h-4 w-4" /> },
  { id: "diagnostic-periodontics", name: "فحص وتشخيص ولثة", slug: "diagnostic-periodontics", icon: <Eye className="h-4 w-4" /> },
  { id: "handpieces-equipment", name: "قبضات وتوربينات وأجهزة", slug: "handpieces-equipment", icon: <Zap className="h-4 w-4" /> },
  { id: "anesthesia-syringes", name: "بنج وتخدير موضعي", slug: "anesthesia-syringes", icon: <Activity className="h-4 w-4" /> },
  { id: "impression-prosthodontics", name: "طبعات وتركيبات وتثبيت", slug: "impression-prosthodontics", icon: <Smile className="h-4 w-4" /> },
  { id: "orthodontics", name: "تقويم الأسنان", slug: "orthodontics", icon: <Wrench className="h-4 w-4" /> },
  { id: "sterilization-infection-control", name: "تعقيم ومكافحة عدوى", slug: "sterilization-infection-control", icon: <ShieldCheck className="h-4 w-4" /> },
  { id: "disposables", name: "مستهلكات ووقايات العيادة", slug: "disposables", icon: <Package className="h-4 w-4" /> },
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
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(true);

  const checkScroll = React.useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    // In RTL, scrollLeft can be negative or positive depending on browser implementation
    const scrollLeft = Math.abs(el.scrollLeft);
    const maxScroll = el.scrollWidth - el.clientWidth;

    setCanScrollRight(scrollLeft > 10);
    setCanScrollLeft(scrollLeft < maxScroll - 10);
  }, []);

  React.useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll]);

  const scroll = (direction: "left" | "right") => {
    const el = scrollContainerRef.current;
    if (!el) return;
    // RTL scroll step
    const step = 280;
    el.scrollBy({
      left: direction === "left" ? -step : step,
      behavior: "smooth",
    });
  };

  return (
    <div className={cn("relative w-full group/cat", className)}>
      {/* Scroll Right Button (moves toward right in RTL) */}
      <button
        type="button"
        onClick={() => scroll("right")}
        aria-label="التمرير لليمين"
        className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20 h-8 w-8 items-center justify-center rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-md border border-slate-200 dark:border-slate-700 hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-slate-700 transition-all cursor-pointer opacity-80 hover:opacity-100"
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      {/* Scrollable Container with Smooth Touch */}
      <div
        ref={scrollContainerRef}
        className="w-full overflow-x-auto pb-2 scrollbar-none scroll-smooth touch-pan-x select-none"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <div className="flex items-center gap-2 min-w-max px-2 py-1">
          {categories.map((category) => {
            const isSelected = selectedSlug === category.slug;
            return (
              <button
                key={category.id}
                onClick={() => onSelectCategory(category.slug)}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all duration-200 cursor-pointer select-none active:scale-95 whitespace-nowrap",
                  isSelected
                    ? "bg-orange-600 text-white shadow-md shadow-orange-600/30 scale-[1.02] border border-orange-500 ring-2 ring-orange-500/20"
                    : "bg-white text-slate-700 hover:bg-slate-50 hover:text-orange-600 border border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800 dark:hover:bg-slate-800/80 dark:hover:text-orange-400"
                )}
              >
                {category.icon && (
                  <span className={cn(isSelected ? "text-white" : "text-slate-400")}>
                    {category.icon}
                  </span>
                )}
                <span>{category.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Scroll Left Button (moves toward left in RTL) */}
      <button
        type="button"
        onClick={() => scroll("left")}
        aria-label="التمرير لليسار"
        className="hidden md:flex absolute -left-3 top-1/2 -translate-y-1/2 z-20 h-8 w-8 items-center justify-center rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-md border border-slate-200 dark:border-slate-700 hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-slate-700 transition-all cursor-pointer opacity-80 hover:opacity-100"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
    </div>
  );
}
