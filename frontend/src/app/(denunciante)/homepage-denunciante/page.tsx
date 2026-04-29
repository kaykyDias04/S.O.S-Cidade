"use client";

import Link from "next/link";
import { AlertTriangle, Check, Bookmark, Book } from "lucide-react";
import { useAuthStore } from "@/src/store/useAuthStore";

export default function HomepageDenunciante() {
  const { user } = useAuthStore();
  const nomeExibicao = user?.name?.split(' ')[0] || "Cidadão";

  return (
    <main className="bg-white p-8 rounded-2xl shadow-md relative">
      <section className="mb-12">
        <h1 className="text-4xl font-bold text-gray-800">Olá, {nomeExibicao}!</h1>
        <p className="text-lg text-gray-500 mt-2">
          Bem-vindo(a) ao S.O.S Cidade — sistema de denúncias urbanas de Recife. O que deseja fazer?
        </p>
      </section>

      <div className="flex flex-col items-center">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">

          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-blue-200 transition-all duration-300 p-6 flex flex-col group">
            <div className="w-14 h-14 rounded-full bg-blue-50 group-hover:bg-blue-100 transition-colors flex items-center justify-center mb-5">
              <AlertTriangle className="w-7 h-7 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Registrar Denúncia</h2>
            <p className="text-gray-600 mt-3 mb-8 flex-grow text-sm leading-relaxed">
              Reporte um problema urbano: buraco na via, iluminação, lixo, assalto, alagamento e mais.
            </p>
            <Link
              href="/nova-denuncia"
              className="bg-blue-600 text-white text-center font-semibold py-3 px-6 rounded-xl transition-all hover:bg-blue-700 hover:shadow-md w-full"
            >
              Nova Denúncia
            </Link>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-blue-200 transition-all duration-300 p-6 flex flex-col group">
            <div className="w-14 h-14 rounded-full bg-blue-50 group-hover:bg-blue-100 transition-colors flex items-center justify-center mb-5">
              <Bookmark className="w-7 h-7 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Minhas Denúncias</h2>
            <p className="text-gray-600 mt-3 mb-8 flex-grow text-sm leading-relaxed">
              Acompanhe o andamento, status e protocolo das denúncias que você já registrou.
            </p>
            <Link
              href="/minhas-denuncias"
              className="bg-white border-2 border-blue-600 text-blue-600 text-center font-semibold py-3 px-6 rounded-xl transition-all hover:bg-blue-50 hover:shadow-sm w-full"
            >
              Minhas Denúncias
            </Link>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-green-200 transition-all duration-300 p-6 flex flex-col group md:col-span-2 lg:col-span-1">
            <div className="w-14 h-14 rounded-full bg-green-50 group-hover:bg-green-100 transition-colors flex items-center justify-center mb-5">
              <Check className="w-7 h-7 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Como Funciona?</h2>
            <p className="text-gray-600 mt-3 mb-6 text-sm leading-relaxed">
              Entenda o fluxo da sua denúncia no S.O.S Cidade.
            </p>
            <div className="space-y-3 text-sm text-gray-600 mt-auto">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 shrink-0 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs mt-0.5">1</span>
                <span className="leading-tight pt-1">Descreva o problema e o bairro</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 shrink-0 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs mt-0.5">2</span>
                <span className="leading-tight pt-1">Receba o número de protocolo</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 shrink-0 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs mt-0.5">3</span>
                <span className="leading-tight pt-1">O gestor analisa e encaminha a denúncia</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 shrink-0 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs mt-0.5">4</span>
                <span className="leading-tight pt-1">Acompanhe as suas denúncias pela aba Minhas Denúncias</span>
              </div>
            </div>
          </div>

        </div>

        <div className="mt-8 w-full max-w-4xl bg-sky-50 border border-sky-200 rounded-2xl p-6">
          <h3 className="font-bold text-sky-800 mb-2">Área de cobertura</h3>
          <p className="text-sky-700 text-sm">
            Este sistema atende denúncias da <strong>Cidade do Recife — PE</strong>.
          </p>
        </div>
      </div>
    </main>
  );
}
