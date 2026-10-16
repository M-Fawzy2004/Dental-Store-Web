"use client";

import * as React from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Search,
  Stethoscope,
  Phone,
  ShieldCheck,
  Lock,
} from "lucide-react";
import { useCartStore } from "@/lib/store/use-cart-store";

interface NavbarProps {
  onSearchClick?: () => void;
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
}

export function Navbar({ onSearchClick, searchQuery, onSearchChange }: NavbarProps) {
  const [mounted, setMounted] = React.useState(false);
  const items = useCartStore((state) => state.items);
  const openDrawer = useCartStore((state) => state.openDrawer);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const totalItems = mounted ? items.reduce((acc, item) => acc + item.quantity, 0) : 0;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90 transition-colors">
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-teal-800 via-cyan-800 to-slate-900 px-4 py-1.5 text-center text-xs font-medium text-white flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-3.5 w-3.5 text-teal-300" />
          <span>مستلزمات وأدوات طب أسنان أصلية معتمدة • شحن سريع لجميع محافظات مصر 🇪🇬</span>
        </div>

        <Link
          href="/admin/login"
          className="flex items-center gap-1.5 text-[11px] text-cyan-200 hover:text-white font-semibold transition-colors bg-white/10 hover:bg-white/20 px-2.5 py-0.5 rounded-lg"
        >
          <Lock className="h-3 w-3" />
          <span>لوحة التحكم (الإدارة)</span>
        </Link>
      </div>

      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 transition-opacity hover:opacity-90 group"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-600 to-teal-500 text-white shadow-md shadow-cyan-600/20 group-hover:scale-105 transition-transform">
            <Stethoscope className="h-6 w-6" />
          </div>
          <div className="flex flex-col text-right">
            <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>دينتال ستور</span>
              <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/60 px-1.5 py-0.5 rounded-md">
                مصر
              </span>
            </span>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Dental Supplies & Equipment
            </span>
          </div>
        </Link>

        {/* Center Search Bar (Desktop) */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="ابحث عن أدوات جراحة، بنج، حشوات، قبضة توربين..."
              value={searchQuery ?? ""}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="w-full h-10 pr-10 pl-4 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-transparent focus:border-cyan-500 focus:bg-white dark:focus:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile search button */}
          <button
            onClick={onSearchClick}
            className="md:hidden flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
            aria-label="بحث"
          >
            <Search className="h-5 w-5" />
          </button>

          {/* Direct WhatsApp contact */}
          <a
            href="https://wa.me/201068808559"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-2 text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 px-3 py-2 rounded-xl border border-emerald-200/60 dark:border-emerald-800/40 hover:bg-emerald-100 transition-colors"
          >
            <Phone className="h-3.5 w-3.5" />
            <span>طلب فوري واتساب</span>
          </a>

          {/* Interactive Cart Button with Live Badge */}
          <button
            onClick={openDrawer}
            className="relative flex items-center gap-2 h-11 px-3.5 sm:px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-semibold text-sm transition-all active:scale-95 group cursor-pointer"
            aria-label="سلة المشتريات"
          >
            <div className="relative">
              <ShoppingBag className="h-5 w-5 text-cyan-700 dark:text-cyan-400 group-hover:scale-110 transition-transform" />
              {totalItems > 0 && (
                <span className="absolute -top-2.5 -right-2.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-emerald-500 px-1 text-[11px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-slate-900 animate-in zoom-in">
                  {totalItems}
                </span>
              )}
            </div>
            <span className="hidden sm:inline text-xs font-bold">السلة</span>
          </button>
        </div>
      </div>
    </header>
  );
}
