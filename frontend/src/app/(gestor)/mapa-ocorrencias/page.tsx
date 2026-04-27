"use client";

import dynamic from "next/dynamic";
import { useDenuncias } from "@/src/hooks/useDenuncias";
import { Skeleton } from "@/src/components/ui/skeleton";

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
        <Skeleton className="w-full h-[calc(100vh-220px)] min-h-[500px] rounded-xl" />
      </div>
    ),
  }
);

export default function MapaOcorrenciasPage() {
  const { denuncias, loading, error, refetch } = useDenuncias(1, 50);

  if (loading) {
    return (
      <div className="w-full">
        <div className="space-y-4">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-80" />
          </div>
          <Skeleton className="w-full h-[calc(100vh-220px)] min-h-[500px] rounded-xl" />
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
            onClick={() => refetch()}
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
