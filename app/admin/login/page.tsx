"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Lock, Mail, ArrowRight, Stethoscope, KeyRound, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = React.useState("admin@dentalstore.com");
  const [password, setPassword] = React.useState("admin123");
  const [isLoading, setIsLoading] = React.useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      toast.success("تم تسجيل الدخول بنجاح! مرحباً بك في لوحة تحكم دينتال كير");
      router.push("/admin/dashboard");
    }, 500);
  };

  const handleFillDemo = () => {
    setUsername("admin@dentalstore.com");
    setPassword("admin123");
    toast.info("تم ملء بيانات الدخول التجريبية");
  };

  return (
    <main className="min-h-screen bg-[#070b16] flex flex-col justify-center items-center p-4 relative overflow-hidden text-right select-none">
      {/* Background glow effects */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-teal-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 via-teal-500 to-emerald-400 text-slate-950 shadow-xl shadow-cyan-900/40">
            <Stethoscope className="h-7 w-7 text-slate-950" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-white flex items-center justify-center gap-1.5">
              <span>لوحة تحكم دينتال كير</span>
              <Sparkles className="h-4 w-4 text-cyan-400" />
            </h1>
            <p className="text-xs text-slate-400">
              أدخل اسم المستخدم وكلمة المرور الخاصة بك لمتابعة طلبات العيادات والمخزون
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="rounded-3xl border border-slate-800 bg-[#0e172c]/90 p-7 shadow-2xl backdrop-blur-xl space-y-5">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                اسم المستخدم أو البريد الإلكتروني
              </label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin@dentalstore.com"
                required
                className="bg-[#091020] border-slate-700 text-white font-mono text-left focus:border-cyan-500 focus:ring-cyan-500"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                كلمة المرور
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="bg-[#091020] border-slate-700 text-white font-mono text-left focus:border-cyan-500 focus:ring-cyan-500"
                dir="ltr"
              />
            </div>

            <Button
              type="submit"
              size="lg"
              isLoading={isLoading}
              className="w-full shadow-lg shadow-cyan-900/30 font-bold"
            >
              <span>تسجيل الدخول للوحة التحكم</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          {/* Quick Demo Fill button */}
          <div className="pt-3 border-t border-slate-800/80 text-center">
            <button
              type="button"
              onClick={handleFillDemo}
              className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-bold cursor-pointer transition-colors"
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
            className="text-xs text-slate-400 hover:text-cyan-400 transition-colors inline-flex items-center gap-1 font-bold"
          >
            <span>← العودة لمتجر العملاء والعيادات</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
