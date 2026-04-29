"use client";

import { useState, useMemo } from "react";
import { useDenuncias } from "@/src/hooks/useDenuncias";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Filter, AlertCircle } from "lucide-react";

const COLORS = ['rgba(44, 105, 175, 1)', '#58d69bff', '#ffdd55ff', '#c65b5bff', '#b48edcff', '#8fa2b9ff'];

export default function DashboardPage() {
  const { denuncias, loading, error } = useDenuncias(1, 1000);

  const [bairroFilter, setBairroFilter] = useState("Todos");
  const [situacaoFilter, setSituacaoFilter] = useState("Todas");

  const bairrosUnicos = useMemo(() => {
    const bairros = new Set(denuncias.map((d) => d.bairroOcorrencia));
    return ["Todos", ...Array.from(bairros)].sort();
  }, [denuncias]);

  const situacoesUnicas = useMemo(() => {
    const situacoes = new Set(denuncias.map((d) => d.situacao));
    return ["Todas", ...Array.from(situacoes)].sort();
  }, [denuncias]);

  const filteredDenuncias = useMemo(() => {
    return denuncias.filter((d) => {
      const matchBairro = bairroFilter === "Todos" || d.bairroOcorrencia === bairroFilter;
      const matchSituacao = situacaoFilter === "Todas" || d.situacao === situacaoFilter;
      return matchBairro && matchSituacao;
    });
  }, [denuncias, bairroFilter, situacaoFilter]);

  const dataPorTipo = useMemo(() => {
    const contagem = filteredDenuncias.reduce((acc, d) => {
      acc[d.tipoDenuncia] = (acc[d.tipoDenuncia] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(contagem)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredDenuncias]);

  const dataPorSituacao = useMemo(() => {
    const contagem = filteredDenuncias.reduce((acc, d) => {
      acc[d.situacao] = (acc[d.situacao] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(contagem).map(([name, value]) => ({ name, value }));
  }, [filteredDenuncias]);

  const dataPorBairro = useMemo(() => {
    const contagem = filteredDenuncias.reduce((acc, d) => {
      acc[d.bairroOcorrencia] = (acc[d.bairroOcorrencia] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(contagem)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [filteredDenuncias]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[50vh] text-red-400">
        <AlertCircle className="w-8 h-8 mb-4" />
        <p className="text-sm">Erro ao carregar dados: {error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto bg-white rounded-xl md:rounded-2xl border border-stone-200 p-4 md:p-6 overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-stone-100 pb-4 md:pb-6">
        <div className="w-full md:w-auto">
          <h1 className="text-lg md:text-xl font-semibold text-stone-700">Dashboard Interativo</h1>
          <p className="text-xs md:text-sm text-stone-400 mt-1">Visão geral e estatísticas das ocorrências.</p>
        </div>

        <div className="flex flex-wrap w-full md:w-auto gap-3 items-center bg-stone-50 p-2 md:p-3 rounded-lg border border-stone-100">
          <div className="flex items-center gap-1.5 text-stone-500 md:mr-2">
            <Filter className="w-3.5 h-3.5" />
            <span className="text-xs md:text-sm font-medium">Filtros:</span>
          </div>

          <div className="flex items-center gap-2 flex-1 md:flex-none">
            <label htmlFor="bairro-filter" className="text-[10px] md:text-xs font-medium text-stone-500">Bairro</label>
            <select
              id="bairro-filter"
              className="bg-white border border-stone-200 text-stone-600 text-xs md:text-sm rounded-md focus:ring-stone-300 focus:border-stone-300 block w-full md:w-auto py-1.5 px-2 outline-none cursor-pointer transition-colors"
              value={bairroFilter}
              onChange={(e) => setBairroFilter(e.target.value)}
            >
              {bairrosUnicos.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 flex-1 md:flex-none">
            <label htmlFor="situacao-filter" className="text-[10px] md:text-xs font-medium text-stone-500">Situação</label>
            <select
              id="situacao-filter"
              className="bg-white border border-stone-200 text-stone-600 text-xs md:text-sm rounded-md focus:ring-stone-300 focus:border-stone-300 block w-full md:w-auto py-1.5 px-2 outline-none cursor-pointer transition-colors"
              value={situacaoFilter}
              onChange={(e) => setSituacaoFilter(e.target.value)}
            >
              {situacoesUnicas.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {filteredDenuncias.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-stone-400">
          <AlertCircle className="w-8 h-8 mb-3 opacity-50" />
          <p className="text-xs md:text-sm text-center">Nenhuma denúncia encontrada para os filtros selecionados.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
            <div className="bg-white border border-stone-100 rounded-xl p-4 md:p-5">
              <h2 className="text-[10px] md:text-xs font-semibold text-stone-500 mb-4 md:mb-6 uppercase tracking-wider text-center">
                Denúncias por Situação
              </h2>
              <div className="h-48 md:h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dataPorSituacao}
                      cx="50%"
                      cy="50%"
                      innerRadius="55%"
                      outerRadius="75%"
                      paddingAngle={2}
                      labelLine={false}
                      stroke="none"
                      label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                      dataKey="value"
                    >
                      {dataPorSituacao.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: '6px', border: '1px solid #f5f5f4', boxShadow: 'none', fontSize: '11px' }}
                      itemStyle={{ color: '#57534e' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#78716c' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white border border-stone-100 rounded-xl p-4 md:p-5">
              <h2 className="text-[10px] md:text-xs font-semibold text-stone-500 mb-4 md:mb-6 uppercase tracking-wider text-center">
                Tipos Mais Frequentes
              </h2>
              <div className="h-48 md:h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dataPorTipo}
                    layout="vertical"
                    margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#fafaf9" />
                    <XAxis type="number" allowDecimals={false} tick={{ fill: '#a8a29e', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis dataKey="name" type="category" width={85} tick={{ fontSize: 10, fill: '#78716c' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      cursor={{ fill: '#fafaf9' }}
                      contentStyle={{ borderRadius: '6px', border: '1px solid #f5f5f4', boxShadow: 'none', fontSize: '11px' }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={24}>
                      {dataPorTipo.slice(0, 5).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="bg-white border border-stone-100 rounded-xl p-4 md:p-5">
            <h2 className="text-[10px] md:text-xs font-semibold text-stone-500 mb-4 md:mb-6 uppercase tracking-wider text-center">
              Top 10 Bairros com Mais Ocorrências
            </h2>
            <div className="h-56 md:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dataPorBairro}
                  margin={{ top: 10, right: 10, left: -20, bottom: 45 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#fafaf9" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    interval={0}
                    height={50}
                    tick={{ fontSize: 10, fill: '#78716c' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis allowDecimals={false} tick={{ fill: '#a8a29e', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: '#fafaf9' }}
                    contentStyle={{ borderRadius: '6px', border: '1px solid #f5f5f4', boxShadow: 'none', fontSize: '11px' }}
                  />
                  <Bar dataKey="value" fill={COLORS[0]} radius={[4, 4, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}