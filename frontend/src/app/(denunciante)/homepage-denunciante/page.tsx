"use client";

import Link from "next/link";
import { AlertTriangle, Check } from "lucide-react";
import { useAuth } from "@/src/contexts/auth-context";

export default function HomepageDenunciante() {
  const { user } = useAuth();
  const nomeExibicao = user?.name?.split(' ')[0] || "Cidadão";

  return (
    <main className="p-8 relative bg-white rounded-2xl">
      <section className="mb-12">
        <h1 className="text-4xl font-bold text-gray-800">Olá, {nomeExibicao}!</h1>
        <p className="text-lg text-gray-500 mt-2">
          Bem-vindo(a) ao S.O.S Cidade — sistema de denúncias urbanas de Recife. O que deseja fazer?
        </p>
      </section>

      <div className="flex flex-col items-center">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">

          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 flex flex-col">
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              <AlertTriangle className="w-7 h-7 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Registrar Denúncia</h2>
            <p className="text-gray-600 mt-2 mb-6 flex-grow">
              Reporte um problema urbano: buraco na via, iluminação, lixo, assalto, alagamento e mais.
            </p>
            <Link
              href="/nova-denuncia"
              className="bg-blue-600 text-white text-center font-semibold py-3 px-6 rounded-xl transition hover:bg-blue-700"
            >
              Nova Denúncia
            </Link>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 flex flex-col">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <Check className="w-7 h-7 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Como Funciona</h2>
            <p className="text-gray-600 mt-2 mb-6 flex-grow">
              Registre o problema, receba um protocolo e acompanhe o encaminhamento junto à Prefeitura do Recife.
            </p>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">1</span>
                <span>Descreva o problema e o bairro</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">2</span>
                <span>Receba o número de protocolo</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">3</span>
                <span>O gestor analisa e encaminha</span>
              </div>
            </div>
          </div>

        </div>

        <div className="mt-8 w-full max-w-4xl bg-sky-50 border border-sky-200 rounded-2xl p-6">
          <h3 className="font-bold text-sky-800 mb-2">📍 Área de cobertura</h3>
          <p className="text-sky-700 text-sm">
            Este sistema atende denúncias da <strong>Região Metropolitana do Recife — PE</strong>.
            Bairros de Recife, Olinda, Caruaru e municípios vizinhos podem ser registrados.
          </p>
        </div>
      </div>
    </main>
  );
}
