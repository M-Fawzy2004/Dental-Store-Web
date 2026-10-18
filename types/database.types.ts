export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type PaymentMethod = "cash_on_delivery" | "vodafone_cash" | "instapay";
export type PaymentStatus = "pending" | "paid" | "failed";
export type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";

export type Category = {
  id: string;
  created_at: string;
  name: string;
  slug: string;
  description: string | null;
};

export type Product = {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  category_id: string | null;
  category_name: string;
  image_url: string | null;
  stock: number;
  is_active: boolean;
  specifications?: {
    material?: string;
    autoclavable?: string;
    origin?: string;
    warranty?: string;
    intendedUse?: string;
    packaging?: string;
  };
};

export type Order = {
  id: string;
  created_at: string;
  order_number?: number;
  customer_name: string;
  customer_phone: string;
  shipping_address: string;
  city: string;
  notes: string | null;
  total_amount: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  status: OrderStatus;
  sender_phone?: string | null;
  payment_proof_url?: string | null;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  unit_price: number;
  quantity: number;
  total_price: number;
};

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: Category;
        Insert: {
          id?: string;
          created_at?: string;
          name: string;
          slug: string;
          description?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          name?: string;
          slug?: string;
          description?: string | null;
        };
        Relationships: [];
      };
      products: {
        Row: Product;
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          name: string;
          slug: string;
          description?: string | null;
          price: number;
          compare_at_price?: number | null;
          category_id?: string | null;
          category_name: string;
          image_url?: string | null;
          stock?: number;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          price?: number;
          compare_at_price?: number | null;
          category_id?: string | null;
          category_name?: string;
          image_url?: string | null;
          stock?: number;
          is_active?: boolean;
        };
        Relationships: [];
      };
      orders: {
        Row: Order;
        Insert: {
          id?: string;
          created_at?: string;
          order_number?: number;
          customer_name: string;
          customer_phone: string;
          shipping_address: string;
          city: string;
          notes?: string | null;
          total_amount: number;
          payment_method: PaymentMethod;
          payment_status?: PaymentStatus;
          status?: OrderStatus;
          sender_phone?: string | null;
          payment_proof_url?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          order_number?: number;
          customer_name?: string;
          customer_phone?: string;
          shipping_address?: string;
          city?: string;
          notes?: string | null;
          total_amount?: number;
          payment_method?: PaymentMethod;
          payment_status?: PaymentStatus;
          status?: OrderStatus;
          sender_phone?: string | null;
          payment_proof_url?: string | null;
        };
        Relationships: [];
      };
      order_items: {
        Row: OrderItem;
        Insert: {
          id?: string;
          order_id: string;
          product_id?: string | null;
          product_name: string;
          unit_price: number;
          quantity?: number;
          total_price: number;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string | null;
          product_name?: string;
          unit_price?: number;
          quantity?: number;
          total_price?: number;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      payment_method: PaymentMethod;
      payment_status: PaymentStatus;
      order_status: OrderStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};
