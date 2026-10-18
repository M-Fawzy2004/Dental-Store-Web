"use client";

import * as React from "react";
import { CheckCircle2 } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";

export interface InvoiceItem {
  productName?: string;
  name?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  sku?: string;
}

export interface AmazonInvoiceProps {
  orderId: string;
  orderNumber?: number | string;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  city: string;
  notes?: string | null;
  paymentMethod: string;
  senderPhone?: string | null;
  paymentStatus?: string | null;
  items: InvoiceItem[];
  totalAmount: number;
  createdAt?: string;
}

export function AmazonInvoiceDocument({
  orderId,
  orderNumber,
  customerName,
  customerPhone,
  shippingAddress,
  city,
  notes,
  paymentMethod,
  senderPhone,
  paymentStatus = "pending",
  items,
  totalAmount,
  createdAt,
}: AmazonInvoiceProps) {
  const formattedDate = createdAt ? formatDate(createdAt) : "18 أكتوبر 2026";
  const invoiceNumber = orderNumber ? `INV-${orderNumber}` : `INV-${orderId.slice(0, 8).toUpperCase()}`;

  const paymentMethodLabel =
    paymentMethod === "vodafone_cash"
      ? "فودافون كاش (محفظة إلكترونية)"
      : paymentMethod === "instapay"
        ? "إنستاباي (InstaPay تحويل لحظي)"
        : "الدفع نقداً عند الاستلام والمعاينة";

  return (
    <div className="printable-invoice-container bg-white text-slate-900 text-right p-6 sm:p-8 font-sans max-w-4xl mx-auto border border-slate-200 print:border-none print:p-0 print:m-0 shadow-sm print:shadow-none select-text leading-tight">
      {/* 1. Header Section - Official Corporate Amazon / Depot Style */}
      <div className="flex flex-row items-start justify-between gap-4 pb-3.5 border-b-2 border-slate-900">
        {/* Brand Details (Right in RTL) */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-orange-600 text-white flex items-center justify-center font-black text-base shadow-sm">
              🦷
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-950 tracking-tight leading-none">
                تكنو دنتال ستور مصر
              </h1>
              <span dir="ltr" className="text-[9px] font-bold text-slate-600 tracking-wider uppercase font-mono block">
                TECHNO DENTAL SUPPLIES & INSTRUMENTS CO.
              </span>
            </div>
          </div>
          <p className="text-[11px] text-slate-600 max-w-sm pt-0.5 leading-tight">
            الشركة الرائدة لتوريدات ومستلزمات وأدوات طب وجراحة الأسنان وعلاج الجذور
          </p>
          <div className="text-[10px] text-slate-500 font-mono space-y-0.5 pt-0.5">
            <div>س.ت: 104829 • ب.ض: 492-819-330 • رقم التسجيل الضريبي المعتمد</div>
            <div>خدمة العملاء والتحصيلات: 01068808559 • جمهورية مصر العربية</div>
          </div>
        </div>

        {/* Invoice Metadata (Left in RTL) */}
        <div className="text-left space-y-0.5 bg-slate-50 p-3 rounded-lg border border-slate-200 print:bg-transparent print:p-0 print:border-none min-w-[200px]">
          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-black bg-slate-900 text-white uppercase tracking-wider">
            فاتورة مبيعات ضريبية إلكترونية
          </span>
          <div className="text-xs font-black text-slate-950 font-mono pt-0.5" dir="ltr">
            {invoiceNumber}
          </div>
          <div className="text-[11px] text-slate-600">
            تاريخ الإصدار: <span className="font-bold text-slate-900">{formattedDate}</span>
          </div>
          <div className="text-[11px] text-slate-600">
            رقم الطلب: <span className="font-mono font-bold text-slate-900" dir="ltr">#{orderNumber || orderId.slice(0, 8)}</span>
          </div>
          <div className="text-[10px] text-emerald-700 font-bold flex items-center justify-start gap-1 pt-0.5">
            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
            <span>طلب مسجل ومعتمد للشحن والتسليم</span>
          </div>
        </div>
      </div>

      {/* 2. Customer & Payment Information Grid (Clean 2-Columns) */}
      <div className="grid grid-cols-2 gap-3 py-3 text-xs border-b border-slate-200">
        {/* Customer Information (Sold to / Ship to) */}
        <div className="p-3 rounded-lg bg-slate-50/70 border border-slate-200 print:bg-transparent print:border-slate-300 space-y-1.5">
          <div className="flex items-center justify-between pb-1 border-b border-slate-200">
            <span className="text-[11px] font-black text-slate-900">بيانات المشتري والتوصيل</span>
            <span dir="ltr" className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">Sold To / Deliver To</span>
          </div>
          <div className="space-y-1 text-slate-800 text-[11px]">
            <div>
              <span className="text-slate-500">اسم الطبيب / العميل: </span>
              <strong className="text-slate-950 font-bold">{customerName}</strong>
            </div>
            <div>
              <span className="text-slate-500">رقم الهاتف (واتساب): </span>
              <strong className="font-mono text-slate-950 dir-ltr inline-block text-right">{customerPhone}</strong>
            </div>
            <div>
              <span className="text-slate-500">عنوان التوصيل: </span>
              <span className="font-semibold text-slate-900">{city} - {shippingAddress}</span>
            </div>
            {notes && (
              <div className="text-[10px] text-amber-800 pt-0.5">
                <span className="font-bold">ملاحظات التجهيز: </span>
                <span>{notes}</span>
              </div>
            )}
          </div>
        </div>

        {/* Payment & Transfer Verification Information */}
        <div className="p-3 rounded-lg bg-slate-50/70 border border-slate-200 print:bg-transparent print:border-slate-300 space-y-1.5">
          <div className="flex items-center justify-between pb-1 border-b border-slate-200">
            <span className="text-[11px] font-black text-slate-900">تفاصيل السداد والتحصيل</span>
            <span dir="ltr" className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">Payment Details</span>
          </div>
          <div className="space-y-1 text-slate-800 text-[11px]">
            <div>
              <span className="text-slate-500">طريقة الدفع: </span>
              <strong className="text-slate-950">{paymentMethodLabel}</strong>
            </div>
            <div>
              <span className="text-slate-500">الحساب المستلم للمتجر: </span>
              <strong className="font-mono text-orange-700 dir-ltr inline-block">01068808559</strong>
            </div>
            {senderPhone ? (
              <div>
                <span className="text-slate-500">المحفظة / الحساب المُحوِّل: </span>
                <strong className="font-mono text-slate-950 dir-ltr inline-block">{senderPhone}</strong>
              </div>
            ) : (
              <div>
                <span className="text-slate-500">تحصيل القيمة: </span>
                <span className="text-slate-900 font-semibold">تحصيل نقدي عند الاستلام بعد المعاينة</span>
              </div>
            )}
            <div>
              <span className="text-slate-500">حالة الدفعة: </span>
              <span className="font-bold text-emerald-700">
                {paymentStatus === "paid" ? "✅ تم استلام وتأكيد التحويل" : "⏳ قيد المعاينة والتأكيد"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Items Table - Crisp Amazon Style */}
      <div className="py-3">
        <div className="flex items-center justify-between mb-1.5">
          <h3 className="text-[11px] font-black text-slate-900 uppercase">
            بيان الأصناف والمعدات الطبية المفوترة
          </h3>
          <span dir="ltr" className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">
            Items Specification
          </span>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-300 print:border-slate-400">
          <table className="w-full text-[11px] text-right border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-900 border-b border-slate-300 font-bold">
                <th className="py-1.5 px-2.5 w-8 text-center">#</th>
                <th className="py-1.5 px-2.5">بيان الصنف والمواصفات</th>
                <th className="py-1.5 px-2.5 text-center w-16">الكمية</th>
                <th className="py-1.5 px-2.5 text-left w-24">سعر الوحدة</th>
                <th className="py-1.5 px-2.5 text-left w-28">الإجمالي (ج.م)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {items && items.length > 0 ? (
                items.map((item, idx) => {
                  const resolvedName =
                    item.productName || item.name || "صنف ومعدة طبية أصلية معتمدة";
                  return (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-1.5 px-2.5 text-center text-slate-500 font-mono">
                        {idx + 1}
                      </td>
                      <td className="py-1.5 px-2.5 font-bold text-slate-950">
                        <div className="text-slate-950 font-black">{resolvedName}</div>
                        <div className="text-[9px] text-slate-500 font-normal">
                          ستانلس ستيل طبي أوتوكلاف 134°C • خامات أصلية معتمدة
                        </div>
                      </td>
                      <td className="py-1.5 px-2.5 text-center font-bold text-slate-900 font-mono">
                        {item.quantity}
                      </td>
                      <td className="py-1.5 px-2.5 text-left font-mono text-slate-800">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="py-1.5 px-2.5 text-left font-black text-slate-950 font-mono">
                        {formatCurrency(item.totalPrice)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-3 text-center text-slate-500">
                    لا توجد أصناف مسجلة
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Financial Calculations & Summary Box */}
      <div className="flex flex-row justify-between items-start gap-4 py-3 border-t border-slate-200">
        {/* Left Notes & Delivery Terms */}
        <div className="space-y-1 text-[10px] text-slate-600 max-w-sm">
          <div className="font-bold text-slate-900">تعليمات المعاينة والاستلام:</div>
          <ul className="list-disc list-inside space-y-0.5 text-slate-600 leading-normal">
            <li>يحق للطبيب أو المستلم معاينة وفحص الأدوات ومطابقتها قبل السداد.</li>
            <li>ضمان استبدال فوري ضد عيوب الصناعة أو الكسر والصدأ لمدة عام كامل.</li>
            <li>الأسعار تشمل ضريبة القيمة المضافة طبقاً للوائح والقوانين المصرية.</li>
          </ul>
        </div>

        {/* Right Financial Calculation Table */}
        <div className="w-64 space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-200 print:bg-transparent print:border-slate-300 text-xs">
          <div className="flex justify-between items-center text-slate-700 text-[11px]">
            <span>المجموع الفرعي:</span>
            <span className="font-mono font-bold text-slate-950">{formatCurrency(totalAmount)}</span>
          </div>
          <div className="flex justify-between items-center text-slate-700 text-[11px]">
            <span>مصاريف الشحن والتوصيل:</span>
            <span className="font-bold text-emerald-700">شحن مجاني (معاينة قبل الدفع)</span>
          </div>
          <div className="flex justify-between items-center text-slate-700 text-[11px]">
            <span>ضريبة القيمة المضافة (14%):</span>
            <span className="text-[10px] text-slate-500 font-medium">متضمنة بالفاتورة</span>
          </div>
          <div className="flex justify-between items-center text-sm font-black text-slate-950 pt-1.5 border-t-2 border-slate-900">
            <span>المبلغ الإجمالي النهائي:</span>
            <span className="font-mono text-orange-600">{formatCurrency(totalAmount)}</span>
          </div>
        </div>
      </div>

      {/* 5. Official Stamp, Barcode & Signatures (Single Sheet Fit Guarantee) */}
      <div className="pt-3 mt-2 border-t-2 border-dashed border-slate-300 flex flex-row items-center justify-between gap-4 text-[10px] text-slate-500">
        {/* Barcode representation */}
        <div className="text-right space-y-0.5">
          <div className="font-mono text-xs tracking-widest text-slate-900 font-bold" dir="ltr">
            ||||| | |||| ||| ||||||| || |||||| | |||||
          </div>
          <div className="font-mono text-[9px] text-slate-500" dir="ltr">
            *{invoiceNumber}*
          </div>
          <p className="text-[9px] text-slate-400">
            فاتورة إلكترونية صادرة ومعتمدة آلياً لا تتطلب ختماً ورقياً رطباً.
          </p>
        </div>

        {/* Official Stamp Simulation */}
        <div className="flex items-center gap-2.5">
          <div className="h-16 w-16 rounded-full border-2 border-dashed border-orange-600 text-orange-600 flex flex-col items-center justify-center p-1 text-center rotate-3 select-none opacity-90">
            <span className="text-[7px] font-black uppercase tracking-tight">TECHNO DENTAL</span>
            <span className="text-[9px] font-black leading-tight">معتمد للشحن</span>
            <span className="text-[7px] font-bold">CAIRO - EGYPT</span>
          </div>

          <div className="text-right space-y-0.5">
            <div className="font-bold text-slate-800 text-[10px]">توقيع مسؤول التجهيز والتسليم:</div>
            <div className="font-mono text-[9px] text-slate-400">مراجعة الجودة والتعقيم: معتمد ✓</div>
          </div>
        </div>
      </div>
    </div>
  );
}
