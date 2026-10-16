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
  Sparkles,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";
import { generateWhatsAppUrl, WhatsAppOrderPayload } from "@/lib/utils/whatsapp";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";

interface OrderReceiptState {
  orderId: string;
  orderNumber?: number;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  city: string;
  notes?: string | null;
  paymentMethod: string;
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

  React.useEffect(() => {
    async function loadOrder() {
      // 1. Try session storage first
      if (typeof window !== "undefined") {
        const cached = sessionStorage.getItem("last_order_receipt");
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (!orderId || parsed.orderId === orderId) {
              setReceipt(parsed);
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
              setReceipt(JSON.parse(localOrder));
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
              paymentMethod: orderData.payment_method,
              items: (itemsData || []).map((i) => ({
                productName: i.product_name,
                quantity: i.quantity,
                unitPrice: i.unit_price,
                totalPrice: i.total_price,
              })),
              totalAmount: orderData.total_amount,
              createdAt: orderData.created_at,
            });
          }
        } catch (err) {
          console.warn("Could not fetch order from Supabase:", err);
        }
      }

      setLoading(false);
    }

    loadOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-600 border-t-transparent" />
        <p className="text-xs text-slate-500">جاري تحميل تفاصيل الطلب...</p>
      </div>
    );
  }

  // If receipt could not be found, show a graceful generic confirmation
  const orderNumberDisplay = receipt?.orderNumber
    ? `#${receipt.orderNumber}`
    : orderId
    ? `#${orderId.slice(0, 8)}`
    : "#1001";

  const payload: WhatsAppOrderPayload = {
    orderId: receipt?.orderId || orderId || "order-id",
    orderNumber: receipt?.orderNumber,
    customerName: receipt?.customerName || "طبيب الأسنان",
    customerPhone: receipt?.customerPhone || "01000000000",
    shippingAddress: receipt?.shippingAddress || "عيادة الأسنان",
    city: receipt?.city || "القاهرة",
    notes: receipt?.notes,
    paymentMethod: receipt?.paymentMethod || "cash_on_delivery",
    items: receipt?.items || [],
    totalAmount: receipt?.totalAmount || 0,
  };

  const whatsappUrl = generateWhatsAppUrl(payload);

  const paymentLabels: Record<string, string> = {
    cash_on_delivery: "الدفع عند الاستلام",
    vodafone_cash: "فودافون كاش",
    instapay: "انستاباي (InstaPay)",
  };

  return (
    <div className="mx-auto max-w-3xl py-12 px-4 sm:px-6 text-right">
      {/* Success Badge Banner */}
      <div className="rounded-3xl border border-emerald-200/80 bg-gradient-to-b from-emerald-50/80 via-white to-white p-8 shadow-sm dark:border-emerald-900/50 dark:from-emerald-950/20 dark:via-slate-900 dark:to-slate-900 text-center space-y-4">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 animate-in zoom-in duration-300">
          <CheckCircle2 className="h-12 w-12" />
        </div>

        <div className="space-y-1">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-3 py-1 rounded-full">
            <Sparkles className="h-3.5 w-3.5" />
            تم استلام الطلب وتجهيزه بنجاح
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white pt-2">
            شكراً لطلبك من متجر دينتال كير!
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
            رقم الطلب الخاص بك هو{" "}
            <span className="font-extrabold text-cyan-700 dark:text-cyan-400">
              {orderNumberDisplay}
            </span>
            . سيتم تجهيز الشحنة والتواصل معكم لتأكيد موعد التوصيل للعيادة.
          </p>
        </div>

        {/* WhatsApp Prominent Action Button */}
        <div className="pt-4 max-w-md mx-auto space-y-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold py-4 px-6 text-base shadow-xl shadow-emerald-900/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <MessageCircle className="h-6 w-6" />
            <span>تأكيد الطلب فوراً عبر واتساب</span>
          </a>
          <p className="text-[11px] text-slate-400">
            اضغط لتأكيد الطلب وإرسال تفاصيل الفاتورة مباشرة لمسؤول التجهيز والشحن
          </p>
        </div>
      </div>

      {/* Order Details Card */}
      {receipt && (
        <div className="mt-8 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                تفاصيل الفاتورة والطلب {orderNumberDisplay}
              </h2>
              {receipt.createdAt && (
                <p className="text-xs text-slate-400 mt-0.5">
                  تاريخ الطلب: {formatDate(receipt.createdAt)}
                </p>
              )}
            </div>
            <button
              onClick={() => window.print()}
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg"
            >
              <Printer className="h-4 w-4" />
              <span>طباعة الإيصال</span>
            </button>
          </div>

          {/* Customer & Address Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-2 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-slate-500 font-medium">
                <User className="h-4 w-4 text-cyan-600" />
                <span>اسم العميل / الطبيب:</span>
              </div>
              <p className="font-bold text-slate-800 dark:text-slate-100 pr-6">
                {receipt.customerName}
              </p>

              <div className="flex items-center gap-2 text-slate-500 font-medium pt-1">
                <Phone className="h-4 w-4 text-cyan-600" />
                <span>رقم الهاتف (واتساب):</span>
              </div>
              <p className="font-bold text-slate-800 dark:text-slate-100 pr-6" dir="ltr">
                {receipt.customerPhone}
              </p>
            </div>

            <div className="space-y-2 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-slate-500 font-medium">
                <MapPin className="h-4 w-4 text-cyan-600" />
                <span>عنوان التوصيل:</span>
              </div>
              <p className="font-bold text-slate-800 dark:text-slate-100 pr-6">
                {receipt.city} - {receipt.shippingAddress}
              </p>

              <div className="flex items-center gap-2 text-slate-500 font-medium pt-1">
                <CreditCard className="h-4 w-4 text-cyan-600" />
                <span>طريقة الدفع:</span>
              </div>
              <p className="font-bold text-slate-800 dark:text-slate-100 pr-6">
                {paymentLabels[receipt.paymentMethod] || receipt.paymentMethod}
              </p>
            </div>
          </div>

          {/* Items Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300">
              المنتجات المطلوبة:
            </h3>
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {receipt.items.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 flex items-center justify-between bg-white dark:bg-slate-900"
                >
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {item.productName}
                    </span>
                    <p className="text-[11px] text-slate-400">
                      {item.quantity} × {formatCurrency(item.unitPrice)}
                    </p>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {formatCurrency(item.totalPrice)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Total Breakdown */}
          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-4 space-y-2 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>المجموع الفرعي:</span>
              <span>{formatCurrency(receipt.totalAmount)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>مصاريف الشحن:</span>
              <span className="text-emerald-600 font-semibold">يحدد حسب المحافظة</span>
            </div>
            <div className="flex justify-between text-base font-black text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700">
              <span>الإجمالي النهائي:</span>
              <span className="text-cyan-700 dark:text-cyan-400">
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
            <span>العودة لمتجر المنتجات</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <Suspense
        fallback={
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-600 border-t-transparent" />
          </div>
        }
      >
        <OrderSuccessContent />
      </Suspense>
    </main>
  );
}
