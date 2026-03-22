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
import { Pencil, XOctagon, Loader2, DollarSign, Eye } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import { usePermission } from '@/lib/auth/usePermission';
import { useRouter } from 'next/navigation';

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
   ACABAMENTO: 'bg-indigo-600', PRONTO: 'bg-purple-600',
   ENTREGUE: 'bg-green-600', CANCELADO: 'bg-gray-700',
   CRIADO: 'bg-gray-500', PAGAMENTO: 'bg-green-400'
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
   const vArte = (item.detalhes as any)?.preco?.precoArte || (item.detalhes as any)?.preco?.valorArte;
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
               {vArte != null && <div><strong>Add Arte:</strong> R$ {Number(vArte).toFixed(2)}</div>}
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

   // Estados de Fetch da Timeline
   const [historicoProd, setHistoricoProd] = useState<any[]>([]);
   const [pagamentos, setPagamentos] = useState<any[]>([]);
   const [isLoadingTimeline, setIsLoadingTimeline] = useState(true);

   useEffect(() => {
      setIsLoadingTimeline(true);
      Promise.all([
         authenticatedFetch(`/api/pedidos/${pedido.id}/historico-producao`).then(r => r.ok ? r.json() : []),
         authenticatedFetch(`/api/contas-receber/pedido/${pedido.id}`).then(r => r.ok ? r.json() : null)
      ]).then(([prodData, contasData]) => {
         setHistoricoProd(Array.isArray(prodData) ? prodData : []);
         setPagamentos(contasData && contasData.pagamentos ? contasData.pagamentos : []);
         setIsLoadingTimeline(false);
      }).catch(err => {
         console.error("Erro timeline:", err);
         setIsLoadingTimeline(false);
      });
   }, [pedido.id]);

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
                           <span className="text-gray-500 font-medium">Add Arte:</span>
                           <span className="text-blue-400/80 font-medium">R$ {resumoFinanceiro.arte.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 ml-auto border-l border-gray-700/50 pl-4 py-0.5">
                           <span className="text-gray-400 font-semibold">Lucro Líquido:</span>
                           <span className="font-bold text-green-500/90">R$ {resumoFinanceiro.lucro.toFixed(2)}</span>
                        </div>
                     </div>
                  </div>

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
       </div>
   );
};

export default DetalhesPedidoRow;