"use client";

import * as React from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Search,
  Wrench,
  Phone,
  ShieldCheck,
  Lock,
  Layers,
} from "lucide-react";
import { useCartStore } from "@/lib/store/use-cart-store";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface NavbarProps {
  onSearchClick?: () => void;
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
}

export function Navbar({ onSearchClick, searchQuery, onSearchChange }: NavbarProps) {
  const [mounted, setMounted] = React.useState(false);
  const [showMobileSearch, setShowMobileSearch] = React.useState(false);
  const items = useCartStore((state) => state.items);
  const openDrawer = useCartStore((state) => state.openDrawer);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const totalItems = mounted ? items.reduce((acc, item) => acc + item.quantity, 0) : 0;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#090d16]/95 backdrop-blur-md transition-colors print:hidden no-print">
      {/* Top Banner Notice - Industrial Dark Bar */}
      <div className="bg-slate-900 px-4 py-1.5 text-center text-xs text-slate-200 flex items-center justify-between max-w-7xl mx-auto border-b border-slate-800">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-3.5 w-3.5 text-orange-400" />
          <span className="font-medium text-[11px] sm:text-xs">
            أدوات ومعدات أصلية معتمدة • شحن سريع لجميع محافظات مصر • فواتير ضريبية ومعاينة قبل الدفع 🇪🇬
          </span>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://wa.me/201068808559"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-1.5 text-[11px] text-emerald-400 hover:text-emerald-300 font-bold"
          >
            <Phone className="h-3 w-3" />
            <span>01068808559</span>
          </a>

          <Link
            href="/admin/login"
            className="flex items-center gap-1 text-[11px] text-orange-300 hover:text-white font-bold transition-colors bg-white/10 hover:bg-orange-600 px-2 py-0.5 rounded-md"
          >
            <Lock className="h-3 w-3" />
            <span>لوحة تحكم الإدارة</span>
          </Link>
        </div>
      </div>

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">
        {/* Brand Logo - Engineering Tools Style */}
        <Link
          href="/"
          className="flex items-center gap-2.5 transition-opacity hover:opacity-90 group select-none"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-600 text-white shadow-md shadow-orange-600/30 group-hover:bg-orange-500 transition-colors flex-shrink-0">
            <Wrench className="h-5 w-5" />
          </div>
          <div className="flex flex-col text-right">
            <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>تكنو دنتال ستور</span>
              <span className="text-[10px] font-black text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/80 px-1.5 py-0.2 rounded border border-orange-200 dark:border-orange-800">
                PRO
              </span>
            </span>
            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
              أدوات ومستلزمات طب وجراحة الأسنان
            </span>
          </div>
        </Link>

        {/* Center Search Bar (Desktop) */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="ابحث في جميع أصناف الأسنان: جراحة، حشوات، توربينات، بنج، طبعات، تقويم، تعقيم..."
              value={searchQuery ?? ""}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="w-full h-10 pr-10 pl-4 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 focus:border-orange-500 focus:bg-white dark:focus:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none transition-all shadow-inner"
            />
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Mobile search button */}
          <button
            onClick={() => {
              setShowMobileSearch(!showMobileSearch);
              onSearchClick?.();
            }}
            className="md:hidden flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="بحث"
          >
            <Search className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          </button>

          {/* Light / Dark Mode Toggle Button */}
          <ThemeToggle />

          {/* Direct WhatsApp contact button */}
          <a
            href="https://wa.me/201068808559"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors"
          >
            <Phone className="h-3.5 w-3.5" />
            <span>طلب فوري</span>
          </a>

          {/* Interactive Cart Button with Live Badge */}
          <button
            onClick={openDrawer}
            className="relative flex items-center gap-2 h-10 px-3 sm:px-3.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs transition-all active:scale-95 group cursor-pointer shadow-md shadow-orange-600/20"
            aria-label="سلة المشتريات"
          >
            <ShoppingBag className="h-4 w-4 transition-transform group-hover:scale-110" />
            <span className="hidden sm:inline">السلة</span>
            {totalItems > 0 && (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-slate-950 text-white px-1 text-[11px] font-black border border-orange-400">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Expandable Mobile Search Bar */}
      {showMobileSearch && (
        <div className="md:hidden px-4 pb-3 pt-1 border-t border-slate-100 dark:border-slate-800 animate-in slide-in-from-top-2 duration-200">
          <div className="relative w-full">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-500" />
            <input
              type="text"
              placeholder="ابحث في جميع أصناف الأسنان..."
              value={searchQuery ?? ""}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="w-full h-10 pr-10 pl-4 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 shadow-inner"
              autoFocus
            />
          </div>
        </div>
      )}
    </header>
  );
}
