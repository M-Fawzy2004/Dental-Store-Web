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
} from "lucide-react";
import { toast } from "sonner";
import { OrderStatus } from "@/types";
import { supabase } from "@/lib/supabase/client";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { orderStatusLabels } from "@/components/admin/order-status-badge";

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
    customerName: "د. طارق الشربيني (عيادة الشروق للأسنان)",
    customerPhone: "01019882233",
    city: "القاهرة",
    shippingAddress: "مدينة الشروق، مجمع العيادات الطبي، عيادة 204",
    totalAmount: 4850,
    paymentMethod: "cash_on_delivery",
    status: "pending",
    createdAt: "2026-10-16T14:45:00Z",
    notes: "يرجى التوصيل بعد الساعة 3 عصراً",
    items: [
      { name: "طقم كابلات خلع أسنان بريميوم (10 قطع)", quantity: 1, price: 3400 },
      { name: "طقم روافع جذور Bein مستقيمة ومنحنية", quantity: 2, price: 720 },
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
    createdAt: "2026-10-16T13:20:00Z",
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
    shippingAddress: "سموحة، شارع فوزي معاذ، عمارة الأطباء",
    totalAmount: 2150,
    paymentMethod: "vodafone_cash",
    status: "shipped",
    createdAt: "2026-10-16T11:15:00Z",
    items: [
      { name: "قبضة توربين ضوئية LED عالية السرعة", quantity: 1, price: 2850 },
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

  const loadOrders = async () => {
    setIsRefreshing(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        setOrders(
          data.map((o) => ({
            id: o.id,
            orderNumber: o.order_number || Math.floor(100000 + Math.random() * 900000),
            customerName: o.customer_name,
            customerPhone: o.customer_phone,
            shippingAddress: o.shipping_address,
            city: o.city,
            totalAmount: Number(o.total_amount) || 0,
            paymentMethod: o.payment_method,
            status: o.status as OrderStatus,
            createdAt: o.created_at,
            notes: o.notes,
          }))
        );
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

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId);
    } catch (err) {
      console.warn("Supabase status update notice:", err);
    }

    setOrders(
      orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    toast.success(`تم تحديث حالة الطلب إلى: ${orderStatusLabels[newStatus].label}`);
  };

  const handleViewOrder = async (ord: AdminOrderRow) => {
    setSelectedOrder(ord);

    // If order has no items populated yet, fetch from Supabase order_items
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

  const paymentLabels: Record<string, string> = {
    cash_on_delivery: "الدفع عند الاستلام",
    vodafone_cash: "فودافون كاش",
    instapay: "انستاباي (InstaPay)",
  };

  return (
    <div className="p-6 lg:p-8 space-y-8 text-right max-w-7xl">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-white flex items-center gap-2.5 tracking-tight">
            <ShoppingBag className="h-7 w-7 text-teal-400" />
            <span>الطلبات والمبيعات الواردة من العيادات</span>
          </h1>
          <p className="text-xs lg:text-sm text-slate-400 mt-1">
            متابعة فورية للطلبات، تحديث حالات الشحن، والتواصل الفوري مع الأطباء لتأكيد التوريد
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadOrders}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#111e38] hover:bg-[#16274a] text-slate-200 text-xs font-bold transition-colors border border-slate-700/60 cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-cyan-400 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>تحديث الطلبات</span>
          </button>

          <span className="font-extrabold text-cyan-300 bg-cyan-950/80 border border-cyan-800 px-3.5 py-2.5 rounded-xl text-xs">
            {filteredOrders.length} طلبات مسجلة
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-cyan-400" />
          <input
            type="text"
            placeholder="ابحث برقم الطلب، اسم الدكتور، الهاتف، أو المدينة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pr-10 pl-4 rounded-xl bg-[#0e172c] border border-slate-700/70 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 shadow-inner"
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
                  ? "bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-teal-900/40 border border-teal-400/40"
                  : "bg-[#0e172c] text-slate-300 hover:text-white border border-slate-800 hover:bg-[#121e38]"
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table with High Contrast Styling */}
      <div className="rounded-2xl bg-gradient-to-b from-[#0e172c] to-[#0a1021] border border-slate-800/90 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right">
            <thead>
              <tr className="border-b border-slate-800 bg-[#121e38]/80 text-slate-300">
                <th className="py-3.5 px-4 font-bold rounded-r-xl">رقم الطلب والتاريخ</th>
                <th className="py-3.5 px-4 font-bold">العميل / العيادة</th>
                <th className="py-3.5 px-4 font-bold">العنوان والمحافظة</th>
                <th className="py-3.5 px-4 font-bold">طريقة الدفع</th>
                <th className="py-3.5 px-4 font-bold">الإجمالي</th>
                <th className="py-3.5 px-4 font-bold">حالة الطلب</th>
                <th className="py-3.5 px-4 font-bold text-center rounded-l-xl">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-cyan-950/20 transition-colors">
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-cyan-400 text-sm block">
                      #{ord.orderNumber}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      {formatDate(ord.createdAt)}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-extrabold text-white text-sm block">
                      {ord.customerName}
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <a
                        href={`https://wa.me/2${ord.customerPhone.replace(/^0+/, "")}?text=${encodeURIComponent(`مرحباً دكتور، نتواصل معك بخصوص طلبك رقم #${ord.orderNumber} من متجر دينتال كير للأسنان.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800/70"
                        dir="ltr"
                      >
                        <MessageCircle className="h-3 w-3" />
                        <span>{ord.customerPhone}</span>
                      </a>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-slate-300">
                    <span className="font-bold block text-white">{ord.city}</span>
                    <span className="text-[11px] text-slate-400 line-clamp-1">
                      {ord.shippingAddress}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-lg bg-[#142344] text-[11px] font-bold text-cyan-300 border border-cyan-900/50">
                      {paymentLabels[ord.paymentMethod] || ord.paymentMethod}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-black text-emerald-400 text-sm">
                    {formatCurrency(ord.totalAmount)}
                  </td>

                  <td className="py-3.5 px-4">
                    <select
                      value={ord.status}
                      onChange={(e) =>
                        handleUpdateStatus(ord.id, e.target.value as OrderStatus)
                      }
                      className="h-9 rounded-xl bg-[#091020] border border-slate-700 text-xs text-white px-2.5 focus:outline-none focus:border-cyan-500 font-bold cursor-pointer shadow-inner"
                    >
                      <option value="pending">قيد المراجعة</option>
                      <option value="confirmed">تم التأكيد</option>
                      <option value="shipped">جاري الشحن</option>
                      <option value="delivered">تم التوصيل</option>
                      <option value="cancelled">ملغي</option>
                    </select>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => handleViewOrder(ord)}
                      className="p-2 rounded-xl bg-[#111e38] hover:bg-[#16274a] text-slate-300 hover:text-cyan-300 border border-slate-700/60 transition-colors cursor-pointer"
                      title="عرض الفاتورة وتفاصيل المنتجات"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
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
          className="bg-[#0e172c] border-slate-700 text-white max-w-xl text-right"
        >
          <div className="space-y-4 pt-2 text-right">
            {/* Customer Details Box */}
            <div className="p-4 rounded-2xl bg-[#091020] border border-slate-700/80 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">الطبيب / العيادة:</span>
                <span className="font-extrabold text-white text-sm">{selectedOrder.customerName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">رقم الهاتف:</span>
                <a
                  href={`tel:${selectedOrder.customerPhone}`}
                  className="font-bold text-emerald-400 font-mono flex items-center gap-1"
                  dir="ltr"
                >
                  <Phone className="h-3 w-3" />
                  <span>{selectedOrder.customerPhone}</span>
                </a>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">المحافظة:</span>
                <span className="font-bold text-white">{selectedOrder.city}</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-slate-400">عنوان التوصيل:</span>
                <span className="font-medium text-slate-200 max-w-[70%] text-left">
                  {selectedOrder.shippingAddress}
                </span>
              </div>
              {selectedOrder.notes && (
                <div className="flex justify-between items-start pt-2 border-t border-slate-800">
                  <span className="text-amber-400">ملاحظات الطبيب:</span>
                  <span className="font-medium text-slate-200">{selectedOrder.notes}</span>
                </div>
              )}
            </div>

            {/* Ordered Items List */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300">
                المنتجات والأدوات المطلوبة في هذا الطلب:
              </h4>
              <div className="divide-y divide-slate-800 rounded-2xl bg-[#091020] border border-slate-700/80 p-3">
                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                  selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-white block">{item.name}</span>
                        <span className="text-slate-400 text-[11px]">
                          الكمية: {item.quantity} × {formatCurrency(item.price)}
                        </span>
                      </div>
                      <span className="font-black text-cyan-400">
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
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-cyan-950/60 border border-emerald-800/60">
              <span className="font-bold text-white text-sm">المبلغ الإجمالي المستحق:</span>
              <span className="text-xl font-black text-emerald-400">
                {formatCurrency(selectedOrder.totalAmount)}
              </span>
            </div>

            {/* Actions in Modal */}
            <div className="pt-2 flex gap-2">
              <a
                href={`https://wa.me/2${selectedOrder.customerPhone.replace(/^0+/, "")}?text=${encodeURIComponent(`مرحباً دكتور ${selectedOrder.customerName}، معك متجر دينتال كير للأسنان بخصوص طلبك رقم #${selectedOrder.orderNumber} بقيمة ${formatCurrency(selectedOrder.totalAmount)}. تم تأكيد التجهيز للشحن.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-md shadow-emerald-950/40"
              >
                <MessageCircle className="h-4 w-4" />
                <span>مراسلة الطبيب عبر واتساب</span>
              </a>

              <Button
                variant="outline"
                onClick={() => setSelectedOrder(null)}
                className="border-slate-700 bg-[#111e38] text-slate-300 hover:bg-[#16274a] text-xs font-bold"
              >
                إغلاق
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
