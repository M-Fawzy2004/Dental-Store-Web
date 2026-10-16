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
  Stethoscope,
  Award,
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
    <main className="min-h-screen bg-slate-50 dark:bg-[#0b1329] pb-24 text-right">
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0b3c49] via-[#0b2b3a] to-[#0b1329] text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-cyan-900/40">
        {/* Abstract Background Accents */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-24 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-5xl text-center space-y-6">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/15 border border-cyan-400/40 px-4 py-1.5 text-xs sm:text-sm font-bold text-cyan-300 backdrop-blur-md shadow-lg shadow-cyan-950/40">
            <Sparkles className="h-4 w-4 text-cyan-300 animate-pulse" />
            <span>المتجر التخصصي الأول لأدوات ومستلزمات طب الأسنان في مصر</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            أدوات جراحة وحشوات الأسنان
            <br />
            <span className="bg-gradient-to-r from-cyan-300 via-teal-200 to-emerald-300 bg-clip-text text-transparent">
              بأعلى معايير التعقيم والجودة الطبية
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            نوفر لأطباء وجراحي الأسنان والمراكز المتخصصة أجود أدوات الستانلس ستيل الألماني القابل للتعقيم 134°C، حشوات الكومبوزيت، البنج الموضعي، والمستهلكات بأفضل أسعار وشحن مباشر لباب العيادة.
          </p>

          {/* Quick Search on Hero */}
          <div className="mx-auto max-w-xl pt-2">
            <div className="relative flex items-center">
              <Search className="absolute right-4 h-5 w-5 text-cyan-300" />
              <input
                type="text"
                placeholder="ابحث عن أداة معينة (مثال: كابلات خلع، توربين، حشوة Filtek، بنج أرتيكايين)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-13 pr-12 pl-14 rounded-2xl bg-white/10 backdrop-blur-md border border-cyan-400/30 text-white placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:bg-white/15 text-sm transition-all shadow-xl"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute left-4 text-xs font-bold text-cyan-300 hover:text-white bg-white/10 px-2 py-1 rounded-md cursor-pointer"
                >
                  مسح
                </button>
              )}
            </div>
          </div>

          {/* Trust Value Props */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 text-right">
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/20 text-teal-300">
                <ShieldCheck className="h-6 w-6 flex-shrink-0" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">ستانلس ستيل طبي</h4>
                <p className="text-[10px] text-slate-300">مقاوم للصدأ أوتوكلاف 134°</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-300">
                <Truck className="h-6 w-6 flex-shrink-0" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">شحن سريع ومباشر</h4>
                <p className="text-[10px] text-slate-300">لباب العيادة بكافة المحافظات</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300">
                <CreditCard className="h-6 w-6 flex-shrink-0" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">دفع مريح عند الاستلام</h4>
                <p className="text-[10px] text-slate-300">كاش أو انستاباي وفودافون</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300">
                <Headphones className="h-6 w-6 flex-shrink-0" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">طلب وتأكيد واتساب</h4>
                <p className="text-[10px] text-slate-300">متابعة فورية 01068808559</p>
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
                كتالوج أدوات ومستلزمات الأسنان
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                اختر التصنيف الطبي المطلوب للاطلاع على المواصفات والأسعار
              </p>
            </div>
            <span className="text-xs font-bold text-cyan-700 dark:text-cyan-300 bg-cyan-100 dark:bg-cyan-950/80 px-3 py-1.5 rounded-xl border border-cyan-200 dark:border-cyan-800">
              {filteredProducts.length} منتج متوفر
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
              <ProductCard
                key={product.id}
                product={product}
                onViewDetails={setSelectedProduct}
              />
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
              className="text-xs font-bold text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 underline underline-offset-4 cursor-pointer"
            >
              عرض جميع أدوات الكتالوج
            </button>
          </div>
        )}
      </section>

      {/* Product Details Modal (Dental Tool Specs, Autoclave, Origin, WhatsApp) */}
      <ProductDetailsModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </main>
  );
}
