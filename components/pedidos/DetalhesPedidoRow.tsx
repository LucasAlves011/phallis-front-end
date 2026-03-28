// Arquivo: components/pedidos/DetalhesPedidoRow.tsx
import React, { useMemo, useState, useEffect } from 'react';
import { Pedido, ItemPedido } from '@/lib/orderData';
import { type Product } from '@/lib/productData';
import Image from 'next/image';
import { cn } from "@/lib/utils";
import { authenticatedFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
   AlertDialog,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogHeader,
   AlertDialogTitle,
   AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Pencil, XOctagon, Loader2, DollarSign, Eye, Link as LinkIcon, Check, PlusCircle, CreditCard, Banknote, Landmark } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import { usePermission } from '@/lib/auth/usePermission';
import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type DetalhesProps = {
   pedido: Pedido;
   onPedidoUpdated: (pedido: Pedido) => void;
};

// STATUS MAPS
const STATUS_NOME_MAP: Record<string, string> = {
   PENDENTE: 'Pendente',
   PARCIAL: 'Pagamento Parcial',
   PAGO: 'Pago',
   REEMBOLSADO: 'Reembolsado',
   PRE_PROD: 'Pré-Produção',
   EM_PRODUCAO: 'Em Produção',
   ACABAMENTO: 'Acabamento',
   PRONTO: 'Pronto p/ Retirada',
   ENTREGUE: 'Entregue',
   CANCELADO: 'Cancelado',
   CRIADO: 'Pedido Criado',
   PAGAMENTO: 'Pagamento Realizado'
};
const STATUS_COR_MAP: Record<string, string> = {
   PENDENTE: 'bg-red-600',
   PARCIAL: 'bg-yellow-500',
   PAGO: 'bg-green-600',
   REEMBOLSADO: 'bg-gray-500',
   PRE_PROD: 'bg-gray-500',
   EM_PRODUCAO: 'bg-blue-600',
   ACABAMENTO: 'bg-indigo-600',
   PRONTO: 'bg-purple-600',
   ENTREGUE: 'bg-green-600',
   CANCELADO: 'bg-gray-700',
   CRIADO: 'bg-gray-500',
   PAGAMENTO: 'bg-green-400'
};

// TIMELINE ITEM
const TimelineItem = ({ item, isLast }: { item: { status: string, data: string, user: string, subStatus?: string, motivo?: string, observacao?: string }, isLast: boolean }) => {
   const nomeStatus = STATUS_NOME_MAP[item.status] || item.status.replace(/_/g, ' ');
   const corStatus = STATUS_COR_MAP[item.status] || 'bg-cyan-500';
   return (
      <li className="flex gap-3">
         <div className="flex flex-col items-center">
            <div className={cn("h-3 w-3 rounded-full mt-1.5", corStatus)} />
            {!isLast && (<div className="w-px flex-1 bg-gray-600 my-1" />)}
         </div>
         <div className="pb-4 flex-1">
            <div className="flex justify-between text-xs">
               <span className="text-sm text-white font-medium flex items-center gap-1">
                  {nomeStatus}
                  {item.subStatus && <span className="text-gray-400 text-xs font-normal">{item.subStatus}</span>}
               </span>
            </div>
            <div className="text-[11px] text-gray-500 mt-0.5">
               {new Date(item.data).toLocaleString('pt-BR')} por {item.user}
            </div>
            {item.motivo && (
               <div className="mt-1 text-xs text-red-400 bg-red-950/30 p-1.5 rounded border border-red-900/50">
                  <span className="font-semibold block mb-0.5">Motivo:</span>
                  {item.motivo}
               </div>
            )}
            {item.observacao && (
               <div className="mt-1 text-xs text-gray-400 bg-gray-800/40 p-1.5 rounded border border-gray-700/50">
                  <span className="font-semibold block mb-0.5">Observação:</span>
                  {item.observacao}
               </div>
            )}
         </div>
      </li>
   );
};

// MINI ITEM CARD
const MiniItemCard: React.FC<{ item: ItemPedido }> = ({ item }) => {
   const [produtoFetched, setProdutoFetched] = useState<Product | null>(null);
   const [isExpanded, setIsExpanded] = useState(false);

   useEffect(() => {
      authenticatedFetch(`/api/produtos/${item.productId}`)
         .then(res => res.ok ? res.json() : null)
         .then(data => setProdutoFetched(data))
         .catch(err => console.error("Erro ao buscar produto:", err));
   }, [item.productId]);

   // Valores extraidos
   const tipo = item.tipoPrecificacao || item.detalhes?.type;
   const tipoStr = tipo ? String(tipo).toUpperCase() : '';
   const opts = item.opcoes || item.detalhes?.opcoes || {};
   const qtd = item.quantidade || (item.detalhes as any)?.preco?.quantidade;
   const w = item.largura || (item.detalhes as any)?.preco?.largura || (item.detalhes as any)?.dimensoesPersonalizadas?.larguraCm;
   const h = item.altura || (item.detalhes as any)?.preco?.altura || (item.detalhes as any)?.dimensoesPersonalizadas?.alturaCm;
   const vCusto = item.valorCusto || (tipoStr === 'UNIDADE' ? (item.detalhes as any)?.preco?.precoCusto : (item.detalhes as any)?.preco?.m2Custo);
   const vVenda = item.valorVenda || (tipoStr === 'UNIDADE' ? (item.detalhes as any)?.preco?.precoVenda : (item.detalhes as any)?.preco?.m2Venda);
   const vArte = (item.detalhes as any)?.preco?.precoArte || (item as any)?.valorArte;
   const vDesconto = item.valorDesconto || (item.detalhes as any)?.preco?.desconto;

   const getCustoTotalItem = () => {
      const precoDet = (item.detalhes as any)?.preco;
      if (precoDet?.custoTotal) return Number(precoDet.custoTotal);
      if (precoDet?.valorTotalCusto) return Number(precoDet.valorTotalCusto);
      const v = Number(vCusto) || 0;
      if (tipoStr === 'UNIDADE') return v; // Custo do Lote fixo
      if (tipoStr === 'METRO') return v * (Number(w) || 1) * (Number(h) || 1) * (Number(qtd) || 1);
      return 0;
   };

   const custoTotalItem = getCustoTotalItem();
   const lucroItem = (Number(item.valor) || 0) - custoTotalItem;

   const formatarEspecificacoes = () => {
      const specs = [];
      if (tipoStr === 'UNIDADE' || tipoStr === 'METRO') {
         if (produtoFetched && produtoFetched.options) {
            const optsConfig = produtoFetched.options;
            Object.entries(opts).forEach(([key, val]) => {
               const optName = optsConfig[key as keyof typeof optsConfig]?.find((o: any) => o.id === val)?.name;
               if (optName) specs.push(optName);
            });
         } else {
            specs.push("Carregando opções...");
         }

         if (w && h) {
            specs.push(tipoStr === 'METRO' ? `Dimensões: ${w}m x ${h}m` : `Tamanho: ${w}x${h}cm`);
         }

         if (tipoStr === 'UNIDADE' && qtd) {
            specs.push(`Qtd: ${qtd}`);
         }
      } else if (tipoStr === 'SERVICO') {
         specs.push("Serviço/Arte");
      } else if (!tipoStr) {
         return "Detalhes em branco";
      }
      return specs.join(" • ");
   };

   const observacaoFinal = item.observacao || item.detalhes?.observacao;

   return (
      <div className="flex flex-col mb-2 bg-phalis-gray/20 border border-gray-700 rounded-lg hover:bg-phalis-gray/40 transition">
         {/* CABEÇALHO DO ITEM (CLICÁVEL PARA EXPANDIR) */}
         <div
            className="flex gap-4 items-center p-3 cursor-pointer"
            onClick={() => setIsExpanded(!isExpanded)}
         >
            <div className="relative w-16 h-16 shrink-0 rounded-md overflow-hidden bg-phalis-dark border border-gray-700">
               <Image src={item.itemImageUrl || '/images/catalogo/arte.png'} alt={item.itemNome} fill className="object-contain" />
            </div>
            <div className="flex-1 min-w-0">
               <h5 className="font-bold text-white text-md truncate flex items-center gap-2">
                  {item.itemNome}
                  <Eye className="h-4 w-4 text-gray-400 hover:text-white transition-colors" />
               </h5>
               <p className="text-xs text-gray-400 mt-1 line-clamp-2">{formatarEspecificacoes()}</p>
               {observacaoFinal && (
                  <p className="text-[11px] text-yellow-500 mt-1 truncate">Obs: {observacaoFinal}</p>
               )}
            </div>
            <div className="text-right shrink-0">
               <span className="text-sm font-bold text-phalis-action">
                  R$ {(Number(item.valor) || 0).toFixed(2)}
               </span>
            </div>
         </div>

         {/* DETALHES DE FATURAMENTO EXPANDIDOS */}
         {isExpanded && (
            <div className="p-3 border-t border-gray-700 bg-black/30 text-xs text-gray-400 grid grid-cols-2 gap-y-2 gap-x-4">
               <div><strong>Tipo:</strong> <span className="capitalize">{tipo}</span></div>
               {qtd && <div><strong>Quantidade:</strong> {qtd} un</div>}
               {w && h && <div><strong>Dimensões:</strong> {w} x {h} {tipo?.toUpperCase() === 'METRO' ? 'm' : 'cm'}</div>}

               {vCusto != null && <div><strong>Custo Base:</strong> R$ {Number(vCusto).toFixed(2)}</div>}
               {vVenda != null && <div><strong>Venda Base:</strong> R$ {Number(vVenda).toFixed(2)}</div>}
               {vArte != null && <div><strong>Adicional Arte:</strong> R$ {Number(vArte).toFixed(2)}</div>}
               {vDesconto != null && <div><strong>Desconto:</strong> R$ {Number(vDesconto).toFixed(2)}</div>}

               <div className="col-span-2 mt-2 pt-2 border-t border-gray-700/50 flex justify-between items-center text-sm">
                  <div className="text-gray-300"><strong>Custo Pedido:</strong> R$ {custoTotalItem.toFixed(2)}</div>
                  <div className="text-green-400 font-bold bg-green-900/30 px-2 py-1 rounded">Lucro Item: R$ {lucroItem.toFixed(2)}</div>
               </div>
            </div>
         )}
      </div>
   );
};

// MAIN COMPONENT
const DetalhesPedidoRow: React.FC<DetalhesProps> = ({ pedido, onPedidoUpdated }) => {
   const { hasPermission } = usePermission();
   const router = useRouter();
   const { user } = useAuth();

   const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
   const [cancelMotivo, setCancelMotivo] = useState('');
   const [cancelLoading, setCancelLoading] = useState(false);
   const [cancelError, setCancelError] = useState('');
   const [copiado, setCopiado] = useState(false);

   // Modal de Pagamento
   const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
   const [paymentValor, setPaymentValor] = useState('');
   const [paymentForma, setPaymentForma] = useState('PIX');
   const [paymentObs, setPaymentObs] = useState('');
   const [paymentLoading, setPaymentLoading] = useState(false);
   const [paymentError, setPaymentError] = useState('');

   // Estados de Fetch da Timeline e Financeiro
   const [historicoProd, setHistoricoProd] = useState<any[]>([]);
   const [pagamentos, setPagamentos] = useState<any[]>([]);
   const [contaReceber, setContaReceber] = useState<any>(null);
   const [isLoadingTimeline, setIsLoadingTimeline] = useState(true);
   const lastFetchedIdRef = React.useRef<string | null>(null);

   useEffect(() => {
      const isInitialLoad = lastFetchedIdRef.current !== String(pedido.id);

      if (isInitialLoad) {
         setIsLoadingTimeline(true);
         setHistoricoProd([]);
         setPagamentos([]);
         setContaReceber(null);
         lastFetchedIdRef.current = String(pedido.id);
      }

      Promise.all([
         authenticatedFetch(`/api/pedidos/${pedido.id}/historico-producao`).then(r => r.ok ? r.json() : []),
         authenticatedFetch(`/api/contas-receber/pedido/${pedido.id}`).then(r => r.ok ? r.json() : null)
      ]).then(([prodData, contasData]) => {
         setHistoricoProd(Array.isArray(prodData) ? prodData : []);
         setPagamentos(contasData && contasData.pagamentos ? contasData.pagamentos : []);
         setContaReceber(contasData);
         setIsLoadingTimeline(false);
      }).catch(err => {
         console.error("Erro timeline:", err);
         setIsLoadingTimeline(false);
      });
   }, [pedido.id, pedido.statusProducao, pedido.statusFinanceiro]);

   const historicoCompleto = useMemo(() => {
      // Começamos o evento inicial de criação:
      const eventos: { status: string, data: string, user: string, subStatus?: string, motivo?: string, observacao?: string }[] = [
         {
            status: 'CRIADO',
            data: pedido.dataCriacao,
            user: pedido.criadoPor?.nome || pedido.criadoPor || 'Sistema'
         }
      ];

      // Mapeamos a Producao
      historicoProd.forEach((hp: any) => {
         eventos.push({
            status: hp.status,
            data: hp.dataAlteracao,
            user: hp.nomeUsuario || 'Sistema'
         });
      });

      // Mapeamos o Financeiro (Pagamentos)
      pagamentos.forEach((pg: any) => {
         eventos.push({
            status: 'PAGAMENTO',
            subStatus: `(R$ ${pg.valorPago.toFixed(2)} - ${pg.formaPagamento})`,
            data: pg.dataPagamento,
            user: pg.nomeUsuario || 'Sistema',
            observacao: pg.observacao
         });
      });

      eventos.sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
      return eventos;
   }, [pedido.dataCriacao, pedido.criadoPor, historicoProd, pagamentos]);

   const itensToRender = pedido.itens && pedido.itens.length > 0
      ? pedido.itens
      : [
         {
            id: pedido.id,
            productId: pedido.productId || 'unknown',
            itemNome: pedido.itemNome || 'Item Desconhecido',
            itemImageUrl: pedido.itemImageUrl || '',
            valor: pedido.valor,
            statusProducao: pedido.statusProducao,
            detalhes: pedido.detalhes
         } as ItemPedido
      ];

   // SUMARIO FINANCEIRO DO PEDIDO
   const resumoFinanceiro = useMemo(() => {
      let custo = 0;
      let arte = 0;
      let desconto = 0;

      itensToRender.forEach(it => {
         const tipoStr = (it.tipoPrecificacao || it.detalhes?.type || '').toUpperCase();
         const qtd = it.quantidade || (it.detalhes as any)?.preco?.quantidade || 1;
         const w = it.largura || (it.detalhes as any)?.preco?.largura || (it.detalhes as any)?.dimensoesPersonalizadas?.larguraCm || 1;
         const h = it.altura || (it.detalhes as any)?.preco?.altura || (it.detalhes as any)?.dimensoesPersonalizadas?.alturaCm || 1;

         const vC = it.valorCusto || (tipoStr === 'UNIDADE' ? (it.detalhes as any)?.preco?.precoCusto : (it.detalhes as any)?.preco?.m2Custo) || 0;

         const precoDet = (it.detalhes as any)?.preco;
         let cTot = precoDet?.custoTotal || precoDet?.valorTotalCusto;
         if (cTot == null) {
            if (tipoStr === 'UNIDADE') cTot = Number(vC);
            else if (tipoStr === 'METRO') cTot = Number(vC) * Number(w) * Number(h) * Number(qtd);
            else cTot = 0;
         }
         custo += Number(cTot);

         const aTot = (it.detalhes as any)?.preco?.precoArte || (it.detalhes as any)?.preco?.valorArte || 0;
         arte += Number(aTot);

         const dTot = it.valorDesconto || (it.detalhes as any)?.preco?.desconto || 0;
         desconto += Number(dTot);
      });

      const lucro = (Number(pedido.valor) || 0) - custo;

      return { custo, arte, desconto, lucro };
   }, [itensToRender, pedido.valor]);

   const isCanceled = pedido.statusProducao === 'CANCELADO';

   const handleEdit = (e: React.MouseEvent) => {
      e.stopPropagation();
      // Edição legado suportava só um item
      router.push(`/pedido?id=${itensToRender[0].productId}&edit=${pedido.id}`);
   };

   const openCancelDialog = (e: React.MouseEvent) => {
      e.stopPropagation();
      setCancelMotivo(''); setCancelError(''); setCancelLoading(false); setIsCancelDialogOpen(true);
   };

   const handleCancelConfirm = async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!cancelMotivo) { setCancelError("O motivo é obrigatório."); return; }
      setCancelLoading(true); setCancelError('');
      try {
         const response = await authenticatedFetch(`/api/pedidos/${pedido.id}/cancelar`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userName: user?.nome || 'Usuário', motivo: cancelMotivo }),
         });
         if (!response.ok) throw new Error('Falha ao cancelar');
         const updatedPedido = await response.json();
         onPedidoUpdated(updatedPedido);
         setIsCancelDialogOpen(false);
      } catch (error: any) {
         setCancelError(error.message);
      } finally {
         setCancelLoading(false);
      }
   };

   // ==================== LÓGICA DE PAGAMENTO PARCIAL ====================

   const valorTotalPedido = Number(contaReceber?.valorTotal || pedido.valor || 0);
   const valorPagoAtual = Number(contaReceber?.valorPago || 0);
   const valorFaltante = Math.max(0, valorTotalPedido - valorPagoAtual);
   const progressoPorcentagem = valorTotalPedido > 0 ? Math.min(100, (valorPagoAtual / valorTotalPedido) * 100) : 0;

   const openPaymentModal = (e: React.MouseEvent) => {
      e.stopPropagation();
      setPaymentValor(valorFaltante.toFixed(2));
      setPaymentForma('PIX');
      setPaymentObs('');
      setPaymentError('');
      setIsPaymentModalOpen(true);
   };

   const handlePaymentSubmit = async (e: React.MouseEvent) => {
      e.stopPropagation();
      const numValor = parseFloat(paymentValor.replace(',', '.'));
      if (isNaN(numValor) || numValor <= 0) {
         setPaymentError("Insira um valor válido.");
         return;
      }
      if (numValor > valorFaltante + 0.05) { // margem de centavos
         setPaymentError(`Você não pode cobrar mais do que o valor restante (R$ ${valorFaltante.toFixed(2)}).`);
         return;
      }

      setPaymentLoading(true);
      setPaymentError('');

      try {
         const payload = {
            valorPago: numValor,
            formaPagamento: paymentForma,
            observacao: paymentObs
         };
         
         const response = await authenticatedFetch(`/api/pedidos/${pedido.id}/pagamento`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
         });

         if (!response.ok) {
            const errBody = await response.text();
            throw new Error(errBody || 'Erro ao registrar pagamento');
         }

         const updatedConta = await response.json();
         
         // Atualiza state local para refletir na barra imediatamente
         setContaReceber(updatedConta);
         setPagamentos(updatedConta.pagamentos || []);
         
         // Injeta evento artificial na timeline para não ter que fazer novo fetch do pedido
         onPedidoUpdated({
            ...pedido,
            statusFinanceiro: updatedConta.status
         });

         setIsPaymentModalOpen(false);

      } catch (error: any) {
         setPaymentError(error.message);
      } finally {
         setPaymentLoading(false);
      }
   };

   return (
      <div className="bg-black/40 rounded-lg border border-phalis-gray/50 overflow-hidden" onClick={e => e.stopPropagation()}>
         <div className="grid grid-cols-1 md:grid-cols-12 gap-0">

            {/* Lado Esquerdo: Lista de Itens */}
            <div className="md:col-span-8 flex flex-col border-r border-gray-800">

               {/* Resumo Financeiro do Pedido */}
               <div className="py-2.5 px-5 border-b border-gray-800 bg-black/20">
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] sm:text-xs">
                     <div className="flex items-center gap-1.5">
                        <span className="text-gray-500 font-medium">Custo Pedido:</span>
                        <span className="text-red-400/80 font-medium">R$ {resumoFinanceiro.custo.toFixed(2)}</span>
                     </div>
                     <div className="flex items-center gap-1.5">
                        <span className="text-gray-500 font-medium">Descontos:</span>
                        <span className="text-yellow-500/80 font-medium">R$ {resumoFinanceiro.desconto.toFixed(2)}</span>
                     </div>
                     <div className="flex items-center gap-1.5">
                        <span className="text-gray-500 font-medium">Adicional Arte:</span>
                        <span className="text-blue-400/80 font-medium">R$ {resumoFinanceiro.arte.toFixed(2)}</span>
                     </div>
                     <div className="flex items-center gap-1.5 ml-auto border-l border-gray-700/50 pl-4 py-0.5">
                        <span className="text-gray-400 font-semibold">Lucro Líquido:</span>
                        <span className="font-bold text-green-500/90">R$ {resumoFinanceiro.lucro.toFixed(2)}</span>
                     </div>
                  </div>
               </div>

               {/* Barra de Progresso Financeiro (Pagamentos Parciais) */}
               {contaReceber && (
                  <div className="py-4 px-5 border-b border-gray-800 bg-[#151515]">
                     <div className="flex justify-between items-end mb-2">
                        <div>
                           <h4 className="text-gray-300 text-sm font-bold flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-phalis-action" />
                              Andamento Financeiro
                           </h4>
                           <p className="text-xs text-gray-500 mt-0.5">
                              Pago: <strong className="text-white">R$ {valorPagoAtual.toFixed(2)}</strong> / 
                              Total: R$ {valorTotalPedido.toFixed(2)}
                           </p>
                        </div>
                        {valorFaltante > 0 && !isCanceled && hasPermission('pedidos.status.financeiro') && (
                           <Button 
                              size="sm" 
                              className="bg-phalis-action hover:bg-cyan-600 text-black font-bold h-8 text-xs"
                              onClick={openPaymentModal}
                           >
                              <PlusCircle className="w-3.5 h-3.5 mr-1" /> Registrar Pagamento
                           </Button>
                        )}
                        {valorFaltante <= 0 && !isCanceled && (
                           <span className="bg-green-600/20 text-green-400 font-bold text-xs px-2 py-1 rounded border border-green-600/30">
                              <Check className="w-3 h-3 inline mr-1" /> Quitada
                           </span>
                        )}
                     </div>

                     {/* Progress Bar Container */}
                     <div className="w-full bg-gray-800 rounded-full h-2.5 mt-2 overflow-hidden flex">
                        <div 
                           className={cn(
                              "h-2.5 transition-all duration-700 ease-out", 
                              progressoPorcentagem < 100 ? "bg-phalis-action shadow-[0_0_8px_#00bcd4]" : "bg-green-500 shadow-[0_0_8px_#4ade80]"
                           )}
                           style={{ width: `${progressoPorcentagem}%` }}
                        />
                     </div>
                     {valorFaltante > 0 && (
                        <p className="text-[10px] text-yellow-500/80 text-right mt-1 font-medium">
                           Falta receber: R$ {valorFaltante.toFixed(2)}
                        </p>
                     )}
                  </div>
               )}

               {/* Lista de Itens */}
               <div className="p-5 flex-1">
                  <h4 className="text-md font-semibold text-white mb-4 flex items-center justify-between">
                     <span>Itens do Pedido ({itensToRender.length})</span>
                     <span className="text-phalis-action font-bold text-lg">{(Number(pedido.valor) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                  </h4>
                  <div className="space-y-3">
                     {itensToRender.map((item, idx) => (
                        <MiniItemCard key={item.id || idx} item={item} />
                     ))}
                  </div>
               </div>
            </div>

            {/* Lado Direito: Histórico */}
            <div className="md:col-span-4 p-5 bg-phalis-gray/10 flex flex-col h-full">
               <h4 className="text-md font-semibold text-white mb-4 flex items-center gap-2">
                  Linha do Tempo
               </h4>

               <div className="flex-1 overflow-y-auto max-h-[350px] pr-2 scrollbar-thin">
                  {isLoadingTimeline ? (
                     <div className="flex items-center justify-center p-6 text-gray-500">
                        <Loader2 className="h-6 w-6 animate-spin mr-2" /> Carregando Histórico...
                     </div>
                  ) : (
                     <ol className="list-none m-0 p-0">
                        {historicoCompleto.length === 0 && <span className="text-sm text-gray-400">Nenhum evento registrado.</span>}
                        {historicoCompleto.map((item, index) => (
                           <TimelineItem key={index} item={item} isLast={index === historicoCompleto.length - 1} />
                        ))}
                     </ol>
                  )}
               </div>

               <div className="flex flex-col space-y-2 mt-4 pt-4 border-t border-gray-800">
                  {pedido.hashRastreio && (
                     <Button 
                        variant="outline" 
                        size="sm" 
                        className={cn(
                           "w-full border-gray-700",
                           copiado ? "bg-green-600/20 text-green-400 hover:bg-green-600/30 hover:text-green-300" : "bg-phalis-dark hover:bg-gray-700 hover:text-white"
                        )}
                        onClick={(e) => {
                           e.stopPropagation();
                           const url = `${window.location.origin}/rastreio/${pedido.hashRastreio}`;
                           navigator.clipboard.writeText(url);
                           setCopiado(true);
                           setTimeout(() => setCopiado(false), 2000);
                        }}
                     >
                        {copiado ? <Check className="h-4 w-4 mr-2" /> : <LinkIcon className="h-4 w-4 mr-2" />}
                        {copiado ? 'Link Copiado!' : 'Copiar Link de Rastreio'}
                     </Button>
                  )}
                  {hasPermission('pedidos.editar') && (
                     <Button variant="outline" size="sm" className="w-full bg-phalis-dark border-gray-700 hover:bg-gray-700 hover:text-white" onClick={handleEdit} disabled={isCanceled}>
                        <Pencil className="h-4 w-4 mr-2" /> Editar Pedido
                     </Button>
                  )}
                  {hasPermission('pedidos.cancelar') && (
                     <Button variant="outline" size="sm" className="w-full bg-phalis-danger/20 text-phalis-danger border-phalis-danger/30 hover:bg-phalis-danger/30 hover:text-red-400" onClick={openCancelDialog} disabled={isCanceled}>
                        <XOctagon className="h-4 w-4 mr-2" /> Cancelar Pedido
                     </Button>
                  )}
               </div>
            </div>

         </div>

         <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
            <AlertDialogContent className="bg-phalis-black border-gray-800 text-white">
               <AlertDialogHeader>
                  <AlertDialogTitle>Cancelar Pedido {pedido.id}?</AlertDialogTitle>
                  <AlertDialogDescription asChild>
                     <div className="text-gray-400 space-y-3 mt-2">
                        <p className="text-yellow-400">Esta ação não pode ser desfeita. Todos os itens associados serão cancelados.</p>
                        <div className="space-y-2 pt-2">
                           <Label htmlFor="motivo" className="text-white">Motivo (Obrigatório)</Label>
                           <Textarea id="motivo" className="bg-phalis-gray border-0" value={cancelMotivo} onChange={(e) => setCancelMotivo(e.target.value)} onClick={(e) => e.stopPropagation()} />
                           {cancelError && <p className="text-sm text-phalis-danger">{cancelError}</p>}
                        </div>
                     </div>
                  </AlertDialogDescription>
               </AlertDialogHeader>
               <AlertDialogFooter>
                  <AlertDialogCancel className="bg-gray-700 border-0 hover:text-white" onClick={(e) => e.stopPropagation()}>Voltar</AlertDialogCancel>
                  <Button className="bg-phalis-danger text-white hover:bg-red-700" disabled={cancelLoading} onClick={handleCancelConfirm}>{cancelLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirmar Cancelamento"}</Button>
               </AlertDialogFooter>
            </AlertDialogContent>
         </AlertDialog>

         {/* Modal de Pagamento Parcial */}
         <AlertDialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
            <AlertDialogContent className="bg-phalis-black border-gray-800 text-white max-w-sm">
               <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                     <DollarSign className="w-5 h-5 text-phalis-action" /> Add Pagamento
                  </AlertDialogTitle>
                  <AlertDialogDescription asChild>
                     <div className="text-gray-400 space-y-4 mt-4">
                        <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-800 text-center">
                           <p className="text-sm font-semibold text-gray-300">Valor Restante</p>
                           <p className="text-2xl font-bold text-phalis-action">R$ {valorFaltante.toFixed(2)}</p>
                        </div>

                        <div className="space-y-1.5">
                           <Label htmlFor="valor" className="text-white text-xs">Valor Cobrado (R$)</Label>
                           <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                              <input 
                                 id="valor"
                                 type="number"
                                 step="0.01"
                                 min="0.01"
                                 max={valorFaltante}
                                 className="flex h-10 w-full rounded-md border border-gray-700 bg-phalis-gray px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-phalis-action pl-8"
                                 value={paymentValor}
                                 onChange={(e) => setPaymentValor(e.target.value)}
                                 onClick={e => e.stopPropagation()}
                              />
                           </div>
                        </div>

                        <div className="space-y-1.5">
                           <Label className="text-white text-xs">Forma de Pagamento</Label>
                           <Select value={paymentForma} onValueChange={setPaymentForma}>
                              <SelectTrigger className="w-full bg-phalis-gray border-gray-700 text-white" onClick={e => e.stopPropagation()}>
                                 <SelectValue placeholder="Selecione..." />
                              </SelectTrigger>
                              <SelectContent className="bg-phalis-dark border-gray-700 text-white">
                                 <SelectItem value="PIX"><div className="flex items-center"><Banknote className="w-4 h-4 mr-2" /> PIX</div></SelectItem>
                                 <SelectItem value="CREDITO"><div className="flex items-center"><CreditCard className="w-4 h-4 mr-2" /> Cartão de Crédito</div></SelectItem>
                                 <SelectItem value="DEBITO"><div className="flex items-center"><CreditCard className="w-4 h-4 mr-2" /> Cartão de Débito</div></SelectItem>
                                 <SelectItem value="DINHEIRO"><div className="flex items-center"><Landmark className="w-4 h-4 mr-2" /> Dinheiro</div></SelectItem>
                                 <SelectItem value="TRANSFERENCIA"><div className="flex items-center"><Landmark className="w-4 h-4 mr-2" /> Transferência</div></SelectItem>
                              </SelectContent>
                           </Select>
                        </div>

                        <div className="space-y-1.5">
                           <Label htmlFor="obs" className="text-white text-xs">Observação (Opcional)</Label>
                           <Textarea 
                              id="obs" 
                              className="bg-phalis-gray border-gray-700 min-h-[60px]" 
                              placeholder="Ex: Sinal para iniciar a arte"
                              value={paymentObs} 
                              onChange={(e) => setPaymentObs(e.target.value)} 
                              onClick={(e) => e.stopPropagation()} 
                           />
                        </div>

                        {paymentError && <p className="text-sm text-phalis-danger">{paymentError}</p>}
                     </div>
                  </AlertDialogDescription>
               </AlertDialogHeader>
               <AlertDialogFooter className="mt-2">
                  <AlertDialogCancel className="bg-gray-800/50 border-0 hover:text-white" onClick={(e) => e.stopPropagation()}>Cancelar</AlertDialogCancel>
                  <Button 
                     className="bg-phalis-action text-black font-bold hover:bg-cyan-600" 
                     disabled={paymentLoading} 
                     onClick={handlePaymentSubmit}
                  >
                     {paymentLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar Pagamento"}
                  </Button>
               </AlertDialogFooter>
            </AlertDialogContent>
         </AlertDialog>
      </div>
   );
};

export default DetalhesPedidoRow;