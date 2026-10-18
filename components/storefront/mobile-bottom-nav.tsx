"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Layers, ShoppingBag, Phone, Lock } from "lucide-react";
import { useCartStore } from "@/lib/store/use-cart-store";
import { cn } from "@/lib/utils";

export function MobileBottomNav() {
  const pathname = usePathname();
  const [mounted, setMounted] = React.useState(false);
  const items = useCartStore((state) => state.items);
  const openDrawer = useCartStore((state) => state.openDrawer);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const totalItems = mounted ? items.reduce((acc, item) => acc + item.quantity, 0) : 0;
  const isStorefront = !pathname?.startsWith("/admin");

  if (!isStorefront) return null;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#070b16]/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-3 py-2 flex items-center justify-around shadow-2xl transition-colors no-print hide-on-print print:hidden">
      {/* Home */}
      <Link
        href="/"
        className={cn(
          "flex flex-col items-center gap-1 text-[10px] font-bold transition-colors cursor-pointer",
          pathname === "/"
            ? "text-orange-600 dark:text-orange-400"
            : "text-slate-500 hover:text-orange-600 dark:text-slate-400"
        )}
      >
        <Home className="h-5 w-5" />
        <span>الرئيسية</span>
      </Link>

      {/* Cart Button */}
      <button
        onClick={openDrawer}
        className="relative flex flex-col items-center gap-1 text-[10px] font-bold text-slate-500 hover:text-orange-600 dark:text-slate-400 cursor-pointer"
      >
        <div className="relative">
          <ShoppingBag className="h-5 w-5" />
          {totalItems > 0 && (
            <span className="absolute -top-1.5 -right-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-orange-600 text-white px-1 text-[9px] font-black border border-white dark:border-slate-900">
              {totalItems}
            </span>
          )}
        </div>
        <span>السلة</span>
      </button>

      {/* WhatsApp Immediate Contact */}
      <a
        href="https://wa.me/201068808559"
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 cursor-pointer"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800">
          <Phone className="h-3.5 w-3.5" />
        </div>
        <span>طلب واتساب</span>
      </a>

      {/* Admin Panel */}
      <Link
        href="/admin/login"
        className="flex flex-col items-center gap-1 text-[10px] font-bold text-slate-500 hover:text-orange-600 dark:text-slate-400 cursor-pointer"
      >
        <Lock className="h-5 w-5" />
        <span>الإدارة</span>
      </Link>
    </div>
  );
}
