"use client";

import { SidebarProvider, SidebarInset } from "@/src/components/ui/sidebar";
import { AppSidebarDenunciante } from "@/src/components/app-sidebar-denunciante";
import { SiteHeader } from "@/src/components/site-header";
import React from "react";

export default function LayoutDenunciante({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-white">
        <AppSidebarDenunciante />
        <SidebarInset className="flex flex-col flex-1 overflow-hidden">
          <SiteHeader />
          <main className="flex-1 p-6 overflow-y-auto bg-stone-50">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
