import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import { Toaster } from "sonner";
import { Navbar } from "@/components/storefront/navbar";
import { CartDrawer } from "@/components/storefront/cart-drawer";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "متجر دينتال كير | مستلزمات وأدوات طب الأسنان في مصر",
  description:
    "المتجر الرائد لتوريد جميع مستلزمات وأدوات وعيادات طب الأسنان في مصر. شحن سريع لجميع المحافظات والدفع عند الاستلام أو فودافون كاش وإنستاباي.",
  keywords: [
    "مستلزمات طب اسنان",
    "ادوات اسنان",
    "حشوات كومبوزيت",
    "بنج اسنان",
    "تعقيم عيادات اسنان",
    "مصر",
    "dental store egypt",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} h-full antialiased`}>
      <body className="font-sans min-h-full flex flex-col bg-slate-50 text-slate-900 selection:bg-cyan-500 selection:text-white dark:bg-slate-950 dark:text-slate-100">
        {/* Global Navigation */}
        <Navbar />

        {/* Slide-over Cart Drawer */}
        <CartDrawer />

        {/* Page Content */}
        <div className="flex-1 flex flex-col">{children}</div>

        {/* Sonner Toast Notifications (RTL configured) */}
        <Toaster
          position="top-center"
          dir="rtl"
          richColors
          closeButton
          toastOptions={{
            style: {
              fontFamily: "var(--font-cairo)",
            },
          }}
        />

        {/* Global Clean Medical Footer */}
        <footer className="mt-auto border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center sm:text-right flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1">
              <h3 className="text-base font-black text-cyan-800 dark:text-cyan-400">
                متجر دينتال كير لمستلزمات الأسنان
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                توريدات طبية أصلية 100% لأطباء الأسنان والعيادات والمراكز التخصصية في مصر.
              </p>
            </div>
            <div className="flex items-center gap-6 text-xs text-slate-600 dark:text-slate-400">
              <a
                href="https://wa.me/201012345678"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-emerald-600 transition-colors font-medium flex items-center gap-1.5"
              >
                <span>خدمة العملاء والطلبات: 01012345678</span>
              </a>
              <span>•</span>
              <span>جميع الحقوق محفوظة © 2026</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
