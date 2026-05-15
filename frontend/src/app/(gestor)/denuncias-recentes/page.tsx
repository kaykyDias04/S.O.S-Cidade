"use client";

import { useEffect, useState } from "react";
import { DenunciasDataTable, DenunciaRow } from "@/src/components/gestor-data-table";
import { useDenuncias } from "@/src/hooks/useDenuncias";
import { DataTableSkeleton } from "@/src/components/data-table-skeleton";

export default function DenunciasRecentesPage() {
  const { denuncias, loading, error, refetch } = useDenuncias(1, 50);
  const [data, setData] = useState<DenunciaRow[]>([]);

  useEffect(() => {
    if (denuncias) {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      const filtered = denuncias.filter((d) => {
        const isFinalizada = d.situacao?.toLowerCase() === "finalizada";
        const isOlderThanOneMonth = new Date(d.createdAt) < oneMonthAgo;
        return !(isFinalizada && isOlderThanOneMonth);
      });

      const converted = filtered.map((d) => ({
        id: d.id,
        tipoDenuncia: d.tipoDenuncia,
        identificacao: d.identificacao,
        nomeDenunciante: (d as any).nomeDenunciante || (d as any).nomeDenunciante || "Anônimo",
        bairroOcorrencia: (d as any).bairroOcorrencia || (d as any).localOcorrencia || "",
        descricaoOcorrencia: d.descricaoOcorrencia,
        dataOcorrencia: d.dataOcorrencia,
        protocolo: d.protocolo,
        situacao: d.situacao,
        imagens: d.imagens,
      }));
      setData(converted);
    }
  }, [denuncias]);

  if (loading) {
    return (
      <div className="w-full">
        <DataTableSkeleton columns={8} rows={8} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-red-600 mb-4">Erro ao carregar denúncias: {error}</p>
          <p className="text-gray-500 text-sm mb-4">
            Verifique se o servidor está rodando em <code className="bg-gray-100 px-1 rounded">{process.env.NEXT_PUBLIC_API_URL}</code>
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
    <div className="w-full space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Lista de denúncias recentes</h1>
        <p className="text-slate-500">Visualize todas as denúncias dos últimos dias</p>
      </div>
      <div className="w-full bg-white rounded-xl shadow-sm border border-stone-200 p-4">
        <DenunciasDataTable data={data} />
      </div>
    </div>
  );
}
