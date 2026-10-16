export * from "./database.types";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url: string | null;
  max_stock?: number;
}

export interface GuestCheckoutInput {
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  city: string;
  notes?: string;
  paymentMethod: "cash_on_delivery" | "vodafone_cash" | "instapay";
}
