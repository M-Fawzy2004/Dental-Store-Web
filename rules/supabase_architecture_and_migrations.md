# Supabase Architecture, Security & Database Migrations

This document specifies the PostgreSQL relational schema, Row Level Security (RLS) policies, Storage bucket configurations, and manual setup instructions for Supabase.

---

## 1. Storage Configuration

Create a dedicated Storage Bucket in the Supabase Dashboard:
- **Bucket Name:** `dental-products`
- **Public Bucket:** Enabled (`true`)
- **Allowed MIME Types:** `image/jpeg`, `image/png`, `image/webp`
- **File Size Limit:** 3MB

### Storage Security Policies (SQL)

```sql
-- Allow public access to view product images
create policy "Public Access to Product Images"
on storage.objects for select
using ( bucket_id = 'dental-products' );

-- Allow authenticated admins to upload product images
create policy "Admin Upload Product Images"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'dental-products' );

-- Allow authenticated admins to update/delete product images
create policy "Admin Modify Product Images"
on storage.objects for update
to authenticated
using ( bucket_id = 'dental-products' );

create policy "Admin Delete Product Images"
on storage.objects for delete
to authenticated
using ( bucket_id = 'dental-products' );
```

---

## 2. Complete SQL Migration Script

Save and run this script inside the **Supabase SQL Editor** or place it in `supabase/migrations/001_initial_schema.sql`.

```sql
-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- ============================================================================
-- 1. TABLES DEFINITION
-- ============================================================================

-- Categories Table
create table if not exists public.categories (
    id uuid primary key default gen_random_uuid(),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    name text not null unique,
    slug text not null unique,
    description text
);

-- Products Table
create table if not exists public.products (
    id uuid primary key default gen_random_uuid(),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    name text not null,
    slug text not null unique,
    description text,
    price numeric(10, 2) not null check (price >= 0),
    compare_at_price numeric(10, 2) check (compare_at_price >= price),
    category_id uuid references public.categories(id) on delete set null,
    category_name text not null,
    image_url text,
    stock integer not null default 0 check (stock >= 0),
    is_active boolean not null default true
);

-- Orders Table (Guest Checkout)
create table if not exists public.orders (
    id uuid primary key default gen_random_uuid(),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    order_number serial unique,
    customer_name text not null,
    customer_phone text not null,
    shipping_address text not null,
    city text not null,
    notes text,
    total_amount numeric(10, 2) not null check (total_amount >= 0),
    payment_method text not null check (payment_method in ('cash_on_delivery', 'vodafone_cash', 'instapay')),
    payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'failed')),
    status text not null default 'pending' check (status in ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled'))
);

-- Order Items Table
create table if not exists public.order_items (
    id uuid primary key default gen_random_uuid(),
    order_id uuid references public.orders(id) on delete cascade not null,
    product_id uuid references public.products(id) on delete set null,
    product_name text not null,
    unit_price numeric(10, 2) not null check (unit_price >= 0),
    quantity integer not null default 1 check (quantity > 0),
    total_price numeric(10, 2) not null check (total_price >= 0)
);

-- ============================================================================
-- 2. INDEXES FOR PERFORMANCE
-- ============================================================================

create index if not exists idx_products_category on public.products(category_id);
create index if not exists idx_products_is_active on public.products(is_active);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_created_at on public.orders(created_at desc);
create index if not exists idx_order_items_order_id on public.order_items(order_id);

-- ============================================================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- CATEGORIES: Public can read, Admins can manage
create policy "Allow public read categories"
on public.categories for select
using (true);

create policy "Allow authenticated admin full access to categories"
on public.categories for all
to authenticated
using (true)
with check (true);

-- PRODUCTS: Public can read active products, Admins can manage all
create policy "Allow public read active products"
on public.products for select
using (is_active = true);

create policy "Allow authenticated admin full access to products"
on public.products for all
to authenticated
using (true)
with check (true);

-- ORDERS: Public guests can INSERT orders, Admins can read & update
create policy "Allow public guest insert orders"
on public.orders for insert
to anon, authenticated
with check (true);

create policy "Allow authenticated admin full access to orders"
on public.orders for all
to authenticated
using (true)
with check (true);

-- ORDER ITEMS: Public guests can INSERT items during checkout, Admins can read & manage
create policy "Allow public guest insert order_items"
on public.order_items for insert
to anon, authenticated
with check (true);

create policy "Allow authenticated admin full access to order_items"
on public.order_items for all
to authenticated
using (true)
with check (true);

-- ============================================================================
-- 4. SEED DATA (Default Dental Categories)
-- ============================================================================

insert into public.categories (name, slug, description)
values
    ('أدوات الفحص والتشخيص', 'diagnostic-instruments', 'مرايا، مجسات، وملاقط فحص الأسنان'),
    ('أدوات الحشو والترميم', 'restorative-instruments', 'حشوات الكومبوزيت، مسدسات الحشو، وحوامل المبارد'),
    ('أدوات الجراحة والخلع', 'surgical-instruments', 'روافع الجذور، كابلات الخلع، ومشارط الجراحة'),
    ('مهمات التعقيم ومكافحة العدوى', 'sterilization-infection-control', 'أكياس تعقيم، مطهرات الأسطح، والقفازات الطبية'),
    ('مستهلكات العيادة اليومية', 'disposables', 'ماصات اللعاب، مرايل المرضى، والقطن الطبي')
on conflict (slug) do nothing;
```

---

## 3. Environment Variables Configuration

Place these variables in `.env.local`:

```env
# Public Supabase credentials (Safe for browser)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key

# Store Configuration
NEXT_PUBLIC_STORE_NAME="متجر دينتال كير لمستلزمات الأسنان"
NEXT_PUBLIC_STORE_WHATSAPP="201000000000"
NEXT_PUBLIC_STORE_CURRENCY="ج.م"
```