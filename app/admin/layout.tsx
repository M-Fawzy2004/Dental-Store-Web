"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#070b16] text-slate-100 flex flex-col lg:flex-row antialiased selection:bg-cyan-500 selection:text-white">
      <AdminSidebar />
      <div className="flex-1 min-w-0 flex flex-col bg-[#0a1122] overflow-y-auto min-h-screen">
        {children}
      </div>
    </div>
  );
}
