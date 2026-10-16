"use client";

import * as React from "react";
import Image from "next/image";
import { ShoppingCart, Check, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Product } from "@/types";
import { useCartStore } from "@/lib/store/use-cart-store";
import { formatCurrency } from "@/lib/utils/formatters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [isAdded, setIsAdded] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);
  const addToCart = useCartStore((state) => state.addToCart);

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

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
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300 hover:shadow-xl hover:shadow-cyan-900/5 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-cyan-800">
      {/* Badges Overlay */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5 items-end">
        {discountPercent && (
          <span className="rounded-lg bg-rose-600 px-2 py-0.5 text-[11px] font-bold text-white shadow-sm">
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

      {/* Product Image Area */}
      <div className="relative aspect-square w-full overflow-hidden bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 p-6 flex items-center justify-center">
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
            <span className="text-4xl">🦷</span>
            <span className="mt-2 text-[11px] font-medium text-slate-400">
              صورة المنتج
            </span>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="flex flex-1 flex-col p-4 text-right">
        <div className="mb-1 text-[11px] font-bold tracking-wide text-cyan-600 dark:text-cyan-400">
          {product.category_name}
        </div>

        <h3 className="line-clamp-2 text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-cyan-700 dark:group-hover:text-cyan-300 transition-colors">
          {product.name}
        </h3>

        {product.description && (
          <p className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
            {product.description}
          </p>
        )}

        {/* Pricing */}
        <div className="mt-4 flex items-baseline justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-col">
            <span className="text-base font-extrabold text-slate-900 dark:text-white">
              {formatCurrency(product.price)}
            </span>
            {product.compare_at_price && product.compare_at_price > product.price && (
              <span className="text-xs text-slate-400 line-through">
                {formatCurrency(product.compare_at_price)}
              </span>
            )}
          </div>
        </div>

        {/* Add to Cart Button */}
        <div className="mt-3">
          <Button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="w-full text-xs"
            size="md"
            variant={isAdded ? "accent" : "default"}
          >
            {isAdded ? (
              <>
                <Check className="h-4 w-4" />
                <span>تمت الإضافة!</span>
              </>
            ) : isOutOfStock ? (
              <>
                <AlertCircle className="h-4 w-4" />
                <span>نفد من المخزن</span>
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4" />
                <span>إضافة إلى السلة</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
