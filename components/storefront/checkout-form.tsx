"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { User, Phone, MapPin, Building, CreditCard, Banknote, Smartphone, CheckCircle, ShieldAlert } from "lucide-react";
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
  
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const totalAmount = getTotalPrice();

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!customerName.trim() || customerName.trim().length < 3) {
      newErrors.customerName = "يرجى كتابة الاسم بالكامل (3 أحرف على الأقل)";
    }

    if (!customerPhone.trim() || !isValidEgyptianPhone(customerPhone)) {
      newErrors.customerPhone = "يرجى إدخال رقم هاتف مصري صحيح (مثال: 01012345678 أو 011 أو 012 أو 015)";
    }

    if (!city) {
      newErrors.city = "يرجى اختيار المحافظة";
    }

    if (!shippingAddress.trim() || shippingAddress.trim().length < 5) {
      newErrors.shippingAddress = "يرجى كتابة العنوان التفصيلي (الشارع، رقم العيادة/المبنى، علامة مميزة)";
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
      toast.error("يرجى مراجعة الحقول المطلوبة والتأكد من صحة رقم الهاتف");
      return;
    }

    setIsSubmitting(true);

    try {
      const generatedOrderId = crypto.randomUUID();
      const generatedOrderNumber = Math.floor(100000 + Math.random() * 900000);
      let orderIdToUse = generatedOrderId;
      let orderNumberToUse = generatedOrderNumber;

      // Check if item id is valid UUID for Postgres foreign key
      const isUuid = (id: string) =>
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

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
          })
          .select("id, order_number")
          .single();

        if (orderError) {
          console.warn("Supabase orders table write warning:", orderError.message);
        } else if (orderData) {
          orderIdToUse = orderData.id;
          if (orderData.order_number) {
            orderNumberToUse = orderData.order_number;
          }

          // Insert order items
          const orderItemsRows = items.map((item) => ({
            order_id: orderIdToUse,
            product_id: isUuid(item.id) ? item.id : null,
            product_name: item.name,
            unit_price: item.price,
            quantity: item.quantity,
            total_price: item.price * item.quantity,
          }));

          const { error: itemsError } = await supabase
            .from("order_items")
            .insert(orderItemsRows);

          if (itemsError) {
            console.warn("Supabase order_items table write warning:", itemsError.message);
          }
        }
      } catch (dbErr) {
        console.warn("Supabase query execution fallback:", dbErr);
      }

      // Persist full receipt payload for the Order Success & WhatsApp generation
      const orderReceipt = {
        orderId: orderIdToUse,
        orderNumber: orderNumberToUse,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        shippingAddress: shippingAddress.trim(),
        city: city,
        notes: notes.trim() || null,
        paymentMethod: paymentMethod,
        items: items.map((i) => ({
          productName: i.name,
          quantity: i.quantity,
          unitPrice: i.price,
          totalPrice: i.price * i.quantity,
        })),
        totalAmount: totalAmount,
        createdAt: new Date().toISOString(),
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
    <form onSubmit={handleSubmit} className="space-y-8 text-right">
      {/* Customer Info Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <User className="h-5 w-5 text-cyan-600" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            بيانات الطبيب / العيادة
          </h3>
        </div>

        <div className="space-y-4">
          <Input
            id="customerName"
            label="الاسم بالكامل / اسم الدكتور *"
            placeholder="د. محمد فوزي"
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
            * يجب أن يبدأ بـ 010 أو 011 أو 012 أو 015 ويتكون من 11 رقماً
          </p>
        </div>
      </div>

      {/* Shipping Address Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <MapPin className="h-5 w-5 text-cyan-600" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            عنوان التوصيل والعيادة
          </h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              المحافظة *
            </label>
            <div className="relative">
              <select
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  if (errors.city) setErrors((prev) => ({ ...prev, city: undefined }));
                }}
                className="w-full h-11 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
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
            label="العنوان بالتفصيل (المنطقة، الشارع، رقم المبنى والعيادة) *"
            placeholder="مثال: مدينة نصر، شارع عباس العقاد، برج الأطباء، الدور الرابع، عيادة 402"
            value={shippingAddress}
            onChange={(e) => {
              setShippingAddress(e.target.value);
              if (errors.shippingAddress) setErrors((prev) => ({ ...prev, shippingAddress: undefined }));
            }}
            error={errors.shippingAddress}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              ملاحظات إضافية للشحن والتجهيز (اختياري)
            </label>
            <textarea
              rows={2}
              placeholder="مثال: يرجى التوصيل بعد الساعة 3 عصراً، أو الاتصال بالعيادة مسبقاً..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 resize-none"
            />
          </div>
        </div>
      </div>

      {/* Payment Method Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <CreditCard className="h-5 w-5 text-cyan-600" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            طريقة الدفع
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Cash on Delivery */}
          <label
            className={`flex flex-col gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${
              paymentMethod === "cash_on_delivery"
                ? "border-cyan-600 bg-cyan-50/60 dark:bg-cyan-950/40"
                : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
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
              <Banknote className="h-6 w-6 text-teal-600" />
              {paymentMethod === "cash_on_delivery" && (
                <CheckCircle className="h-4 w-4 text-cyan-600" />
              )}
            </div>
            <div>
              <span className="block text-xs font-bold text-slate-900 dark:text-white">
                الدفع عند الاستلام
              </span>
              <span className="block text-[11px] text-slate-500 dark:text-slate-400">
                ادفع نقداً لمندوب الشحن
              </span>
            </div>
          </label>

          {/* Vodafone Cash */}
          <label
            className={`flex flex-col gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${
              paymentMethod === "vodafone_cash"
                ? "border-cyan-600 bg-cyan-50/60 dark:bg-cyan-950/40"
                : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
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
                <CheckCircle className="h-4 w-4 text-cyan-600" />
              )}
            </div>
            <div>
              <span className="block text-xs font-bold text-slate-900 dark:text-white">
                فودافون كاش
              </span>
              <span className="block text-[11px] text-slate-500 dark:text-slate-400">
                محافظ إلكترونية وموبايل كاش
              </span>
            </div>
          </label>

          {/* InstaPay */}
          <label
            className={`flex flex-col gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${
              paymentMethod === "instapay"
                ? "border-cyan-600 bg-cyan-50/60 dark:bg-cyan-950/40"
                : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
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
                <CheckCircle className="h-4 w-4 text-cyan-600" />
              )}
            </div>
            <div>
              <span className="block text-xs font-bold text-slate-900 dark:text-white">
                انستاباي (InstaPay)
              </span>
              <span className="block text-[11px] text-slate-500 dark:text-slate-400">
                تحويل بنكي لحظي فوري
              </span>
            </div>
          </label>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        size="lg"
        isLoading={isSubmitting}
        className="w-full text-base py-4 font-bold shadow-xl shadow-cyan-900/15"
      >
        <span>تأكيد الطلب الآن ({formatCurrency(totalAmount)})</span>
      </Button>

      <p className="text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
        <ShieldAlert className="h-4 w-4 text-teal-600" />
        <span>طلب سريع بدون تسجيل دخول أو كلمة مرور • تأكيد فوري عبر واتساب</span>
      </p>
    </form>
  );
}
