"use client";

import { useEffect, useState, useMemo } from "react";
import { DenuncianteDenunciasDataTable, type DenunciaRow } from "@/src/components/denunciante-data-table";
import { useDenuncias } from "@/src/hooks/useDenuncias";
import { useAuthStore } from "@/src/store/useAuthStore";

export default function MinhasDenunciasPage() {
  const { denuncias, loading, error, refetch } = useDenuncias(1, 50);
  const { user } = useAuthStore();
  const [data, setData] = useState<DenunciaRow[]>([]);

  const minhasDenuncias = useMemo(() => {
    if (!denuncias || !user?.name) return [];

    return denuncias
      .filter((d) => d.nomeDenunciante === user.name)
      .map((d) => ({
        id: d.id,
        tipoDenuncia: d.tipoDenuncia,
        identificacao: d.identificacao,
        nomeDenunciante: (d as any).nomeDenunciante || "Anônimo",
        bairroOcorrencia: (d as any).bairroOcorrencia || "",
        descricaoOcorrencia: d.descricaoOcorrencia,
        dataOcorrencia: d.dataOcorrencia,
        protocolo: d.protocolo,
        situacao: d.situacao,
      }));
  }, [denuncias, user?.name]);

  useEffect(() => {
    setData(minhasDenuncias);
  }, [minhasDenuncias]);

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center p-8">
        <p className="text-gray-600">Carregando denúncias...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-red-600 mb-4">Erro ao carregar denúncias: {error}</p>
          <p className="text-gray-500 text-sm mb-4">
            Verifique se o servidor está rodando em <code className="bg-gray-100 px-1 rounded">http://localhost:8000</code>
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
      <DenuncianteDenunciasDataTable data={data} />
    </div>
  );
}
