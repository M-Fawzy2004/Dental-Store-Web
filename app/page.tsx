"use client";

import * as React from "react";
import {
  Sparkles,
  ShieldCheck,
  Truck,
  CreditCard,
  Headphones,
  Search,
  FilterX,
} from "lucide-react";
import { Product } from "@/types";
import { supabase } from "@/lib/supabase/client";
import { initialMockProducts } from "@/lib/domain/mock-products";
import { ProductCard } from "@/components/storefront/product-card";
import { CategoryBar } from "@/components/storefront/category-bar";

export default function HomePage() {
  const [products, setProducts] = React.useState<Product[]>(initialMockProducts);
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [loading, setLoading] = React.useState<boolean>(true);

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
          // Keep mock products if Supabase table is empty or error
          setProducts(initialMockProducts);
        }
      } catch (err) {
        console.warn("Using local dental catalog fallback:", err);
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
        product.slug.includes(selectedCategory);

      const matchesSearch =
        searchQuery.trim() === "" ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description &&
          product.description.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-b from-cyan-900 via-teal-900 to-slate-900 text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        {/* Abstract Background Accents */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-24 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-5xl text-center space-y-6">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 border border-cyan-400/30 px-4 py-1.5 text-xs sm:text-sm font-semibold text-cyan-300 backdrop-blur-md">
            <Sparkles className="h-4 w-4 text-cyan-400 animate-pulse" />
            <span>المتجر الطبي الأول لمستلزمات وعيادات الأسنان في مصر</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            أدوات ومستلزمات طب الأسنان
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
              بأعلى معايير الدقة والتعقيم
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            نوفر لأطباء الأسنان والعيادات والمستشفيات أحدث أدوات الجراحة، حشوات الكومبوزيت، البنج الموضعي، أجهزة التعقيم والمستهلكات اليومية بأسعار تنافسية وشحن فوري.
          </p>

          {/* Quick Search on Hero */}
          <div className="mx-auto max-w-xl pt-2">
            <div className="relative flex items-center">
              <Search className="absolute right-4 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="ابحث بالاسم، النوع، أو الماركة (مثال: بنج، كابلات، كومبوزيت)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-13 pr-12 pl-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:bg-white/15 text-sm transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute left-4 text-xs text-slate-300 hover:text-white"
                >
                  مسح
                </button>
              )}
            </div>
          </div>

          {/* Trust Value Props */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 text-right">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <ShieldCheck className="h-7 w-7 text-teal-400 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-white">أصلية 100%</h4>
                <p className="text-[10px] text-slate-300">منتجات معتمدة طبياً</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <Truck className="h-7 w-7 text-cyan-400 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-white">شحن سريع</h4>
                <p className="text-[10px] text-slate-300">لجميع محافظات مصر</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <CreditCard className="h-7 w-7 text-emerald-400 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-white">دفع مريح</h4>
                <p className="text-[10px] text-slate-300">عند الاستلام أو كاش</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <Headphones className="h-7 w-7 text-amber-400 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-white">دعم مستمر</h4>
                <p className="text-[10px] text-slate-300">واتساب 7 أيام بالأسبوع</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Catalog Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10">
        {/* Category Filter Tabs */}
        <div className="mb-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                كتالوج المنتجات والمستلزمات
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                اختر القسم المناسب لتصفح احتياجات عيادتك بسهولة
              </p>
            </div>
            <span className="text-xs font-bold text-cyan-700 bg-cyan-50 dark:bg-cyan-950/60 px-3 py-1.5 rounded-xl border border-cyan-200 dark:border-cyan-800">
              {filteredProducts.length} منتج
            </span>
          </div>

          <CategoryBar
            selectedSlug={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-12 text-center space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400">
              <FilterX className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                لا توجد نتائج مطابقة لبحثك
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md">
                لم نتمكن من العثور على منتجات مطابقة لـ &quot;{searchQuery}&quot; في هذا القسم. حاول استخدام كلمات بحث أخرى أو إعادة ضبط الفلتر.
              </p>
            </div>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              className="text-xs font-bold text-cyan-600 hover:text-cyan-700 underline underline-offset-4"
            >
              عرض جميع المنتجات
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
