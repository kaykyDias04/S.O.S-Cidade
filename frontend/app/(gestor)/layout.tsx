"use client";

import React from "react";
import { SidebarProvider, SidebarInset } from "@/src/components/ui/sidebar";
import { AppSidebarGestor } from "@/src/components/app-sidebar-gestor";
import { SiteHeader } from "@/src/components/site-header";

export default function LayoutGestor({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-white">
        <AppSidebarGestor />
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
