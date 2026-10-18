"use client";

import * as React from "react";
import { ShoppingCart, Check, AlertCircle, Eye, ShieldCheck, Ruler } from "lucide-react";
import { toast } from "sonner";
import { Product } from "@/types";
import { useCartStore } from "@/lib/store/use-cart-store";
import { formatCurrency } from "@/lib/utils/formatters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ProductCardProps {
  product: Product;
  onViewDetails?: (product: Product) => void;
}

export function ProductCard({ product, onViewDetails }: ProductCardProps) {
  const [isAdded, setIsAdded] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);
  const addToCart = useCartStore((state) => state.addToCart);

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
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
      1
    );

    setIsAdded(true);
    toast.success(`تمت إضافة "${product.name}" إلى السلة بنجاح`);

    setTimeout(() => {
      setIsAdded(false);
    }, 1500);
  };

  const discountPercent =
    product.compare_at_price && product.compare_at_price > product.price
      ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
      : null;

  return (
    <div
      onClick={() => onViewDetails?.(product)}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-orange-500 hover:shadow-lg hover:shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-orange-500 dark:hover:shadow-none cursor-pointer"
    >
      {/* Badges Overlay */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5 items-end">
        {discountPercent && (
          <span className="rounded-md bg-rose-600 px-2 py-0.5 text-[10px] font-black text-white shadow-sm">
            خصم {discountPercent}%
          </span>
        )}
        {isOutOfStock ? (
          <Badge variant="destructive">غير متوفر</Badge>
        ) : isLowStock ? (
          <Badge variant="warning">باقي {product.stock} فقط</Badge>
        ) : (
          <Badge variant="success">متوفر بالمخزن</Badge>
        )}
      </div>

      {/* Engineering Quality Badge */}
      <div className="absolute top-3 left-3 z-10">
        <span className="rounded-md bg-slate-900/85 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold text-white shadow-sm flex items-center gap-1 border border-slate-700">
          <ShieldCheck className="h-3 w-3 text-orange-400" />
          <span>أصلي معتمد</span>
        </span>
      </div>

      {/* Product Image Area */}
      <div className="relative aspect-square w-full overflow-hidden bg-slate-50 dark:bg-slate-800/50 p-6 flex items-center justify-center border-b border-slate-100 dark:border-slate-800">
        {product.image_url && !imageError ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-300 dark:text-slate-600">
            <span className="text-4xl">⚙️</span>
            <span className="mt-2 text-[11px] font-bold text-slate-400">
              أداة معتمدة
            </span>
          </div>
        )}

        {/* Quick View Hover Tag */}
        <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white shadow-md border border-slate-200 dark:border-slate-700">
            <Eye className="h-3.5 w-3.5 text-orange-500" />
            <span>عرض المواصفات الفنية</span>
          </span>
        </div>
      </div>

      {/* Product Details */}
      <div className="flex flex-1 flex-col p-4 text-right">
        <div className="mb-1 text-[11px] font-bold tracking-wide text-orange-600 dark:text-orange-400">
          {product.category_name}
        </div>

        <h3 className="line-clamp-2 text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors leading-snug">
          {product.name}
        </h3>

        {product.description && (
          <p className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {product.description}
          </p>
        )}

        {/* Pricing */}
        <div className="mt-4 flex items-baseline justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-col">
            <span className="text-base font-black text-slate-900 dark:text-white">
              {formatCurrency(product.price)}
            </span>
            {product.compare_at_price && product.compare_at_price > product.price && (
              <span className="text-xs text-slate-400 line-through font-normal">
                {formatCurrency(product.compare_at_price)}
              </span>
            )}
          </div>
          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
            شحن فوري
          </span>
        </div>

        {/* Action Buttons: Details + Add to Cart */}
        <div className="mt-3 grid grid-cols-5 gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onViewDetails?.(product)}
            type="button"
            className="col-span-2 flex items-center justify-center gap-1 py-2 px-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
            title="عرض تفاصيل ومواصفات الأداة"
          >
            <Eye className="h-3.5 w-3.5 text-orange-600" />
            <span>التفاصيل</span>
          </button>

          <Button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="col-span-3 text-xs font-bold py-2"
            size="sm"
            variant="default"
          >
            {isAdded ? (
              <>
                <Check className="h-3.5 w-3.5" />
                <span>أضيفت!</span>
              </>
            ) : isOutOfStock ? (
              <>
                <AlertCircle className="h-3.5 w-3.5" />
                <span>نفد</span>
              </>
            ) : (
              <>
                <ShoppingCart className="h-3.5 w-3.5" />
                <span>أضف للسلة</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
