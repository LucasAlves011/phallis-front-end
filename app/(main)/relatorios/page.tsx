// Arquivo: app/(main)/relatorios/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
   AreaChart,
   Area,
   BarChart,
   Bar,
   PieChart,
   Pie,
   Cell,
   XAxis,
   YAxis,
   CartesianGrid,
   Tooltip,
   ResponsiveContainer,
} from 'recharts';
import { authenticatedFetch } from '@/lib/api';
import { useAuth } from '@/lib/auth/AuthContext';
import { usePermission } from '@/lib/auth/usePermission';
import { useRouter } from 'next/navigation';
import {
   TrendingUp,
   DollarSign,
   ShoppingBag,
   AlertCircle,
   Calendar,
   Loader2,
   BarChart2,
   Trophy,
   Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

// ============================================================
// TIPOS — Agora refletem os DTOs do backend
// ============================================================
type Periodo = '7d' | '30d' | '3m' | '6m';

interface ResumoRelatorio {
   totalPedidos: number;
   faturamentoTotal: number;
   ticketMedio: number;
   pedidosPendentes: number;
   pedidosPagos: number;
   pedidosCancelados: number;
   totalRecebido: number;
   totalAReceber: number;
}

interface FaturamentoDiario {
   data: string;
   faturamento: number;
   pedidos: number;
}

interface StatusCount {
   status: string;
   quantidade: number;
}

interface ProdutoTop {
   produtoNome: string;
   quantidade: number;
   faturamento: number;
}

interface ClienteTop {
   clienteNome: string;
   totalPedidos: number;
   faturamentoTotal: number;
}

interface DadoStatus {
   name: string;
   value: number;
   color: string;
}

// ============================================================
// CORES
// ============================================================
const CORES_FINANCEIRO: Record<string, string> = {
   PAGO: '#00f0b5',
   PARCIAL: '#ffeb3b',
   PENDENTE: '#e11d48',
   REEMBOLSADO: '#00bcd4',
};

const CORES_PRODUCAO: Record<string, string> = {
   PRE_PROD: '#6b7280',
   EM_PRODUCAO: '#00bcd4',
   ACABAMENTO: '#ffeb3b',
   PRONTO: '#00f0b5',
   ENTREGUE: '#d80683',
   CANCELADO: '#e11d48',
};

const LABEL_PRODUCAO: Record<string, string> = {
   PRE_PROD: 'Pré-Produção',
   EM_PRODUCAO: 'Em Produção',
   ACABAMENTO: 'Acabamento',
   PRONTO: 'Pronto',
   ENTREGUE: 'Entregue',
   CANCELADO: 'Cancelado',
};

// ============================================================
// HELPERS
// ============================================================
const formatarMoeda = (valor: number) =>
   valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const formatarData = (dataISO: string) => {
   const d = new Date(dataISO + 'T00:00:00');
   return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
};

const calcularDatas = (periodo: Periodo): { inicio: string; fim: string } => {
   const agora = new Date();
   const fim = agora.toISOString().split('T')[0];

   const dataInicio = new Date();
   switch (periodo) {
      case '7d': dataInicio.setDate(dataInicio.getDate() - 7); break;
      case '30d': dataInicio.setDate(dataInicio.getDate() - 30); break;
      case '3m': dataInicio.setMonth(dataInicio.getMonth() - 3); break;
      case '6m': dataInicio.setMonth(dataInicio.getMonth() - 6); break;
   }
   const inicio = dataInicio.toISOString().split('T')[0];

   return { inicio, fim };
};

// ============================================================
// TOOLTIP PERSONALIZADO
// ============================================================
const CustomTooltip = ({ active, payload, label }: any) => {
   if (active && payload && payload.length) {
      return (
         <div className="bg-[#1a1a1a] border border-gray-700 rounded-lg p-3 shadow-xl">
            {label && <p className="text-gray-400 text-xs mb-2">{label}</p>}
            {payload.map((entry: any, index: number) => (
               <p key={index} className="text-sm font-semibold" style={{ color: entry.color }}>
                  {entry.name === 'faturamento' ? formatarMoeda(entry.value) : entry.value}
               </p>
            ))}
         </div>
      );
   }
   return null;
};

// ============================================================
// CARD KPI
// ============================================================
interface KpiCardProps {
   titulo: string;
   valor: string;
   subtitulo?: string;
   icone: React.ReactNode;
   corIcone: string;
   corBorda: string;
}

const KpiCard: React.FC<KpiCardProps> = ({ titulo, valor, subtitulo, icone, corIcone, corBorda }) => (
   <div
      className="bg-[#111111] rounded-xl p-5 flex items-start gap-4 border border-gray-800 hover:border-gray-600 transition-all duration-300 group"
      style={{ borderLeft: `3px solid ${corBorda}` }}
   >
      <div
         className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-110"
         style={{ backgroundColor: `${corBorda}18`, color: corIcone }}
      >
         {icone}
      </div>
      <div className="min-w-0">
         <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{titulo}</p>
         <p className="text-2xl font-bold text-white truncate">{valor}</p>
         {subtitulo && <p className="text-xs text-gray-500 mt-1">{subtitulo}</p>}
      </div>
   </div>
);

// ============================================================
// CARD DO GRÁFICO
// ============================================================
const GraficoCard: React.FC<{ titulo: string; icone: React.ReactNode; children: React.ReactNode }> = ({
   titulo, icone, children,
}) => (
   <div className="bg-[#111111] border border-gray-800 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-6">
         <span className="text-phalis-action">{icone}</span>
         <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">{titulo}</h3>
      </div>
      {children}
   </div>
);

// ============================================================
// PÁGINA PRINCIPAL
// ============================================================
export default function RelatoriosPage() {
   const { user } = useAuth();
   const { hasPermission } = usePermission();
   const router = useRouter();

   const [periodo, setPeriodo] = useState<Periodo>('30d');
   const [isLoading, setIsLoading] = useState(true);

   // Estados dos dados — agora vindos diretamente das APIs
   const [resumo, setResumo] = useState<ResumoRelatorio | null>(null);
   const [dadosFaturamento, setDadosFaturamento] = useState<FaturamentoDiario[]>([]);
   const [dadosStatusFinanceiro, setDadosStatusFinanceiro] = useState<DadoStatus[]>([]);
   const [dadosStatusProducao, setDadosStatusProducao] = useState<DadoStatus[]>([]);
   const [dadosProdutos, setDadosProdutos] = useState<ProdutoTop[]>([]);
   const [dadosClientes, setDadosClientes] = useState<ClienteTop[]>([]);

   // Redireciona se não tiver permissão
   useEffect(() => {
      if (user && !hasPermission('relatorios.ver')) {
         router.push('/');
      }
   }, [user, hasPermission, router]);

   // Carrega todos os dados em paralelo das APIs do backend
   const carregarDados = useCallback(async () => {
      setIsLoading(true);
      const { inicio, fim } = calcularDatas(periodo);
      const params = `inicio=${inicio}&fim=${fim}`;

      try {
         const [
            resResumo,
            resFaturamento,
            resStatusFin,
            resStatusProd,
            resProdutos,
            resClientes,
         ] = await Promise.all([
            authenticatedFetch(`/api/relatorios/resumo?${params}`),
            authenticatedFetch(`/api/relatorios/faturamento?${params}`),
            authenticatedFetch(`/api/relatorios/status-financeiro?${params}`),
            authenticatedFetch(`/api/relatorios/status-producao?${params}`),
            authenticatedFetch(`/api/relatorios/produtos-top?${params}&limite=5`),
            authenticatedFetch(`/api/relatorios/clientes-top?${params}&limite=5`),
         ]);

         // Resumo (KPIs)
         if (resResumo.ok) {
            setResumo(await resResumo.json());
         }

         // Faturamento por dia
         if (resFaturamento.ok) {
            const dados: FaturamentoDiario[] = await resFaturamento.json();
            setDadosFaturamento(
               dados.map(d => ({
                  ...d,
                  data: formatarData(d.data),
               }))
            );
         }

         // Status Financeiro → transforma em DadoStatus
         if (resStatusFin.ok) {
            const dados: StatusCount[] = await resStatusFin.json();
            setDadosStatusFinanceiro(
               dados
                  .filter(d => d.status !== 'INDEFINIDO' && d.quantidade > 0)
                  .map(d => ({
                     name: d.status,
                     value: d.quantidade,
                     color: CORES_FINANCEIRO[d.status] ?? '#6b7280',
                  }))
            );
         }

         // Status Produção → transforma em DadoStatus
         if (resStatusProd.ok) {
            const dados: StatusCount[] = await resStatusProd.json();
            setDadosStatusProducao(
               dados
                  .filter(d => d.status !== 'INDEFINIDO' && d.quantidade > 0)
                  .map(d => ({
                     name: LABEL_PRODUCAO[d.status] ?? d.status,
                     value: d.quantidade,
                     color: CORES_PRODUCAO[d.status] ?? '#6b7280',
                  }))
            );
         }

         // Top Produtos
         if (resProdutos.ok) {
            const dados: ProdutoTop[] = await resProdutos.json();
            setDadosProdutos(dados);
         }

         // Top Clientes
         if (resClientes.ok) {
            const dados: ClienteTop[] = await resClientes.json();
            setDadosClientes(dados);
         }
      } catch (err) {
         console.error('Erro ao carregar relatórios:', err);
      } finally {
         setIsLoading(false);
      }
   }, [periodo]);

   useEffect(() => {
      carregarDados();
   }, [carregarDados]);

   // ============================================================
   // RENDER
   // ============================================================
   if (!user || !hasPermission('relatorios.ver')) {
      return (
         <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-phalis-action" />
         </div>
      );
   }

   const periodos: { value: Periodo; label: string }[] = [
      { value: '7d', label: '7 dias' },
      { value: '30d', label: '30 dias' },
      { value: '3m', label: '3 meses' },
      { value: '6m', label: '6 meses' },
   ];

   const kpis = resumo ?? {
      totalPedidos: 0,
      faturamentoTotal: 0,
      ticketMedio: 0,
      pedidosPendentes: 0,
      pedidosPagos: 0,
      pedidosCancelados: 0,
      totalRecebido: 0,
      totalAReceber: 0,
   };

   return (
      <div className="space-y-6 pb-10">

         {/* ─── CABEÇALHO ─── */}
         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
               <h1 className="text-3xl font-bold text-white">Relatórios</h1>
               <p className="text-sm text-gray-500 mt-1">Visão geral do desempenho do negócio</p>
            </div>

            {/* Filtro de período */}
            <div className="flex items-center gap-2 bg-[#111111] border border-gray-800 rounded-xl p-1">
               <Calendar size={16} className="text-gray-500 ml-2" />
               {periodos.map(p => (
                  <Button
                     key={p.value}
                     size="sm"
                     onClick={() => setPeriodo(p.value)}
                     className={`rounded-lg text-xs px-3 h-8 transition-all ${
                        periodo === p.value
                           ? 'bg-phalis-action text-phalis-black font-bold shadow-md'
                           : 'bg-transparent text-gray-400 hover:text-white hover:bg-gray-800'
                     }`}
                  >
                     {p.label}
                  </Button>
               ))}
            </div>
         </div>

         {/* ─── LOADING OVERLAY COM SKELETONS ─── */}
         {isLoading ? (
            <div className="space-y-4">
               {/* Skeletons dos GPUs (4 cards) */}
               <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map(i => (
                     <div key={i} className="bg-[#111111] border border-gray-800 rounded-xl p-5 flex items-start gap-4">
                        <Skeleton className="h-11 w-11 rounded-lg" />
                        <div className="space-y-2 flex-1">
                           <Skeleton className="h-4 w-24" />
                           <Skeleton className="h-8 w-32" />
                           <Skeleton className="h-3 w-40" />
                        </div>
                     </div>
                  ))}
               </div>
               {/* Skeleton Gráfico Faturamento */}
               <div className="bg-[#111111] border border-gray-800 rounded-xl p-5 space-y-4">
                  <div className="flex items-center gap-2">
                     <Skeleton className="h-4 w-4 rounded-full" />
                     <Skeleton className="h-4 w-40" />
                  </div>
                  <Skeleton className="h-56 w-full rounded-lg" />
               </div>
               {/* Skeletons 2 Gráficos de barra/pizza */}
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {[1, 2].map(i => (
                     <div key={i} className="bg-[#111111] border border-gray-800 rounded-xl p-5 space-y-4">
                        <div className="flex items-center gap-2">
                           <Skeleton className="h-4 w-4 rounded-full" />
                           <Skeleton className="h-4 w-40" />
                        </div>
                        <Skeleton className="h-56 w-full rounded-lg" />
                     </div>
                  ))}
               </div>
            </div>
         ) : (
            <>
               {/* ─── CARDS KPI ─── */}
               <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                  <KpiCard
                     titulo="Total de Pedidos"
                     valor={kpis.totalPedidos.toString()}
                     subtitulo={`${kpis.pedidosCancelados} cancelado(s)`}
                     icone={<ShoppingBag size={20} />}
                     corIcone="#00bcd4"
                     corBorda="#00bcd4"
                  />
                  <KpiCard
                     titulo="Faturamento Total"
                     valor={formatarMoeda(kpis.faturamentoTotal)}
                     subtitulo={`${kpis.pedidosPagos} pago(s) integralmente`}
                     icone={<DollarSign size={20} />}
                     corIcone="#00f0b5"
                     corBorda="#00f0b5"
                  />
                  <KpiCard
                     titulo="Ticket Médio"
                     valor={formatarMoeda(kpis.ticketMedio)}
                     subtitulo="Por pedido no período"
                     icone={<TrendingUp size={20} />}
                     corIcone="#d80683"
                     corBorda="#d80683"
                  />
                  <KpiCard
                     titulo="Pagamentos Pendentes"
                     valor={kpis.pedidosPendentes.toString()}
                     subtitulo="Aguardando pagamento"
                     icone={<AlertCircle size={20} />}
                     corIcone="#e11d48"
                     corBorda="#e11d48"
                  />
               </div>

               {/* ─── GRÁFICO FATURAMENTO (linha completa) ─── */}
               <GraficoCard titulo="Faturamento por Dia" icone={<TrendingUp size={16} />}>
                  {dadosFaturamento.length === 0 ? (
                     <div className="flex items-center justify-center h-48 text-gray-600 text-sm">
                        Nenhum dado no período selecionado
                     </div>
                  ) : (
                     <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={dadosFaturamento} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                           <defs>
                              <linearGradient id="gradFaturamento" x1="0" y1="0" x2="0" y2="1">
                                 <stop offset="5%" stopColor="#00f0b5" stopOpacity={0.3} />
                                 <stop offset="95%" stopColor="#00f0b5" stopOpacity={0} />
                              </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" vertical={false} />
                           <XAxis
                              dataKey="data"
                              tick={{ fill: '#6b7280', fontSize: 11 }}
                              axisLine={false}
                              tickLine={false}
                           />
                           <YAxis
                              tick={{ fill: '#6b7280', fontSize: 11 }}
                              axisLine={false}
                              tickLine={false}
                              tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`}
                              width={50}
                           />
                           <Tooltip content={<CustomTooltip />} />
                           <Area
                              type="monotone"
                              dataKey="faturamento"
                              name="faturamento"
                              stroke="#00f0b5"
                              strokeWidth={2}
                              fill="url(#gradFaturamento)"
                              dot={false}
                              activeDot={{ r: 5, fill: '#00f0b5', stroke: '#000', strokeWidth: 2 }}
                           />
                        </AreaChart>
                     </ResponsiveContainer>
                  )}
               </GraficoCard>

               {/* ─── LINHA 2: Status Financeiro + Status Produção ─── */}
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                  {/* Rosca — Status Financeiro */}
                  <GraficoCard titulo="Status de Pagamento" icone={<DollarSign size={16} />}>
                     {dadosStatusFinanceiro.length === 0 ? (
                        <div className="flex items-center justify-center h-48 text-gray-600 text-sm">
                           Nenhum dado no período
                        </div>
                     ) : (
                        <div className="flex flex-col items-center">
                           <ResponsiveContainer width="100%" height={200}>
                              <PieChart>
                                 <Pie
                                    data={dadosStatusFinanceiro}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={85}
                                    paddingAngle={3}
                                    dataKey="value"
                                 >
                                    {dadosStatusFinanceiro.map((entry, index) => (
                                       <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                                    ))}
                                 </Pie>
                                 <Tooltip
                                    content={({ active, payload }) =>
                                       active && payload?.length ? (
                                          <div className="bg-[#1a1a1a] border border-gray-700 rounded-lg p-3">
                                             <p className="text-sm font-semibold" style={{ color: payload[0].payload.color }}>
                                                {payload[0].payload.name}: {payload[0].value} pedido(s)
                                             </p>
                                          </div>
                                       ) : null
                                    }
                                 />
                              </PieChart>
                           </ResponsiveContainer>
                           <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2">
                              {dadosStatusFinanceiro.map(d => (
                                 <div key={d.name} className="flex items-center gap-1.5 text-xs text-gray-400">
                                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                                    {d.name} ({d.value})
                                 </div>
                              ))}
                           </div>
                        </div>
                     )}
                  </GraficoCard>

                  {/* Barras — Status Produção */}
                  <GraficoCard titulo="Status de Produção" icone={<BarChart2 size={16} />}>
                     {dadosStatusProducao.length === 0 ? (
                        <div className="flex items-center justify-center h-48 text-gray-600 text-sm">
                           Nenhum dado no período
                        </div>
                     ) : (
                        <ResponsiveContainer width="100%" height={220}>
                           <BarChart
                              data={dadosStatusProducao}
                              layout="vertical"
                              margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
                           >
                              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" horizontal={false} />
                              <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                              <YAxis
                                 type="category"
                                 dataKey="name"
                                 tick={{ fill: '#9ca3af', fontSize: 11 }}
                                 axisLine={false}
                                 tickLine={false}
                                 width={90}
                              />
                              <Tooltip
                                 content={({ active, payload }) =>
                                    active && payload?.length ? (
                                       <div className="bg-[#1a1a1a] border border-gray-700 rounded-lg p-3">
                                          <p className="text-sm font-semibold text-white">
                                             {payload[0].payload.name}: {payload[0].value} pedido(s)
                                          </p>
                                       </div>
                                    ) : null
                                 }
                              />
                              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                 {dadosStatusProducao.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                 ))}
                              </Bar>
                           </BarChart>
                        </ResponsiveContainer>
                     )}
                  </GraficoCard>
               </div>

               {/* ─── LINHA 3: Top Produtos + Top Clientes ─── */}
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                  {/* Barras — Top 5 Produtos */}
                  <GraficoCard titulo="Top 5 Produtos por Faturamento" icone={<Trophy size={16} />}>
                     {dadosProdutos.length === 0 ? (
                        <div className="flex items-center justify-center h-48 text-gray-600 text-sm">
                           Nenhum produto no período
                        </div>
                     ) : (
                        <ResponsiveContainer width="100%" height={220}>
                           <BarChart
                              data={dadosProdutos.map(p => ({
                                 nome: p.produtoNome.length > 18 ? p.produtoNome.slice(0, 16) + '…' : p.produtoNome,
                                 nomeCompleto: p.produtoNome,
                                 quantidade: p.quantidade,
                                 faturamento: p.faturamento,
                              }))}
                              margin={{ top: 5, right: 10, left: 0, bottom: 30 }}
                           >
                              <defs>
                                 <linearGradient id="gradProdutos" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#d80683" stopOpacity={1} />
                                    <stop offset="100%" stopColor="#d80683" stopOpacity={0.4} />
                                 </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" vertical={false} />
                              <XAxis
                                 dataKey="nome"
                                 tick={{ fill: '#9ca3af', fontSize: 10 }}
                                 axisLine={false}
                                 tickLine={false}
                                 angle={-25}
                                 textAnchor="end"
                                 interval={0}
                              />
                              <YAxis
                                 tick={{ fill: '#6b7280', fontSize: 10 }}
                                 axisLine={false}
                                 tickLine={false}
                                 tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`}
                                 width={45}
                              />
                              <Tooltip
                                 content={({ active, payload }) =>
                                    active && payload?.length ? (
                                       <div className="bg-[#1a1a1a] border border-gray-700 rounded-lg p-3 space-y-1">
                                          <p className="text-sm font-bold text-white">{payload[0].payload.nomeCompleto}</p>
                                          <p className="text-xs text-phalis-rosa">
                                             Faturamento: {formatarMoeda(payload[0].value as number)}
                                          </p>
                                          <p className="text-xs text-gray-400">
                                             Qtd: {payload[0].payload.quantidade}
                                          </p>
                                       </div>
                                    ) : null
                                 }
                              />
                              <Bar dataKey="faturamento" fill="url(#gradProdutos)" radius={[4, 4, 0, 0]} />
                           </BarChart>
                        </ResponsiveContainer>
                     )}
                  </GraficoCard>

                  {/* Tabela — Top 5 Clientes */}
                  <GraficoCard titulo="Top 5 Clientes por Faturamento" icone={<Users size={16} />}>
                     {dadosClientes.length === 0 ? (
                        <div className="flex items-center justify-center h-48 text-gray-600 text-sm">
                           Nenhum cliente no período
                        </div>
                     ) : (
                        <div className="space-y-2">
                           {dadosClientes.map((cliente, index) => {
                              const medals = ['🥇', '🥈', '🥉', '4º', '5º'];
                              const pct = dadosClientes[0].faturamentoTotal > 0
                                 ? (cliente.faturamentoTotal / dadosClientes[0].faturamentoTotal) * 100
                                 : 0;
                              return (
                                 <div key={cliente.clienteNome} className="flex items-center gap-3 group">
                                    <span className="text-lg w-7 text-center shrink-0">{medals[index]}</span>
                                    <div className="flex-1 min-w-0">
                                       <div className="flex justify-between items-baseline mb-1">
                                          <p className="text-sm text-white font-medium truncate pr-2">{cliente.clienteNome}</p>
                                          <p className="text-sm font-bold text-phalis-action shrink-0">
                                             {formatarMoeda(cliente.faturamentoTotal)}
                                          </p>
                                       </div>
                                       <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                          <div
                                             className="h-full rounded-full transition-all duration-700"
                                             style={{
                                                width: `${pct}%`,
                                                background: index === 0
                                                   ? 'linear-gradient(90deg, #00f0b5, #00bcd4)'
                                                   : '#2a2a2a8c',
                                                backgroundColor: index === 0 ? undefined : '#00f0b540',
                                             }}
                                          />
                                       </div>
                                       <p className="text-[10px] text-gray-600 mt-0.5">{cliente.totalPedidos} pedido(s)</p>
                                    </div>
                                 </div>
                              );
                           })}
                        </div>
                     )}
                  </GraficoCard>
               </div>
            </>
         )}
      </div>
   );
}
