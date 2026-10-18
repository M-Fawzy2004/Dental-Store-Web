"use client";

import * as React from "react";
import {
  ShoppingBag,
  Search,
  Phone,
  Printer,
  Eye,
  RefreshCw,
  MessageCircle,
  Truck,
  CheckCircle2,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";
import { OrderStatus } from "@/types";
import { supabase } from "@/lib/supabase/client";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { orderStatusLabels } from "@/components/admin/order-status-badge";
import { AmazonInvoiceDocument } from "@/components/storefront/amazon-invoice-document";

interface AdminOrderRow {
  id: string;
  orderNumber: number;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  city: string;
  totalAmount: number;
  paymentMethod: string;
  status: OrderStatus;
  createdAt: string;
  notes?: string | null;
  senderPhone?: string | null;
  paymentProofUrl?: string | null;
  paymentStatus?: string | null;
  items?: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

const fallbackOrders: AdminOrderRow[] = [
  {
    id: "ord-1",
    orderNumber: 104281,
    customerName: "د. طارق الشربيني (عيادة الشروق)",
    customerPhone: "01019882233",
    city: "القاهرة",
    shippingAddress: "مدينة الشروق، المنطقة الطبية، عمارة 204",
    totalAmount: 4850,
    paymentMethod: "cash_on_delivery",
    status: "pending",
    paymentStatus: "pending",
    createdAt: "2026-10-18T09:45:00Z",
    notes: "يرجى التوصيل بعد الساعة 3 عصراً",
    items: [
      { name: "طقم كابلات خلع ومعدات بريميوم (10 قطع)", quantity: 1, price: 3400 },
      { name: "طقم روافع دقيقة مستقيمة ومنحنية", quantity: 2, price: 720 },
    ],
  },
  {
    id: "ord-2",
    orderNumber: 104280,
    customerName: "د. أحمد الشناوي",
    customerPhone: "01099234812",
    city: "القاهرة",
    shippingAddress: "مدينة نصر، شارع الطيران، بجوار مجمع العيادات",
    totalAmount: 3400,
    paymentMethod: "instapay",
    status: "confirmed",
    paymentStatus: "paid",
    senderPhone: "01099234812@instapay",
    paymentProofUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80",
    createdAt: "2026-10-18T08:20:00Z",
    items: [
      { name: "بنج أرتيكايين 4% مع أدرينالين (علبة 50 كاربول)", quantity: 2, price: 1250 },
      { name: "حشوة كومبوزيت Filtek Universal لون A2", quantity: 1, price: 880 },
    ],
  },
  {
    id: "ord-3",
    orderNumber: 104279,
    customerName: "د. إيمان عبد الحميد",
    customerPhone: "01233445566",
    city: "الإسكندرية",
    shippingAddress: "سموحة، شارع فوزي معاذ",
    totalAmount: 2150,
    paymentMethod: "vodafone_cash",
    status: "shipped",
    paymentStatus: "paid",
    senderPhone: "01233445566",
    paymentProofUrl: "https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=600&q=80",
    createdAt: "2026-10-17T16:15:00Z",
    items: [
      { name: "قبضة توربين ضوئية LED عالية السرعة أوتوكلاف", quantity: 1, price: 2850 },
    ],
  },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = React.useState<AdminOrderRow[]>(fallbackOrders);
  const [loading, setLoading] = React.useState(true);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedStatus, setSelectedStatus] = React.useState<string>("all");
  const [selectedOrder, setSelectedOrder] = React.useState<AdminOrderRow | null>(null);
  const [previewInvoiceOrder, setPreviewInvoiceOrder] = React.useState<AdminOrderRow | null>(null);
  const [printOrder, setPrintOrder] = React.useState<AdminOrderRow | null>(null);

  const loadOrders = async () => {
    setIsRefreshing(true);
    try {
      let combinedOrders: AdminOrderRow[] = [];

      // 1. Fetch from Supabase
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        combinedOrders = data.map((o) => ({
          id: o.id,
          orderNumber: o.order_number || Math.floor(100000 + Math.random() * 900000),
          customerName: o.customer_name,
          customerPhone: o.customer_phone,
          shippingAddress: o.shipping_address,
          city: o.city,
          totalAmount: Number(o.total_amount) || 0,
          paymentMethod: o.payment_method,
          status: o.status as OrderStatus,
          paymentStatus: o.payment_status,
          senderPhone: o.sender_phone,
          paymentProofUrl: o.payment_proof_url,
          createdAt: o.created_at,
          notes: o.notes,
        }));
      }

      // 2. Load any orders placed locally in the current browser session
      if (typeof window !== "undefined") {
        const localOrders: AdminOrderRow[] = [];

        // Check sessionStorage
        const cachedReceipt = sessionStorage.getItem("last_order_receipt");
        if (cachedReceipt) {
          try {
            const parsed = JSON.parse(cachedReceipt);
            if (parsed && parsed.orderId) {
              localOrders.push({
                id: parsed.orderId,
                orderNumber: Number(parsed.orderNumber) || 120008,
                customerName: parsed.customerName || "عميل المتجر",
                customerPhone: parsed.customerPhone || "",
                shippingAddress: parsed.shippingAddress || "",
                city: parsed.city || "القاهرة",
                totalAmount: Number(parsed.totalAmount) || 0,
                paymentMethod: parsed.paymentMethod || "cash_on_delivery",
                status: "pending",
                paymentStatus: parsed.paymentMethod === "cash_on_delivery" ? "pending" : "paid",
                senderPhone: parsed.senderPhone,
                paymentProofUrl: parsed.paymentProofUrl,
                createdAt: parsed.createdAt || new Date().toISOString(),
                notes: parsed.notes,
                items: (parsed.items || []).map((i: any) => ({
                  name: i.productName || i.name || "صنف ومعدة طبية معتمدة",
                  quantity: Number(i.quantity) || 1,
                  price: Number(i.unitPrice || i.price) || 0,
                })),
              });
            }
          } catch (e) {}
        }

        // Check localStorage keys
        Object.keys(localStorage)
          .filter((k) => k.startsWith("order_"))
          .forEach((key) => {
            try {
              const raw = localStorage.getItem(key);
              if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed && parsed.orderId && !localOrders.some((lo) => lo.id === parsed.orderId)) {
                  localOrders.push({
                    id: parsed.orderId,
                    orderNumber: Number(parsed.orderNumber) || 120008,
                    customerName: parsed.customerName || "عميل المتجر",
                    customerPhone: parsed.customerPhone || "",
                    shippingAddress: parsed.shippingAddress || "",
                    city: parsed.city || "القاهرة",
                    totalAmount: Number(parsed.totalAmount) || 0,
                    paymentMethod: parsed.paymentMethod || "cash_on_delivery",
                    status: "pending",
                    paymentStatus: parsed.paymentMethod === "cash_on_delivery" ? "pending" : "paid",
                    senderPhone: parsed.senderPhone,
                    paymentProofUrl: parsed.paymentProofUrl,
                    createdAt: parsed.createdAt || new Date().toISOString(),
                    notes: parsed.notes,
                    items: (parsed.items || []).map((i: any) => ({
                      name: i.productName || i.name || "صنف ومعدة طبية معتمدة",
                      quantity: Number(i.quantity) || 1,
                      price: Number(i.unitPrice || i.price) || 0,
                    })),
                  });
                }
              }
            } catch (e) {}
          });

        // Merge locally placed orders at the top
        localOrders.forEach((lo) => {
          if (!combinedOrders.some((co) => co.id === lo.id)) {
            combinedOrders.unshift(lo);
          }
        });
      }

      if (combinedOrders.length > 0) {
        setOrders(combinedOrders);
      } else {
        setOrders(fallbackOrders);
      }
    } catch (err) {
      console.warn("Using fallback orders:", err);
      setOrders(fallbackOrders);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  React.useEffect(() => {
    loadOrders();
  }, []);

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.orderNumber.toString().includes(searchQuery) ||
      o.customerPhone.includes(searchQuery) ||
      o.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === "all" || o.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getWhatsAppStatusMessage = (ord: AdminOrderRow, status: OrderStatus): string => {
    const cleanPhone = ord.customerPhone.replace(/^0+/, "");
    const total = formatCurrency(ord.totalAmount);

    let statusText = "";
    if (status === "confirmed") {
      statusText = `مرحباً دكتور ${ord.customerName} 🦷،\nمعك متجر تكنو دنتال ستور مصر.\n\nيسعدنا إبلاغك بأنه تم *تأكيد طلبك رقم #${ord.orderNumber}* بنجاح ✅\nجاري حالياً فحص وتعقيم وتجهيز الأدوات والمعدات المفوترة في المخزن الرئيسي استعداداً لتسليمها لشركة الشحن.\n\n💰 إجمالي الفاتورة: ${total}\n📍 عنوان التوصيل: ${ord.city} - ${ord.shippingAddress}\n\nلأي استفسار أو تعديل، تواصل معنا دائماً عبر هذا الرقم (01068808559).`;
    } else if (status === "shipped") {
      statusText = `مرحباً دكتور ${ord.customerName} 🚚،\nمعك متجر تكنو دنتال ستور مصر.\n\nتم *تسليم شحنتك رقم #${ord.orderNumber}* لمندوب التوصيل وهي الآن في طريقها إليك! 📦\n\n📌 *ملاحظة هامة:* يحق لك معاينة وفحص جميع الأدوات والعبوات مع المندوب ومطابقتها قبل الاستلام والسداد.\n💰 المبلغ المطلوب تحصيله: ${total}\n📍 العنوان: ${ord.city} - ${ord.shippingAddress}\n\nسيتواصل معك المندوب هاتفياً لتنسيق موعد الاستلام.`;
    } else if (status === "delivered") {
      statusText = `شكراً لتعاملك معنا دكتور ${ord.customerName} 🌟\nمعك متجر تكنو دنتال ستور مصر.\n\nتم *تسليم طلبك رقم #${ord.orderNumber}* بنجاح. نتمنى لك عملاً موفقاً دائماً!\n\n🛡️ نذكرك بأن جميع الأدوات مشمولة بضمان الاستبدال الفوري ضد عيوب الصناعة لمدة عام كامل.\nيسعدنا دائماً تكرار التعامل معك 🦷✨`;
    } else if (status === "cancelled") {
      statusText = `مرحباً دكتور ${ord.customerName}،\nمعك متجر تكنو دنتال ستور مصر بخصوص طلبك رقم #${ord.orderNumber}.\nنحيطك علماً بأنه تم إلغاء الطلب. إذا كنت ترغب في استئناف الطلب أو تعديله، يرجى الرد على هذه الرسالة.`;
    } else {
      statusText = `مرحباً دكتور ${ord.customerName} 🦷،\nمعك متجر تكنو دنتال ستور مصر بخصوص طلبك رقم #${ord.orderNumber} بقيمة ${total}. نحن قيد مراجعة وتجهيز الفاتورة.`;
    }

    return `https://wa.me/2${cleanPhone}?text=${encodeURIComponent(statusText)}`;
  };

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId);
    } catch (err) {
      console.warn("Supabase status update notice:", err);
    }

    // Also update localStorage and sessionStorage if this order exists locally
    if (typeof window !== "undefined") {
      try {
        const localKeys = Object.keys(localStorage).filter((k) => k.startsWith("order_"));
        localKeys.forEach((key) => {
          const raw = localStorage.getItem(key);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed.orderId === orderId) {
              parsed.status = newStatus;
              localStorage.setItem(key, JSON.stringify(parsed));
            }
          }
        });

        const cachedReceipt = sessionStorage.getItem("last_order_receipt");
        if (cachedReceipt) {
          const parsed = JSON.parse(cachedReceipt);
          if (parsed.orderId === orderId) {
            parsed.status = newStatus;
            sessionStorage.setItem("last_order_receipt", JSON.stringify(parsed));
          }
        }
      } catch (e) {}
    }

    setOrders(
      orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );

    const targetOrder = orders.find((o) => o.id === orderId);
    if (targetOrder && targetOrder.customerPhone) {
      const waUrl = getWhatsAppStatusMessage(targetOrder, newStatus);
      toast.success(
        `تم تحديث حالة الطلب #${targetOrder.orderNumber} إلى: ${orderStatusLabels[newStatus].label}`,
        {
          action: {
            label: `💬 إرسال واتساب للعميل (${targetOrder.customerName.split(" ")[0]})`,
            onClick: () => window.open(waUrl, "_blank"),
          },
          duration: 7000,
        }
      );
    } else {
      toast.success(`تم تحديث حالة الطلب إلى: ${orderStatusLabels[newStatus].label}`);
    }
  };

  const handleViewOrder = async (ord: AdminOrderRow) => {
    setSelectedOrder(ord);

    if (!ord.items || ord.items.length === 0) {
      try {
        const { data: dbItems } = await supabase
          .from("order_items")
          .select("*")
          .eq("order_id", ord.id);

        if (dbItems && dbItems.length > 0) {
          setSelectedOrder({
            ...ord,
            items: dbItems.map((i) => ({
              name: i.product_name,
              quantity: i.quantity,
              price: Number(i.unit_price) || 0,
            })),
          });
        }
      } catch (err) {
        console.warn("Order items fetch notice:", err);
      }
    }
  };

  const handlePrintOrder = async (ord: AdminOrderRow) => {
    let orderToPrint = { ...ord };
    if (!ord.items || ord.items.length === 0) {
      try {
        const { data: dbItems } = await supabase
          .from("order_items")
          .select("*")
          .eq("order_id", ord.id);

        if (dbItems && dbItems.length > 0) {
          orderToPrint.items = dbItems.map((i) => ({
            name: i.product_name,
            quantity: i.quantity,
            price: Number(i.unit_price) || 0,
          }));
        }
      } catch (err) {
        console.warn("Order items fetch notice:", err);
      }
    }
    setPrintOrder(orderToPrint);
    setTimeout(() => {
      window.print();
    }, 250);
  };

  const handlePreviewInvoice = async (ord: AdminOrderRow) => {
    let orderToPreview = { ...ord };
    if (!ord.items || ord.items.length === 0) {
      try {
        const { data: dbItems } = await supabase
          .from("order_items")
          .select("*")
          .eq("order_id", ord.id);

        if (dbItems && dbItems.length > 0) {
          orderToPreview.items = dbItems.map((i) => ({
            name: i.product_name,
            quantity: i.quantity,
            price: Number(i.unit_price) || 0,
          }));
        }
      } catch (err) {
        console.warn("Order items fetch notice:", err);
      }
    }
    setPreviewInvoiceOrder(orderToPreview);
  };

  const paymentLabels: Record<string, { label: string; badgeClass: string }> = {
    cash_on_delivery: {
      label: "الدفع عند الاستلام",
      badgeClass: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    },
    vodafone_cash: {
      label: "فودافون كاش",
      badgeClass: "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border-rose-200 dark:border-rose-800",
    },
    instapay: {
      label: "انستاباي (InstaPay)",
      badgeClass: "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400 border-purple-200 dark:border-purple-800",
    },
  };

  return (
    <>
      <div className="no-print hide-on-print print:hidden p-6 lg:p-8 space-y-8 text-right max-w-7xl">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2.5 tracking-tight">
            <ShoppingBag className="h-7 w-7 text-orange-600" />
            <span>الطلبات والمبيعات والتحويلات اليدوية</span>
          </h1>
          <p className="text-xs lg:text-sm text-slate-500 dark:text-slate-400 mt-1">
            متابعة فورية للطلبات، تأكيد استلام تحويلات إنستاباي وفودافون كاش، والتواصل مع العميل عبر واتساب
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadOrders}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#111e38] hover:bg-slate-50 dark:hover:bg-[#16274a] text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors border border-slate-200 dark:border-slate-700/60 cursor-pointer shadow-sm"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-orange-600 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>تحديث الطلبات</span>
          </button>

          <span className="font-extrabold text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-950/80 border border-orange-200 dark:border-orange-800 px-3.5 py-2.5 rounded-xl text-xs">
            {filteredOrders.length} طلبات مسجلة
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-500" />
          <input
            type="text"
            placeholder="ابحث برقم الطلب، اسم العميل، الهاتف، أو المدينة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pr-10 pl-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-orange-500 shadow-sm"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1">
          {[
            { id: "all", label: "جميع الطلبات" },
            { id: "pending", label: "قيد المراجعة" },
            { id: "confirmed", label: "تم التأكيد" },
            { id: "shipped", label: "جاري الشحن" },
            { id: "delivered", label: "تم التوصيل" },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setSelectedStatus(st.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shadow-sm ${
                selectedStatus === st.id
                  ? "bg-orange-600 text-white shadow-orange-600/30 border border-orange-500"
                  : "bg-white text-slate-700 hover:text-slate-900 dark:bg-slate-900 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300">
                <th className="py-3.5 px-4 font-bold rounded-r-xl">رقم الطلب والتاريخ</th>
                <th className="py-3.5 px-4 font-bold">العميل والمشتري</th>
                <th className="py-3.5 px-4 font-bold">العنوان والمحافظة</th>
                <th className="py-3.5 px-4 font-bold">طريقة الدفع</th>
                <th className="py-3.5 px-4 font-bold">الإجمالي</th>
                <th className="py-3.5 px-4 font-bold">حالة الطلب</th>
                <th className="py-3.5 px-4 font-bold text-center rounded-l-xl">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredOrders.map((ord) => {
                const paymentInfo = paymentLabels[ord.paymentMethod] || {
                  label: ord.paymentMethod,
                  badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
                };

                return (
                  <tr key={ord.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-orange-600 dark:text-orange-400 text-sm block">
                        #{ord.orderNumber}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block">
                        {formatDate(ord.createdAt)}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 dark:text-white text-sm block">
                        {ord.customerName}
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <a
                          href={getWhatsAppStatusMessage(ord, ord.status)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800 transition-colors"
                          dir="ltr"
                          title="مراسلة العميل بالواتساب حسب الحالة الحالية"
                        >
                          <MessageCircle className="h-3 w-3 text-emerald-600" />
                          <span>{ord.customerPhone}</span>
                        </a>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                      <span className="font-bold block text-slate-900 dark:text-white">{ord.city}</span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                        {ord.shippingAddress}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2.5 py-1 rounded-lg border text-[11px] font-bold ${paymentInfo.badgeClass}`}>
                        {paymentInfo.label}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-black text-slate-900 dark:text-white text-sm">
                      {formatCurrency(ord.totalAmount)}
                    </td>

                    <td className="py-3.5 px-4">
                      <select
                        value={ord.status}
                        onChange={(e) =>
                          handleUpdateStatus(ord.id, e.target.value as OrderStatus)
                        }
                        className="h-9 w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white px-2.5 focus:outline-none focus:border-orange-500 font-bold cursor-pointer shadow-inner"
                      >
                        <option value="pending">قيد المراجعة</option>
                        <option value="confirmed">تم التأكيد</option>
                        <option value="shipped">جاري الشحن</option>
                        <option value="delivered">تم التوصيل</option>
                        <option value="cancelled">ملغي</option>
                      </select>

                      <a
                        href={getWhatsAppStatusMessage(ord, ord.status)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1.5 flex items-center justify-center gap-1 text-[10px] font-bold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 px-2 py-1 rounded-lg border border-emerald-300 dark:border-emerald-700 transition-all shadow-xs"
                        title="إرسال إشعار فوري بحالة الطلب للعميل عبر واتساب"
                      >
                        <MessageCircle className="h-3 w-3 text-emerald-600" />
                        <span>إرسال إشعار واتساب</span>
                      </a>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleViewOrder(ord)}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-orange-600 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                          title="عرض تفاصيل الطلب والفاتورة"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handlePrintOrder(ord)}
                          className="p-2 rounded-xl bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/60 dark:hover:bg-orange-900/60 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800 transition-colors cursor-pointer"
                          title="طباعة سريعة لفاتورة الشحن PDF"
                        >
                          <Printer className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <Dialog
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title={`تفاصيل فاتورة الطلب #${selectedOrder.orderNumber}`}
          description={`تاريخ تسجيل الطلب: ${formatDate(selectedOrder.createdAt)}`}
          className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white max-w-xl text-right"
        >
          <div className="space-y-4 pt-2 text-right">
            {/* Customer Details Box */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">العميل / المشتري:</span>
                <span className="font-extrabold text-slate-900 dark:text-white text-sm">{selectedOrder.customerName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">رقم الهاتف:</span>
                <a
                  href={`tel:${selectedOrder.customerPhone}`}
                  className="font-bold text-emerald-600 font-mono flex items-center gap-1"
                  dir="ltr"
                >
                  <Phone className="h-3 w-3" />
                  <span>{selectedOrder.customerPhone}</span>
                </a>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">طريقة الدفع:</span>
                <span className="font-bold text-orange-600 dark:text-orange-400">
                  {paymentLabels[selectedOrder.paymentMethod]?.label || selectedOrder.paymentMethod}
                </span>
              </div>
              {selectedOrder.senderPhone && (
                <div className="flex justify-between items-center pt-1 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400">رقم المحفظة / التحويل:</span>
                  <span className="font-mono font-bold text-orange-600 dark:text-orange-400 dir-ltr text-right">
                    {selectedOrder.senderPhone}
                  </span>
                </div>
              )}
              {selectedOrder.paymentProofUrl && (
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400 block mb-1.5 font-bold">إيصال التحويل المرفق:</span>
                  <div className="h-28 w-28 rounded-xl border border-slate-300 dark:border-slate-600 overflow-hidden bg-slate-100 dark:bg-slate-900">
                    <img
                      src={selectedOrder.paymentProofUrl}
                      alt="إيصال الدفع"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">المحافظة:</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedOrder.city}</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-slate-500 dark:text-slate-400">عنوان التوصيل:</span>
                <span className="font-medium text-slate-700 dark:text-slate-200 max-w-[70%] text-left">
                  {selectedOrder.shippingAddress}
                </span>
              </div>
              {selectedOrder.notes && (
                <div className="flex justify-between items-start pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-amber-600 font-bold">ملاحظات:</span>
                  <span className="font-medium text-slate-700 dark:text-slate-200">{selectedOrder.notes}</span>
                </div>
              )}
            </div>

            {/* Ordered Items List */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                المنتجات والأدوات المطلوبة في هذا الطلب:
              </h4>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-3">
                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                  selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block">{item.name}</span>
                        <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                          الكمية: {item.quantity} × {formatCurrency(item.price)}
                        </span>
                      </div>
                      <span className="font-black text-orange-600 dark:text-orange-400">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="py-3 text-center text-xs text-slate-400">
                    طلب مسجل بقيمة إجمالية {formatCurrency(selectedOrder.totalAmount)}
                  </div>
                )}
              </div>
            </div>

            {/* Total and Status */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-orange-50 dark:bg-slate-800 border border-orange-200 dark:border-slate-700">
              <span className="font-bold text-slate-800 dark:text-white text-sm">المبلغ الإجمالي المستحق:</span>
              <span className="text-xl font-black text-orange-600 dark:text-orange-400">
                {formatCurrency(selectedOrder.totalAmount)}
              </span>
            </div>

            {/* Interactive WhatsApp Status Notifier */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                  <MessageCircle className="h-4 w-4 text-emerald-600" />
                  <span>إرسال إشعار فوري بحالة الطلب للعميل عبر واتساب:</span>
                </span>
                <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 font-bold" dir="ltr">
                  {selectedOrder.customerPhone}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-0.5">
                <a
                  href={getWhatsAppStatusMessage(selectedOrder, "confirmed")}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleUpdateStatus(selectedOrder.id, "confirmed")}
                  className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-emerald-100 dark:hover:bg-slate-800 border border-emerald-300 dark:border-emerald-700 text-slate-800 dark:text-slate-200 font-bold text-[11px] shadow-xs transition-colors"
                >
                  <span>✅ إرسال: تم التأكيد</span>
                </a>
                <a
                  href={getWhatsAppStatusMessage(selectedOrder, "shipped")}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleUpdateStatus(selectedOrder.id, "shipped")}
                  className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-emerald-100 dark:hover:bg-slate-800 border border-emerald-300 dark:border-emerald-700 text-slate-800 dark:text-slate-200 font-bold text-[11px] shadow-xs transition-colors"
                >
                  <span>🚚 إرسال: جاري الشحن</span>
                </a>
                <a
                  href={getWhatsAppStatusMessage(selectedOrder, "delivered")}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleUpdateStatus(selectedOrder.id, "delivered")}
                  className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-emerald-100 dark:hover:bg-slate-800 border border-emerald-300 dark:border-emerald-700 text-slate-800 dark:text-slate-200 font-bold text-[11px] shadow-xs transition-colors"
                >
                  <span>📦 إرسال: تم التسليم</span>
                </a>
              </div>
            </div>

            {/* Actions in Modal */}
            <div className="pt-2 flex flex-wrap gap-2">
              <a
                href={getWhatsAppStatusMessage(selectedOrder, selectedOrder.status)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-md shadow-emerald-950/20"
              >
                <MessageCircle className="h-4 w-4" />
                <span>مراسلة العميل بالحالة الحالية</span>
              </a>

              <Button
                variant="outline"
                onClick={() => handlePreviewInvoice(selectedOrder)}
                className="border-orange-500 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/30 gap-1.5 text-xs font-bold"
              >
                <Eye className="h-4 w-4 text-orange-500" />
                <span>معاينة الفاتورة الرسمية</span>
              </Button>

              <Button
                variant="default"
                onClick={() => handlePrintOrder(selectedOrder)}
                className="gap-1.5 text-xs font-bold"
              >
                <Printer className="h-4 w-4" />
                <span>طباعة فاتورة PDF</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => setSelectedOrder(null)}
                className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold"
              >
                إغلاق
              </Button>
            </div>
          </div>
        </Dialog>
      )}

      {/* Full Amazon Invoice Preview Modal for Admin */}
      {previewInvoiceOrder && (
        <Dialog
          isOpen={!!previewInvoiceOrder}
          onClose={() => setPreviewInvoiceOrder(null)}
          title={`معاينة فاتورة الشحن الرسمية - طلب #${previewInvoiceOrder.orderNumber}`}
          description="فاتورة مبيعات ضريبية إلكترونية معتمدة بنمط أمازون للطباعة والتسليم"
          className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white max-w-4xl text-right"
        >
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                جاهزة للحفظ كـ PDF أو الطباعة المباشرة مع الشحنة
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="default"
                  onClick={() => handlePrintOrder(previewInvoiceOrder)}
                  className="gap-1.5 text-xs font-bold"
                >
                  <Printer className="h-4 w-4" />
                  <span>طباعة الآن (PDF)</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPreviewInvoiceOrder(null)}
                  className="text-xs"
                >
                  إغلاق
                </Button>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm bg-white">
              <AmazonInvoiceDocument
                orderId={previewInvoiceOrder.id}
                orderNumber={previewInvoiceOrder.orderNumber}
                customerName={previewInvoiceOrder.customerName}
                customerPhone={previewInvoiceOrder.customerPhone}
                shippingAddress={previewInvoiceOrder.shippingAddress}
                city={previewInvoiceOrder.city}
                notes={previewInvoiceOrder.notes}
                paymentMethod={previewInvoiceOrder.paymentMethod}
                senderPhone={previewInvoiceOrder.senderPhone}
                paymentStatus={previewInvoiceOrder.paymentStatus || "pending"}
                items={(previewInvoiceOrder.items || []).map((i) => ({
                  productName: i.name || (i as any).productName,
                  quantity: i.quantity,
                  unitPrice: i.price,
                  totalPrice: i.price * i.quantity,
                }))}
                totalAmount={previewInvoiceOrder.totalAmount}
                createdAt={previewInvoiceOrder.createdAt}
              />
            </div>
          </div>
        </Dialog>
      )}
      </div>

      {/* Print-Only Amazon-Style Clean Invoice Component */}
      {printOrder && (
        <div className="hidden print:block printable-invoice-container">
          <AmazonInvoiceDocument
            orderId={printOrder.id}
            orderNumber={printOrder.orderNumber}
            customerName={printOrder.customerName}
            customerPhone={printOrder.customerPhone}
            shippingAddress={printOrder.shippingAddress}
            city={printOrder.city}
            notes={printOrder.notes}
            paymentMethod={printOrder.paymentMethod}
            senderPhone={printOrder.senderPhone}
            paymentStatus={printOrder.paymentStatus || "pending"}
            items={(printOrder.items || []).map((i) => ({
              productName: i.name || (i as any).productName,
              quantity: i.quantity,
              unitPrice: i.price,
              totalPrice: i.price * i.quantity,
            }))}
            totalAmount={printOrder.totalAmount}
            createdAt={printOrder.createdAt}
          />
        </div>
      )}
    </>
  );
}
