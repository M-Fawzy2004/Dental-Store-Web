"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/storefront/navbar";
import { CartDrawer } from "@/components/storefront/cart-drawer";
import { MobileBottomNav } from "@/components/storefront/mobile-bottom-nav";
import { Wrench, Phone, ShieldCheck, Truck, CreditCard } from "lucide-react";

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
      <div className="flex-1 flex flex-col pb-16 md:pb-0">{children}</div>
      <MobileBottomNav />
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070b14] py-10 transition-colors pb-24 md:pb-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800/80">
            <div className="space-y-1 text-center sm:text-right">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-600 text-white">
                  <Wrench className="h-4 w-4" />
                </div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  متجر تكنو دنتال لتوريدات ومستلزمات طب وجراحة الأسنان
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                توريدات طبية وهندسية أصلية 100% لأدوات الجراحة، علاج الجذور، الحشوات، التعقيم، والمستهلكات لعيادات ومراكز الأسنان في مصر.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                <ShieldCheck className="h-3.5 w-3.5 text-orange-600" />
                <span>ضمان فني معتمد</span>
              </span>
              <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                <Truck className="h-3.5 w-3.5 text-blue-600" />
                <span>شحن ومعاينة قبل الدفع</span>
              </span>
              <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                <CreditCard className="h-3.5 w-3.5 text-emerald-600" />
                <span>إنستاباي / فودافون / كاش</span>
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
            <a
              href="https://wa.me/201068808559"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-bold flex items-center gap-1.5"
            >
              <Phone className="h-3.5 w-3.5 text-emerald-500" />
              <span>مبيعات وطلبات الأسنان المباشرة: 01068808559</span>
            </a>
            <span>جميع الحقوق محفوظة © 2026 - تكنو دنتال ستور مصر</span>
          </div>
        </div>
      </footer>
    </>
  );
}
