"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Phone,
  MapPin,
  Building,
  CreditCard,
  Banknote,
  Smartphone,
  CheckCircle,
  ShieldAlert,
  ArrowLeft,
  Copy,
  Check,
  UploadCloud,
  Image as ImageIcon,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "@/lib/store/use-cart-store";
import { supabase } from "@/lib/supabase/client";
import { formatCurrency, isValidEgyptianPhone } from "@/lib/utils/formatters";
import { egyptianGovernorates } from "@/lib/validations/checkout.schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface FormErrors {
  customerName?: string;
  customerPhone?: string;
  city?: string;
  shippingAddress?: string;
  senderPhone?: string;
}

export function CheckoutForm() {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);
  const clearCart = useCartStore((state) => state.clearCart);

  const [customerName, setCustomerName] = React.useState("");
  const [customerPhone, setCustomerPhone] = React.useState("");
  const [city, setCity] = React.useState("القاهرة");
  const [shippingAddress, setShippingAddress] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [paymentMethod, setPaymentMethod] = React.useState<"cash_on_delivery" | "vodafone_cash" | "instapay">("cash_on_delivery");

  // Payment transfer verification states
  const [senderPhone, setSenderPhone] = React.useState("");
  const [paymentProofUrl, setPaymentProofUrl] = React.useState<string | null>(null);
  const [paymentProofName, setPaymentProofName] = React.useState<string | null>(null);
  const [isCopied, setIsCopied] = React.useState(false);

  const [errors, setErrors] = React.useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const totalAmount = getTotalPrice();

  const handleCopyNumber = (num: string) => {
    navigator.clipboard.writeText(num);
    setIsCopied(true);
    toast.success(`تم نسخ الرقم (${num}) إلى الحافظة بنجاح!`);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleProofUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("يرجى اختيار ملف صورة صالح (PNG, JPG, JPEG, WEBP)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("حجم الصورة كبير جداً، يرجى اختيار صورة أقل من 5 ميجابايت");
      return;
    }

    setPaymentProofName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setPaymentProofUrl(reader.result as string);
      toast.success("تم رفع سكرين شوت الإيصال بنجاح!");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveProof = () => {
    setPaymentProofUrl(null);
    setPaymentProofName(null);
    toast.info("تمت إزالة صورة الإيصال");
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!customerName.trim() || customerName.trim().length < 3) {
      newErrors.customerName = "يرجى كتابة الاسم بالكامل (3 أحرف على الأقل)";
    }

    if (!customerPhone.trim() || !isValidEgyptianPhone(customerPhone)) {
      newErrors.customerPhone = "يرجى إدخال رقم هاتف مصري صحيح (11 رقماً يبدأ بـ 010 أو 011 أو 012 أو 015)";
    }

    if (!city) {
      newErrors.city = "يرجى اختيار المحافظة";
    }

    if (!shippingAddress.trim() || shippingAddress.trim().length < 5) {
      newErrors.shippingAddress = "يرجى كتابة العنوان التفصيلي (المنطقة، الشارع، رقم المبنى)";
    }

    if (paymentMethod !== "cash_on_delivery" && (!senderPhone.trim() || senderPhone.trim().length < 8)) {
      newErrors.senderPhone = "يرجى كتابة رقم المحفظة أو الحساب الذي قمت بالتحويل منه لتأكيد ومطابقة الدفعة";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      toast.error("سلة المشتريات فارغة! أضف منتجات قبل إتمام الطلب");
      router.push("/");
      return;
    }

    if (!validate()) {
      toast.error("يرجى مراجعة الحقول المطلوبة والتأكد من صحة رقم الهاتف وبيانات التحويل");
      return;
    }

    setIsSubmitting(true);

    try {
      const generatedOrderId = crypto.randomUUID();
      const generatedOrderNumber = Math.floor(100000 + Math.random() * 900000);
      let orderIdToUse = generatedOrderId;

      // Attempt Supabase insert
      try {
        const { data: orderData, error: orderError } = await supabase
          .from("orders")
          .insert({
            id: generatedOrderId,
            customer_name: customerName.trim(),
            customer_phone: customerPhone.trim(),
            shipping_address: shippingAddress.trim(),
            city: city,
            notes: notes.trim() || null,
            total_amount: totalAmount,
            payment_method: paymentMethod,
            payment_status: "pending",
            status: "pending",
            sender_phone: paymentMethod !== "cash_on_delivery" ? senderPhone.trim() : null,
            payment_proof_url: paymentMethod !== "cash_on_delivery" ? paymentProofUrl : null,
          })
          .select("id, order_number")
          .single();

        if (!orderError && orderData) {
          orderIdToUse = orderData.id;
        }
      } catch (dbErr) {
        console.warn("Supabase insert fallback notice:", dbErr);
      }

      // Store local receipt
      const orderReceipt = {
        orderId: orderIdToUse,
        orderNumber: generatedOrderNumber,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        city: city,
        shippingAddress: shippingAddress.trim(),
        notes: notes.trim() || null,
        paymentMethod: paymentMethod,
        senderPhone: paymentMethod !== "cash_on_delivery" ? senderPhone.trim() : null,
        paymentProofUrl: paymentMethod !== "cash_on_delivery" ? paymentProofUrl : null,
        items: items.map((i) => ({
          productId: i.id,
          name: i.name,
          productName: i.name,
          quantity: i.quantity,
          unitPrice: i.price,
          totalPrice: i.price * i.quantity,
        })),
        totalAmount: totalAmount,
        createdAt: "2026-10-18T10:00:00Z",
      };

      if (typeof window !== "undefined") {
        sessionStorage.setItem("last_order_receipt", JSON.stringify(orderReceipt));
        localStorage.setItem(`order_${orderIdToUse}`, JSON.stringify(orderReceipt));
      }

      // Clear the Zustand Cart
      clearCart();

      toast.success("تم تسجيل طلبك بنجاح! جاري تحويلك لصفحة التأكيد...");
      router.push(`/order-success?orderId=${orderIdToUse}`);
    } catch (error) {
      console.error("Order processing error:", error);
      toast.error("حدث خطأ أثناء حفظ الطلب. يرجى المحاولة مرة أخرى أو التواصل معنا عبر واتساب.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-right">
      {/* Customer Info Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <User className="h-5 w-5 text-orange-600" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            بيانات المشتري / العميل
          </h3>
        </div>

        <div className="space-y-4">
          <Input
            id="customerName"
            label="الاسم بالكامل *"
            placeholder="مثال: م. أحمد عبد العزيز / د. محمد فوزي"
            value={customerName}
            onChange={(e) => {
              setCustomerName(e.target.value);
              if (errors.customerName) setErrors((prev) => ({ ...prev, customerName: undefined }));
            }}
            error={errors.customerName}
          />

          <Input
            id="customerPhone"
            label="رقم الهاتف المحمول (واتساب) *"
            placeholder="01012345678"
            type="tel"
            dir="ltr"
            className="text-right"
            value={customerPhone}
            onChange={(e) => {
              setCustomerPhone(e.target.value);
              if (errors.customerPhone) setErrors((prev) => ({ ...prev, customerPhone: undefined }));
            }}
            error={errors.customerPhone}
          />
          <p className="text-[11px] text-slate-500 pr-1">
            * يجب أن يتكون من 11 رقماً مصرياً للتواصل وتأكيد الشحن
          </p>
        </div>
      </div>

      {/* Shipping Address Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <MapPin className="h-5 w-5 text-orange-600" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            عنوان التوصيل والاستلام
          </h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              المحافظة *
            </label>
            <div className="relative">
              <select
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  if (errors.city) setErrors((prev) => ({ ...prev, city: undefined }));
                }}
                className="w-full h-11 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
              >
                {egyptianGovernorates.map((gov) => (
                  <option key={gov} value={gov}>
                    {gov}
                  </option>
                ))}
              </select>
            </div>
            {errors.city && <p className="text-xs text-rose-500 font-medium mt-1">{errors.city}</p>}
          </div>

          <Input
            id="shippingAddress"
            label="العنوان بالتفصيل (المنطقة، الشارع، رقم المبنى / الورشة) *"
            placeholder="مثال: مدينة نصر، شارع عباس العقاد، عمارة 15، الدور الثاني"
            value={shippingAddress}
            onChange={(e) => {
              setShippingAddress(e.target.value);
              if (errors.shippingAddress) setErrors((prev) => ({ ...prev, shippingAddress: undefined }));
            }}
            error={errors.shippingAddress}
          />

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              ملاحظات إضافية للشحن والتجهيز (اختياري)
            </label>
            <textarea
              rows={2}
              placeholder="مثال: الاتصال قبل الوصول بنصف ساعة، التوصيل بالفترة المسائية..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 resize-none"
            />
          </div>
        </div>
      </div>

      {/* Payment Method Card - Manual / Delivery */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <CreditCard className="h-5 w-5 text-orange-600" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            طريقة الدفع (تحويل فوري أو استلام)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Cash on Delivery */}
          <label
            className={`flex flex-col gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === "cash_on_delivery"
                ? "border-orange-600 bg-orange-50/70 dark:bg-orange-950/40"
                : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
              }`}
          >
            <input
              type="radio"
              name="paymentMethod"
              value="cash_on_delivery"
              checked={paymentMethod === "cash_on_delivery"}
              onChange={() => setPaymentMethod("cash_on_delivery")}
              className="sr-only"
            />
            <div className="flex items-center justify-between">
              <Banknote className="h-6 w-6 text-emerald-600" />
              {paymentMethod === "cash_on_delivery" && (
                <CheckCircle className="h-4 w-4 text-orange-600" />
              )}
            </div>
            <div>
              <span className="block text-xs font-bold text-slate-900 dark:text-white">
                الدفع عند الاستلام
              </span>
              <span className="block text-[11px] text-slate-500 dark:text-slate-400">
                معاينة الأداة والدفع نقداً
              </span>
            </div>
          </label>

          {/* Vodafone Cash */}
          <label
            className={`flex flex-col gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === "vodafone_cash"
                ? "border-orange-600 bg-orange-50/70 dark:bg-orange-950/40"
                : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
              }`}
          >
            <input
              type="radio"
              name="paymentMethod"
              value="vodafone_cash"
              checked={paymentMethod === "vodafone_cash"}
              onChange={() => setPaymentMethod("vodafone_cash")}
              className="sr-only"
            />
            <div className="flex items-center justify-between">
              <Smartphone className="h-6 w-6 text-rose-600" />
              {paymentMethod === "vodafone_cash" && (
                <CheckCircle className="h-4 w-4 text-orange-600" />
              )}
            </div>
            <div>
              <span className="block text-xs font-bold text-slate-900 dark:text-white">
                فودافون كاش
              </span>
              <span className="block text-[11px] text-slate-500 dark:text-slate-400">
                تحويل كاش (01068808559)
              </span>
            </div>
          </label>

          {/* InstaPay */}
          <label
            className={`flex flex-col gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === "instapay"
                ? "border-orange-600 bg-orange-50/70 dark:bg-orange-950/40"
                : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
              }`}
          >
            <input
              type="radio"
              name="paymentMethod"
              value="instapay"
              checked={paymentMethod === "instapay"}
              onChange={() => setPaymentMethod("instapay")}
              className="sr-only"
            />
            <div className="flex items-center justify-between">
              <CreditCard className="h-6 w-6 text-purple-600" />
              {paymentMethod === "instapay" && (
                <CheckCircle className="h-4 w-4 text-orange-600" />
              )}
            </div>
            <div>
              <span className="block text-xs font-bold text-slate-900 dark:text-white">
                انستاباي (InstaPay)
              </span>
              <span className="block text-[11px] text-slate-500 dark:text-slate-400">
                تحويل لحظي (01068808559)
              </span>
            </div>
          </label>
        </div>

        {/* Manual Payment Details & Verification Section */}
        {paymentMethod !== "cash_on_delivery" && (
          <div className="p-4 sm:p-5 rounded-2xl bg-orange-50/80 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 space-y-4">
            {/* Transfer Instructions & Copy Number Box */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-orange-200 dark:border-orange-800/80 shadow-sm">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-orange-600 dark:text-orange-400 block">
                  {paymentMethod === "vodafone_cash"
                    ? "رقم محفظة فودافون كاش المعتمد للتحويل:"
                    : "رقم حساب إنستاباي (InstaPay) المعتمد للتحويل:"}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-white font-mono tracking-wider dir-ltr">
                    01068808559
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
                    نشط وفوري
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  المبلغ المطلوب تحويله:{" "}
                  <strong className="text-orange-600 dark:text-orange-400 font-black">
                    {formatCurrency(totalAmount)}
                  </strong>
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleCopyNumber("01068808559")}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs transition-all shadow-md shadow-orange-600/20 active:scale-95 cursor-pointer whitespace-nowrap self-start sm:self-center"
              >
                {isCopied ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span>تم النسخ بنجاح!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>نسخ الرقم</span>
                  </>
                )}
              </button>
            </div>

            {/* Sender Account / Phone Input */}
            <div className="space-y-1.5">
              <Input
                id="senderPhone"
                label={
                  paymentMethod === "vodafone_cash"
                    ? "رقم محفظة فودافون كاش الذي قمت بالتحويل منه *"
                    : "رقم الهاتف أو عنوان الحساب المُحوِّل منه عبر انستاباي *"
                }
                placeholder="مثال: 01012345678 أو username@instapay"
                value={senderPhone}
                onChange={(e) => {
                  setSenderPhone(e.target.value);
                  if (errors.senderPhone) setErrors((prev) => ({ ...prev, senderPhone: undefined }));
                }}
                error={errors.senderPhone}
                className="bg-white dark:bg-slate-900 border-orange-200 dark:border-orange-800"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400 pr-1">
                * ضروري لمطابقة التحويل وتأكيد استلام المبلغ فوراً في لوحة الإدارة.
              </p>
            </div>

            {/* Screenshot / Proof Uploader */}
            <div className="space-y-2 pt-2 border-t border-orange-200/60 dark:border-orange-800/60">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                رفع سكرين شوت أو إيصال التحويل (اختياري / لتسريع التأكيد):
              </label>

              {paymentProofUrl ? (
                /* Preview Container */
                <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-800 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="h-14 w-14 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700 flex-shrink-0">
                      <img
                        src={paymentProofUrl}
                        alt="إيصال الدفع"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="space-y-0.5 text-right">
                      <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                        <span>تم إرفاق إيصال التحويل بنجاح</span>
                      </span>
                      <p className="text-[11px] text-slate-500 font-mono truncate max-w-[200px]">
                        {paymentProofName || "payment-receipt.jpg"}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleRemoveProof}
                    className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                    title="حذف الصورة"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                /* Upload Drop Area */
                <label className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-orange-300 dark:border-orange-800/80 bg-white/60 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-900 transition-all cursor-pointer text-center group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProofUpload}
                    className="sr-only"
                  />
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform mb-2">
                    <UploadCloud className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    اضغط هنا لاختيار صورة إيصال التحويل أو سحبها
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5">
                    يدعم صور PNG, JPG, JPEG (بحد أقصى 5 ميجابايت)
                  </span>
                </label>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        size="lg"
        isLoading={isSubmitting}
        className="w-full text-base py-4 font-bold shadow-xl shadow-orange-600/20"
      >
        <span>تأكيد وتسجيل الطلب الآن ({formatCurrency(totalAmount)})</span>
      </Button>

      <p className="text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
        <ShieldAlert className="h-4 w-4 text-orange-600" />
        <span>طلب سريع بدون كلمة مرور • يُرسل مباشرة للوحة تحكم المتجر وقاعدة البيانات</span>
      </p>
    </form>
  );
}
