"use client";

import { useEffect, useState } from "react";
import { GestoresDataTable } from "@/src/components/gestores-data-table";
import { User, usersAPI } from "@/src/lib/api";
import { DataTableSkeleton } from "@/src/components/data-table-skeleton";

export default function GestoresPage() {
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGestores = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await usersAPI.list("GESTOR");
      if (response.success && response.data) {
        setData(response.data);
      } else {
        setError(response.error || "Erro ao carregar gestores.");
      }
    } catch (err: any) {
      setError(err.message || "Erro desconhecido ao carregar gestores.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGestores();
  }, []);

  if (loading) {
    return (
      <div className="w-full">
        <DataTableSkeleton columns={4} rows={6} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-red-600 mb-4">Erro: {error}</p>
          <button
            onClick={fetchGestores}
            className="px-4 py-2 bg-sky-700 text-white rounded hover:bg-sky-800 cursor-pointer"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <GestoresDataTable data={data} onRefresh={fetchGestores} />
    </div>
  );
}
