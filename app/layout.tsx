import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { StorefrontShell } from "@/components/storefront/storefront-shell";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "متجر الأدوات والمعدات الهندسية والطبية | توريدات أصلية في مصر",
  description:
    "المتجر الرائد لتوريد جميع الأدوات والمعدات الهندسية والطبية الأصلية في مصر. شحن سريع لجميع المحافظات والدفع عند الاستلام أو فودافون كاش وإنستاباي.",
  keywords: [
    "ادوات هندسية",
    "معدات طبية",
    "ادوات اسنان",
    "اجهزة قياس دقيقة",
    "توريدات مصانع وعيادات",
    "مصر",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="font-sans min-h-full flex flex-col bg-slate-50 text-slate-900 selection:bg-orange-500 selection:text-white dark:bg-[#090d16] dark:text-slate-100 transition-colors duration-200">
        <ThemeProvider>
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
        </ThemeProvider>
      </body>
    </html>
  );
}
