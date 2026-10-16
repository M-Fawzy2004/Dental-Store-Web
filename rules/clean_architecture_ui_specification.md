# Clean Architecture & UI Design Specification

This document defines the architectural boundaries, layer segregation, component taxonomy, and user interface standards for the Dental Supplies E-commerce platform.

---

## 1. Architectural Layers (Clean Architecture in Next.js)

The application follows Clean Architecture principles adapted for the Next.js App Router framework. High-level business rules must never depend on low-level UI or vendor-specific libraries.

```
       ┌────────────────────────────────────────────────────────┐
       │              Presentation Layer (UI)                   │
       │   - App Router Pages & Layouts (`app/`)                │
       │   - View Components (`components/storefront/`, etc.)    │
       └─────────────────────────┬──────────────────────────────┘
                                 │ depends on
                                 ▼
       ┌────────────────────────────────────────────────────────┐
       │             Application Layer (Use Cases)              │
       │   - Zustand Stores (`lib/store/use-cart-store.ts`)      │
       │   - Validation Schemas (`lib/validations/`)            │
       │   - Services & Orchestrators (`lib/services/`)         │
       └─────────────────────────┬──────────────────────────────┘
                                 │ depends on
                                 ▼
       ┌────────────────────────────────────────────────────────┐
       │             Domain Layer (Core Business Rules)         │
       │   - Data Entities & Value Objects                      │
       │   - TypeScript Interfaces (`types/`)                   │
       │   - Pure Business Logic & Calculations                 │
       └─────────────────────────▲──────────────────────────────┘
                                 │ implemented by
       ┌─────────────────────────┴──────────────────────────────┐
       │             Infrastructure Layer (Adapters)            │
       │   - Supabase Client & Queries (`lib/supabase/`)        │
       │   - External Notification Services (WhatsApp API)      │
       │   - LocalStorage & Browser Adapters                    │
       └────────────────────────────────────────────────────────┘
```

### Layer Responsibilities

1. **Domain Layer (`types/`, `lib/domain/`):**
   - Pure domain models (`Product`, `Order`, `OrderItem`, `Customer`).
   - Pure calculations (Cart subtotal, discount, VAT, shipping calculations).
   - Zero framework dependencies (no React, no Next.js imports).

2. **Application Layer (`lib/store/`, `lib/services/`, `lib/validations/`):**
   - Coordinates application workflows (e.g., `checkoutService.ts`, `orderService.ts`).
   - Validates incoming user data with Zod before reaching the database.
   - Manages client-side reactivity via Zustand stores.

3. **Infrastructure Layer (`lib/supabase/`, `lib/adapters/`):**
   - Handles external communication: database queries, Supabase authentication, storage operations, and external messaging (WhatsApp URL encoder).

4. **Presentation Layer (`app/`, `components/`):**
   - Server Components for optimal SEO, rendering performance, and data fetching.
   - Client Components marked strictly at the leaf level for user interactions.

---

## 2. Directory Structure

```text
├── app/
│   ├── (storefront)/                  # Public customer-facing route group
│   │   ├── page.tsx                   # Homepage (Hero, Categories, Featured Products)
│   │   ├── products/
│   │   │   ├── page.tsx               # Catalog with category filters & search
│   │   │   └── [id]/page.tsx          # Product details & specifications
│   │   ├── cart/page.tsx              # Cart review view
│   │   ├── checkout/page.tsx          # Guest checkout form
│   │   └── order-success/page.tsx     # Order confirmation & WhatsApp action
│   ├── admin/                         # Protected admin route group
│   │   ├── login/page.tsx             # Supabase email/password login
│   │   ├── dashboard/page.tsx         # Order overview, filtering & status updater
│   │   └── products/page.tsx          # Inventory management (CRUD + Image Upload)
│   ├── layout.tsx                     # Global layout (RTL config, font, Sonner toast)
│   └── globals.css                    # Tailwind CSS directives & color tokens
├── components/
│   ├── ui/                            # Atomic primitives (button, input, badge, dialog)
│   ├── storefront/                    # Storefront components
│   │   ├── navbar.tsx                 # Navigation header with cart drawer trigger
│   │   ├── product-card.tsx           # Product card with price and quick-add button
│   │   ├── cart-drawer.tsx            # Slide-over cart preview
│   │   ├── checkout-form.tsx          # Guest validation form
│   │   └── category-filter.tsx        # Dental categories selector
│   └── admin/                         # Administration components
│       ├── order-table.tsx            # Interactive order listing table
│       ├── order-status-select.tsx    # Dropdown to update order state
│       ├── product-form-modal.tsx     # Modal to add/edit dental supplies
│       └── image-uploader.tsx         # Direct upload to Supabase storage
├── lib/
│   ├── domain/                        # Pure business calculations & helpers
│   ├── services/                      # Application use-case coordinators
│   ├── store/                         # Zustand state management
│   │   └── use-cart-store.ts          # Persistent cart state
│   ├── supabase/                      # Supabase client configurations
│   │   ├── client.ts                  # Client-side Supabase client
│   │   └── server.ts                  # Server-side Supabase client (cookies)
│   ├── validations/                   # Zod validation schemas
│   │   ├── checkout.schema.ts         # Checkout input validation (Egyptian phone, etc.)
│   │   └── product.schema.ts          # Product CRUD validation
│   └── utils/
│       ├── formatters.ts              # EGP Currency and timestamp formatters
│       └── whatsapp.ts                # WhatsApp payload builder
└── types/
    ├── database.types.ts              # Generated Supabase PostgreSQL types
    └── index.ts                       # Domain entity definitions
```

---

## 3. UI/UX Design System Guidelines

### Visual Theme & Identity
- **Industry Context:** Dental & Medical supplies require clinical cleanliness, high trust, precision, and modern aesthetics.
- **Color Palette:**
  - **Primary:** Medical Cyan / Deep Teal (`#0891b2` / `#0e7490`).
  - **Secondary / Accent:** Mint Green (`#10b981`) for stock availability and confirmation tags.
  - **Neutral Dark:** Slate 900 (`#0f172a`) for typography and high-contrast headers.
  - **Neutral Light:** Slate 50 (`#f8fafc`) for backgrounds, Slate 100 for surface cards.
  - **Alerts / Destructive:** Rose 600 (`#e11d48`) for errors and cancellations.

### Typography & Localization
- **Language:** Native Arabic primary, RTL-first layout (`dir="rtl"` applied at root).
- **Font Stack:** Modern Arabic typography using `Cairo` or `IBM Plex Sans Arabic` via `next/font`.
- **Currency Format:** Egyptian Pounds (`ج.م` or `EGP`) with thousands separator (e.g., `1,250 ج.م`).

### Responsive UI Standards
- Mobile-first approach: dental professionals and clinic assistants often order from their smartphones.
- Bottom navigation bar or sticky bottom cart drawer for mobile screens.
- Desktop layout featuring a multi-column grid with sticky category sidebars.

---

## 4. State Management Standards (Zustand)

The cart store (`lib/store/use-cart-store.ts`) must:
1. Store only necessary identifiers and display details:
   - `id`, `name`, `price`, `image_url`, `quantity`, `max_stock`.
2. Persist in `localStorage` through `zustand/middleware`.
3. Provide isolated mutation actions:
   - `addItem(product, quantity)`
   - `removeItem(productId)`
   - `updateQuantity(productId, quantity)`
   - `clearCart()`
4. Provide pure computed getters:
   - `getTotalItems()`
   - `getSubtotal()`
```