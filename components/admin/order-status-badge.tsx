import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { OrderStatus } from "@/types";

export const orderStatusLabels: Record<OrderStatus, { label: string; variant: "default" | "secondary" | "success" | "warning" | "destructive" }> = {
  pending: { label: "قيد المراجعة", variant: "warning" },
  confirmed: { label: "تم التأكيد", variant: "default" },
  shipped: { label: "جاري الشحن", variant: "secondary" },
  delivered: { label: "تم التوصيل", variant: "success" },
  cancelled: { label: "ملغي", variant: "destructive" },
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const meta = orderStatusLabels[status] || { label: status, variant: "secondary" };
  return <Badge variant={meta.variant}>{meta.label}</Badge>;
}
