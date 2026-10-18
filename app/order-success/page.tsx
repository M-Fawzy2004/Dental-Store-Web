"use client";

import * as React from "react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  MessageCircle,
  ShoppingBag,
  MapPin,
  Phone,
  User,
  CreditCard,
  Printer,
  Wrench,
  ShieldCheck,
  FileDown,
  Eye,
  FileText,
  Truck,
  Clock,
  PackageCheck,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";
import { generateWhatsAppUrl, WhatsAppOrderPayload } from "@/lib/utils/whatsapp";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase/client";
import { AmazonInvoiceDocument } from "@/components/storefront/amazon-invoice-document";

interface OrderReceiptState {
  orderId: string;
  orderNumber?: number;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  city: string;
  notes?: string | null;
  paymentMethod: string;
  status?: string;
  senderPhone?: string | null;
  paymentProofUrl?: string | null;
  items: Array<{
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  totalAmount: number;
  createdAt?: string;
}

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [receipt, setReceipt] = React.useState<OrderReceiptState | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [showInvoiceModal, setShowInvoiceModal] = React.useState(false);

  React.useEffect(() => {
    async function loadOrder() {
      // 1. Try session storage first
      if (typeof window !== "undefined") {
        const cached = sessionStorage.getItem("last_order_receipt");
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (!orderId || parsed.orderId === orderId) {
              const normalizedItems = (parsed.items || []).map((i: any) => ({
                productName: i.productName || i.name || "صنف ومعدة طبية معتمدة",
                quantity: Number(i.quantity) || 1,
                unitPrice: Number(i.unitPrice) || 0,
                totalPrice: Number(i.totalPrice) || (Number(i.unitPrice) * Number(i.quantity)),
              }));
              setReceipt({
                ...parsed,
                items: normalizedItems,
              });
              setLoading(false);
              return;
            }
          } catch (e) {
            console.error("Failed to parse cached receipt:", e);
          }
        }

        // 2. Try localStorage by orderId
        if (orderId) {
          const localOrder = localStorage.getItem(`order_${orderId}`);
          if (localOrder) {
            try {
              const parsed = JSON.parse(localOrder);
              const normalizedItems = (parsed.items || []).map((i: any) => ({
                productName: i.productName || i.name || "صنف ومعدة طبية معتمدة",
                quantity: Number(i.quantity) || 1,
                unitPrice: Number(i.unitPrice) || 0,
                totalPrice: Number(i.totalPrice) || (Number(i.unitPrice) * Number(i.quantity)),
              }));
              setReceipt({
                ...parsed,
                items: normalizedItems,
              });
              setLoading(false);
              return;
            } catch (e) {
              console.error("Failed to parse local order:", e);
            }
          }
        }
      }

      // 3. Fallback: Query Supabase
      if (orderId) {
        try {
          const { data: orderData } = await supabase
            .from("orders")
            .select("*")
            .eq("id", orderId)
            .single();

          if (orderData) {
            const { data: itemsData } = await supabase
              .from("order_items")
              .select("*")
              .eq("order_id", orderId);

            setReceipt({
              orderId: orderData.id,
              orderNumber: orderData.order_number,
              customerName: orderData.customer_name,
              customerPhone: orderData.customer_phone,
              shippingAddress: orderData.shipping_address,
              city: orderData.city,
              notes: orderData.notes,
              status: orderData.status || "pending",
              paymentMethod: orderData.payment_method,
              totalAmount: Number(orderData.total_amount),
              createdAt: orderData.created_at,
              items: (itemsData || []).map((i) => ({
                productName: i.product_name,
                quantity: i.quantity,
                unitPrice: Number(i.unit_price),
                totalPrice: Number(i.total_price),
              })),
            });
          }
        } catch (dbErr) {
          console.error("Failed to fetch order from Supabase:", dbErr);
        }
      }

      setLoading(false);
    }

    loadOrder();
  }, [orderId]);

  const paymentLabels: Record<string, string> = {
    cash_on_delivery: "الدفع عند الاستلام (نقداً)",
    vodafone_cash: "فودافون كاش ومحافظ إلكترونية",
    instapay: "انستاباي (InstaPay)",
  };

  const orderNumberDisplay = receipt?.orderNumber
    ? `#${receipt.orderNumber}`
    : orderId
      ? `#${orderId.slice(0, 8)}`
      : "#1000";

  const whatsappPayload: WhatsAppOrderPayload = {
    orderId: receipt?.orderId || orderId || "order-unknown",
    orderNumber: receipt?.orderNumber,
    customerName: receipt?.customerName || "عميل المتجر",
    customerPhone: receipt?.customerPhone || "",
    shippingAddress: receipt?.shippingAddress || "",
    city: receipt?.city || "",
    paymentMethod: paymentLabels[receipt?.paymentMethod || ""] || receipt?.paymentMethod || "الدفع عند الاستلام",
    notes: receipt?.notes,
    items: (receipt?.items || []).map((item) => ({
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
    })),
    totalAmount: receipt?.totalAmount || 0,
  };

  const whatsappUrl = generateWhatsAppUrl(whatsappPayload, "201068808559");

  return (
    <>
      {/* 1. On-Screen Web View (Hidden completely on print) */}
      <div className="no-print hide-on-print print:hidden mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 text-right">
        {/* Top Success Banner */}
        <div className="rounded-3xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 p-8 text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/30">
            <CheckCircle2 className="h-9 w-9" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              تم استلام وتسجيل طلبك بنجاح!
            </h1>
            <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
              رقم الطلب الخاص بك: <span className="font-mono text-base font-black">{orderNumberDisplay}</span>
            </p>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
            تم حفظ طلبك وإرسال بياناته للوحة إدارة المتجر. سيقوم مسؤول التجهيز بالتواصل معك هاتفياً أو عبر واتساب لتأكيد الشحن والتوصيل.
          </p>

          {/* Instant WhatsApp Action */}
          <div className="pt-2 max-w-sm mx-auto space-y-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-all active:scale-95"
            >
              <MessageCircle className="h-5 w-5" />
              <span>تأكيد الطلب فوراً عبر واتساب (01068808559)</span>
            </a>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              اضغط لإرسال بيانات الفاتورة المباشرة لمسؤول التجهيز والشحن
            </p>
          </div>
        </div>

        {/* Live Order Status Tracking Progress Card */}
        {receipt && (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-orange-600" />
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  متابعة خط سير وحالة الطلب والشحن (Live Tracking)
                </h3>
              </div>
              <span className="text-[11px] font-bold text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-950/70 px-3 py-1 rounded-full border border-orange-200 dark:border-orange-800">
                {receipt.status === "confirmed"
                  ? "✅ تم تأكيد الطلب والتجهيز"
                  : receipt.status === "shipped"
                    ? "🚚 جاري الشحن مع المندوب"
                    : receipt.status === "delivered"
                      ? "🌟 تم التوصيل والاستلام"
                      : "⏳ قيد المراجعة والتدقيق"}
              </span>
            </div>

            {/* 4-Step Progress Indicator */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-center">
              {/* Step 1: Pending */}
              <div className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${["pending", "confirmed", "shipped", "delivered"].includes(receipt.status || "pending")
                  ? "border-emerald-300 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200"
                  : "border-slate-200 bg-slate-50 text-slate-400"
                }`}>
                <div className="h-7 w-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-black">
                  ✓
                </div>
                <span className="text-xs font-bold">1. تسجيل الطلب</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">تم الحفظ بنجاح</span>
              </div>

              {/* Step 2: Confirmed */}
              <div className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${["confirmed", "shipped", "delivered"].includes(receipt.status || "")
                  ? "border-emerald-300 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200 shadow-sm"
                  : "border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-slate-400"
                }`}>
                <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-black ${["confirmed", "shipped", "delivered"].includes(receipt.status || "")
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-200 dark:bg-slate-700 text-slate-500"
                  }`}>
                  2
                </div>
                <span className="text-xs font-bold">2. تأكيد وتجهيز</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">تعقيم وفحص المخزن</span>
              </div>

              {/* Step 3: Shipped */}
              <div className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${["shipped", "delivered"].includes(receipt.status || "")
                  ? "border-orange-300 bg-orange-50/70 dark:bg-orange-950/30 text-orange-900 dark:text-orange-200 shadow-sm"
                  : "border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-slate-400"
                }`}>
                <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-black ${["shipped", "delivered"].includes(receipt.status || "")
                    ? "bg-orange-600 text-white"
                    : "bg-slate-200 dark:bg-slate-700 text-slate-500"
                  }`}>
                  3
                </div>
                <span className="text-xs font-bold">3. جاري الشحن</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">خرج مع المندوب</span>
              </div>

              {/* Step 4: Delivered */}
              <div className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${receipt.status === "delivered"
                  ? "border-emerald-300 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200 shadow-sm"
                  : "border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-slate-400"
                }`}>
                <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-black ${receipt.status === "delivered"
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-200 dark:bg-slate-700 text-slate-500"
                  }`}>
                  4
                </div>
                <span className="text-xs font-bold">4. استلام ومعاينة</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">فحص وسداد المبلغ</span>
              </div>
            </div>
          </div>
        )}

        {/* Order Details Card */}
        {receipt && (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  تفاصيل الفاتورة والطلب {orderNumberDisplay}
                </h2>
                {receipt.createdAt && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    تاريخ الطلب: {formatDate(receipt.createdAt)}
                  </p>
                )}
              </div>

              {/* Print & Amazon Invoice Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowInvoiceModal(true)}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl cursor-pointer shadow-sm hover:border-orange-500 transition-all"
                  title="معاينة الفاتورة الضريبية الرسمية"
                >
                  <Eye className="h-4 w-4 text-orange-500" />
                  <span className="hidden sm:inline">معاينة الفاتورة الرسمية</span>
                  <span className="sm:hidden">معاينة</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-orange-600 dark:hover:bg-orange-500 px-3.5 py-1.5 rounded-xl cursor-pointer shadow-md shadow-slate-950/20 active:scale-95 transition-all"
                  title="طباعة أو تحميل كملف PDF"
                >
                  <FileDown className="h-4 w-4 text-orange-400 dark:text-white" />
                  <span>تحميل / طباعة PDF</span>
                </button>
              </div>
            </div>

            {/* Customer & Address Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-2 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 text-slate-500 font-medium">
                  <User className="h-4 w-4 text-orange-600" />
                  <span>اسم المشتري / العميل:</span>
                </div>
                <p className="font-bold text-slate-900 dark:text-slate-100 pr-6">
                  {receipt.customerName}
                </p>

                <div className="flex items-center gap-2 text-slate-500 font-medium pt-1">
                  <Phone className="h-4 w-4 text-orange-600" />
                  <span>رقم الهاتف (واتساب):</span>
                </div>
                <p className="font-bold text-slate-900 dark:text-slate-100 pr-6" dir="ltr">
                  {receipt.customerPhone}
                </p>
              </div>

              <div className="space-y-2 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 text-slate-500 font-medium">
                  <MapPin className="h-4 w-4 text-orange-600" />
                  <span>عنوان التوصيل:</span>
                </div>
                <p className="font-bold text-slate-900 dark:text-slate-100 pr-6">
                  {receipt.city} - {receipt.shippingAddress}
                </p>

                <div className="flex items-center gap-2 text-slate-500 font-medium pt-1">
                  <CreditCard className="h-4 w-4 text-orange-600" />
                  <span>طريقة الدفع:</span>
                </div>
                <p className="font-bold text-slate-900 dark:text-slate-100 pr-6">
                  {paymentLabels[receipt.paymentMethod] || receipt.paymentMethod}
                </p>

                {receipt.senderPhone && (
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                    <span className="text-[11px] text-slate-500 block">رقم المحفظة / الحساب المُحوِّل منه:</span>
                    <span className="font-mono font-bold text-orange-600 dark:text-orange-400 text-xs dir-ltr block text-right">
                      {receipt.senderPhone}
                    </span>
                  </div>
                )}

                {receipt.paymentProofUrl && (
                  <div className="pt-2">
                    <span className="text-[11px] text-slate-500 block mb-1">إيصال التحويل المرفق:</span>
                    <div className="h-16 w-16 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                      <img
                        src={receipt.paymentProofUrl}
                        alt="إيصال التحويل"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Items Table */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                الأدوات والمعدات المطلوبة:
              </h3>
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {receipt.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 flex items-center justify-between bg-white dark:bg-slate-900"
                  >
                    <div className="space-y-0.5">
                      <span className="font-bold text-slate-900 dark:text-slate-200">
                        {item.productName}
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {item.quantity} × {formatCurrency(item.unitPrice)}
                      </p>
                    </div>
                    <span className="font-black text-slate-900 dark:text-white">
                      {formatCurrency(item.totalPrice)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Breakdown */}
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-4 space-y-2 text-xs">
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>المجموع الفرعي:</span>
                <span>{formatCurrency(receipt.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>مصاريف الشحن:</span>
                <span className="text-emerald-600 font-semibold">يحدد حسب المحافظة</span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700">
                <span>الإجمالي النهائي:</span>
                <span className="text-orange-600 dark:text-orange-400">
                  {formatCurrency(receipt.totalAmount)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Return to Store Action */}
        <div className="mt-8 text-center">
          <Link href="/">
            <Button variant="outline" size="md" className="gap-2">
              <ShoppingBag className="h-4 w-4" />
              <span>العودة لكتالوج الأدوات</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Amazon Invoice Preview Modal (On-Screen Interactive Preview) */}
      {showInvoiceModal && receipt && (
        <Dialog
          isOpen={showInvoiceModal}
          onClose={() => setShowInvoiceModal(false)}
          title="معاينة الفاتورة الضريبية الرسمية (نمط أمازون PDF)"
          className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white max-w-4xl p-0 overflow-hidden"
        >
          <div className="p-4 sm:p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-orange-600" />
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  فاتورة شراء رسمية معتمدة وفق متطلبات الشركات والمراكز الطبية
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-md shadow-orange-600/20 transition-all active:scale-95 cursor-pointer"
                >
                  <Printer className="h-4 w-4" />
                  <span>طباعة / حفظ كملف PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowInvoiceModal(false)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  إغلاق
                </button>
              </div>
            </div>

            {/* Render Amazon Invoice Template inside Modal */}
            <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm bg-white">
              <AmazonInvoiceDocument
                orderId={receipt.orderId}
                orderNumber={receipt.orderNumber}
                customerName={receipt.customerName}
                customerPhone={receipt.customerPhone}
                shippingAddress={receipt.shippingAddress}
                city={receipt.city}
                notes={receipt.notes}
                paymentMethod={receipt.paymentMethod}
                senderPhone={receipt.senderPhone}
                paymentStatus="paid"
                items={receipt.items}
                totalAmount={receipt.totalAmount}
                createdAt={receipt.createdAt}
              />
            </div>
          </div>
        </Dialog>
      )}

      {/* 3. 100% Print-Only Amazon-Style Clean Invoice Component */}
      {receipt && (
        <div className="hidden print:block printable-invoice-container">
          <AmazonInvoiceDocument
            orderId={receipt.orderId}
            orderNumber={receipt.orderNumber}
            customerName={receipt.customerName}
            customerPhone={receipt.customerPhone}
            shippingAddress={receipt.shippingAddress}
            city={receipt.city}
            notes={receipt.notes}
            paymentMethod={receipt.paymentMethod}
            senderPhone={receipt.senderPhone}
            paymentStatus="paid"
            items={receipt.items}
            totalAmount={receipt.totalAmount}
            createdAt={receipt.createdAt}
          />
        </div>
      )}
    </>
  );
}

export default function OrderSuccessPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#090d16] pb-20 transition-colors duration-200">
      <Suspense
        fallback={
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-600 border-t-transparent" />
          </div>
        }
      >
        <OrderSuccessContent />
      </Suspense>
    </main>
  );
}
