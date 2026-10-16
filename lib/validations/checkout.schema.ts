import { z } from "zod";

export const egyptianGovernorates = [
  "القاهرة",
  "الجيزة",
  "الإسكندرية",
  "الدقهلية",
  "البحر الأحمر",
  "البحيرة",
  "الفيوم",
  "الغربية",
  "الإسماعيلية",
  "المنوفية",
  "المنيا",
  "القليوبية",
  "الوادي الجديد",
  "السويس",
  "أسوان",
  "أسيوط",
  "بني سويف",
  "بورسعيد",
  "دمياط",
  "الشرقية",
  "جنوب سيناء",
  "كفر الشيخ",
  "مطروح",
  "الأقصر",
  "قنا",
  "شمال سيناء",
  "سوهاج",
] as const;

export const checkoutFormSchema = z.object({
  customerName: z
    .string()
    .min(3, "الاسم بالكامل يجب أن يحتوي على 3 أحرف على الأقل")
    .max(100, "الاسم طويل جداً"),
  customerPhone: z
    .string()
    .trim()
    .regex(/^01[0125][0-9]{8}$/, "يرجى إدخال رقم هاتف مصري صحيح (مثال: 01012345678)"),
  city: z
    .string()
    .min(2, "يرجى اختيار المحافظة أو المدينة"),
  shippingAddress: z
    .string()
    .min(5, "يرجى إدخال العنوان بالتفصيل (الشارع، رقم العيادة/المبنى، علامة مميزة)"),
  notes: z.string().optional(),
  paymentMethod: z.enum(["cash_on_delivery", "vodafone_cash", "instapay"], {
    error: "يرجى اختيار طريقة الدفع",
  }),
});

export type CheckoutFormData = z.infer<typeof checkoutFormSchema>;
