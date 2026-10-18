"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Lock, Mail, ArrowRight, Wrench, KeyRound, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = React.useState("admin@store.com");
  const [password, setPassword] = React.useState("admin123");
  const [isLoading, setIsLoading] = React.useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      toast.success("تم تسجيل الدخول بنجاح! مرحباً بك في لوحة تحكم تكنو تولز");
      router.push("/admin/dashboard");
    }, 500);
  };

  const handleFillDemo = () => {
    setUsername("admin@store.com");
    setPassword("admin123");
    toast.info("تم ملء بيانات الدخول التجريبية");
  };

  return (
    <main className="min-h-screen bg-slate-100 dark:bg-[#070b16] flex flex-col justify-center items-center p-4 relative overflow-hidden text-right select-none transition-colors duration-200">
      {/* Top Bar with Theme Toggle */}
      <div className="absolute top-4 left-4 z-20">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-600 text-white shadow-xl shadow-orange-600/30">
            <Wrench className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center justify-center gap-1.5">
              <span>لوحة إدارة تكنو تولز</span>
              <Sparkles className="h-4 w-4 text-orange-500" />
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              أدخل بيانات الدخول لمتابعة الطلبات، المدفوعات اليدوية، والمنتجات
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-7 shadow-xl dark:shadow-2xl backdrop-blur-xl space-y-5">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                اسم المستخدم أو البريد الإلكتروني
              </label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin@store.com"
                required
                className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-left focus:border-orange-500"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                كلمة المرور
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-left focus:border-orange-500"
                dir="ltr"
              />
            </div>

            <Button
              type="submit"
              size="lg"
              isLoading={isLoading}
              className="w-full shadow-lg shadow-orange-600/25 font-bold"
            >
              <span>تسجيل الدخول للوحة التحكم</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          {/* Quick Demo Fill button */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
            <button
              type="button"
              onClick={handleFillDemo}
              className="inline-flex items-center gap-1.5 text-xs text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 font-bold cursor-pointer transition-colors"
            >
              <KeyRound className="h-3.5 w-3.5" />
              <span>ملء بيانات الدخول التجريبية تلقائياً</span>
            </button>
          </div>
        </div>

        {/* Back to Storefront Link */}
        <div className="text-center">
          <Link
            href="/"
            className="text-xs text-slate-500 hover:text-orange-600 dark:text-slate-400 dark:hover:text-orange-400 transition-colors inline-flex items-center gap-1 font-bold"
          >
            <span>← العودة لمتجر الأدوات والمعدات</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
