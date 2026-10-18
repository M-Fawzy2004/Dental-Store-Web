"use client";

import * as React from "react";
import {
  CreditCard,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Eye,
  RefreshCw,
  Search,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  Check,
  X,
  Phone,
  FileText,
  Copy,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

export interface PaymentRequestRow {
  id: string;
  orderNumber: number;
  customerName: string;
  customerPhone: string;
  totalAmount: number;
  paymentMethod: "vodafone_cash" | "instapay" | "cash_on_delivery";
  paymentStatus: "pending" | "paid" | "failed";
  orderStatus: string;
  senderPhone?: string | null;
  paymentProofUrl?: string | null;
  createdAt: string;
  city: string;
}

const fallbackPayments: PaymentRequestRow[] = [
  {
    id: "ord-pay-1",
    orderNumber: 104285,
    customerName: "د. هاني منصور (عيادة الشروق للأسنان)",
    customerPhone: "01099234812",
    totalAmount: 3400,
    paymentMethod: "instapay",
    paymentStatus: "pending",
    orderStatus: "pending",
    senderPhone: "01099234812@instapay",
    paymentProofUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80",
    createdAt: "2026-10-18T10:45:00Z",
    city: "القاهرة",
  },
  {
    id: "ord-pay-2",
    orderNumber: 104284,
    customerName: "د. ريم فاروق (مركز النخبة)",
    customerPhone: "01061122334",
    totalAmount: 2850,
    paymentMethod: "vodafone_cash",
    paymentStatus: "pending",
    orderStatus: "pending",
    senderPhone: "01061122334",
    paymentProofUrl: "https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=600&q=80",
    createdAt: "2026-10-18T09:30:00Z",
    city: "الجيزة",
  },
  {
    id: "ord-pay-3",
    orderNumber: 104282,
    customerName: "د. أحمد عبد الرحمن",
    customerPhone: "01233445566",
    totalAmount: 1850,
    paymentMethod: "instapay",
    paymentStatus: "paid",
    orderStatus: "confirmed",
    senderPhone: "01233445566",
    paymentProofUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80",
    createdAt: "2026-10-18T08:15:00Z",
    city: "الإسكندرية",
  },
  {
    id: "ord-pay-4",
    orderNumber: 104278,
    customerName: "د. محمود سراج",
    customerPhone: "01144556677",
    totalAmount: 4950,
    paymentMethod: "vodafone_cash",
    paymentStatus: "paid",
    orderStatus: "shipped",
    senderPhone: "01144556677",
    paymentProofUrl: "https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=600&q=80",
    createdAt: "2026-10-17T18:00:00Z",
    city: "المنصورة",
  },
];

export default function AdminPaymentsPage() {
  const [payments, setPayments] = React.useState<PaymentRequestRow[]>(fallbackPayments);
  const [loading, setLoading] = React.useState(true);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedFilter, setSelectedFilter] = React.useState<string>("pending");
  const [inspectPayment, setInspectPayment] = React.useState<PaymentRequestRow | null>(null);

  const loadPayments = async () => {
    setIsRefreshing(true);
    try {
      let combinedPayments: PaymentRequestRow[] = [];

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .in("payment_method", ["vodafone_cash", "instapay"])
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        combinedPayments = data.map((o) => ({
          id: o.id,
          orderNumber: o.order_number || Math.floor(100000 + Math.random() * 900000),
          customerName: o.customer_name,
          customerPhone: o.customer_phone,
          totalAmount: Number(o.total_amount) || 0,
          paymentMethod: o.payment_method as "vodafone_cash" | "instapay",
          paymentStatus: (o.payment_status as "pending" | "paid" | "failed") || "pending",
          orderStatus: o.status,
          senderPhone: o.sender_phone || o.customer_phone,
          paymentProofUrl: o.payment_proof_url,
          createdAt: o.created_at,
          city: o.city,
        }));
      }

      // Merge local transfer orders
      if (typeof window !== "undefined") {
        const localPayments: PaymentRequestRow[] = [];
        const checkAndAdd = (parsed: any) => {
          if (
            parsed &&
            parsed.orderId &&
            (parsed.paymentMethod === "vodafone_cash" || parsed.paymentMethod === "instapay") &&
            !localPayments.some((lp) => lp.id === parsed.orderId)
          ) {
            localPayments.push({
              id: parsed.orderId,
              orderNumber: Number(parsed.orderNumber) || 120008,
              customerName: parsed.customerName || "عميل المتجر",
              customerPhone: parsed.customerPhone || "",
              totalAmount: Number(parsed.totalAmount) || 0,
              paymentMethod: parsed.paymentMethod,
              paymentStatus: "pending",
              orderStatus: "pending",
              senderPhone: parsed.senderPhone || parsed.customerPhone,
              paymentProofUrl: parsed.paymentProofUrl,
              createdAt: parsed.createdAt || new Date().toISOString(),
              city: parsed.city || "القاهرة",
            });
          }
        };

        const cachedReceipt = sessionStorage.getItem("last_order_receipt");
        if (cachedReceipt) {
          try {
            checkAndAdd(JSON.parse(cachedReceipt));
          } catch (e) {}
        }

        Object.keys(localStorage)
          .filter((k) => k.startsWith("order_"))
          .forEach((key) => {
            try {
              const raw = localStorage.getItem(key);
              if (raw) checkAndAdd(JSON.parse(raw));
            } catch (e) {}
          });

        localPayments.forEach((lp) => {
          if (!combinedPayments.some((cp) => cp.id === lp.id)) {
            combinedPayments.unshift(lp);
          }
        });
      }

      if (combinedPayments.length > 0) {
        setPayments(combinedPayments);
      } else {
        setPayments(fallbackPayments);
      }
    } catch (err) {
      console.warn("Using fallback payments:", err);
      setPayments(fallbackPayments);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  React.useEffect(() => {
    loadPayments();
  }, []);

  const handleConfirmPayment = async (payId: string) => {
    try {
      await supabase
        .from("orders")
        .update({ payment_status: "paid", status: "confirmed" })
        .eq("id", payId);
    } catch (err) {
      console.warn("Supabase update notice:", err);
    }

    setPayments((prev) =>
      prev.map((p) => (p.id === payId ? { ...p, paymentStatus: "paid", orderStatus: "confirmed" } : p))
    );

    if (inspectPayment && inspectPayment.id === payId) {
      setInspectPayment({ ...inspectPayment, paymentStatus: "paid", orderStatus: "confirmed" });
    }

    toast.success("تم تأكيد استلام الدفعة وتحديث حالة الطلب إلى (مؤكد) بنجاح!");
  };

  const handleRejectPayment = async (payId: string) => {
    try {
      await supabase
        .from("orders")
        .update({ payment_status: "failed" })
        .eq("id", payId);
    } catch (err) {
      console.warn("Supabase reject notice:", err);
    }

    setPayments((prev) =>
      prev.map((p) => (p.id === payId ? { ...p, paymentStatus: "failed" } : p))
    );

    if (inspectPayment && inspectPayment.id === payId) {
      setInspectPayment({ ...inspectPayment, paymentStatus: "failed" });
    }

    toast.error("تم رفض الدفعة وتنبيه ضرورة مراجعة التحويل");
  };

  const handleWhatsAppContact = (pay: PaymentRequestRow) => {
    const cleanPhone = pay.customerPhone.replace(/\D/g, "");
    const targetPhone = cleanPhone.startsWith("0") ? `2${cleanPhone}` : cleanPhone;
    const msg = `مرحباً يا دكتور ${pay.customerName}،
بخصوص طلبكم رقم #${pay.orderNumber} من متجر تكنو دنتال بقيمة ${formatCurrency(pay.totalAmount)}،
طريقة الدفع: ${pay.paymentMethod === "vodafone_cash" ? "فودافون كاش" : "انستاباي"}.
رقم التحويل المرفق: ${pay.senderPhone || "غير مسجل"}.
${
  pay.paymentStatus === "paid"
    ? "✅ تم تأكيد استلام التحويل ومطابقته بنجاح، وجاري تجهيز الشحن فوراً."
    : "نود تأكيد إتمام التحويل من طرفكم للبدء في شحن الأدوات إلى عنوانكم."
}
شكراً لتعاملكم معنا.`;

    const url = `https://wa.me/${targetPhone}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  };

  // Filtered list
  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      p.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.orderNumber.toString().includes(searchQuery) ||
      p.customerPhone.includes(searchQuery) ||
      (p.senderPhone && p.senderPhone.includes(searchQuery));

    const matchesFilter =
      selectedFilter === "all" ||
      (selectedFilter === "pending" && p.paymentStatus === "pending") ||
      (selectedFilter === "paid" && p.paymentStatus === "paid") ||
      (selectedFilter === "vodafone" && p.paymentMethod === "vodafone_cash") ||
      (selectedFilter === "instapay" && p.paymentMethod === "instapay");

    return matchesSearch && matchesFilter;
  });

  // Calculate Quick Stats
  const pendingCount = payments.filter((p) => p.paymentStatus === "pending").length;
  const paidCount = payments.filter((p) => p.paymentStatus === "paid").length;
  const totalTransferred = payments
    .filter((p) => p.paymentStatus === "paid")
    .reduce((acc, p) => acc + p.totalAmount, 0);

  return (
    <div className="p-6 lg:p-8 space-y-8 text-right max-w-7xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/80 px-2.5 py-0.5 rounded-full border border-orange-200 dark:border-orange-800">
              قسم الحسابات والتحصيلات
            </span>
            <span className="text-xs text-slate-400">• رقم الحساب المستلم: 01068808559</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2.5 mt-1 tracking-tight">
            <CreditCard className="h-7 w-7 text-orange-600" />
            <span>طلبات ومراجعة دفعات التحويل (فودافون كاش & انستاباي)</span>
          </h1>
          <p className="text-xs lg:text-sm text-slate-500 dark:text-slate-400 mt-1">
            هنا تظهر جميع طلبات العملاء الذين حوّلوا مبالغهم مسبقاً مع سكرين شوت الإيصال ورقم المحفظة لتأكيد الدفعة بضغطة واحدة
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadPayments}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#111e38] hover:bg-slate-50 dark:hover:bg-[#16274a] text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors border border-slate-200 dark:border-slate-700/60 cursor-pointer shadow-sm"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-orange-600 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>تحديث الطلبات</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Pending Card */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              <span>تحويلات قيد المراجعة</span>
            </span>
            <span className="text-3xl font-black text-slate-900 dark:text-white block">
              {pendingCount} طلبات
            </span>
            <span className="text-[11px] text-slate-500">تحتاج مطابقة وتأكيد فوري</span>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 border border-amber-200 dark:border-amber-800">
            <Clock className="h-6 w-6" />
          </div>
        </div>

        {/* Confirmed Card */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>دفعات مستلمة ومؤكدة</span>
            </span>
            <span className="text-3xl font-black text-slate-900 dark:text-white block">
              {paidCount} طلبات
            </span>
            <span className="text-[11px] text-slate-500">تمت مطابقتها وإرسالها للشحن</span>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </div>

        {/* Total Collected Card */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-orange-600 dark:text-orange-400 flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>إجمالي المبالغ المحصلة</span>
            </span>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white block">
              {formatCurrency(totalTransferred)}
            </span>
            <span className="text-[11px] text-slate-500">عبر فودافون كاش وإنستاباي</span>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 dark:bg-orange-950/60 text-orange-600 border border-orange-200 dark:border-orange-800">
            <CreditCard className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-500" />
          <input
            type="text"
            placeholder="ابحث برقم الطلب، اسم العميل، أو رقم المحفظة المُحوِّل منها..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pr-10 pl-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-orange-500 shadow-sm"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1">
          {[
            { id: "pending", label: "قيد المراجعة ⏳" },
            { id: "all", label: "جميع التحويلات" },
            { id: "paid", label: "تم التأكيد ✅" },
            { id: "vodafone", label: "فودافون كاش 📱" },
            { id: "instapay", label: "انستاباي 💳" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shadow-sm ${
                selectedFilter === tab.id
                  ? "bg-orange-600 text-white shadow-orange-600/30 border border-orange-500"
                  : "bg-white text-slate-700 hover:text-slate-900 dark:bg-slate-900 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Payments Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300">
                <th className="py-3.5 px-4 font-bold rounded-r-xl">رقم الطلب والعميل</th>
                <th className="py-3.5 px-4 font-bold">وسيلة الدفع</th>
                <th className="py-3.5 px-4 font-bold">الحساب / المحفظة المُحوِّل منها</th>
                <th className="py-3.5 px-4 font-bold">إيصال التحويل</th>
                <th className="py-3.5 px-4 font-bold">المبلغ المطلوب</th>
                <th className="py-3.5 px-4 font-bold">حالة الدفعة</th>
                <th className="py-3.5 px-4 font-bold text-center rounded-l-xl">الإجراءات الفورية</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredPayments.map((pay) => (
                <tr key={pay.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  {/* Order & Customer */}
                  <td className="py-3.5 px-4">
                    <div className="space-y-1">
                      <span className="font-bold text-slate-900 dark:text-white block">
                        {pay.customerName}
                      </span>
                      <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                        <span className="font-mono font-bold text-orange-600 dark:text-orange-400">
                          #{pay.orderNumber}
                        </span>
                        <span>•</span>
                        <span dir="ltr">{pay.customerPhone}</span>
                        <span>•</span>
                        <span>{pay.city}</span>
                      </div>
                    </div>
                  </td>

                  {/* Payment Method */}
                  <td className="py-3.5 px-4">
                    {pay.paymentMethod === "vodafone_cash" ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800 font-bold">
                        <Smartphone className="h-3.5 w-3.5 text-rose-600" />
                        <span>فودافون كاش</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800 font-bold">
                        <CreditCard className="h-3.5 w-3.5 text-purple-600" />
                        <span>انستاباي</span>
                      </span>
                    )}
                  </td>

                  {/* Sender Account */}
                  <td className="py-3.5 px-4">
                    <div className="space-y-0.5">
                      <span className="font-mono font-bold text-slate-900 dark:text-white text-xs dir-ltr block text-right">
                        {pay.senderPhone || "غير مسجل"}
                      </span>
                      <span className="text-[10px] text-slate-400">رقم تحويل العميل</span>
                    </div>
                  </td>

                  {/* Screenshot Proof */}
                  <td className="py-3.5 px-4">
                    {pay.paymentProofUrl ? (
                      <button
                        onClick={() => setInspectPayment(pay)}
                        className="group relative h-12 w-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center cursor-pointer shadow-sm hover:ring-2 hover:ring-orange-500"
                        title="معاينة إيصال التحويل"
                      >
                        <img
                          src={pay.paymentProofUrl}
                          alt="إيصال"
                          className="h-full w-full object-cover transition-transform group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-slate-950/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Eye className="h-4 w-4 text-white" />
                        </div>
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">بدون إيصال</span>
                    )}
                  </td>

                  {/* Amount */}
                  <td className="py-3.5 px-4">
                    <span className="font-black text-slate-900 dark:text-white text-sm">
                      {formatCurrency(pay.totalAmount)}
                    </span>
                  </td>

                  {/* Payment Status */}
                  <td className="py-3.5 px-4">
                    {pay.paymentStatus === "paid" ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 font-bold border border-emerald-300 dark:border-emerald-800">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>مؤكد ومستلم</span>
                      </span>
                    ) : pay.paymentStatus === "failed" ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-400 font-bold border border-rose-300 dark:border-rose-800">
                        <X className="h-3 w-3" />
                        <span>مرفوض / غير مطابق</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400 font-bold border border-amber-300 dark:border-amber-800 animate-pulse">
                        <Clock className="h-3 w-3" />
                        <span>قيد المراجعة</span>
                      </span>
                    )}
                  </td>

                  {/* Quick Actions */}
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {pay.paymentStatus !== "paid" ? (
                        <button
                          onClick={() => handleConfirmPayment(pay.id)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition-all shadow-sm cursor-pointer"
                          title="تأكيد استلام المبلغ"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>تأكيد الاستلام</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRejectPayment(pay.id)}
                          className="px-2 py-1 rounded-lg text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-[10px] font-bold transition-colors cursor-pointer"
                          title="إلغاء التأكيد أو رفض"
                        >
                          إلغاء التأكيد
                        </button>
                      )}

                      <button
                        onClick={() => handleWhatsAppContact(pay)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 font-bold text-[11px] border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                        title="مراسلة العميل بالواتساب"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">واتساب</span>
                      </button>

                      {pay.paymentProofUrl && (
                        <button
                          onClick={() => setInspectPayment(pay)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-orange-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="معاينة الإيصال مكبراً"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Payment & Receipt Modal */}
      {inspectPayment && (
        <Dialog isOpen={!!inspectPayment} onClose={() => setInspectPayment(null)}>
          <div className="p-6 text-right space-y-5 max-w-lg mx-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-orange-600" />
                <span>إيصال تحويل الطلب #{inspectPayment.orderNumber}</span>
              </h3>
              <button
                onClick={() => setInspectPayment(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Receipt Image Display */}
            {inspectPayment.paymentProofUrl ? (
              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-950/5 p-2 flex items-center justify-center max-h-[380px]">
                <img
                  src={inspectPayment.paymentProofUrl}
                  alt="إيصال الدفع"
                  className="max-h-[360px] w-auto object-contain rounded-xl shadow-md"
                />
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                لا توجد صورة إيصال مرفقة مع هذا الطلب
              </div>
            )}

            {/* Details Summary */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <div>
                <span className="text-slate-500 block">العميل:</span>
                <span className="font-bold text-slate-900 dark:text-white">{inspectPayment.customerName}</span>
              </div>
              <div>
                <span className="text-slate-500 block">المبلغ الإجمالي:</span>
                <span className="font-black text-orange-600 dark:text-orange-400 text-sm">
                  {formatCurrency(inspectPayment.totalAmount)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">طريقة الدفع:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {inspectPayment.paymentMethod === "vodafone_cash" ? "فودافون كاش" : "انستاباي"}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">رقم التحويل المُحوِّل منه:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white dir-ltr block text-right">
                  {inspectPayment.senderPhone || "غير مسجل"}
                </span>
              </div>
            </div>

            {/* Action Buttons inside Modal */}
            <div className="flex items-center gap-3 pt-2">
              {inspectPayment.paymentStatus !== "paid" ? (
                <Button
                  onClick={() => handleConfirmPayment(inspectPayment.id)}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                >
                  <Check className="h-4 w-4 ml-1.5" />
                  <span>تأكيد استلام المبلغ ومطابقته</span>
                </Button>
              ) : (
                <div className="flex-1 text-center py-2 px-3 rounded-xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-xs border border-emerald-300">
                  ✅ تم تأكيد استلام هذا التحويل مسبقاً
                </div>
              )}

              <button
                onClick={() => handleWhatsAppContact(inspectPayment)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-100 font-bold text-xs border border-emerald-200 dark:border-emerald-800 transition-colors cursor-pointer"
              >
                <MessageCircle className="h-4 w-4" />
                <span>واتساب</span>
              </button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
