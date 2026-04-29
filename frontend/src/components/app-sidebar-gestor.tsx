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
import { useMemo } from "react";
import { useDenuncias } from "@/src/hooks/useDenuncias";
import { useAuthStore } from "@/src/store/useAuthStore";

const items = [
  { title: "Dashboard", url: "/dashboard" },
  { title: "Denúncias Recentes", url: "/denuncias-recentes" },
  { title: "Mapa de Ocorrências", url: "/mapa-ocorrencias" },
];

const parseDate = (dateString: string) => {
  const [day, month, year] = dateString.split('/');
  return new Date(`${year}-${month}-${day}`);
};

export function AppSidebarGestor() {
  const pathname = usePathname();
  const { logout, user } = useAuthStore();
  const { denuncias, loading } = useDenuncias(1, 100);

  const casosPrioritarios = useMemo(() => {
    const tiposPrioritarios = ["Assalto / Violência", "Vandalismo"];
    return (denuncias || [])
      .filter((d) => tiposPrioritarios.includes(d.tipoDenuncia) && d.situacao !== "Finalizada")
      .sort((a, b) => parseDate(b.dataOcorrencia).getTime() - parseDate(a.dataOcorrencia).getTime())
      .slice(0, 2);
  }, [denuncias]);

  return (
    <Sidebar className="bg-stone-100 p-6 rounded-2xl flex flex-col">
      <SidebarHeader className="flex flex-col items-center bg-stone-100 text-center gap-4">
        <div className="relative w-24 h-24 md:w-30 md:h-30 bg-sky-700 rounded-full flex items-center justify-center shadow-md">
          <img src="/logo.svg" alt="Logo" className="w-16 h-16 md:w-20 md:h-20" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-sky-700">S.O.S Cidade</h1>
          <p className="text-sm text-stone-600">
            Bem-vindo(a), Gestor {user?.name ? user.name.split(' ')[0] : ""}
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
        <div className="bg-white p-4 rounded-xl shadow-sm border border-stone-200">
          <h2 className="text-sm uppercase tracking-wide font-bold text-center text-stone-800 mb-4">
            Ocorrências Prioritárias
          </h2>
          <div className="space-y-3">
            {loading ? (
              <p className="text-center text-xs text-stone-500 animate-pulse">Carregando...</p>
            ) : casosPrioritarios.length > 0 ? (
              casosPrioritarios.map((d, index) => (
                <div key={d.protocolo || index} className="p-3 bg-stone-50 rounded-lg border border-stone-100 hover:border-red-200 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-1.5">
                      <p className="font-bold text-sky-700 text-sm leading-none">{d.tipoDenuncia}</p>
                      <p className="text-xs text-stone-500 font-mono leading-none">{d.protocolo}</p>
                    </div>
                    <span className="relative flex h-2.5 w-2.5 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-xs text-stone-500 py-2">Sem ocorrências prioritárias</p>
            )}
          </div>
        </div>
        <p className="text-center text-xs font-medium text-stone-400 mt-4">
          Prefeitura do Recife: (81) 3355-8000
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}
