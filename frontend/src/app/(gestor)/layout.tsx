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
      <div className="flex flex-1 min-h-0 w-full bg-white">
        <AppSidebarGestor />
        <SidebarInset className="flex flex-col flex-1 overflow-hidden">
          <SiteHeader />
          <main className="flex-1 p-4 overflow-y-auto bg-white">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
