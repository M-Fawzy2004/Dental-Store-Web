"use client";

import * as React from "react";
import Link from "next/link";
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowLeft, Wrench } from "lucide-react";
import { useCartStore } from "@/lib/store/use-cart-store";
import { formatCurrency } from "@/lib/utils/formatters";
import { Button } from "@/components/ui/button";

export function CartDrawer() {
  const [mounted, setMounted] = React.useState(false);
  const items = useCartStore((state) => state.items);
  const isDrawerOpen = useCartStore((state) => state.isDrawerOpen);
  const closeDrawer = useCartStore((state) => state.closeDrawer);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const clearCart = useCartStore((state) => state.clearCart);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);
  const getTotalItems = useCartStore((state) => state.getTotalItems);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when drawer is open
  React.useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isDrawerOpen]);

  if (!mounted || !isDrawerOpen) return null;

  const totalAmount = getTotalPrice();
  const totalCount = getTotalItems();

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={closeDrawer}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 left-0 flex max-w-full">
        {/* Drawer Panel (RTL: appears from the left) */}
        <div className="w-screen max-w-md transform bg-white dark:bg-slate-900 shadow-2xl transition-all duration-300 flex flex-col border-r border-slate-200 dark:border-slate-800 text-right">
          {/* Drawer Header */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-5 py-4">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-orange-600" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                سلة المشتريات ({totalCount})
              </h2>
            </div>
            <button
              onClick={closeDrawer}
              className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="إغلاق السلة"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-5">
            {items.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400">
                  <ShoppingBag className="h-10 w-10 stroke-[1.5]" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                    سلتك فارغة حالياً
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
                    تصفح تشكيلتنا من الأدوات والمعدات الدقيقة وأضف ما تحتاجه لسلتك
                  </p>
                </div>
                <Button onClick={closeDrawer} variant="outline" size="sm">
                  تصفح المنتجات
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-xs text-slate-500">الأصناف المختارة</span>
                  <button
                    onClick={clearCart}
                    className="text-xs text-rose-500 hover:text-rose-600 font-bold cursor-pointer"
                  >
                    تفريغ السلة
                  </button>
                </div>

                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-3 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-orange-300 dark:hover:border-orange-500/50 transition-colors"
                  >
                    {/* Item Image */}
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1 flex items-center justify-center">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <span className="text-xl">⚙️</span>
                      )}
                    </div>

                    {/* Item Info */}
                    <div className="flex flex-1 flex-col justify-between">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 line-clamp-1">
                          {item.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                          aria-label="حذف"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs font-black text-slate-900 dark:text-white">
                          {formatCurrency(item.price * item.quantity)}
                        </span>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-1 py-0.5">
                          <button
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            className="flex h-6 w-6 items-center justify-center rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
                            aria-label="تقليل الكمية"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-5 text-center text-xs font-bold text-slate-800 dark:text-slate-100">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="flex h-6 w-6 items-center justify-center rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
                            aria-label="زيادة الكمية"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Drawer Footer */}
          {items.length > 0 && (
            <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 p-5 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>المجموع الفرعي ({totalCount} قطعة):</span>
                  <span>{formatCurrency(totalAmount)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>الشحن:</span>
                  <span className="text-emerald-600 font-bold">يحدد حسب المحافظة</span>
                </div>
                <div className="flex justify-between text-sm font-black text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-800">
                  <span>الإجمالي:</span>
                  <span className="text-orange-600 dark:text-orange-400 font-black text-base">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>
              </div>

              <Link href="/checkout" onClick={closeDrawer} className="block w-full">
                <Button className="w-full shadow-lg" size="lg">
                  <span>متابعة لإتمام الطلب</span>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
