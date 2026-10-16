"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, ShoppingBag, ShieldCheck } from "lucide-react";
import { useCartStore } from "@/lib/store/use-cart-store";
import { formatCurrency } from "@/lib/utils/formatters";
import { CheckoutForm } from "@/components/storefront/checkout-form";
import { Button } from "@/components/ui/button";

export default function CheckoutPage() {
  const [mounted, setMounted] = React.useState(false);
  const items = useCartStore((state) => state.items);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);
  const getTotalItems = useCartStore((state) => state.getTotalItems);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-600 border-t-transparent" />
      </div>
    );
  }

  const totalAmount = getTotalPrice();
  const totalItems = getTotalItems();

  if (items.length === 0) {
    return (
      <main className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600">
          <ShoppingBag className="h-10 w-10 stroke-[1.5]" />
        </div>
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
          سلة المشتريات فارغة
        </h1>
        <p className="text-sm text-slate-500 max-w-sm">
          لا يمكنك إتمام الطلب بدون منتجات في السلة. تصفح أدوات ومستلزمات الأسنان واختر ما يلزمك.
        </p>
        <Link href="/">
          <Button>العودة للمتجر والتسوق</Button>
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Top Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
          <div className="space-y-1 text-right">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              إتمام طلب المستلزمات (طلب سريع للعيادات)
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              أدخل بيانات التوصيل أدناه لتجهيز شحنتك فوراً بدون تسجيل دخول
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-cyan-700 hover:text-cyan-800 dark:text-cyan-400"
          >
            <ArrowRight className="h-4 w-4" />
            <span>متابعة التسوق وإضافة منتجات أخرى</span>
          </Link>
        </div>

        {/* 2-Column Checkout Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Right Column: Checkout Form (7 cols) */}
          <div className="lg:col-span-7">
            <CheckoutForm />
          </div>

          {/* Left Column: Order Summary (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 text-right">
              <h3 className="text-base font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span>ملخص الطلب</span>
                <span className="text-xs font-semibold text-cyan-600 bg-cyan-50 dark:bg-cyan-950 px-2 py-0.5 rounded-lg">
                  {totalItems} عناصر
                </span>
              </h3>

              {/* Order Items Preview */}
              <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-72 overflow-y-auto py-2 pr-1">
                {items.map((item) => (
                  <div key={item.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 flex-shrink-0 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center p-1 overflow-hidden">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <span className="text-lg">🦷</span>
                        )}
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 line-clamp-1">
                          {item.name}
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          الكمية: {item.quantity} × {formatCurrency(item.price)}
                        </p>
                      </div>
                    </div>

                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Calculations */}
              <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>المجموع الفرعي:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>مصاريف الشحن:</span>
                  <span className="font-semibold text-emerald-600">
                    تحدد حسب المحافظة عند التأكيد
                  </span>
                </div>
                <div className="flex justify-between text-base font-black text-slate-900 dark:text-white pt-3 border-t border-slate-200 dark:border-slate-700">
                  <span>إجمالي المنتجات:</span>
                  <span className="text-cyan-700 dark:text-cyan-400">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>
              </div>

              <div className="mt-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3.5 border border-slate-200/60 dark:border-slate-700/60 flex items-start gap-2.5">
                <ShieldCheck className="h-5 w-5 text-teal-600 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  فحص واستلام: يحق للطبيب أو مندوب العيادة مراجعة الشحنة والتأكد من سلامة العبوات ومطابقتها للمواصفات الطبية قبل السداد.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
