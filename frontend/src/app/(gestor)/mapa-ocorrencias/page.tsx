"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { Skeleton } from "@/src/components/ui/skeleton";
import { denunciasAPI, Denuncia } from "@/src/lib/api";

const MapaOcorrencias = dynamic(
  () =>
    import("@/src/components/mapa-ocorrencias").then(
      (mod) => mod.MapaOcorrencias
    ),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-4">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-80" />
        </div>
        <Skeleton className="w-full h-[500px] rounded-xl" />
      </div>
    ),
  }
);

export default function MapaOcorrenciasPage() {
  const [denuncias, setDenuncias] = useState<Denuncia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let allData: Denuncia[] = [];
      let page = 1;
      let hasMore = true;
      const MAX_PAGES = 10; // previne loop infinito (até 1000 itens)

      while (hasMore && page <= MAX_PAGES) {
        const res = await denunciasAPI.list(page, 100);
        if (res.success && res.data) {
          const paginatedData = res.data as any;
          const items = Array.isArray(paginatedData) ? paginatedData : (paginatedData.data || []);
          allData = [...allData, ...items];
          
          if (items.length < 100) {
            hasMore = false;
          } else {
            page++;
          }
        } else {
          throw new Error(res.error || "Erro ao carregar");
        }
      }
      
      setDenuncias(allData);
    } catch (e: any) {
      setError(e.message || "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  if (loading) {
    return (
      <div className="w-full">
        <div className="space-y-4">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-80" />
          </div>
          <Skeleton className="w-full h-[500px] rounded-xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-red-600 mb-4">Erro ao carregar denúncias: {error}</p>
          <p className="text-gray-500 text-sm mb-4">
            Verifique se o servidor está rodando em{" "}
            <code className="bg-gray-100 px-1 rounded">http://localhost:8000</code>
          </p>
          <button
            onClick={fetchAll}
            className="px-4 py-2 bg-sky-700 text-white rounded hover:bg-sky-800"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <MapaOcorrencias denuncias={denuncias} />
    </div>
  );
}
