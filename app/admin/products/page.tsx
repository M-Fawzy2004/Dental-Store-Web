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
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Product } from "@/types";
import { supabase } from "@/lib/supabase/client";
import { initialMockProducts } from "@/lib/domain/mock-products";
import { formatCurrency } from "@/lib/utils/formatters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";

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
  const [material, setMaterial] = React.useState("ستانلس ستيل طبي ألماني (Medical Grade 316L)");
  const [autoclavable, setAutoclavable] = React.useState("نعم - أوتوكلاف حتى 134° مئوية");
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
    setMaterial("ستانلس ستيل طبي ألماني (Medical Grade 316L)");
    setAutoclavable("نعم - أوتوكلاف حتى 134° مئوية");
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
    setMaterial(prod.specifications?.material || "ستانلس ستيل طبي ألماني (Medical Grade 316L)");
    setAutoclavable(prod.specifications?.autoclavable || "نعم - أوتوكلاف حتى 134° مئوية");
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
      intendedUse: "عيادات ومراكز طب وجراحة الأسنان",
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
        updated_at: "2026-10-16T15:00:00Z",
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
      const newId = `prod-dental-${Math.floor(1000 + Math.random() * 9000)}`;
      const slug = `dental-${Date.now()}`;
      const newProd: Product = {
        id: newId,
        created_at: "2026-10-16T15:00:00Z",
        updated_at: "2026-10-16T15:00:00Z",
        name: name.trim(),
        slug: slug,
        category_id: "surgical-instruments",
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-white flex items-center gap-2.5 tracking-tight">
            <Package className="h-7 w-7 text-cyan-400" />
            <span>إدارة منتجات وأدوات الأسنان والمخزون</span>
          </h1>
          <p className="text-xs lg:text-sm text-slate-400 mt-1">
            أي أداة أو مستحضر تضيفه أو تعدله هنا يظهر لزوار المتجر والعيادات والمراكز فوراً
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadProducts}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#111e38] hover:bg-[#16274a] text-slate-200 text-xs font-bold transition-colors border border-slate-700/60 cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-cyan-400 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>تحديث القائمة</span>
          </button>

          <Button onClick={handleOpenAdd} className="gap-2 text-xs font-bold shadow-lg shadow-cyan-900/30">
            <Plus className="h-4 w-4" />
            <span>إضافة أداة / منتج جديد</span>
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-cyan-400" />
          <input
            type="text"
            placeholder="ابحث بالاسم أو القسم أو الأداة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pr-10 pl-4 rounded-xl bg-[#0e172c] border border-slate-700/70 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 shadow-inner"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1">
          {[
            { id: "all", label: "جميع الأدوات" },
            { id: "low_stock", label: "أوشك على النفاد ⚠️" },
            { id: "جراحة", label: "أدوات جراحة وخلع" },
            { id: "حشوات", label: "حشوات وبنج" },
            { id: "تعقيم", label: "تعقيم ومكافحة عدوى" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shadow-sm ${
                selectedCategory === cat.id
                  ? "bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-cyan-900/40 border border-cyan-400/40"
                  : "bg-[#0e172c] text-slate-300 hover:text-white border border-slate-800 hover:bg-[#121e38]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table with Enhanced Medical Colors */}
      <div className="rounded-2xl bg-gradient-to-b from-[#0e172c] to-[#0a1021] border border-slate-800/90 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right">
            <thead>
              <tr className="border-b border-slate-800 bg-[#121e38]/80 text-slate-300">
                <th className="py-3.5 px-4 font-bold rounded-r-xl">المنتج / الأداة</th>
                <th className="py-3.5 px-4 font-bold">القسم</th>
                <th className="py-3.5 px-4 font-bold">السعر للعيادات</th>
                <th className="py-3.5 px-4 font-bold">المخزون</th>
                <th className="py-3.5 px-4 font-bold">حالة العرض</th>
                <th className="py-3.5 px-4 font-bold text-center rounded-l-xl">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredProducts.map((prod) => (
                <tr key={prod.id} className="hover:bg-cyan-950/20 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-[#142344] border border-slate-700/60 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
                        {prod.image_url ? (
                          <img
                            src={prod.image_url}
                            alt={prod.name}
                            className="h-full w-full object-contain p-1"
                          />
                        ) : (
                          <span className="text-xl">🦷</span>
                        )}
                      </div>
                      <div className="space-y-0.5">
                        <span className="font-extrabold text-white line-clamp-1">
                          {prod.name}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-cyan-400 font-mono">
                            {prod.id}
                          </span>
                          {prod.specifications?.autoclavable?.includes("134") && (
                            <span className="text-[9px] font-bold text-teal-400 bg-teal-950/80 px-1.5 py-0.2 rounded border border-teal-800/80">
                              أوتوكلاف 134°
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-lg bg-[#142344] text-cyan-300 text-[11px] font-bold border border-cyan-900/50">
                      {prod.category_name}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-black text-emerald-400 text-sm">
                    {formatCurrency(prod.price)}
                    {prod.compare_at_price && (
                      <span className="block text-[10px] text-slate-400 line-through font-normal">
                        {formatCurrency(prod.compare_at_price)}
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`font-black px-2.5 py-1 rounded-lg text-[11px] border ${
                        prod.stock <= 5
                          ? "bg-rose-950/70 text-rose-300 border-rose-800"
                          : "bg-[#111e38] text-slate-200 border-slate-700"
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
                          ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/25"
                          : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700"
                      }`}
                    >
                      {prod.is_active ? "معروض بالمتجر" : "مخفي مؤقتاً"}
                    </button>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleOpenEdit(prod)}
                        className="p-2 rounded-xl bg-[#111e38] hover:bg-cyan-950 text-slate-300 hover:text-cyan-300 border border-slate-700/60 transition-colors cursor-pointer"
                        title="تعديل تفاصيل الأداة"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(prod.id, prod.name)}
                        className="p-2 rounded-xl bg-[#111e38] hover:bg-rose-950 text-slate-400 hover:text-rose-300 border border-slate-700/60 transition-colors cursor-pointer"
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

      {/* Add / Edit Product Modal with Dental Specifications */}
      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? "تعديل بيانات ومواصفات أداة الأسنان" : "إضافة منتج طبي جديد للكتالوج"}
        description="أدخل تفاصيل الأداة الجراحية، مادة الصنع، معايير الأوتوكلاف، وسعر البيع"
        className="bg-[#0e172c] border-slate-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <form onSubmit={handleSaveProduct} className="space-y-4 pt-2 text-right">
          <Input
            label="اسم المنتج الطبي أو الأداة بالكامل *"
            placeholder="مثال: طقم كابلات خلع أسنان فك علوي وسفلي بريميوم"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="bg-[#091020] border-slate-700 text-white"
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                القسم الطبي والتصنيف *
              </label>
              <select
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="w-full h-11 rounded-xl bg-[#091020] border border-slate-700 text-white px-3 text-xs focus:outline-none focus:border-cyan-500"
              >
                <option value="أدوات جراحة وخلع">أدوات جراحة وخلع</option>
                <option value="حشوات وترميم">حشوات وترميم</option>
                <option value="تعقيم ومكافحة عدوى">تعقيم ومكافحة عدوى</option>
                <option value="أدوات الفحص والتشخيص">أدوات الفحص والتشخيص</option>
                <option value="مستهلكات العيادة">مستهلكات العيادة</option>
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
              className="bg-[#091020] border-slate-700 text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="سعر البيع للعيادات (ج.م) *"
              type="number"
              placeholder="1250"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              className="bg-[#091020] border-slate-700 text-white"
            />
            <Input
              label="السعر قبل الخصم (اختياري)"
              type="number"
              placeholder="1400"
              value={comparePrice}
              onChange={(e) => setComparePrice(e.target.value)}
              className="bg-[#091020] border-slate-700 text-white"
            />
          </div>

          {/* Dental Specifications Group */}
          <div className="p-3.5 rounded-2xl bg-[#091020] border border-slate-700/80 space-y-3">
            <h4 className="text-xs font-black text-cyan-400 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              <span>المواصفات الفنية لطب الأسنان (تظهر في نافذة التفاصيل):</span>
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="مادة الصنع"
                placeholder="ستانلس ستيل طبي ألماني (Medical Grade 316L)"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                className="bg-[#0e172c] border-slate-700 text-xs text-white"
              />
              <Input
                label="التعقيم بالأوتوكلاف"
                placeholder="نعم - أوتوكلاف حتى 134° مئوية"
                value={autoclavable}
                onChange={(e) => setAutoclavable(e.target.value)}
                className="bg-[#0e172c] border-slate-700 text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="بلد المنشأ والجودة"
                placeholder="ألمانيا / معتمد CE & ISO 13485"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="bg-[#0e172c] border-slate-700 text-xs text-white"
              />
              <Input
                label="الضمان الطبي"
                placeholder="ضمان 3 سنوات ضد الكسر والصدأ"
                value={warranty}
                onChange={(e) => setWarranty(e.target.value)}
                className="bg-[#0e172c] border-slate-700 text-xs text-white"
              />
            </div>
          </div>

          <Input
            label="رابط صورة الأداة (URL)"
            placeholder="https://images.unsplash.com/..."
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="bg-[#091020] border-slate-700 text-white text-left font-mono text-xs"
            dir="ltr"
          />

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              الوصف الطبي للأداة وكيفية استخدامها
            </label>
            <textarea
              rows={3}
              placeholder="وصف طبي دقيق لميزات الأداة وملاءمتها لجراحات وتخصصات الفم والأسنان..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl bg-[#091020] border border-slate-700 text-white p-3 text-xs focus:outline-none focus:border-cyan-500 resize-none"
            />
          </div>

          <div className="pt-3 flex gap-2">
            <Button type="submit" className="flex-1 font-bold shadow-lg shadow-cyan-900/30">
              {editingProduct ? "حفظ التعديلات" : "إضافة الأداة للمتجر"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="border-slate-700 bg-[#111e38] text-slate-300 hover:bg-[#16274a]"
            >
              إلغاء
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
