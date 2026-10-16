# AI Master Execution Controller & Working Protocol

> **CRITICAL DIRECTIVE FOR AI:**
> Whenever the developer prompts you to "Follow `rules/AGENT_PROMPT.md`" or references this file, you must strictly load, read, and adhere to the project's 3 source documents before generating or modifying any code:
> 1. `rules/clean_architecture_ui_specification.md` (Clean Architecture, folder layout, UI design system)
> 2. `rules/supabase_architecture_and_migrations.md` (PostgreSQL schemas, RLS security, and storage)
> 3. `rules/master_ai_orchestration_guide.md` (Step-by-step phases and implementation checklist)

---

## 1. Non-Negotiable Core Principles

1. **Guest Checkout Only:**
   - Buyers do NOT have accounts.
   - Do NOT add customer signup, login, or JWT session handling for visitors.
   - Flow: Cart -> Guest Form (Name, Egyptian Phone, City, Address) -> Save Order to Supabase -> Redirect to WhatsApp confirmation.

2. **Admin-Only Authentication:**
   - The `/admin` routes are protected exclusively using Supabase Auth (Email & Password).

3. **Strict Layer Segregation (Clean Architecture):**
   - **Domain (`types/`):** Pure TypeScript interfaces, zero UI/framework dependencies.
   - **Application (`lib/store/`, `lib/validations/`):** Zustand stores with `persist`, Zod schemas.
   - **Infrastructure (`lib/supabase/`):** Supabase client initialization and API adapters.
   - **Presentation (`app/`, `components/`):** Server Components for data display, Client Components (`'use client'`) only for interactive leaves.

4. **Localization & Formatting:**
   - Native Arabic UI with RTL direction (`dir="rtl"`).
   - Egyptian Phone validation: `/^01[0125][0-9]{8}$/`.
   - Prices formatted in Egyptian Pounds (`ج.م`).

---

## 2. Pre-Response Verification Checklist (Self-Check before output)

Before writing any code or answering a prompt, the AI must silently verify:
- [ ] Are all types explicitly defined in `types/`? (No `any`).
- [ ] Does this file respect the Clean Architecture boundaries?
- [ ] Are client components kept to the minimum interactive boundaries?
- [ ] Are table and column names identical to `rules/supabase_architecture_and_migrations.md`?
- [ ] Are error handlers implemented gracefully using `sonner` toasts?

---

## 3. Quick Command Reference (For Developer)

Use these short commands in your chat with the AI:

### To Start a Specific Phase:
> "Follow `rules/AGENT_PROMPT.md` and implement Phase 1: Core Foundation & Types."

### To Build a Component or Page:
> "Follow `rules/AGENT_PROMPT.md` and build the Guest Checkout Form (`components/storefront/checkout-form.tsx`)."

### To Connect to Supabase:
> "Follow `rules/AGENT_PROMPT.md` and implement the order submission service connecting to Supabase."

### To Review / Debug Code:
> "Follow `rules/AGENT_PROMPT.md` and review this code against our architectural rules and Supabase schema."