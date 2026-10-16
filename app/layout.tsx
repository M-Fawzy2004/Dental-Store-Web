import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import { Toaster } from "sonner";
import { StorefrontShell } from "@/components/storefront/storefront-shell";
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
        {/* StorefrontShell conditionally renders Navbar & Footer only for customer storefront, NOT admin */}
        <StorefrontShell>{children}</StorefrontShell>

        {/* Global Toast Notifications (RTL configured) */}
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
      </body>
    </html>
  );
}
