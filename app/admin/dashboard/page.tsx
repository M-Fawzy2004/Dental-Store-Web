"use client";

import * as React from "react";
import Link from "next/link";
import {
  TrendingUp,
  ShoppingBag,
  Package,
  AlertTriangle,
  ArrowUpRight,
  Plus,
  RefreshCw,
  Clock,
  Database,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";
import { supabase } from "@/lib/supabase/client";
import { initialMockProducts } from "@/lib/domain/mock-products";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { OrderStatus } from "@/types";

interface DashboardOrder {
  id: string;
  orderNumber: number;
  customerName: string;
  customerPhone: string;
  city: string;
  totalAmount: number;
  paymentMethod: string;
  status: OrderStatus;
  createdAt: string;
}

export default function AdminDashboardPage() {
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [totalSales, setTotalSales] = React.useState(18500);
  const [ordersCount, setOrdersCount] = React.useState(6);
  const [productsCount, setProductsCount] = React.useState(12);
  const [pendingCount, setPendingCount] = React.useState(2);
  const [recentOrders, setRecentOrders] = React.useState<DashboardOrder[]>([
    {
      id: "ord-1",
      orderNumber: 104281,
      customerName: "د. طارق الشربيني (عيادة الشروق)",
      customerPhone: "01019882233",
      city: "القاهرة",
      totalAmount: 4850,
      paymentMethod: "cash_on_delivery",
      status: "pending",
      createdAt: "2026-10-16T14:45:00Z",
    },
    {
      id: "ord-2",
      orderNumber: 104280,
      customerName: "د. أحمد الشناوي",
      customerPhone: "01099234812",
      city: "القاهرة",
      totalAmount: 3400,
      paymentMethod: "instapay",
      status: "confirmed",
      createdAt: "2026-10-16T13:20:00Z",
    },
    {
      id: "ord-3",
      orderNumber: 104279,
      customerName: "د. إيمان عبد الحميد",
      customerPhone: "01233445566",
      city: "الإسكندرية",
      totalAmount: 2150,
      paymentMethod: "vodafone_cash",
      status: "shipped",
      createdAt: "2026-10-16T11:15:00Z",
    },
  ]);

  const loadData = async () => {
    setIsRefreshing(true);
    try {
      // 1. Fetch Supabase Orders
      const { data: dbOrders, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (!ordersError && dbOrders && dbOrders.length > 0) {
        setOrdersCount(dbOrders.length);
        const total = dbOrders.reduce((acc, o) => acc + (Number(o.total_amount) || 0), 0);
        setTotalSales(total);
        const pending = dbOrders.filter((o) => o.status === "pending").length;
        setPendingCount(pending);

        setRecentOrders(
          dbOrders.slice(0, 5).map((o) => ({
            id: o.id,
            orderNumber: o.order_number || 1000,
            customerName: o.customer_name,
            customerPhone: o.customer_phone,
            city: o.city,
            totalAmount: Number(o.total_amount) || 0,
            paymentMethod: o.payment_method,
            status: o.status as OrderStatus,
            createdAt: o.created_at,
          }))
        );
      }

      // 2. Fetch Supabase Products Count
      const { count: prodCount, error: prodError } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true });

      if (!prodError && prodCount !== null && prodCount > 0) {
        setProductsCount(prodCount);
      } else {
        setProductsCount(initialMockProducts.length);
      }
    } catch (err) {
      console.warn("Using offline dashboard fallback:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  React.useEffect(() => {
    loadData();
  }, []);

  const paymentLabels: Record<string, string> = {
    cash_on_delivery: "الدفع عند الاستلام",
    vodafone_cash: "فودافون كاش",
    instapay: "انستاباي (InstaPay)",
  };

  return (
    <div className="p-6 lg:p-8 space-y-8 text-right max-w-7xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight">
              لوحة مؤشرات المتجر والمبيعات
            </h1>
            <Sparkles className="h-5 w-5 text-cyan-400" />
          </div>
          <p className="text-xs lg:text-sm text-slate-400 mt-1">
            متابعة فورية ومباشرة للطلبات الواردة، أرباح المبيعات، ومخزون مستلزمات عيادات الأسنان
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadData}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#111e38] hover:bg-[#16274a] text-slate-200 text-xs font-bold transition-all border border-slate-700/60 shadow-sm cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-cyan-400 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>تحديث البيانات (Supabase)</span>
          </button>

          <Link href="/admin/products">
            <Button size="sm" className="gap-1.5 text-xs font-bold shadow-lg shadow-cyan-900/30">
              <Plus className="h-4 w-4" />
              <span>إضافة منتج جديد</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Stat Cards with Rich Gradients & High Contrast */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0c2235] via-[#0b1b2d] to-[#08121f] border border-emerald-500/30 shadow-lg shadow-emerald-950/20 space-y-3 relative overflow-hidden group hover:border-emerald-400/60 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between relative">
            <span className="text-xs font-bold text-slate-300">إجمالي المبيعات المحققة</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-inner">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="space-y-1 relative">
            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {formatCurrency(totalSales)}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400">
              <ArrowUpRight className="h-3.5 w-3.5" />
              <span>طلبات مؤكدة من الموقع</span>
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0b263b] via-[#091e30] to-[#071322] border border-cyan-500/30 shadow-lg shadow-cyan-950/20 space-y-3 relative overflow-hidden group hover:border-cyan-400/60 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between relative">
            <span className="text-xs font-bold text-slate-300">إجمالي الطلبات المستلمة</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-inner">
              <ShoppingBag className="h-5 w-5" />
            </div>
          </div>
          <div className="space-y-1 relative">
            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {ordersCount} طلبات
            </div>
            <div className="text-[11px] font-medium text-cyan-300">
              قاعدة بيانات Supabase المباشرة
            </div>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#291e10] via-[#20180d] to-[#120e07] border border-amber-500/40 shadow-lg shadow-amber-950/20 space-y-3 relative overflow-hidden group hover:border-amber-400/70 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between relative">
            <span className="text-xs font-bold text-amber-200">طلبات قيد المراجعة</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-inner">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="space-y-1 relative">
            <div className="text-2xl sm:text-3xl font-black text-amber-400 tracking-tight">
              {pendingCount} بانتظار الشحن
            </div>
            <div className="text-[11px] font-medium text-amber-300/80">
              تتطلب تأكيد العيادة وتجهيز الفاتورة
            </div>
          </div>
        </div>

        {/* Total Catalog Products */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#1d1533] via-[#161028] to-[#0c0919] border border-purple-500/30 shadow-lg shadow-purple-950/20 space-y-3 relative overflow-hidden group hover:border-purple-400/60 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between relative">
            <span className="text-xs font-bold text-slate-300">المنتجات بالكتالوج</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 shadow-inner">
              <Package className="h-5 w-5" />
            </div>
          </div>
          <div className="space-y-1 relative">
            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {productsCount} صنف معروض
            </div>
            <div className="text-[11px] font-medium text-purple-300">
              متاحة لطلب الأطباء والزوار فوراً
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="rounded-2xl bg-gradient-to-b from-[#0e172c] to-[#0a1021] border border-slate-800/90 p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <div>
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              <span>أحدث طلبات العيادات والأطباء الواردة</span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                مباشر
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              قائمة الطلبات المسجلة من المتجر للاتصال بالأطباء وتجهيز الشحن
            </p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 bg-[#111e38] px-3 py-1.5 rounded-xl border border-slate-700/60 hover:bg-[#16274a] transition-colors"
          >
            <span>عرض كل الطلبات وإدارتها</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right">
            <thead>
              <tr className="border-b border-slate-800 text-slate-300 bg-[#121e38]/70">
                <th className="py-3 px-3.5 font-bold rounded-r-xl">رقم الطلب</th>
                <th className="py-3 px-3.5 font-bold">العميل / الطبيب</th>
                <th className="py-3 px-3.5 font-bold">المحافظة</th>
                <th className="py-3 px-3.5 font-bold">طريقة الدفع</th>
                <th className="py-3 px-3.5 font-bold">الإجمالي</th>
                <th className="py-3 px-3.5 font-bold rounded-l-xl">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {recentOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-cyan-950/20 transition-colors">
                  <td className="py-3 px-3.5 font-mono font-bold text-cyan-400">
                    #{ord.orderNumber}
                  </td>
                  <td className="py-3 px-3.5 font-bold text-white">
                    {ord.customerName}
                    <span className="block text-[10px] text-slate-400 font-mono mt-0.5" dir="ltr">
                      {ord.customerPhone}
                    </span>
                  </td>
                  <td className="py-3 px-3.5 text-slate-300 font-medium">{ord.city}</td>
                  <td className="py-3 px-3.5 text-slate-400 font-medium">
                    {paymentLabels[ord.paymentMethod] || ord.paymentMethod}
                  </td>
                  <td className="py-3 px-3.5 font-black text-emerald-400">
                    {formatCurrency(ord.totalAmount)}
                  </td>
                  <td className="py-3 px-3.5">
                    <OrderStatusBadge status={ord.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Access Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0c2438] via-[#091b2c] to-[#0a1224] border border-cyan-800/50 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-right">
          <h3 className="text-sm font-black text-white flex items-center justify-center sm:justify-start gap-2">
            <span>لوحة تحكم متكاملة لبيع وإدارة مستلزمات طب الأسنان</span>
            <span className="text-[10px] bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-full border border-teal-500/30">
              سوبابيز نشط
            </span>
          </h3>
          <p className="text-xs text-slate-300">
            يمكن لصاحب المتجر إضافة أصناف جديدة وتعديل أسعار الأدوات فوراً، والتواصل مع كل طبيب هاتفياً أو عبر واتساب بضغطة زر.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link href="/admin/products">
            <Button size="sm" className="text-xs font-bold shadow-md shadow-cyan-900/30">
              إدارة المنتجات والمخزن
            </Button>
          </Link>
          <Link href="/" target="_blank">
            <Button size="sm" variant="outline" className="text-xs border-slate-700 bg-[#111e38] text-slate-200 hover:bg-[#16274a] gap-1.5">
              <span>معاينة المتجر</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
