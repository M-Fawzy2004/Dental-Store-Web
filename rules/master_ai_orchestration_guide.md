# Master AI Agent Instructions & Operating Rules

This file serves as the single source of truth for the AI assistant. Whenever prompts are issued, the AI must strictly consult and adhere to this instruction manual along with `docs/architecture-and-ui.md` and `docs/supabase-setup.md`.

---

## 1. Operating Rules & Core Constraints

1. **Strict Context Alignment:**
   - Target project: Single-vendor Dental Supplies E-commerce Platform in Egypt.
   - Core checkout philosophy: **Guest Checkout Only**. Do NOT implement customer authentication, registration, or email verification for buyers.
   - Buyer flow: Add to Cart -> Guest Form (Name, Egyptian Phone, Shipping Address, City, Payment Method) -> Insert Order -> WhatsApp Redirect Button -> Clear Cart.
   - Admin flow: Restricted route (`/admin`) protected by Supabase Auth (Email & Password).

2. **No Assumptions / Self-Contained Implementation:**
   - Always refer to `docs/architecture-and-ui.md` for folder placement, layer segregation, and UI standards.
   - Always refer to `docs/supabase-setup.md` for database column names, foreign keys, and RLS policies.
   - Use strict TypeScript definitions; `any` is forbidden.

3. **Rendering & Next.js Patterns:**
   - Default to React Server Components (RSC) for page routes, catalog queries, and metadata definitions.
   - Add `'use client'` strictly to interactive leaves (e.g., buttons, form components, drawers).
   - Use Next.js dynamic routing: `app/(storefront)/products/[id]/page.tsx` for product details.

4. **Component Design & Localization:**
   - UI direction is RTL (`dir="rtl"`).
   - Use Tailwind CSS classes with semantic color names conforming to the clinical theme in the architecture guide.
   - All customer-facing text, error messages, and notification toasts must be in clear, professional Arabic.

---

## 2. Sequential Development Execution Plan

When prompted to build or extend features, execute them strictly in the following sequence:

### Phase 1: Core Foundation & Types
- Verify `.env.local` variables are mapped.
- Implement `types/index.ts` and `types/database.types.ts` mirroring `docs/supabase-setup.md`.
- Implement `lib/supabase/client.ts` using `@supabase/supabase-js`.
- Implement `lib/utils/formatters.ts` (Currency formatter for EGP, Date formatter).
- Implement `lib/utils/whatsapp.ts` (Build formatted WhatsApp messages and URL encoder).

### Phase 2: State Management & Primitives
- Implement `lib/store/use-cart-store.ts` using Zustand with `persist` middleware.
- Build UI primitives in `components/ui/` (Button, Input, Badge, Textarea, Dialog, Card).
- Configure root layout in `app/layout.tsx` with Arabic font, RTL, and `Sonner` Toaster.

### Phase 3: Storefront Presentation
- Build Navigation Bar (`components/storefront/navbar.tsx`) with search, logo, and Cart Drawer trigger.
- Build Product Card (`components/storefront/product-card.tsx`) with quick-add action.
- Build Homepage (`app/(storefront)/page.tsx`) with dental categories and product grid.
- Build Catalog View (`app/(storefront)/products/page.tsx`) with category filtering and real-time search.
- Build Single Product View (`app/(storefront)/products/[id]/page.tsx`).

### Phase 4: Checkout & Order Flow
- Build Cart Drawer (`components/storefront/cart-drawer.tsx`) and full Cart Page (`app/(storefront)/cart/page.tsx`).
- Build Guest Checkout Form (`components/storefront/checkout-form.tsx`) validated using Zod.
  - Require Egyptian mobile numbers: `/^01[0125][0-9]{8}$/`.
- Build Order Submission Logic:
  1. Insert row into `public.orders`.
  2. Insert items into `public.order_items`.
  3. Clear cart.
  4. Redirect to `/order-success?orderId={id}`.
- Build Order Success Page (`app/(storefront)/order-success/page.tsx`) showing receipt summary and instant WhatsApp CTA button.

### Phase 5: Administration Dashboard (`/admin`)
- Implement Admin Login (`app/admin/login/page.tsx`) via Supabase Auth `signInWithPassword`.
- Build Route Protection (`middleware.ts` or layout-level session check).
- Build Orders Management Dashboard (`app/admin/dashboard/page.tsx`):
  - View all orders, inspect order items, update order statuses (`pending`, `confirmed`, `shipped`, `delivered`, `cancelled`).
- Build Product Management (`app/admin/products/page.tsx`):
  - Add/Edit product modal with image upload directly to the `dental-products` Supabase Storage bucket.
  - Toggle product active state and manage stock count.

---

## 3. Standard Verification Checklist

Before considering any task completed, verify:
- [ ] No compilation errors or TypeScript warnings (`npm run build`).
- [ ] Cart mutations update `localStorage` and persist on page reload.
- [ ] Checkout form validates Egyptian phone numbers accurately.
- [ ] WhatsApp redirection link opens correctly with an itemized Arabic order summary.
- [ ] RLS policies prevent unauthenticated access to the `/admin` database tables.