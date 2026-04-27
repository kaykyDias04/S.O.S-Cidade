"use client";

import * as React from "react";
import { SidebarTrigger } from "@/src/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/src/components/ui/breadcrumb";
import { HouseIcon } from "lucide-react";
import { UserNav } from "./user-nav";

import Link from "next/link"; 
import { usePathname } from "next/navigation"; 

import { useAuthStore } from "@/src/store/useAuthStore";

const formatPathname = (path: string) => {
  return path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, " ");
};

export function SiteHeader() {
  const { user } = useAuthStore();
  
  const homepath = user
    ? user.role === "GESTOR"
      ? "/denuncias-recentes"
      : "/homepage-denunciante"
    : "/";

  const pathname = usePathname(); 
  const pathnames = pathname.split("/").filter((x) => x);

  const breadcrumbNames: Record<string, string> = {
    "homepage-denunciante": "Início",
    "denuncias-recentes": "Denúncias Recentes",
    "mapa-ocorrencias": "Mapa de Ocorrências",
    "minhas-denuncias": "Minhas Denúncias",
    "nova-denuncia": "Nova Denúncia",
  };

  const lastPath = pathnames[pathnames.length - 1];
  const mainTitle = lastPath ? (breadcrumbNames[lastPath] || formatPathname(lastPath)) : "Início";

  return (
    <header className="flex flex-col shrink-0 bg-white">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6 py-4">
        <div className="inline-block relative group">
          <SidebarTrigger className="-ml-1" />
          <div
            className="absolute top-full left-24 transform -translate-x-1/2 mt-2 p-2 bg-white text-black text-sm font-medium rounded shadow-lg 
                       opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-200 whitespace-nowrap
                       z-50"
          >
            Abrir/Fechar Barra Lateral
          </div>
        </div>
        <div className="flex flex-col gap-y-1">
          <h1 className="text-lg font-medium">{mainTitle}</h1>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href={homepath} aria-label="Início">
                    <HouseIcon className="w-4 h-4 text-slate-500 hover:text-slate-700" />
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              
              {pathnames.map((value, index) => {
                const to = `/${pathnames.slice(0, index + 1).join("/")}`;
                const isLast = index === pathnames.length - 1;
                const displayName = breadcrumbNames[value] || formatPathname(value);

                return (
                  <React.Fragment key={to}>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      {isLast ? (
                        <BreadcrumbPage className="text-md font-normal text-slate-900">
                          {displayName}
                        </BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink asChild>
                          <Link href={to} className="text-md font-normal text-slate-500 hover:text-slate-700">
                            {displayName}
                          </Link>
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </React.Fragment>
                );
              })}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <UserNav />
        </div>
      </div>
      <div className="h-2 w-full bg-stone-100" />
    </header>
  );
}
