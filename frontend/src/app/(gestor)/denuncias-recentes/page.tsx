"use client";

import { useEffect, useState } from "react";
import { DenunciasDataTable, DenunciaRow } from "@/src/components/gestor-data-table";
import { useDenuncias } from "@/src/hooks/useDenuncias";

export default function DenunciasRecentesPage() {
  const { denuncias, loading, error, refetch } = useDenuncias(1, 50);
  const [data, setData] = useState<DenunciaRow[]>([]);

  useEffect(() => {
    if (denuncias && denuncias.length > 0) {
      const converted = denuncias.map((d) => ({
        tipoDenuncia: d.tipoDenuncia,
        identificacao: d.identificacao,
        nomeDenunciante: (d as any).nomeDenunciante || (d as any).nomeAluno || "Anônimo",
        bairroOcorrencia: (d as any).bairroOcorrencia || (d as any).localOcorrencia || "",
        descricaoOcorrencia: d.descricaoOcorrencia,
        dataOcorrencia: d.dataOcorrencia,
        protocolo: d.protocolo,
        situacao: d.situacao,
      }));
      setData(converted);
    }
  }, [denuncias]);

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
      <DenunciasDataTable data={data} />
    </div>
  );
}
