"use client";

import * as React from "react";
import {
  Wrench,
  ShieldCheck,
  Truck,
  CreditCard,
  Headphones,
  Search,
  FilterX,
  Layers,
  Sparkles,
} from "lucide-react";
import { Product } from "@/types";
import { supabase } from "@/lib/supabase/client";
import { initialMockProducts } from "@/lib/domain/mock-products";
import { ProductCard } from "@/components/storefront/product-card";
import { CategoryBar } from "@/components/storefront/category-bar";
import { ProductDetailsModal } from "@/components/storefront/product-details-modal";

export default function HomePage() {
  const [products, setProducts] = React.useState<Product[]>(initialMockProducts);
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [loading, setLoading] = React.useState<boolean>(true);
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);

  // Fetch real products from Supabase if available
  React.useEffect(() => {
    async function loadProducts() {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: false });

        if (!error && data && data.length > 0) {
          setProducts(data as Product[]);
        } else {
          setProducts(initialMockProducts);
        }
      } catch (err) {
        console.warn("Using local tools catalog fallback:", err);
        setProducts(initialMockProducts);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  // Filter products by category and search query
  const filteredProducts = React.useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === "all" ||
        product.category_id === selectedCategory ||
        product.slug.includes(selectedCategory) ||
        (selectedCategory === "surgical-instruments" && product.category_name?.includes("جراحة")) ||
        (selectedCategory === "restorative-endodontics" && (product.category_name?.includes("حشوات") || product.category_name?.includes("جذور"))) ||
        (selectedCategory === "diagnostic-periodontics" && (product.category_name?.includes("فحص") || product.category_name?.includes("لثة"))) ||
        (selectedCategory === "handpieces-equipment" && (product.category_name?.includes("قبضات") || product.category_name?.includes("أجهزة") || product.category_name?.includes("توربين"))) ||
        (selectedCategory === "anesthesia-syringes" && (product.category_name?.includes("بنج") || product.category_name?.includes("تخدير"))) ||
        (selectedCategory === "impression-prosthodontics" && (product.category_name?.includes("طبعات") || product.category_name?.includes("تركيبات"))) ||
        (selectedCategory === "orthodontics" && product.category_name?.includes("تقويم")) ||
        (selectedCategory === "sterilization-infection-control" && product.category_name?.includes("تعقيم")) ||
        (selectedCategory === "disposables" && (product.category_name?.includes("مستهلكات") || product.category_name?.includes("وقايات")));

      const matchesSearch =
        searchQuery.trim() === "" ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.category_name && product.category_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (product.description &&
          product.description.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 pb-24 text-right transition-colors duration-200">
      {/* Hero Banner - Engineering Precision Look */}
      <section className="relative overflow-hidden bg-slate-900 text-white py-14 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        {/* Subtle Engineering Grid Background */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f97316_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-orange-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-24 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-5xl text-center space-y-6">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 rounded-full bg-orange-500/15 border border-orange-500/30 px-4 py-1.5 text-xs sm:text-sm font-bold text-orange-400 backdrop-blur-md">
            <Wrench className="h-4 w-4 text-orange-400" />
            <span>متجر توريدات ومستلزمات وأدوات طب وجراحة الأسنان المتخصصة في مصر</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            أدوات ومستلزمات أسنان احترافية
            <br />
            <span className="text-orange-500">
              بأعلى معايير التعقيم والصلابة الطبية المعتمدة
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
            نوفر لأطباء وجراحي الأسنان والمراكز المتخصصة تشكيلة شاملة لجميع التخصصات: كابلات خلع وروافع، حشوات وعلاج جذور، قبضات وتوربينات، بنج موضعي، طبعات وتركيبات، تقويم ومستهلكات تعقيم بأفضل أسعار الجملة مع الشحن المباشر والمعاينة قبل الاستلام.
          </p>

          {/* Quick Search on Hero */}
          <div className="mx-auto max-w-xl pt-2">
            <div className="relative flex items-center">
              <Search className="absolute right-4 h-5 w-5 text-orange-400" />
              <input
                type="text"
                placeholder="ابحث في جميع أصناف الأسنان (مثال: كابلات خلع، توربين، حشوات، بنج، روتاري، أكياس تعقيم، رابر دام، أرجينات)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 pr-12 pl-14 rounded-2xl bg-slate-800/90 border border-slate-700 text-white placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-xs sm:text-sm transition-all shadow-lg"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute left-4 text-xs font-bold text-orange-400 hover:text-white bg-slate-700 px-2 py-1 rounded-md cursor-pointer"
                >
                  مسح
                </button>
              )}
            </div>
          </div>

          {/* Trust Value Props */}
          <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-right">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/20 text-orange-400">
                <ShieldCheck className="h-5 w-5 flex-shrink-0" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">خامات أصلية</h4>
                <p className="text-[10px] text-slate-400">مطابقة للمواصفات</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400">
                <Truck className="h-5 w-5 flex-shrink-0" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">شحن سريع</h4>
                <p className="text-[10px] text-slate-400">معاينة قبل الدفع</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                <CreditCard className="h-5 w-5 flex-shrink-0" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">دفع يدوي مريح</h4>
                <p className="text-[10px] text-slate-400">إنستاباي / فودافون / كاش</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
                <Headphones className="h-5 w-5 flex-shrink-0" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">واتساب فوري</h4>
                <p className="text-[10px] text-slate-400">01068808559</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Catalog Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8">
        {/* Category Filter Tabs */}
        <div className="mb-6 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                كتالوج الأدوات والمعدات
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                اختر التصنيف المطلوب للاطلاع على المنتجات والمواصفات
              </p>
            </div>
            <span className="text-xs font-bold text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/80 px-3 py-1.5 rounded-xl border border-orange-200 dark:border-orange-800">
              {filteredProducts.length} صنف متوفر
            </span>
          </div>

          <CategoryBar
            selectedSlug={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 min-[460px]:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onViewDetails={setSelectedProduct}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-12 text-center space-y-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400">
              <FilterX className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                لا توجد نتائج مطابقة لبحثك
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md">
                لم نتمكن من العثور على منتجات مطابقة لـ &quot;{searchQuery}&quot; في هذا القسم. حاول استخدام كلمات بحث أخرى أو عرض كل الأصناف.
              </p>
            </div>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              className="text-xs font-bold text-orange-600 hover:text-orange-700 dark:text-orange-400 underline underline-offset-4 cursor-pointer"
            >
              عرض جميع الأصناف
            </button>
          </div>
        )}
      </section>

      {/* Product Details Modal */}
      <ProductDetailsModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </main>
  );
}
