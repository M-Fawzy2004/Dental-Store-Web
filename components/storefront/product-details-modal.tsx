"use client";

import * as React from "react";
import {
  X,
  ShoppingCart,
  Check,
  ShieldCheck,
  Sparkles,
  Phone,
  MessageCircle,
  Truck,
  Plus,
  Minus,
  Ruler,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";
import { Product } from "@/types";
import { useCartStore } from "@/lib/store/use-cart-store";
import { formatCurrency } from "@/lib/utils/formatters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ProductDetailsModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductDetailsModal({
  product,
  isOpen,
  onClose,
}: ProductDetailsModalProps) {
  const [quantity, setQuantity] = React.useState(1);
  const [isAdded, setIsAdded] = React.useState(false);
  const addToCart = useCartStore((state) => state.addToCart);

  React.useEffect(() => {
    setQuantity(1);
    setIsAdded(false);
  }, [product]);

  if (!isOpen || !product) return null;

  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) {
      toast.error("هذا المنتج غير متوفر حالياً في المخزن");
      return;
    }

    addToCart(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
        max_stock: product.stock,
      },
      quantity
    );

    setIsAdded(true);
    toast.success(`تمت إضافة ${quantity} من "${product.name}" إلى السلة`);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const discountPercent =
    product.compare_at_price && product.compare_at_price > product.price
      ? Math.round(
        ((product.compare_at_price - product.price) / product.compare_at_price) * 100
      )
      : null;

  const specs = product.specifications || {
    material: "ستانلس ستيل طبي وصناعي معتمد (Grade 316L)",
    autoclavable: "نعم - أوتوكلاف وحرارة حتى 134° مئوية",
    origin: "ألمانيا / معتمد بمواصفات الجودة CE و ISO",
    warranty: "ضمان ضد عيوب الصناعة والتآكل",
    packaging: "عبوة محكمة الإغلاق",
    intendedUse: "استخدامات الورش، المراكز والعيادات التخصصية",
  };

  const whatsappMessage = encodeURIComponent(
    `مرحباً، أرغب في الاستفسار والطلب المباشر للأداة التالية:\n🔧 *${product.name}*\n🏷️ السعر: ${formatCurrency(product.price)}\n📦 الكمية: ${quantity}\nهل متوفر للشحن الفوري؟`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Content */}
      <div className="relative z-50 w-full max-w-3xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden text-right my-8 animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute left-4 top-4 z-10 rounded-full p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:text-slate-300 transition-colors cursor-pointer"
          aria-label="إغلاق"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 max-h-[85vh] overflow-y-auto">
          {/* Image & Badges Column (5 cols) */}
          <div className="md:col-span-5 bg-slate-50 dark:bg-slate-800/60 p-8 flex flex-col justify-between items-center relative border-b md:border-b-0 md:border-l border-slate-200 dark:border-slate-800">
            {/* Top Badges */}
            <div className="w-full flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/80 px-2.5 py-1 rounded-lg border border-orange-200 dark:border-orange-800">
                {product.category_name}
              </span>
              {discountPercent && (
                <span className="bg-rose-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-lg shadow-sm">
                  وفر {discountPercent}%
                </span>
              )}
            </div>

            {/* Product Image */}
            <div className="my-6 aspect-square w-full max-w-[240px] flex items-center justify-center p-3">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="h-full w-full object-contain rounded-xl hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <span className="text-6xl">⚙️</span>
              )}
            </div>

            {/* Trust Badges */}
            <div className="w-full space-y-2 pt-4 border-t border-slate-200 dark:border-slate-700 text-[11px]">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <ShieldCheck className="h-4 w-4 text-orange-600 flex-shrink-0" />
                <span>خامات أصلية مطابقة للمواصفات</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Truck className="h-4 w-4 text-blue-600 flex-shrink-0" />
                <span>شحن سريع ومعاينة قبل الدفع</span>
              </div>
            </div>
          </div>

          {/* Product Details & Actions Column (7 cols) */}
          <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Product Title */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Badge variant={isOutOfStock ? "destructive" : "success"}>
                    {isOutOfStock ? "غير متوفر بالمخزن" : `متوفر بالمخزن (${product.stock} قطع)`}
                  </Badge>
                  <span className="text-[11px] text-slate-400 font-mono">
                    SKU: {product.id}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-snug">
                  {product.name}
                </h2>
              </div>

              {/* Pricing Box */}
              <div className="flex items-baseline gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  {formatCurrency(product.price)}
                </span>
                {product.compare_at_price && product.compare_at_price > product.price && (
                  <span className="text-sm text-slate-400 line-through">
                    {formatCurrency(product.compare_at_price)}
                  </span>
                )}
                <span className="text-xs text-slate-500 mr-auto font-medium">
                  شامل الضريبة
                </span>
              </div>

              {/* Description */}
              {product.description && (
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    الوصف الفني:
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Technical Engineering Specs Grid */}
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Wrench className="h-3.5 w-3.5 text-orange-600" />
                  <span>المواصفات الفنية للأداة:</span>
                </h4>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-0.5">
                    <span className="text-slate-400 block text-[10px]">مادة الصنع:</span>
                    <strong className="text-slate-800 dark:text-slate-200 block truncate">
                      {specs.material}
                    </strong>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-0.5">
                    <span className="text-slate-400 block text-[10px]">التحمل والتعقيم:</span>
                    <strong className="text-orange-600 dark:text-orange-400 block truncate">
                      {specs.autoclavable}
                    </strong>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-0.5">
                    <span className="text-slate-400 block text-[10px]">بلد المنشأ والجودة:</span>
                    <strong className="text-slate-800 dark:text-slate-200 block truncate">
                      {specs.origin}
                    </strong>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-0.5">
                    <span className="text-slate-400 block text-[10px]">الضمان المعتمد:</span>
                    <strong className="text-emerald-600 dark:text-emerald-400 block truncate">
                      {specs.warranty}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Purchase Controls & Actions */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center gap-3">
                {/* Quantity Selector */}
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={isOutOfStock}
                    className="h-8 w-8 rounded-lg hover:bg-white dark:hover:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-8 text-center font-bold text-sm text-slate-900 dark:text-white">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={isOutOfStock || quantity >= product.stock}
                    className="h-8 w-8 rounded-lg hover:bg-white dark:hover:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                {/* Add to Cart Button */}
                <Button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  size="lg"
                  className="flex-1 font-bold text-sm"
                >
                  {isAdded ? (
                    <>
                      <Check className="h-5 w-5" />
                      <span>تمت الإضافة للسلة!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-5 w-5" />
                      <span>إضافة {quantity} للسلة ({formatCurrency(product.price * quantity)})</span>
                    </>
                  )}
                </Button>
              </div>

              {/* WhatsApp Direct Order Button */}
              <a
                href={`https://wa.me/201068808559?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-xs font-bold transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                <span>طلب واستفسار فوري عبر واتساب (01068808559)</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
