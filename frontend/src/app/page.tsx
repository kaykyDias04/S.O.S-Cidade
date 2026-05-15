"use client";

import Link from "next/link";
import { Camera, Search, Settings, Lock } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="bg-[#f4f4f4] font-sans flex flex-col flex-1">

      <header className="w-full max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-[#6498c9] rounded-full flex items-center justify-center shadow-sm">
            <img src="/logo.svg" alt="S.O.S Cidade Logo" className="w-6 h-6 md:w-7 md:h-7" />
          </div>
          <h1 className="text-[#6498c9] font-bold text-2xl md:text-3xl tracking-tight">
            S.O.S Cidade
          </h1>
        </div>
        <Link
          href="/login"
          className="text-[#6498c9] font-bold text-xs md:text-sm px-6 py-1.5 border-2 border-[#6498c9] rounded hover:bg-blue-50 transition-colors uppercase"
        >
          Entrar
        </Link>
      </header>

      <section className="relative w-full h-[250px] md:h-[380px]">
        <img
          src="/homepage-assets/Recife-1024x683.jpg"
          alt="Recife"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center text-center px-4">
          <h2
            className="text-white text-3xl md:text-4xl lg:text-5xl font-bold max-w-4xl mb-4 leading-tight drop-shadow-lg"
            style={{ WebkitTextStroke: "0.8px rgba(0,0,0,1)" }}
          >
            Sua voz ajuda a construir uma cidade melhor
          </h2>
          <p className="text-white text-base md:text-lg max-w-2xl mb-8 font-medium drop-shadow-md">
            Relate problemas do cotidiano urbano, infraestrutura ou segurança de forma rápida e segura
          </p>
          <Link
            href="/login"
            className="bg-[#3b82f6] hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-md transition-colors text-sm md:text-base shadow-lg uppercase"
          >
            Faça sua denúncia agora
          </Link>
        </div>
      </section>

      <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-12 flex flex-col gap-16">

        <section className="flex flex-col items-center w-full">
          <h2 className="text-[#6498c9] text-2xl md:text-3xl font-bold mb-10 text-center">
            Como Funciona
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 w-full">
            <div className="flex items-center gap-4">
              <div className="shrink-0 text-black">
                <Camera size={52} strokeWidth={2} />
              </div>
              <div className="flex flex-col">
                <h3 className="font-bold text-lg text-black mb-1">1. RELATE</h3>
                <p className="text-sm font-medium text-black leading-snug">
                  Escolha a categoria e descreva o problema
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="shrink-0 text-black">
                <Search size={52} strokeWidth={2} />
              </div>
              <div className="flex flex-col">
                <h3 className="font-bold text-lg text-black mb-1">2. ACOMPANHE</h3>
                <p className="text-sm font-medium text-black leading-snug">
                  Receba um número de protocolo e siga o status em tempo real
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="shrink-0 text-black">
                <Settings size={52} strokeWidth={2} />
              </div>
              <div className="flex flex-col">
                <h3 className="font-bold text-lg text-black mb-1">3. RESOLVA</h3>
                <p className="text-sm font-medium text-black leading-snug">
                  A prefeitura recebe o chamado e toma as providências
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="flex flex-col lg:flex-row gap-8 items-stretch w-full pb-8">

          <div className="flex-1 flex flex-col gap-6 w-full">
            <div className="bg-white rounded-3xl shadow-sm p-6 md:p-8 flex items-center gap-6 border border-gray-100">

              <div className="shrink-0 flex items-center justify-center">
                <Lock size={64} className="text-black" strokeWidth={1.5} />
              </div>

              <div className="flex flex-col gap-3">
                <h2 className="text-[#6498c9] text-xl md:text-2xl font-bold text-left leading-tight">
                  Sua identidade está protegida
                </h2>
                <p className="font-medium text-black text-sm md:text-base leading-snug">
                  O sistema garante o anonimato ou o sigilo dos seus dados, em total conformidade com a LGPD. Sua segurança é nossa total prioridade
                </p>
              </div>

            </div>

            <div className="overflow-hidden rounded-3xl shadow-sm w-full flex-1 relative min-h-[160px]">
              <img
                src="/homepage-assets/476837-PGTV1I-985.jpg"
                alt="Pessoas diversas"
                className="absolute inset-0 w-full h-full object-cover object-top"
              />
            </div>
          </div>

          <div className="flex-[1.2] flex flex-col w-full">
            <h2 className="text-[#6498c9] text-2xl md:text-3xl font-bold text-center leading-tight mb-8">
              O que você pode<br />denunciar
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              {[
                { title: "Foco de Dengue", icon: "mosquito icon.png" },
                { title: "Iluminação Pública", icon: "poste-de-iluminacao icon.png" },
                { title: "Falta D'água", icon: "abastecimento-de-agua icon.png" },
                { title: "Alagamento", icon: "enchente icon.png" },
                { title: "Descarte Irregular de Lixo", icon: "saco-de-lixo icon.png" },
                { title: "Buraco na Via", icon: "buraco na via icon.png" }
              ].map((item, idx) => (
                <div key={idx} className="bg-white rounded-2xl shadow-sm p-4 px-6 flex items-center gap-5 border border-gray-100 h-[100px] hover:shadow-md transition-shadow cursor-pointer">
                  <div className="w-12 h-12 shrink-0 flex items-center justify-center">
                    <img
                      src={`/homepage-assets/${item.icon}`}
                      alt={item.title}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <h3 className="font-bold text-black text-sm md:text-base leading-tight">
                    {item.title}
                  </h3>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}