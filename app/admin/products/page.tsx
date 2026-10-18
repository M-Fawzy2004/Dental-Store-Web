"use client";

import * as React from "react";
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  Check,
  AlertCircle,
  Eye,
  RefreshCw,
  Wrench,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Product } from "@/types";
import { supabase } from "@/lib/supabase/client";
import { initialMockProducts } from "@/lib/domain/mock-products";
import { formatCurrency } from "@/lib/utils/formatters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
const categorySlugMap: Record<string, string> = {
  "أدوات جراحة وخلع": "surgical-instruments",
  "حشوات وعلاج جذور": "restorative-endodontics",
  "فحص وتشخيص ولثة": "diagnostic-periodontics",
  "قبضات وتوربينات وأجهزة": "handpieces-equipment",
  "بنج وتخدير موضعي": "anesthesia-syringes",
  "طبعات وتركيبات وتثبيت": "impression-prosthodontics",
  "تقويم الأسنان": "orthodontics",
  "تعقيم ومكافحة عدوى": "sterilization-infection-control",
  "مستهلكات ووقايات العيادة": "disposables",
};

export default function AdminProductsPage() {
  const [products, setProducts] = React.useState<Product[]>(initialMockProducts);
  const [loading, setLoading] = React.useState(true);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("all");
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(null);

  // Form states
  const [name, setName] = React.useState("");
  const [categoryName, setCategoryName] = React.useState("أدوات جراحة وخلع");
  const [price, setPrice] = React.useState("");
  const [comparePrice, setComparePrice] = React.useState("");
  const [stock, setStock] = React.useState("");
  const [imageUrl, setImageUrl] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [material, setMaterial] = React.useState("فولاذ ستانلس ستيل طبي وصناعي (Grade 316L)");
  const [autoclavable, setAutoclavable] = React.useState("نعم - أوتوكلاف وحرارة حتى 134° مئوية");
  const [origin, setOrigin] = React.useState("ألمانيا / معتمد CE & ISO 13485");
  const [warranty, setWarranty] = React.useState("ضمان عام ضد عيوب الصناعة والصدأ");

  const loadProducts = async () => {
    setIsRefreshing(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        setProducts(data as Product[]);
      } else {
        setProducts(initialMockProducts);
      }
    } catch (err) {
      console.warn("Using local products fallback:", err);
      setProducts(initialMockProducts);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  React.useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" ||
      (selectedCategory === "low_stock" && p.stock <= 6) ||
      p.category_name.includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setName("");
    setCategoryName("أدوات جراحة وخلع");
    setPrice("");
    setComparePrice("");
    setStock("20");
    setImageUrl("");
    setDescription("");
    setMaterial("فولاذ ستانلس ستيل طبي وصناعي (Grade 316L)");
    setAutoclavable("نعم - أوتوكلاف وحرارة حتى 134° مئوية");
    setOrigin("ألمانيا / معتمد CE & ISO 13485");
    setWarranty("ضمان عام ضد عيوب الصناعة والصدأ");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prod: Product) => {
    setEditingProduct(prod);
    setName(prod.name);
    setCategoryName(prod.category_name);
    setPrice(prod.price.toString());
    setComparePrice(prod.compare_at_price ? prod.compare_at_price.toString() : "");
    setStock(prod.stock.toString());
    setImageUrl(prod.image_url || "");
    setDescription(prod.description || "");
    setMaterial(prod.specifications?.material || "فولاذ ستانلس ستيل طبي وصناعي (Grade 316L)");
    setAutoclavable(prod.specifications?.autoclavable || "نعم - أوتوكلاف وحرارة حتى 134° مئوية");
    setOrigin(prod.specifications?.origin || "ألمانيا / معتمد CE & ISO 13485");
    setWarranty(prod.specifications?.warranty || "ضمان عام ضد عيوب الصناعة والصدأ");
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, prodName: string) => {
    if (!confirm(`هل أنت متأكد من حذف المنتج: "${prodName}" نهائياً من المتجر؟`)) {
      return;
    }

    try {
      await supabase.from("products").delete().eq("id", id);
    } catch (err) {
      console.warn("Supabase delete notice:", err);
    }

    setProducts(products.filter((p) => p.id !== id));
    toast.success("تم حذف المنتج بنجاح من المتجر");
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !price) {
      toast.error("يرجى إدخال اسم المنتج والسعر");
      return;
    }

    const defaultImg =
      "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=600&q=80";

    const specs = {
      material: material.trim(),
      autoclavable: autoclavable.trim(),
      origin: origin.trim(),
      warranty: warranty.trim(),
      intendedUse: "استخدامات الورش، المراكز، والعيادات التخصصية",
    };

    if (editingProduct) {
      // Update in state
      const updatedItem: Product = {
        ...editingProduct,
        name: name.trim(),
        category_name: categoryName,
        price: Number(price),
        compare_at_price: comparePrice ? Number(comparePrice) : null,
        stock: Number(stock) || 0,
        image_url: imageUrl.trim() || editingProduct.image_url,
        description: description.trim() || null,
        specifications: specs,
        updated_at: "2026-10-18T10:00:00Z",
      };

      try {
        await supabase
          .from("products")
          .update({
            name: updatedItem.name,
            category_name: updatedItem.category_name,
            price: updatedItem.price,
            compare_at_price: updatedItem.compare_at_price,
            stock: updatedItem.stock,
            image_url: updatedItem.image_url,
            description: updatedItem.description,
            updated_at: updatedItem.updated_at,
          })
          .eq("id", editingProduct.id);
      } catch (err) {
        console.warn("Supabase update notice:", err);
      }

      setProducts(products.map((p) => (p.id === editingProduct.id ? updatedItem : p)));
      toast.success("تم حفظ التعديلات بنجاح وستظهر للزوار فوراً!");
    } else {
      // Create new
      const newId = `prod-tool-${Math.floor(1000 + Math.random() * 9000)}`;
      const slug = `tool-${Date.now()}`;
      const newProd: Product = {
        id: newId,
        created_at: "2026-10-18T10:00:00Z",
        updated_at: "2026-10-18T10:00:00Z",
        name: name.trim(),
        slug: slug,
        category_id: categorySlugMap[categoryName] || "surgical-instruments",
        category_name: categoryName,
        price: Number(price),
        compare_at_price: comparePrice ? Number(comparePrice) : null,
        stock: Number(stock) || 10,
        image_url: imageUrl.trim() || defaultImg,
        description: description.trim() || null,
        specifications: specs,
        is_active: true,
      };

      try {
        await supabase.from("products").insert({
          id: newProd.id,
          name: newProd.name,
          slug: newProd.slug,
          category_name: newProd.category_name,
          price: newProd.price,
          compare_at_price: newProd.compare_at_price,
          stock: newProd.stock,
          image_url: newProd.image_url,
          description: newProd.description,
          is_active: true,
        });
      } catch (err) {
        console.warn("Supabase insert notice:", err);
      }

      setProducts([newProd, ...products]);
      toast.success("تمت إضافة المنتج الجديد بنجاح إلى الكتالوج!");
    }

    setIsModalOpen(false);
  };

  const toggleStatus = async (prod: Product) => {
    const newStatus = !prod.is_active;

    try {
      await supabase
        .from("products")
        .update({ is_active: newStatus })
        .eq("id", prod.id);
    } catch (err) {
      console.warn("Supabase status toggle notice:", err);
    }

    setProducts(
      products.map((p) => (p.id === prod.id ? { ...p, is_active: newStatus } : p))
    );
    toast.info(newStatus ? "تم إظهار المنتج للمشترين" : "تم إخفاء المنتج من المتجر");
  };

  return (
    <div className="p-6 lg:p-8 space-y-8 text-right max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2.5 tracking-tight">
            <Package className="h-7 w-7 text-orange-600" />
            <span>إدارة المنتجات والأدوات والمخزون</span>
          </h1>
          <p className="text-xs lg:text-sm text-slate-500 dark:text-slate-400 mt-1">
            أي أداة أو قطعة تضيفها أو تعدلها هنا تظهر لزوار المتجر والمشترين فوراً
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadProducts}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#111e38] hover:bg-slate-50 dark:hover:bg-[#16274a] text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors border border-slate-200 dark:border-slate-700/60 cursor-pointer shadow-sm"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-orange-600 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>تحديث القائمة</span>
          </button>

          <Button onClick={handleOpenAdd} className="gap-2 text-xs font-bold shadow-md shadow-orange-600/20">
            <Plus className="h-4 w-4" />
            <span>إضافة أداة جديدة</span>
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-500" />
          <input
            type="text"
            placeholder="ابحث بالاسم أو القسم أو كود الأداة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pr-10 pl-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-orange-500 shadow-sm"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1">
          {[
            { id: "all", label: "جميع الأصناف" },
            { id: "low_stock", label: "أوشك على النفاد ⚠️" },
            { id: "جراحة", label: "جراحة وخلع" },
            { id: "حشوات", label: "حشوات وعلاج جذور" },
            { id: "فحص", label: "فحص ولثة" },
            { id: "قبضات", label: "قبضات وتوربينات" },
            { id: "بنج", label: "بنج وتخدير" },
            { id: "طبعات", label: "طبعات وتركيبات" },
            { id: "تقويم", label: "تقويم الأسنان" },
            { id: "تعقيم", label: "تعقيم ومكافحة عدوى" },
            { id: "مستهلكات", label: "مستهلكات العيادة" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shadow-sm ${
                selectedCategory === cat.id
                  ? "bg-orange-600 text-white shadow-orange-600/30 border border-orange-500"
                  : "bg-white text-slate-700 hover:text-slate-900 dark:bg-slate-900 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300">
                <th className="py-3.5 px-4 font-bold rounded-r-xl">المنتج / الأداة</th>
                <th className="py-3.5 px-4 font-bold">القسم</th>
                <th className="py-3.5 px-4 font-bold">السعر</th>
                <th className="py-3.5 px-4 font-bold">المخزون</th>
                <th className="py-3.5 px-4 font-bold">حالة العرض</th>
                <th className="py-3.5 px-4 font-bold text-center rounded-l-xl">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredProducts.map((prod) => (
                <tr key={prod.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
                        {prod.image_url ? (
                          <img
                            src={prod.image_url}
                            alt={prod.name}
                            className="h-full w-full object-contain p-1"
                          />
                        ) : (
                          <span className="text-xl">⚙️</span>
                        )}
                      </div>
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-900 dark:text-white line-clamp-1">
                          {prod.name}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-orange-600 dark:text-orange-400 font-mono font-bold">
                            {prod.id}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 text-[11px] font-bold border border-slate-200 dark:border-slate-700">
                      {prod.category_name}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-black text-slate-900 dark:text-white text-sm">
                    {formatCurrency(prod.price)}
                    {prod.compare_at_price && (
                      <span className="block text-[10px] text-slate-400 line-through font-normal">
                        {formatCurrency(prod.compare_at_price)}
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`font-bold px-2.5 py-1 rounded-lg text-[11px] border ${
                        prod.stock <= 5
                          ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-800"
                          : "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700"
                      }`}
                    >
                      {prod.stock} قطع
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => toggleStatus(prod)}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full border cursor-pointer transition-colors ${
                        prod.is_active
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/40"
                          : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                      }`}
                    >
                      {prod.is_active ? "معروض بالمتجر" : "مخفي مؤقتاً"}
                    </button>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleOpenEdit(prod)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-orange-600 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                        title="تعديل تفاصيل الأداة"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(prod.id, prod.name)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-950 text-slate-500 hover:text-rose-600 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                        title="حذف الأداة"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? "تعديل بيانات ومواصفات الأداة" : "إضافة أداة / منتج جديد للكتالوج"}
        description="أدخل تفاصيل الأداة، مادة الصنع، المواصفات الفنية، وسعر البيع"
        className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <form onSubmit={handleSaveProduct} className="space-y-4 pt-2 text-right">
          <Input
            label="اسم الأداة أو المعدة بالكامل *"
            placeholder="مثال: طقم كابلات خلع ومعدات بريميوم"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                التصنيف والقسم *
              </label>
              <select
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="w-full h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white px-3 text-xs focus:outline-none focus:border-orange-500"
              >
                <option value="أدوات جراحة وخلع">أدوات جراحة وخلع</option>
                <option value="حشوات وعلاج جذور">حشوات وعلاج جذور</option>
                <option value="فحص وتشخيص ولثة">فحص وتشخيص ولثة</option>
                <option value="قبضات وتوربينات وأجهزة">قبضات وتوربينات وأجهزة</option>
                <option value="بنج وتخدير موضعي">بنج وتخدير موضعي</option>
                <option value="طبعات وتركيبات وتثبيت">طبعات وتركيبات وتثبيت</option>
                <option value="تقويم الأسنان">تقويم الأسنان</option>
                <option value="تعقيم ومكافحة عدوى">تعقيم ومكافحة عدوى</option>
                <option value="مستهلكات ووقايات العيادة">مستهلكات ووقايات العيادة</option>
              </select>
            </div>

            <Input
              label="الكمية المتاحة بالمخزن *"
              type="number"
              min="0"
              placeholder="15"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              required
              className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="سعر البيع (ج.م) *"
              type="number"
              placeholder="1250"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
            />
            <Input
              label="السعر قبل الخصم (اختياري)"
              type="number"
              placeholder="1400"
              value={comparePrice}
              onChange={(e) => setComparePrice(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
            />
          </div>

          {/* Technical Specifications */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
            <h4 className="text-xs font-black text-orange-600 dark:text-orange-400 flex items-center gap-1.5">
              <Wrench className="h-3.5 w-3.5" />
              <span>المواصفات الفنية للأداة:</span>
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="مادة الصنع"
                placeholder="فولاذ ستانلس ستيل طبي وصناعي 316L"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-xs"
              />
              <Input
                label="التحمل والتعقيم"
                placeholder="نعم - أوتوكلاف حتى 134° مئوية"
                value={autoclavable}
                onChange={(e) => setAutoclavable(e.target.value)}
                className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="بلد المنشأ والجودة"
                placeholder="ألمانيا / معتمد CE & ISO"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-xs"
              />
              <Input
                label="الضمان المعتمد"
                placeholder="ضمان عام ضد عيوب الصناعة والصدأ"
                value={warranty}
                onChange={(e) => setWarranty(e.target.value)}
                className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-xs"
              />
            </div>
          </div>

          <Input
            label="رابط صورة الأداة (URL)"
            placeholder="https://images.unsplash.com/..."
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-left font-mono text-xs"
            dir="ltr"
          />

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              الوصف الفني للأداة
            </label>
            <textarea
              rows={3}
              placeholder="وصف فني لميزات الأداة وملاءمتها للاستخدامات الهندسية أو الطبية..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white p-3 text-xs focus:outline-none focus:border-orange-500 resize-none"
            />
          </div>

          <div className="pt-3 flex gap-2">
            <Button type="submit" className="flex-1 font-bold shadow-md shadow-orange-600/20">
              {editingProduct ? "حفظ التعديلات" : "إضافة الأداة للمتجر"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
            >
              إلغاء
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
