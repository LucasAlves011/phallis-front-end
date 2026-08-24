// Arquivo: app/(main)/relatorios/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
   ResponsiveContainer,
   AreaChart,
   Area,
   PieChart,
   Pie,
   Cell,
   XAxis,
   YAxis,
   CartesianGrid,
   Tooltip,
} from 'recharts';
import { useAuth } from '@/lib/auth/AuthContext';
import { usePermission } from '@/lib/auth/usePermission';
import { useRouter } from 'next/navigation';
import { authenticatedFetch } from '@/lib/api';
import {
   TrendingUp,
   DollarSign,
   Percent,
   Users,
   FileText,
   Calendar,
   CreditCard,
   Banknote,
   Package,
   ArrowRight,
   AlertCircle,
   BarChart3,
   Wallet,
   ArrowUpRight,
   Layers,
   ReceiptText,
   RotateCcw,
   ExternalLink,
   Loader2,
   RefreshCw
} from 'lucide-react';
import { PixIcon } from '@/components/icons/PixIcon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
   DialogDescription,
} from "@/components/ui/dialog";
import { cn } from '@/lib/utils';

// ============================================================
// TIPOS E PERIODOS
// ============================================================
type Periodo = '7d' | '30d' | '3m' | 'ano';

const PERIODOS: { value: Periodo; label: string }[] = [
   { value: '7d', label: 'Últimos 7 dias' },
   { value: '30d', label: 'Últimos 30 dias' },
   { value: '3m', label: 'Últimos 3 meses' },
   { value: 'ano', label: 'Ano de 2026' },
];

export interface ResumoRelatorio {
   totalPedidos: number;
   faturamentoTotal: number;
   ticketMedio: number;
   pedidosPendentesSaldo: number;
   totalRecebido: number;
   totalAReceber: number;
   lucroLiquido: number;
   custoProducao: number;
   margemMedia: number;
}

export interface FluxoCaixaItem {
   data: string;
   vendido: number;
   recebido: number;
   faltaReceber: number;
}

export interface MixPagamentoItem {
   name: string;
   value: number;
   percent: number;
   color: string;
}

export interface FunilOrcamento {
   totalCriados: number;
   totalAprovados: number;
   totalPendentes: number;
   totalRecusados: number;
   taxaConversao: number;
   valorConvertido: number;
   valorPendente: number;
}

export interface PedidoDevedor {
   id: number;
   codigo: string;
   cliente: string;
   valorTotal: number;
   valorPago: number;
   falta: number;
   status: string;
}

export interface EstornoPendente {
   id: number;
   codigo: string;
   cliente: string;
   valorPago: number;
   dataCancelamento: string;
   motivo: string;
}

export interface ClienteTop {
   nome: string;
   pedidos: number;
   totalGasto: number;
   ticketMedio: number;
}

export interface ProdutoLucratividade {
   nome: string;
   qtd: string;
   venda: number;
   custo: number;
   lucro: number;
   margem: number;
}

export interface DashboardRelatorio {
   resumo: ResumoRelatorio;
   fluxoCaixa: FluxoCaixaItem[];
   mixPagamentos: MixPagamentoItem[];
   orcamentos: FunilOrcamento;
   pedidosEmAbertoDestaque: PedidoDevedor[];
   estornosPendentes: EstornoPendente[];
   topClientes: ClienteTop[];
   topProdutosLucratividade: ProdutoLucratividade[];
}

// ============================================================
// HELPERS DE FORMATAÇÃO
// ============================================================
const formatarMoeda = (valor: number = 0) =>
   (valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const formatarEixoMoeda = (valor: number = 0) => {
   if (!valor || valor === 0) return 'R$ 0';
   if (valor >= 1000) {
      return `R$ ${(valor / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}k`;
   }
   return `R$ ${valor}`;
};

const formatarDataISO = (d: Date): string => {
   const ano = d.getFullYear();
   const mes = String(d.getMonth() + 1).padStart(2, '0');
   const dia = String(d.getDate()).padStart(2, '0');
   return `${ano}-${mes}-${dia}`;
};

// ============================================================
// COMPONENTES AUXILIARES
// ============================================================
interface KpiCardProps {
   titulo: string;
   valor: string;
   subtitulo: string;
   icone: React.ReactNode;
   corIcone: string;
   corBorda: string;
   badge?: { texto: string; tipo: 'positivo' | 'alerta' | 'neutro' };
   onClick?: () => void;
   cursorPointer?: boolean;
}

const KpiCard: React.FC<KpiCardProps> = ({ titulo, valor, subtitulo, icone, corIcone, corBorda, badge, onClick, cursorPointer }) => (
   <div
      onClick={onClick}
      className={cn(
         "bg-[#111111] rounded-xl p-5 flex flex-col justify-between border border-gray-800/80 hover:border-gray-700 transition-all duration-300 relative overflow-hidden group shadow-lg",
         cursorPointer && "cursor-pointer hover:bg-white/[0.02] active:scale-[0.99]"
      )}
      style={{ borderTop: `3px solid ${corBorda}` }}
   >
      <div className="flex items-start justify-between gap-3 mb-2">
         <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-110"
            style={{ backgroundColor: `${corBorda}18`, color: corIcone }}
         >
            {icone}
         </div>
         {badge && (
            <span className={cn(
               "text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1",
               badge.tipo === 'positivo' && "bg-emerald-950/80 text-emerald-400 border border-emerald-800/50",
               badge.tipo === 'alerta' && "bg-amber-950/80 text-amber-400 border border-amber-800/50",
               badge.tipo === 'neutro' && "bg-gray-800 text-gray-300 border border-gray-700"
            )}>
               {badge.tipo === 'positivo' && <TrendingUp size={12} />}
               {badge.texto}
            </span>
         )}
      </div>

      <div>
         <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">{titulo}</p>
         <p className="text-2xl font-bold text-white tracking-tight">{valor}</p>
         <p className="text-xs text-gray-400 mt-1 font-normal flex items-center justify-between">
            <span>{subtitulo}</span>
            {cursorPointer && <ArrowUpRight size={14} className="text-amber-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />}
         </p>
      </div>
   </div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
   if (active && payload && payload.length) {
      return (
         <div className="bg-[#18181b] border border-gray-700 rounded-xl p-3 shadow-2xl text-xs space-y-1.5 min-w-[170px]">
            {label && <p className="text-gray-400 font-semibold border-b border-gray-800 pb-1">{label}</p>}
            {payload.map((entry: any, index: number) => (
               <div key={index} className="flex items-center justify-between gap-4">
                  <span className="flex items-center gap-1.5 text-gray-300 capitalize">
                     <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                     {entry.name}:
                  </span>
                  <span className="font-bold text-white">
                     {typeof entry.value === 'number' && entry.name !== 'percent'
                        ? formatarMoeda(entry.value)
                        : entry.value}
                  </span>
               </div>
            ))}
         </div>
      );
   }
   return null;
};

// ============================================================
// PÁGINA PRINCIPAL
// ============================================================
export default function RelatoriosPage() {
   const { user } = useAuth();
   const { hasPermission } = usePermission();
   const router = useRouter();

   const [periodo, setPeriodo] = useState<Periodo>('30d');
   const [dashboard, setDashboard] = useState<DashboardRelatorio | null>(null);
   const [isLoading, setIsLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const [modalEstornoOpen, setModalEstornoOpen] = useState(false);

   // Redireciona se não tiver permissão
   useEffect(() => {
      if (user && !hasPermission('relatorios.ver')) {
         router.push('/');
      }
   }, [user, hasPermission, router]);

   // Busca os dados da API com base no período selecionado
   const carregarDashboard = useCallback(async () => {
      setIsLoading(true);
      setError(null);

      const hoje = new Date();
      let dataInicio = new Date();

      if (periodo === '7d') {
         dataInicio.setDate(hoje.getDate() - 6);
      } else if (periodo === '30d') {
         dataInicio.setDate(hoje.getDate() - 29);
      } else if (periodo === '3m') {
         dataInicio.setDate(hoje.getDate() - 89);
      } else if (periodo === 'ano') {
         dataInicio = new Date(hoje.getFullYear(), 0, 1);
      }

      const inicioStr = formatarDataISO(dataInicio);
      const fimStr = formatarDataISO(hoje);

      try {
         const response = await authenticatedFetch(`/api/relatorios/dashboard?inicio=${inicioStr}&fim=${fimStr}`);
         if (!response.ok) {
            throw new Error('Não foi possível carregar os dados de relatórios.');
         }
         const data: DashboardRelatorio = await response.json();
         setDashboard(data);
      } catch (err: any) {
         console.error('[RelatoriosPage] Erro ao buscar dashboard:', err);
         setError(err.message || 'Erro ao carregar dados do relatório');
      } finally {
         setIsLoading(false);
      }
   }, [periodo]);

   useEffect(() => {
      carregarDashboard();
   }, [carregarDashboard]);

   // Função de navegação para a tabela de pedidos já com filtro duplo (PENDENTE e PARCIAL)
   const irParaPedidosPendentes = (status: string = 'PENDENTE,PARCIAL', highlightId?: number, cliente?: string) => {
      const params = new URLSearchParams();
      params.append('financeiro', status);
      if (highlightId) params.append('highlight', highlightId.toString());
      if (cliente) params.append('cliente', cliente);
      router.push(`/historico-pedidos?${params.toString()}`);
   };

   // Função de navegação para orçamentos em aberto (ABERTO)
   const irParaOrcamentos = (status: string = 'ABERTO') => {
      const params = new URLSearchParams();
      params.append('status', status);
      router.push(`/orcamentos?${params.toString()}`);
   };

   const resumo = dashboard?.resumo || {
      faturamentoTotal: 0,
      custoProducao: 0,
      lucroLiquido: 0,
      margemMedia: 0,
      totalRecebido: 0,
      totalAReceber: 0,
      pedidosPendentesSaldo: 0,
      ticketMedio: 0,
      totalPedidos: 0,
   };

   const totalValorEstorno = (dashboard?.estornosPendentes || []).reduce(
      (acc, item) => acc + (item.valorPago || 0),
      0
   );

   return (
      <div className="space-y-8 pb-12">

         {/* ─── CABEÇALHO & SELETOR DE PERÍODO ─── */}
         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
               <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                  <BarChart3 className="text-phalis-action" size={28} />
                  Relatório Financeiro & Comercial
               </h1>
               <p className="text-sm text-gray-400 mt-1">
                  Fluxo de caixa, margem de revenda e controle de pagamentos pendentes
               </p>
            </div>

            {/* Filtro de período e refresh */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
               <div className="flex items-center gap-1.5 bg-[#111111] border border-gray-800 rounded-xl p-1.5 shadow-sm">
                  <Calendar size={15} className="text-gray-400 ml-2 mr-1" />
                  {PERIODOS.map(p => (
                     <Button
                        key={p.value}
                        size="sm"
                        disabled={isLoading}
                        onClick={() => setPeriodo(p.value)}
                        className={cn(
                           "rounded-lg text-xs px-3 h-8 transition-all font-medium",
                           periodo === p.value
                              ? "bg-phalis-action text-phalis-black font-bold shadow-md"
                              : "bg-transparent text-gray-400 hover:text-white hover:bg-gray-800/60"
                        )}
                     >
                        {p.label}
                     </Button>
                  ))}
               </div>

               <Button
                  size="icon"
                  variant="outline"
                  disabled={isLoading}
                  onClick={carregarDashboard}
                  className="h-11 w-11 bg-[#111111] border-gray-800 text-gray-400 hover:text-white rounded-xl"
                  title="Atualizar dados"
               >
                  <RefreshCw size={16} className={cn(isLoading && "animate-spin text-phalis-action")} />
               </Button>
            </div>
         </div>

         {/* ─── AVISO DE ESTORNOS PENDENTES SE HOUVER ─── */}
         {dashboard?.estornosPendentes && dashboard.estornosPendentes.length > 0 && (
            <div className="bg-purple-950/30 border border-purple-800/60 rounded-xl p-4 flex items-center justify-between flex-wrap gap-3 animate-in fade-in">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/20 text-purple-400 rounded-lg shrink-0">
                     <RotateCcw size={18} />
                  </div>
                  <div>
                     <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-purple-200">
                           {dashboard.estornosPendentes.length} {dashboard.estornosPendentes.length === 1 ? 'Pedido Cancelado com Estorno Pendente' : 'Pedidos Cancelados com Estornos Pendentes'}
                        </span>
                        <Badge className="bg-purple-900/80 text-purple-300 border border-purple-700 text-[10px] py-0">
                           Total: {formatarMoeda(totalValorEstorno)}
                        </Badge>
                     </div>
                     <p className="text-[11px] text-gray-400 mt-0.5">
                        Pedidos cancelados que já possuíam pagamentos lançados e aguardam estorno ou devolução ao cliente.
                     </p>
                  </div>
               </div>
               <Button
                  size="sm"
                  onClick={() => setModalEstornoOpen(true)}
                  className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs h-8 rounded-lg shadow-md flex items-center gap-1.5"
               >
                  Ver Detalhes do Estorno
                  <ArrowRight size={13} />
               </Button>
            </div>
         )}

         {/* ─── LOADING STATE OU ERRO ─── */}
         {isLoading && !dashboard ? (
            <div className="flex flex-col items-center justify-center p-16 space-y-4 bg-[#111111] rounded-2xl border border-gray-800">
               <Loader2 size={36} className="animate-spin text-phalis-action" />
               <p className="text-sm text-gray-400 font-medium">Calculando indicadores financeiros e operacionais...</p>
            </div>
         ) : error ? (
            <div className="p-8 bg-red-950/20 border border-red-900/40 rounded-2xl text-center space-y-3">
               <AlertCircle size={32} className="text-red-400 mx-auto" />
               <h3 className="text-base font-bold text-white">Falha ao carregar relatórios</h3>
               <p className="text-xs text-gray-400">{error}</p>
               <Button size="sm" onClick={carregarDashboard} className="bg-red-600 hover:bg-red-500 text-white text-xs font-semibold">
                  Tentar novamente
               </Button>
            </div>
         ) : (
            <>
               {/* ─── TOP CARDS KPI (FLUXO VENDIDO x CUSTO x LUCRO x RECEBIDO x A RECEBER) ─── */}
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                  
                  {/* 1. Total Vendido */}
                  <KpiCard
                     titulo="Total Vendido"
                     valor={formatarMoeda(resumo.faturamentoTotal)}
                     subtitulo={`${resumo.totalPedidos} pedidos contratados`}
                     icone={<DollarSign size={20} />}
                     corIcone="#00f0b5"
                     corBorda="#00f0b5"
                     badge={{ texto: 'Vendas Totais', tipo: 'positivo' }}
                  />

                  {/* 2. Custo Terceirizado */}
                  <KpiCard
                     titulo="Custo Gráfica Parceira"
                     valor={formatarMoeda(resumo.custoProducao)}
                     subtitulo="Investimento em produção externa"
                     icone={<Layers size={20} />}
                     corIcone="#f59e0b"
                     corBorda="#f59e0b"
                     badge={{ texto: 'Custos', tipo: 'neutro' }}
                  />

                  {/* 3. Lucro Líquido Real */}
                  <KpiCard
                     titulo="Lucro de Revenda"
                     valor={formatarMoeda(resumo.lucroLiquido)}
                     subtitulo={`Margem limpa de ${resumo.margemMedia || 0}%`}
                     icone={<TrendingUp size={20} />}
                     corIcone="#3b82f6"
                     corBorda="#3b82f6"
                     badge={{ texto: `${resumo.margemMedia || 0}% Margem`, tipo: 'positivo' }}
                  />

                  {/* 4. Recebido no Caixa */}
                  <KpiCard
                     titulo="Recebido no Caixa"
                     valor={formatarMoeda(resumo.totalRecebido)}
                     subtitulo="Dinheiro já pago pelos clientes"
                     icone={<Banknote size={20} />}
                     corIcone="#22c55e"
                     corBorda="#22c55e"
                     badge={{ texto: 'Em Caixa', tipo: 'positivo' }}
                  />

                  {/* 5. Falta Receber (Clicável! Abre com PENDENTE e PARCIAL) */}
                  <KpiCard
                     titulo="Falta Receber"
                     valor={formatarMoeda(resumo.totalAReceber)}
                     subtitulo={`${resumo.pedidosPendentesSaldo} pedidos com saldo pendente`}
                     icone={<AlertCircle size={20} />}
                     corIcone="#e11d48"
                     corBorda="#e11d48"
                     badge={{ texto: 'Cobrança Pendente', tipo: 'alerta' }}
                     onClick={() => irParaPedidosPendentes('PENDENTE,PARCIAL')}
                     cursorPointer
                  />
               </div>

               {/* ─── BLOCO 1: FLUXO DE VENDIDO VS RECEBIDO VS A RECEBER + CARD DE COBRANÇA ─── */}
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                  {/* Gráfico Vendido vs Recebido vs Falta Receber (8 cols) */}
                  <div className="lg:col-span-8 bg-[#111111] border border-gray-800/80 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
                     <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
                        <div>
                           <h3 className="text-base font-bold text-white flex items-center gap-2">
                              <ReceiptText className="text-teal-400" size={18} />
                              Fluxo de Caixa: Vendido vs Recebido vs A Receber
                           </h3>
                           <p className="text-xs text-gray-400 mt-0.5">
                              Acompanhamento da entrada real de dinheiro versus valores pendentes de recebimento
                           </p>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-semibold">
                           <span className="flex items-center gap-1.5 text-teal-400">
                              <span className="h-2.5 w-2.5 rounded-full bg-[#00f0b5]" /> Vendido
                           </span>
                           <span className="flex items-center gap-1.5 text-emerald-400">
                              <span className="h-2.5 w-2.5 rounded-full bg-[#22c55e]" /> Recebido em Caixa
                           </span>
                           <span className="flex items-center gap-1.5 text-red-400">
                              <span className="h-2.5 w-2.5 rounded-full bg-[#ef4444]" /> Falta Receber
                           </span>
                        </div>
                     </div>

                     <div className="h-[280px] w-full">
                        {dashboard?.fluxoCaixa && dashboard.fluxoCaixa.length > 0 ? (
                           <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={dashboard.fluxoCaixa} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                 <defs>
                                    <linearGradient id="gradVendido" x1="0" y1="0" x2="0" y2="1">
                                       <stop offset="5%" stopColor="#00f0b5" stopOpacity={0.25} />
                                       <stop offset="95%" stopColor="#00f0b5" stopOpacity={0.0} />
                                    </linearGradient>
                                    <linearGradient id="gradRecebido" x1="0" y1="0" x2="0" y2="1">
                                       <stop offset="5%" stopColor="#22c55e" stopOpacity={0.25} />
                                       <stop offset="95%" stopColor="#22c55e" stopOpacity={0.0} />
                                    </linearGradient>
                                 </defs>
                                 <CartesianGrid strokeDasharray="3 3" stroke="#222225" vertical={false} />
                                 <XAxis dataKey="data" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
                                 <YAxis tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={formatarEixoMoeda} width={60} />
                                 <Tooltip content={<CustomTooltip />} />
                                 <Area type="monotone" dataKey="vendido" name="Vendido" stroke="#00f0b5" strokeWidth={2.5} fill="url(#gradVendido)" />
                                 <Area type="monotone" dataKey="recebido" name="Recebido" stroke="#22c55e" strokeWidth={2.5} fill="url(#gradRecebido)" />
                                 <Area type="monotone" dataKey="faltaReceber" name="Falta Receber" stroke="#ef4444" strokeWidth={2} fill="transparent" strokeDasharray="4 4" />
                              </AreaChart>
                           </ResponsiveContainer>
                        ) : (
                           <div className="h-full flex items-center justify-center text-xs text-gray-500">
                              Nenhuma movimentação registrada no período selecionado.
                           </div>
                        )}
                     </div>
                  </div>

                  {/* Card de Ação Rápida: Cobranças & Pedidos com Saldo Pendente (4 cols) */}
                  <div className="lg:col-span-4 bg-[#111111] border border-gray-800/80 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
                     <div>
                        <div className="flex items-center justify-between">
                           <h3 className="text-base font-bold text-white flex items-center gap-2">
                              <AlertCircle className="text-rose-400" size={18} />
                              Contas a Receber
                           </h3>
                           <Badge className="bg-rose-950 text-rose-300 border border-rose-800/60 font-bold">
                              {formatarMoeda(resumo.totalAReceber)}
                           </Badge>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">
                           Pedidos entregues ou em produção com saldo devedor em aberto
                        </p>
                     </div>

                     {/* Lista rápida de devedores */}
                     <div className="my-4 space-y-2.5">
                        {dashboard?.pedidosEmAbertoDestaque && dashboard.pedidosEmAbertoDestaque.length > 0 ? (
                           dashboard.pedidosEmAbertoDestaque.map((p) => (
                              <div
                                 key={p.id}
                                 onClick={() => irParaPedidosPendentes('PENDENTE,PARCIAL', p.id, p.codigo)}
                                 className="bg-black/30 p-2.5 rounded-xl border border-gray-800/80 hover:border-gray-700 cursor-pointer transition-colors flex items-center justify-between text-xs group"
                              >
                                 <div className="min-w-0 pr-2">
                                    <div className="flex items-center gap-2">
                                       <span className="font-mono text-[10px] text-gray-500 font-bold">{p.codigo}</span>
                                       <Badge className={cn(
                                          "text-[9px] px-1.5 py-0",
                                          p.status === 'PARCIAL' ? "bg-yellow-950 text-yellow-400 border-yellow-800" : "bg-amber-950 text-amber-400 border-amber-800"
                                       )}>
                                          {p.status === 'PARCIAL' ? 'Parcial' : 'Pendente'}
                                       </Badge>
                                    </div>
                                    <p className="font-semibold text-white truncate text-xs mt-0.5 group-hover:text-phalis-action transition-colors">
                                       {p.cliente}
                                    </p>
                                 </div>
                                 <div className="text-right shrink-0">
                                    <span className="text-xs font-bold text-rose-400 block">Falta {formatarMoeda(p.falta)}</span>
                                    <span className="text-[10px] text-gray-500">de {formatarMoeda(p.valorTotal)}</span>
                                 </div>
                              </div>
                           ))
                        ) : (
                           <div className="bg-emerald-950/20 border border-emerald-900/40 rounded-xl p-4 text-center">
                              <p className="text-xs text-emerald-400 font-semibold">Tudo em dia!</p>
                              <p className="text-[11px] text-gray-400 mt-0.5">Nenhum saldo pendente encontrado no período.</p>
                           </div>
                        )}
                     </div>

                     {/* Botão de Ação Direta */}
                     <Button
                        onClick={() => irParaPedidosPendentes('PENDENTE,PARCIAL')}
                        className="w-full bg-phalis-action text-phalis-black hover:bg-phalis-action-hover font-bold text-xs h-10 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-phalis-action/10"
                     >
                        Ver Todos os Pedidos a Receber
                        <ArrowRight size={15} />
                     </Button>
                  </div>

               </div>

               {/* ─── BLOCO 2: MIX DE PAGAMENTOS + FUNIL DE ORÇAMENTOS ─── */}
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                  {/* Mix de Formas de Pagamento (6 cols) */}
                  <div className="lg:col-span-6 bg-[#111111] border border-gray-800/80 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
                     <div>
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                           <Wallet className="text-emerald-400" size={18} />
                           Como os Clientes Estão Pagando
                        </h3>
                        <p className="text-xs text-gray-400 mt-0.5">Distribuição das formas de pagamento recebidas no caixa</p>
                     </div>

                     {dashboard?.mixPagamentos && dashboard.mixPagamentos.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center my-4">
                           <div className="sm:col-span-6 h-[170px] w-full flex items-center justify-center">
                              <ResponsiveContainer width="100%" height="100%">
                                 <PieChart>
                                    <Pie
                                       data={dashboard.mixPagamentos}
                                       cx="50%"
                                       cy="50%"
                                       innerRadius={45}
                                       outerRadius={72}
                                       paddingAngle={4}
                                       dataKey="value"
                                    >
                                       {dashboard.mixPagamentos.map((entry, index) => (
                                          <Cell key={`cell-${index}`} fill={entry.color} stroke="#111111" strokeWidth={2} />
                                       ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                 </PieChart>
                              </ResponsiveContainer>
                           </div>

                           <div className="sm:col-span-6 space-y-2.5 text-xs">
                              {dashboard.mixPagamentos.map((item) => (
                                 <div key={item.name} className="flex items-center justify-between bg-black/20 p-2 rounded-lg border border-gray-800/60">
                                    <span className="flex items-center gap-2 text-gray-300">
                                       {item.name === 'PIX' && <PixIcon className="w-3.5 h-3.5 text-[#77B6A8]" />}
                                       {item.name.includes('Crédito') && <CreditCard size={14} className="text-blue-400" />}
                                       {item.name.includes('Débito') && <CreditCard size={14} className="text-purple-400" />}
                                       {item.name === 'Dinheiro' && <Banknote size={14} className="text-emerald-400" />}
                                       <span className="font-medium">{item.name}</span>
                                    </span>
                                    <div className="text-right">
                                       <span className="font-bold text-white block">{formatarMoeda(item.value)}</span>
                                       <span className="text-gray-400 text-[10px]">{item.percent}%</span>
                                    </div>
                                 </div>
                              ))}
                           </div>
                        </div>
                     ) : (
                        <div className="py-12 text-center text-xs text-gray-500">
                           Nenhum pagamento registrado no período.
                        </div>
                     )}

                     <div className="text-[11px] text-gray-500 text-center">
                        Total recebido em caixa no período: <strong>{formatarMoeda(resumo.totalRecebido)}</strong>
                     </div>
                  </div>

                  {/* Funil de Orçamentos (6 cols) */}
                  <div className="lg:col-span-6 bg-[#111111] border border-gray-800/80 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
                     <div>
                        <div className="flex items-center justify-between">
                           <h3 className="text-base font-bold text-white flex items-center gap-2">
                              <FileText className="text-amber-400" size={18} />
                              Conversão de Orçamentos
                           </h3>
                           <Badge className="bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-bold">
                              {dashboard?.orcamentos?.taxaConversao || 0}% de Fechamento
                           </Badge>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">
                           Eficiência de fechamento de propostas e valores em negociação
                        </p>
                     </div>

                     {/* Barra de Progresso Visual do Funil */}
                     <div className="my-4 space-y-3">
                        <div className="h-3 w-full bg-gray-800/80 rounded-full overflow-hidden flex">
                           <div
                              style={{ width: `${(dashboard?.orcamentos?.totalCriados || 0) > 0 ? ((dashboard?.orcamentos?.totalAprovados || 0) / dashboard!.orcamentos.totalCriados) * 100 : 0}%` }}
                              className="bg-emerald-500 h-full"
                              title="Aprovados"
                           />
                           <div
                              style={{ width: `${(dashboard?.orcamentos?.totalCriados || 0) > 0 ? ((dashboard?.orcamentos?.totalPendentes || 0) / dashboard!.orcamentos.totalCriados) * 100 : 0}%` }}
                              className="bg-amber-500 h-full"
                              title="Pendentes"
                           />
                           <div
                              style={{ width: `${(dashboard?.orcamentos?.totalCriados || 0) > 0 ? ((dashboard?.orcamentos?.totalRecusados || 0) / dashboard!.orcamentos.totalCriados) * 100 : 0}%` }}
                              className="bg-red-500 h-full"
                              title="Cancelados"
                           />
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-center text-xs">
                           <div className="bg-black/30 p-2.5 rounded-xl border border-gray-800">
                              <span className="text-emerald-400 font-bold text-base block">{dashboard?.orcamentos?.totalAprovados || 0}</span>
                              <span className="text-gray-400 text-[11px]">Convertidos</span>
                              <span className="text-emerald-400/90 font-semibold block text-[11px] mt-0.5">
                                 {formatarMoeda(dashboard?.orcamentos?.valorConvertido || 0)}
                              </span>
                           </div>
                           <div className="bg-black/30 p-2.5 rounded-xl border border-gray-800">
                              <span className="text-amber-400 font-bold text-base block">{dashboard?.orcamentos?.totalPendentes || 0}</span>
                              <span className="text-gray-400 text-[11px]">Em Aberto</span>
                              <span className="text-amber-400/90 font-semibold block text-[11px] mt-0.5">
                                 {formatarMoeda(dashboard?.orcamentos?.valorPendente || 0)}
                              </span>
                           </div>
                           <div className="bg-black/30 p-2.5 rounded-xl border border-gray-800">
                              <span className="text-red-400 font-bold text-base block">{dashboard?.orcamentos?.totalRecusados || 0}</span>
                              <span className="text-gray-400 text-[11px]">Não Fechados</span>
                              <span className="text-red-400/90 font-semibold block text-[11px] mt-0.5">Perdidos</span>
                           </div>
                        </div>
                     </div>

                     <div
                        onClick={() => irParaOrcamentos('ABERTO')}
                        className="bg-amber-950/20 border border-amber-900/40 rounded-xl p-3 flex items-center justify-between text-xs cursor-pointer hover:bg-amber-950/30 transition-colors"
                     >
                        <div className="flex items-center gap-2 text-amber-300">
                           <FileText size={16} />
                           <span><strong>{formatarMoeda(dashboard?.orcamentos?.valorPendente || 0)}</strong> em propostas aguardando aprovação</span>
                        </div>
                        <span className="text-amber-400 font-semibold text-[11px] flex items-center gap-1">
                           Ver orçamentos <ArrowRight size={13} />
                        </span>
                     </div>
                  </div>

               </div>

               {/* ─── BLOCO 3: TOP PRODUTOS POR MARGEM DE REVENDA & TOP CLIENTES ─── */}
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                  {/* Top Produtos por Lucratividade de Revenda (8 cols) */}
                  <div className="lg:col-span-8 bg-[#111111] border border-gray-800/80 rounded-2xl p-6 shadow-xl">
                     <div className="flex items-center justify-between mb-4">
                        <div>
                           <h3 className="text-base font-bold text-white flex items-center gap-2">
                              <Package className="text-purple-400" size={18} />
                              Lucratividade de Revenda por Produto
                           </h3>
                           <p className="text-xs text-gray-400 mt-0.5">
                              Margem real: Preço cobrado do cliente menos o custo pago na gráfica parceira
                           </p>
                        </div>
                     </div>

                     <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                           <thead>
                              <tr className="border-b border-gray-800 text-gray-400">
                                 <th className="pb-3 font-semibold">Produto</th>
                                 <th className="pb-3 font-semibold text-center">Volume</th>
                                 <th className="pb-3 font-semibold text-right">Preço Venda</th>
                                 <th className="pb-3 font-semibold text-right text-amber-400">Custo Parceiro</th>
                                 <th className="pb-3 font-semibold text-right text-emerald-400">Lucro Phalis</th>
                                 <th className="pb-3 font-semibold text-right">Margem %</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-gray-800/60 font-medium">
                              {dashboard?.topProdutosLucratividade && dashboard.topProdutosLucratividade.length > 0 ? (
                                 dashboard.topProdutosLucratividade.map((p) => (
                                    <tr key={p.nome} className="hover:bg-white/[0.02] transition-colors">
                                       <td className="py-3 text-white font-semibold flex items-center gap-2">
                                          <span className="h-2 w-2 rounded-full bg-phalis-action shrink-0" />
                                          <span className="truncate max-w-[200px]">{p.nome}</span>
                                       </td>
                                       <td className="py-3 text-center text-gray-300 font-mono text-[11px]">{p.qtd}</td>
                                       <td className="py-3 text-right text-gray-300">{formatarMoeda(p.venda)}</td>
                                       <td className="py-3 text-right text-amber-400/80">{formatarMoeda(p.custo)}</td>
                                       <td className="py-3 text-right text-emerald-400 font-bold">{formatarMoeda(p.lucro)}</td>
                                       <td className="py-3 text-right">
                                          <Badge className={cn(
                                             "text-[10px] font-bold",
                                             p.margem >= 60 ? "bg-emerald-950 text-emerald-400 border border-emerald-800/60" : "bg-blue-950 text-blue-400 border border-blue-800/60"
                                          )}>
                                             {p.margem}%
                                          </Badge>
                                       </td>
                                    </tr>
                                 ))
                              ) : (
                                 <tr>
                                    <td colSpan={6} className="py-6 text-center text-xs text-gray-500">
                                       Nenhum produto faturado no período.
                                    </td>
                                 </tr>
                              )}
                           </tbody>
                        </table>
                     </div>
                  </div>

                  {/* Top Clientes / Frequência (4 cols) */}
                  <div className="lg:col-span-4 bg-[#111111] border border-gray-800/80 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
                     <div>
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                           <Users className="text-cyan-400" size={18} />
                           Clientes Mais Frequentes (VIPs)
                        </h3>
                        <p className="text-xs text-gray-400 mt-0.5">Clientes que mais trouxeram faturamento no período</p>
                     </div>

                     <div className="my-4 space-y-3">
                        {dashboard?.topClientes && dashboard.topClientes.length > 0 ? (
                           dashboard.topClientes.map((c, idx) => (
                              <div key={c.nome} className="bg-black/30 p-3 rounded-xl border border-gray-800/80 flex items-center justify-between text-xs">
                                 <div className="flex items-center gap-2.5 min-w-0 pr-2">
                                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-400 font-bold text-xs">
                                       #{idx + 1}
                                    </span>
                                    <div className="min-w-0">
                                       <span className="font-semibold text-white block truncate">{c.nome}</span>
                                       <span className="text-gray-500 text-[10px]">{c.pedidos} pedido(s) realizado(s)</span>
                                    </div>
                                 </div>
                                 <div className="text-right shrink-0">
                                    <span className="font-bold text-teal-400 block">{formatarMoeda(c.totalGasto)}</span>
                                    <span className="text-gray-500 text-[10px]">Méd: {formatarMoeda(c.ticketMedio)}</span>
                                 </div>
                              </div>
                           ))
                        ) : (
                           <div className="py-6 text-center text-xs text-gray-500">
                              Nenhum cliente registrado no período.
                           </div>
                        )}
                     </div>

                     <div className="text-[11px] text-gray-500 text-center">
                        Foque o relacionamento nos clientes de maior recorrência
                     </div>
                  </div>

               </div>
            </>
         )}

         {/* ─── MODAL DE ESTORNOS PENDENTES ─── */}
         <Dialog open={modalEstornoOpen} onOpenChange={setModalEstornoOpen}>
            <DialogContent className="max-w-2xl bg-[#141416] border border-gray-800 text-white rounded-2xl shadow-2xl p-6">
               <DialogHeader>
                  <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
                     <RotateCcw className="text-purple-400" size={20} />
                     Pedidos Cancelados com Estorno Pendente
                  </DialogTitle>
                  <DialogDescription className="text-xs text-gray-400">
                     Estes pedidos foram cancelados mas o cliente já havia efetuado pagamento total ou parcial. É necessário devolver o valor ou gerar crédito.
                  </DialogDescription>
               </DialogHeader>

               <div className="space-y-3 mt-4 max-h-[380px] overflow-y-auto pr-1">
                  {dashboard?.estornosPendentes && dashboard.estornosPendentes.map((item) => (
                     <div key={item.id} className="bg-black/40 border border-gray-800 rounded-xl p-4 flex items-start justify-between gap-4">
                        <div className="space-y-1">
                           <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-sm text-phalis-action">{item.codigo}</span>
                              <Badge className="bg-red-950 text-red-400 border border-red-800 text-[10px] py-0">Cancelado</Badge>
                              <span className="text-[11px] text-gray-500">Cancelado em {item.dataCancelamento}</span>
                           </div>
                           <p className="text-sm font-semibold text-white">{item.cliente}</p>
                           <p className="text-xs text-gray-400 italic">Motivo: "{item.motivo}"</p>
                        </div>

                        <div className="text-right shrink-0 space-y-2">
                           <div>
                              <span className="text-[10px] text-gray-500 block uppercase font-semibold">Valor a Estornar</span>
                              <span className="text-base font-extrabold text-purple-400">{formatarMoeda(item.valorPago)}</span>
                           </div>
                           <Button
                              size="sm"
                              onClick={() => {
                                 setModalEstornoOpen(false);
                                 router.push(`/historico-pedidos?cliente=${item.codigo}`);
                              }}
                              className="h-8 text-xs bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/40 rounded-lg flex items-center gap-1.5"
                           >
                              Ir para o Pedido
                              <ExternalLink size={12} />
                           </Button>
                        </div>
                     </div>
                  ))}
               </div>

               <div className="bg-purple-950/20 border border-purple-900/30 rounded-xl p-3 mt-4 flex items-center justify-between text-xs text-purple-300">
                  <span>Total de {dashboard?.estornosPendentes?.length || 0} pedido(s) aguardando devolução</span>
                  <span className="font-bold text-purple-200 text-sm">{formatarMoeda(totalValorEstorno)}</span>
               </div>
            </DialogContent>
         </Dialog>

      </div>
   );
}
