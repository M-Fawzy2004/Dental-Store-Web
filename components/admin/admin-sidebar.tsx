"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  CreditCard,
  ExternalLink,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  Wrench,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const navItems = [
  {
    title: "لوحة التحكم والمؤشرات",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    badge: null,
  },
  {
    title: "إدارة المنتجات والمخزن",
    href: "/admin/products",
    icon: Package,
    badge: null,
  },
  {
    title: "الطلبات والمبيعات الواردة",
    href: "/admin/orders",
    icon: ShoppingBag,
    badge: "مباشر",
  },
  {
    title: "طلبات ومراجعة الدفع",
    href: "/admin/payments",
    icon: CreditCard,
    badge: "فودافون/انستا",
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="lg:hidden flex items-center justify-between bg-white dark:bg-[#0a1124] text-slate-900 dark:text-white px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 no-print hide-on-print print:hidden">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-600 text-white shadow-sm">
            <Wrench className="h-4 w-4" />
          </div>
          <div>
            <span className="font-black text-sm block leading-none">لوحة تحكم المتجر</span>
            <span className="text-[10px] text-orange-600 dark:text-orange-400 font-bold">تكنو دنتال مصر</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-orange-600 cursor-pointer"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Backdrop for Mobile */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm no-print hide-on-print print:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed lg:sticky top-0 right-0 z-50 h-screen w-64 flex flex-col bg-white dark:bg-[#0a1124] text-slate-900 dark:text-slate-100 border-l border-slate-200 dark:border-slate-800 transition-transform duration-300 select-none no-print hide-on-print print:hidden",
          mobileOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        )}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-600 text-white shadow-md shadow-orange-600/30 font-black">
              <Wrench className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>تكنو دنتال ستور</span>
                <Sparkles className="h-3 w-3 text-orange-500" />
              </h2>
              <p className="text-[11px] text-orange-600 dark:text-orange-400 font-bold">
                لوحة تحكم صاحب المتجر
              </p>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-2xl bg-slate-50 dark:bg-[#111c38] border border-slate-200 dark:border-slate-700/60 text-right space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 dark:text-white">مدير المتجر</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>متصل الآن</span>
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">admin@store.com</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all group",
                  isActive
                    ? "bg-orange-600 text-white shadow-md shadow-orange-600/30"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#111c38] hover:text-orange-600 dark:hover:text-white"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      "h-4 w-4 transition-transform group-hover:scale-110",
                      isActive ? "text-white" : "text-slate-400 group-hover:text-orange-500"
                    )}
                  />
                  <span>{item.title}</span>
                </div>

                {item.badge && (
                  <span
                    className={cn(
                      "text-[10px] px-2 py-0.5 rounded-full font-bold",
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 border border-orange-200 dark:border-orange-800"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
          {/* Light / Dark Mode Toggle inside Admin */}
          <div className="w-full">
            <ThemeToggle showLabel={true} className="w-full justify-center py-2" />
          </div>

          <Link
            href="/"
            className="flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#111c38] dark:hover:bg-[#162447] text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors border border-slate-200 dark:border-slate-700/40"
          >
            <div className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              <span>معاينة متجر العملاء</span>
            </div>
            <span className="text-[10px] text-orange-600 dark:text-orange-400">مباشر ↗</span>
          </Link>

          <Link
            href="/admin/login"
            className="flex items-center gap-2 w-full px-3.5 py-2 rounded-xl text-slate-500 hover:text-rose-500 text-xs font-semibold transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>تسجيل الخروج</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
