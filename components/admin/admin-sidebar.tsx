"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  Stethoscope,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="lg:hidden flex items-center justify-between bg-[#0a1124] text-white px-4 py-3.5 border-b border-cyan-950/60 sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-cyan-600 to-teal-500 text-white shadow-md">
            <Stethoscope className="h-4 w-4" />
          </div>
          <div>
            <span className="font-extrabold text-sm block leading-none">لوحة تحكم المتجر</span>
            <span className="text-[10px] text-cyan-400 font-medium">دينتال كير الطبية</span>
          </div>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white cursor-pointer"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Backdrop for Mobile */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed lg:sticky top-0 right-0 z-50 h-screen w-64 flex flex-col bg-[#0a1124] text-slate-100 border-l border-slate-800/80 transition-transform duration-300 select-none",
          mobileOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        )}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800/70">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 via-teal-500 to-emerald-400 text-slate-950 shadow-lg shadow-cyan-500/20 font-black">
              <Stethoscope className="h-6 w-6 text-slate-950" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white flex items-center gap-1.5">
                <span>إدارة دينتال كير</span>
                <Sparkles className="h-3 w-3 text-cyan-400" />
              </h2>
              <p className="text-[11px] text-cyan-400 font-medium">
                لوحة تحكم صاحب المتجر
              </p>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-2xl bg-gradient-to-b from-[#111c38] to-[#0d162c] border border-cyan-950/60 text-right space-y-1 shadow-inner">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white">مدير المتجر</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/90 text-emerald-400 border border-emerald-800/80 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>متصل الآن</span>
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">admin@dentalstore.com</p>
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
                    ? "bg-gradient-to-r from-cyan-600 via-teal-600 to-teal-700 text-white shadow-lg shadow-cyan-900/30 border border-cyan-400/30"
                    : "text-slate-300 hover:bg-[#111c38] hover:text-white"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      "h-4 w-4 transition-transform group-hover:scale-110",
                      isActive ? "text-white" : "text-slate-400 group-hover:text-cyan-400"
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
                        : "bg-emerald-950 text-emerald-300 border border-emerald-800"
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
        <div className="p-4 border-t border-slate-800/70 space-y-2">
          <Link
            href="/"
            className="flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl bg-[#111c38] hover:bg-[#162447] text-slate-200 hover:text-white text-xs font-bold transition-colors border border-slate-700/40"
          >
            <div className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4 text-cyan-400" />
              <span>معاينة متجر العملاء</span>
            </div>
            <span className="text-[10px] text-cyan-400">مباشر ↗</span>
          </Link>

          <Link
            href="/admin/login"
            className="flex items-center gap-2 w-full px-3.5 py-2 rounded-xl text-slate-400 hover:text-rose-400 text-xs font-medium transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>تسجيل الخروج</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
