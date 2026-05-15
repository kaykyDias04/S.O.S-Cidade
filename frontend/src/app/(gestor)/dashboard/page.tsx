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
  ComposedChart,
  Line,
} from "recharts";
import {
  Filter,
  AlertCircle,
  Clock,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  BarChart3,
  Calendar,
  Minus
} from "lucide-react";
import { DashboardSkeleton } from "@/src/components/dashboard-skeleton";

const COLORS = ['rgba(44, 105, 175, 1)', '#58d69bff', '#ffdd55ff', '#c65b5bff', '#b48edcff', '#8fa2b9ff'];

// Helpers para datas
function getHoursDiff(start: string, end: string) {
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  return (e - s) / (1000 * 60 * 60);
}

// Considerados como tipos críticos para KPI
const CRITICAL_TYPES = ["alagamento / esgoto", "assalto / violencia", "vandalismo", "buraco na via"];

export default function DashboardPage() {
  const { denuncias, loading, error } = useDenuncias(1, 1000);

  const [bairroFilter, setBairroFilter] = useState("Todos");
  const [situacaoFilter, setSituacaoFilter] = useState("Todas");
  const [periodoFilter, setPeriodoFilter] = useState("Mês");

  const bairrosUnicos = useMemo(() => {
    const bairros = new Set(denuncias.map((d) => d.bairroOcorrencia));
    return ["Todos", ...Array.from(bairros)].sort();
  }, [denuncias]);

  const situacoesUnicas = useMemo(() => {
    const situacoes = new Set(denuncias.map((d) => d.situacao));
    return ["Todas", ...Array.from(situacoes)].sort();
  }, [denuncias]);

  // Divisão de períodos para cálculos de tendência
  const { currentPeriodDenuncias, previousPeriodDenuncias } = useMemo(() => {
    const now = new Date();
    const periodDays = periodoFilter === "Hoje" ? 1 : periodoFilter === "Semana" ? 7 : periodoFilter === "Mês" ? 30 : Infinity;

    const current: typeof denuncias = [];
    const prev: typeof denuncias = [];

    const periodMs = periodDays * 24 * 60 * 60 * 1000;

    denuncias.forEach(d => {
      // Aplicar filtros base
      if (bairroFilter !== "Todos" && d.bairroOcorrencia !== bairroFilter) return;
      if (situacaoFilter !== "Todas" && d.situacao !== situacaoFilter) return;

      const dDate = new Date(d.createdAt).getTime();
      const diffMs = now.getTime() - dDate;

      if (periodDays === Infinity) {
        current.push(d);
      } else {
        if (diffMs <= periodMs) {
          current.push(d);
        } else if (diffMs > periodMs && diffMs <= periodMs * 2) {
          prev.push(d);
        }
      }
    });

    return { currentPeriodDenuncias: current, previousPeriodDenuncias: prev };
  }, [denuncias, bairroFilter, situacaoFilter, periodoFilter]);

  // Cálculo das métricas dos painéis
  const calculateMetrics = (data: typeof denuncias) => {
    const total = data.length;
    const resolved = data.filter(d => d.situacao.toLowerCase() === "finalizada");
    const resolutividade = total > 0 ? (resolved.length / total) * 100 : 0;

    let slaSum = 0;
    resolved.forEach(d => {
      slaSum += getHoursDiff(d.createdAt, d.updatedAt);
    });
    const slaAvg = resolved.length > 0 ? slaSum / resolved.length : 0;

    const critical = data.filter(d =>
      d.situacao.toLowerCase() !== "finalizada" &&
      CRITICAL_TYPES.includes(d.tipoDenuncia.toLowerCase())
    ).length;

    return { total, resolutividade, slaAvg, critical };
  };

  const currentMetrics = calculateMetrics(currentPeriodDenuncias);
  const prevMetrics = calculateMetrics(previousPeriodDenuncias);

  // Formatação de Tendência (Sparklines/Setas)
  const renderTrend = (current: number, prev: number, invertGood = false, isPercentage = false) => {
    if (periodoFilter === "Todos") return <span className="text-stone-400 text-[10px]">vs todo período</span>;
    if (prev === 0) {
      return current > 0
        ? <span className="text-emerald-600 text-[10px] flex items-center font-semibold"><TrendingUp className="w-3 h-3 mr-0.5" /> 100%</span>
        : <span className="text-stone-400 text-[10px]">Sem dados anteriores</span>;
    }

    const diff = current - prev;
    const percent = isPercentage ? diff : (Math.abs(diff) / prev) * 100; // se for taxa (ex: resolutividade), a diferença já é a variação percentual absoluta
    if (diff === 0) return <span className="text-stone-400 text-[10px] flex items-center font-semibold"><Minus className="w-3 h-3 mr-0.5" /> 0%</span>;

    const isUp = diff > 0;
    let isGood = isUp;
    if (invertGood) isGood = !isUp; // Para SLA e Críticas, queda é bom.

    return (
      <span className={`flex items-center text-[10px] font-semibold ${isGood ? 'text-emerald-600' : 'text-rose-600'}`}>
        {isUp ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
        {percent.toFixed(1)}% {isPercentage ? 'pp' : ''}
      </span>
    );
  };

  const formatSla = (hours: number) => {
    if (hours === 0) return "-";
    if (hours < 24) return `${hours.toFixed(1)}h`;
    return `${(hours / 24).toFixed(1)}d`;
  };

  // Dados para gráficos
  const dataPorTipo = useMemo(() => {
    const contagem = currentPeriodDenuncias.reduce((acc, d) => {
      acc[d.tipoDenuncia] = (acc[d.tipoDenuncia] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const prevContagem = previousPeriodDenuncias.reduce((acc, d) => {
      acc[d.tipoDenuncia] = (acc[d.tipoDenuncia] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(contagem)
      .map(([name, value]) => {
        const prevValue = prevContagem[name] || 0;
        const trend = prevValue > 0 ? ((value - prevValue) / prevValue) * 100 : (value > 0 ? 100 : 0);
        return { name, value, trend };
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [currentPeriodDenuncias, previousPeriodDenuncias]);

  const dataPorSituacao = useMemo(() => {
    const contagem = currentPeriodDenuncias.reduce((acc, d) => {
      acc[d.situacao] = (acc[d.situacao] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(contagem).map(([name, value]) => ({ name, value }));
  }, [currentPeriodDenuncias]);

  const dataPorBairro = useMemo(() => {
    const contagem = currentPeriodDenuncias.reduce((acc, d) => {
      if (!acc[d.bairroOcorrencia]) acc[d.bairroOcorrencia] = { count: 0, slaSum: 0, resolved: 0 };
      acc[d.bairroOcorrencia].count += 1;
      if (d.situacao.toLowerCase() === "finalizada") {
        acc[d.bairroOcorrencia].resolved += 1;
        acc[d.bairroOcorrencia].slaSum += getHoursDiff(d.createdAt, d.updatedAt);
      }
      return acc;
    }, {} as Record<string, { count: number, slaSum: number, resolved: number }>);

    return Object.entries(contagem)
      .map(([name, data]) => ({
        name,
        Volume: data.count,
        "SLA Médio (h)": data.resolved > 0 ? parseFloat((data.slaSum / data.resolved).toFixed(1)) : 0
      }))
      .sort((a, b) => b.Volume - a.Volume)
      .slice(0, 10);
  }, [currentPeriodDenuncias]);

  if (loading) return <DashboardSkeleton />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[50vh] text-red-400">
        <AlertCircle className="w-8 h-8 mb-4" />
        <p className="text-sm">Erro ao carregar dados: {error}</p>
      </div>
    );
  }

  // Tooltip customizado para mostrar a tendência no gráfico de Tipos
  const CustomTooltipTipos = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const { value, payload: dataPayload } = payload[0];
      const trend = dataPayload.trend;
      return (
        <div className="bg-white border border-stone-100 shadow-sm p-3 rounded-lg text-xs space-y-1">
          <p className="font-bold text-stone-700">{label}</p>
          <p className="text-sky-700">Volume: {value}</p>
          {periodoFilter !== "Todos" && (
            <p className={`font-semibold ${trend > 0 ? 'text-rose-600' : trend < 0 ? 'text-emerald-600' : 'text-stone-400'}`}>
              {trend > 0 ? `+${trend.toFixed(1)}%` : trend < 0 ? `${trend.toFixed(1)}%` : '0%'} vs anterior
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full space-y-4">
      {/* Redução de cabeçalho */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Dashboard Interativo</h1>
          <p className="text-sm text-slate-500">Visão geral e indicadores críticos da cidade</p>
        </div>

        {/* Filtros Movidos para o Topo (Compacto) */}
        <div className="flex flex-wrap w-full md:w-auto gap-2 items-center bg-white p-2 rounded-lg border border-stone-200 shadow-sm">
          <div className="flex items-center gap-1.5 text-stone-500 px-2 border-r border-stone-100">
            <Filter className="w-3.5 h-3.5" />
          </div>

          <div className="flex items-center gap-2">
            <select
              className="bg-stone-50 border border-stone-200 text-stone-700 text-xs rounded-md focus:ring-sky-500 focus:border-sky-500 block py-1.5 px-2 outline-none cursor-pointer"
              value={periodoFilter}
              onChange={(e) => setPeriodoFilter(e.target.value)}
            >
              {["Hoje", "Semana", "Mês", "Todos"].map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <select
              className="bg-stone-50 border border-stone-200 text-stone-700 text-xs rounded-md focus:ring-sky-500 focus:border-sky-500 block py-1.5 px-2 outline-none cursor-pointer max-w-[120px] truncate"
              value={bairroFilter}
              onChange={(e) => setBairroFilter(e.target.value)}
            >
              {bairrosUnicos.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <select
              className="bg-stone-50 border border-stone-200 text-stone-700 text-xs rounded-md focus:ring-sky-500 focus:border-sky-500 block py-1.5 px-2 outline-none cursor-pointer"
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

      {currentPeriodDenuncias.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-stone-200 text-stone-400">
          <AlertCircle className="w-10 h-10 mb-3 opacity-30" />
          <p className="text-sm font-medium text-center">Nenhuma ocorrência registrada para os filtros selecionados no período.</p>
        </div>
      ) : (
        <div className="space-y-4">

          {/* 1. Indicadores Críticos (4 Cards) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">

            {/* Volume Total */}
            <div className="bg-white rounded-xl border border-stone-200 p-3 shadow-sm flex flex-col justify-between hover:border-sky-200 transition-colors">
              <div className="flex justify-between items-start mb-1">
                <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-wide">Total de Chamados</p>
                <div className="p-1 bg-sky-50 text-sky-600 rounded-md"><BarChart3 className="w-3.5 h-3.5" /></div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">{currentMetrics.total}</h3>
                <div className="mt-0.5">{renderTrend(currentMetrics.total, prevMetrics.total, false)}</div>
              </div>
            </div>

            {/* SLA Médio */}
            <div className="bg-white rounded-xl border border-stone-200 p-3 shadow-sm flex flex-col justify-between hover:border-amber-200 transition-colors">
              <div className="flex justify-between items-start mb-1">
                <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-wide">SLA Médio</p>
                <div className="p-1 bg-amber-50 text-amber-600 rounded-md"><Clock className="w-3.5 h-3.5" /></div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">{formatSla(currentMetrics.slaAvg)}</h3>
                <div className="mt-0.5">{renderTrend(currentMetrics.slaAvg, prevMetrics.slaAvg, true)}</div>
              </div>
            </div>

            {/* Resolutividade */}
            <div className="bg-white rounded-xl border border-stone-200 p-3 shadow-sm flex flex-col justify-between hover:border-emerald-200 transition-colors">
              <div className="flex justify-between items-start mb-1">
                <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-wide">Taxa de Resolução</p>
                <div className="p-1 bg-emerald-50 text-emerald-600 rounded-md"><CheckCircle2 className="w-3.5 h-3.5" /></div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">{currentMetrics.resolutividade.toFixed(1)}%</h3>
                <div className="mt-0.5">{renderTrend(currentMetrics.resolutividade, prevMetrics.resolutividade, false, true)}</div>
              </div>
            </div>

            {/* Ocorrências Críticas Ativas */}
            <div className="bg-white rounded-xl border border-stone-200 p-3 shadow-sm flex flex-col justify-between hover:border-rose-200 transition-colors">
              <div className="flex justify-between items-start mb-1">
                <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-wide">Críticas Ativas</p>
                <div className="p-1 bg-rose-50 text-rose-600 rounded-md"><AlertTriangle className="w-3.5 h-3.5" /></div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-rose-600">{currentMetrics.critical}</h3>
                <div className="mt-0.5">{renderTrend(currentMetrics.critical, prevMetrics.critical, true)}</div>
              </div>
            </div>

          </div>

          {/* Gráficos Redesenhados */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 md:gap-4">

            {/* Gráfico 1: Tipos Frequentes (Ocupa 7 colunas) */}
            <div className="lg:col-span-8 bg-white border border-stone-200 rounded-xl p-4 shadow-sm flex flex-col">
              <h2 className="text-xs font-semibold text-stone-500 mb-4 uppercase tracking-wider">
                Índice de Reincidência (Top 10 Tipos)
              </h2>
              <div className="flex-1 min-h-[230px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dataPorTipo}
                    layout="vertical"
                    margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f5f5f4" />
                    <XAxis type="number" allowDecimals={false} tick={{ fill: '#a8a29e', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis dataKey="name" type="category" width={160} tick={{ fontSize: 10, fill: '#57534e', fontWeight: 500 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltipTipos />} cursor={{ fill: '#fafaf9' }} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={20}>
                      {dataPorTipo.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Gráfico 2: Situação Compactado (Ocupa 4 colunas) */}
            <div className="lg:col-span-4 bg-white border border-stone-200 rounded-xl p-4 shadow-sm flex flex-col items-center">
              <h2 className="text-xs font-semibold text-stone-500 mb-2 uppercase tracking-wider w-full text-left">
                Distribuição de Status
              </h2>
              <div className="w-full flex-1 min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dataPorSituacao}
                      cx="50%"
                      cy="45%"
                      innerRadius="60%"
                      outerRadius="80%"
                      paddingAngle={3}
                      labelLine={false}
                      stroke="none"
                      dataKey="value"
                    >
                      {dataPorSituacao.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: '1px solid #f5f5f4', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                      itemStyle={{ color: '#57534e', fontWeight: 600 }}
                    />
                    <Legend
                      iconType="circle"
                      layout="horizontal"
                      verticalAlign="bottom"
                      align="center"
                      wrapperStyle={{ fontSize: '11px', color: '#78716c', paddingTop: '10px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Gráfico 3: Bairros vs Tempo de Espera (Ocupa 12 colunas) */}
            <div className="lg:col-span-12 bg-white border border-stone-200 rounded-xl p-4 shadow-sm flex flex-col">
              <div className="flex justify-between items-end mb-4">
                <h2 className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                  Top 10 Bairros Críticos (Volume vs Tempo de Espera)
                </h2>
              </div>
              <div className="h-54">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={dataPorBairro}
                    margin={{ top: 10, right: 10, left: -10, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: '#78716c' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    {/* Eixo Y Esquerdo (Volume) */}
                    <YAxis
                      yAxisId="left"
                      allowDecimals={false}
                      tick={{ fill: '#a8a29e', fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    {/* Eixo Y Direito (SLA) */}
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tick={{ fill: '#f59e0b', fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(val) => `${val}h`}
                    />
                    <Tooltip
                      cursor={{ fill: '#fafaf9' }}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #f5f5f4', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Bar yAxisId="left" dataKey="Volume" fill="rgba(44, 105, 175, 0.8)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    <Line yAxisId="right" type="monotone" dataKey="SLA Médio (h)" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: "#f59e0b", strokeWidth: 2, stroke: "#fff" }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}