'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/src/components/ui/sidebar";
import Link from "next/link"; 
import { usePathname } from "next/navigation";
import { useDenuncias } from "@/src/hooks/useDenuncias";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useMemo } from "react";

const items = [
  { title: "Início", url: "/homepage-denunciante" },
  { title: "Minhas Denúncias", url: "/minhas-denuncias" },
  { title: "Nova Denúncia", url: "/nova-denuncia" },
];

const getStatusColor = (situacao: string) => {
  const s = situacao.toLowerCase();
  if (s.includes("finalizada")) return "bg-green-500";
  if (s.includes("andamento")) return "bg-orange-400";
  return "bg-blue-400";
};

export function AppSidebarDenunciante() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { denuncias, loading } = useDenuncias(1, 50);

  const denunciasRecentes = useMemo(() => {
    return (denuncias || [])
      .filter((d) => {
        
        if (user?.id && (d as any).userId) {
          return (d as any).userId === user.id;
        }
        
        return d.nomeDenunciante === user?.name;
      })
      .slice(0, 2)
      .map((d) => ({
        id: d.protocolo,
        status: d.situacao,
        statusColor: getStatusColor(d.situacao),
      }));
  }, [denuncias, user]);

  return (
    <Sidebar className="bg-stone-100 p-6 rounded-2xl flex flex-col">
      <SidebarHeader className="flex flex-col items-center bg-stone-100 text-center gap-4">
        <div className="relative w-24 h-24 md:w-30 md:h-30 bg-sky-700 rounded-full flex items-center justify-center shadow-md">
          <img src="/logo.svg" alt="Logo" className="w-16 h-16 md:w-20 md:h-20" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-sky-700">S.O.S Cidade</h1>
          <p className="text-sm text-stone-600">
            Olá, {user?.name ? user.name.split(' ')[0] : "Cidadão"}
          </p>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-stone-100 pt-10">
        <SidebarMenu>
          {items.map((item) => {
            const isActive = pathname === item.url;
            return (
              <SidebarMenuItem key={item.title} className="mb-2">
                <Link
                  href={item.url}
                  className={`
                    flex items-center w-full p-3 rounded-lg text-lg font-semibold
                    transition-colors duration-200
                    ${isActive ? "bg-sky-700 text-white" : "text-stone-700 hover:bg-stone-200"}
                  `}
                >
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="mt-auto pt-6 border-t bg-stone-100 border-stone-200">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h2 className="text-md font-bold text-stone-800 mb-3">
            Minhas Denúncias Recentes
          </h2>
          <div className="space-y-3">
            {loading ? (
              <p className="text-center text-sm text-stone-500">Carregando...</p>
            ) : denunciasRecentes.length > 0 ? (
              denunciasRecentes.map((d) => (
                <div key={d.id} className="flex justify-between items-center text-sm">
                  <div>
                    <p className="font-semibold text-stone-700">{d.id}</p>
                    <p className="text-stone-500">{d.status}</p>
                  </div>
                  <span className={`w-3 h-3 rounded-full ${d.statusColor}`}></span>
                </div>
              ))
            ) : (
              <p className="text-center text-sm text-stone-500">Nenhuma denúncia registrada</p>
            )}
          </div>
        </div>
        <p className="text-center text-xs text-stone-500 mt-4">
          Prefeitura do Recife: (81) 3355-8000
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}
