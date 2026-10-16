"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/storefront/navbar";
import { CartDrawer } from "@/components/storefront/cart-drawer";

export function StorefrontShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <CartDrawer />
      <div className="flex-1 flex flex-col">{children}</div>
      <footer className="mt-auto border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center sm:text-right flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <h3 className="text-base font-black text-cyan-800 dark:text-cyan-400">
              متجر دينتال كير لمستلزمات الأسنان
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              توريدات طبية أصلية 100% لأطباء الأسنان والعيادات والمراكز التخصصية في مصر.
            </p>
          </div>
          <div className="flex items-center gap-6 text-xs text-slate-600 dark:text-slate-400">
            <a
              href="https://wa.me/201068808559"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-600 transition-colors font-medium flex items-center gap-1.5"
            >
              <span>خدمة العملاء والطلبات: 01068808559</span>
            </a>
            <span>•</span>
            <span>جميع الحقوق محفوظة © 2026</span>
          </div>
        </div>
      </footer>
    </>
  );
}
