import { formatCurrency } from "./formatters";

export interface WhatsAppOrderPayload {
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
}

const paymentMethodLabels: Record<string, string> = {
  cash_on_delivery: "الدفع عند الاستلام (COD)",
  vodafone_cash: "فودافون كاش (Vodafone Cash)",
  instapay: "انستاباي (InstaPay)",
};

export function buildWhatsAppOrderMessage(payload: WhatsAppOrderPayload): string {
  const paymentLabel = paymentMethodLabels[payload.paymentMethod] || payload.paymentMethod;

  const itemsList = payload.items
    .map(
      (item, idx) =>
        `${idx + 1}. *${item.productName}*\n   الكمية: ${item.quantity} × ${formatCurrency(item.unitPrice)} = ${formatCurrency(item.totalPrice)}`
    )
    .join("\n\n");

  const message = `🦷 *طلب جديد من متجر دينتال كير*
─────────────────
📋 *رقم الطلب:* #${payload.orderNumber || payload.orderId.slice(0, 8)}
👤 *اسم العميل:* ${payload.customerName}
📞 *رقم الهاتف:* ${payload.customerPhone}
📍 *المحافظة / المدينة:* ${payload.city}
🏠 *العنوان:* ${payload.shippingAddress}
💳 *طريقة الدفع:* ${paymentLabel}
${payload.notes ? `📝 *ملاحظات:* ${payload.notes}\n` : ""}
─────────────────
📦 *تفاصيل المنتجات:*
${itemsList}

─────────────────
💰 *الإجمالي النهائي:* *${formatCurrency(payload.totalAmount)}*
─────────────────
يرجى تأكيد تجهيز وشحن الطلب، شكراً لكم!`;

  return message;
}

export function generateWhatsAppUrl(
  payload: WhatsAppOrderPayload,
  supportPhone = process.env.NEXT_PUBLIC_STORE_WHATSAPP || "201068808559"
): string {
  const cleanPhone = supportPhone.replace(/[^0-9]/g, "");
  const message = buildWhatsAppOrderMessage(payload);
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
