// Arquivo: components/pedidos/DetalhesPedidoRow.tsx
import React, { useMemo, useState } from 'react';
import { Pedido } from '@/lib/orderData';
import { optionGroupsConfig, getProductById, type Product } from '@/lib/productData';
import Image from 'next/image';
import { cn } from "@/lib/utils";
import { useRouter } from 'next/navigation';
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
import {
   Pencil, XOctagon, Loader2, FileText, DollarSign, AlertCircle,
   ChevronDown, ChevronUp, TrendingUp
} from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import { usePermission } from '@/lib/auth/usePermission';

type DetalhesProps = {
   pedido: Pedido;
   onPedidoUpdated: (pedido: Pedido) => void;
};

const formatarData = (isoString: string) => {
   return new Date(isoString).toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
   });
};

// STATUS MAPS
const STATUS_NOME_MAP: Record<string, string> = {
   nao_pago: 'Não Pago', pago_50: 'Pago 50%', pago: 'Pago',
   pre_prod: 'Pré-Produção', em_producao: 'Em Produção',
   pronto_retirada: 'Pronto p/ Retirada', concluido: 'Concluído',
   CRIADO: 'Pedido Criado', cancelado: 'Cancelado',
};
const STATUS_COR_MAP: Record<string, string> = {
   nao_pago: 'bg-red-600', pago_50: 'bg-yellow-500', pago: 'bg-green-600',
   pre_prod: 'bg-gray-500', em_producao: 'bg-blue-600',
   pronto_retirada: 'bg-purple-600', concluido: 'bg-green-600',
   CRIADO: 'bg-gray-500', cancelado: 'bg-gray-700',
};

// TIMELINE ITEM
const TimelineItem = ({ item, isLast }: { item: { status: string, data: string, user: string, subStatus?: string, motivo?: string }, isLast: boolean }) => {
   const nomeStatus = STATUS_NOME_MAP[item.status] || item.status.replace(/_/g, ' ');
   const corStatus = STATUS_COR_MAP[item.status] || 'bg-cyan-500';
   return (
      <li className="flex gap-3">
         <div className="flex flex-col items-center">
            <div className={cn("h-3 w-3 rounded-full", corStatus)} />
            {!isLast && (<div className="w-px flex-1 bg-gray-600 my-1" />)}
         </div>
         <div className="pb-4 -mt-1 flex-1">
            <div className="flex justify-between text-xs">
               <span className="text-sm text-white font-medium">{nomeStatus}</span>
               <span className="text-gray-400">{item.user}</span>
            </div>
            {item.subStatus && (<div className="text-xs text-gray-400">{item.subStatus}</div>)}
            {item.motivo && (<div className="text-xs text-red-400 italic mt-1">Motivo: {item.motivo}</div>)}
            <div className="text-xs text-gray-500">{formatarData(item.data)}</div>
         </div>
      </li>
   );
};

// --- NOVOS COMPONENTES VISUAIS ---

const InfoBlock = ({ label, value, highlight = false }: { label: string, value: React.ReactNode, highlight?: boolean }) => (
   <div className="flex flex-col">
      <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-0.5">{label}</span>
      <span className={cn("text-sm font-medium", highlight ? "text-phalis-action" : "text-gray-200")}>{value}</span>
   </div>
);

const MoneyRow = ({
   label,
   value,
   isTotal = false,
   isDiscount = false,
   isCost = false
}: {
   label: string,
   value: number,
   isTotal?: boolean,
   isDiscount?: boolean,
   isCost?: boolean
}) => (
   <div className={cn("flex justify-between items-center py-1", isTotal && "pt-2 mt-1 border-t border-white/10")}>
      <span className={cn("text-sm", isTotal ? "text-white font-bold" : "text-gray-400")}>{label}</span>
      <span className={cn(
         "text-sm font-mono",
         isTotal ? "text-phalis-action font-bold text-lg" : "text-gray-300",
         isDiscount && "text-red-400",
         isCost && "text-gray-500" // Cor mais apagada para custos
      )}>
         {isDiscount ? "-" : ""}R$ {value.toFixed(2)}
      </span>
   </div>
);

// --- RENDERIZADORES ---

const DetalhesUnidadeMetro: React.FC<{ pedido: Pedido; produto: Product; onPedidoUpdated: (pedido: Pedido) => void; }> = ({ pedido, produto, onPedidoUpdated }) => {
   const { hasPermission } = usePermission();
   const { detalhes, itemImageUrl, itemNome } = pedido;
   const router = useRouter();
   const { user } = useAuth();

   const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
   const [cancelMotivo, setCancelMotivo] = useState('');
   const [cancelLoading, setCancelLoading] = useState(false);
   const [cancelError, setCancelError] = useState('');

   // Estado para expandir os detalhes financeiros
   const [showFinanceDetails, setShowFinanceDetails] = useState(false);

   if (detalhes.type !== 'unidade' && detalhes.type !== 'metro') return null;
   const { opcoes, preco } = detalhes;

   const getOptionLabel = (groupId: string) => {
      const optionId = opcoes[groupId];
      if (!optionId) return '---';
      if (groupId === 'tamanho' && detalhes.type === 'unidade' && detalhes.dimensoesPersonalizadas) {
         const { larguraCm, alturaCm } = detalhes.dimensoesPersonalizadas;
         return `Personalizado (${larguraCm}x${alturaCm}cm)`;
      }
      return produto.options?.[groupId as keyof typeof produto.options]?.find((o: any) => o.id === optionId)?.name || optionId;
   };

   // Cálculos Auxiliares para Exibição
   const custoTotalReal = detalhes.type === 'unidade' ? preco.custoTotal : preco.valorTotalCusto;
   const lucroEstimado = preco.total - custoTotalReal;

   // Cálculo unitário / m2 para exibição
   const custoUnitarioOuM2 = detalhes.type === 'unidade'
      ? (preco.custoTotal / (preco.quantidade || 1))
      : preco.m2Custo;

   const vendaUnitarioOuM2 = detalhes.type === 'unidade'
      ? (preco.vendaTotal / (preco.quantidade || 1))
      : preco.m2Venda;

   const historicoCompleto = useMemo(() => {
      const statusInicialFinanceiro = pedido.historicoFinanceiro[0]?.status || 'nao_pago';
      const criacaoEvent = {
         status: 'CRIADO', subStatus: `(${STATUS_NOME_MAP[statusInicialFinanceiro]})`,
         data: pedido.dataCriacao, user: pedido.criadoPor,
      };
      const eventosFinanceiros = pedido.historicoFinanceiro.slice(1);
      const eventosProducao = pedido.historicoProducao.slice(1);
      const todosEventos = [criacaoEvent, ...eventosFinanceiros, ...eventosProducao];
      todosEventos.sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
      return todosEventos;
   }, [pedido]);

   const handleEdit = (e: React.MouseEvent) => { e.stopPropagation(); router.push(`/pedido?id=${pedido.productId}&edit=${pedido.id}`); };
   const openCancelDialog = (e: React.MouseEvent) => { e.stopPropagation(); setCancelMotivo(''); setCancelError(''); setCancelLoading(false); setIsCancelDialogOpen(true); };

   const handleCancelConfirm = async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!cancelMotivo) { setCancelError("O motivo é obrigatório."); return; }
      setCancelLoading(true); setCancelError('');
      try {
         const response = await fetch(`/api/pedidos/${pedido.id}/cancelar`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userName: user?.nome || 'Usuário', motivo: cancelMotivo }),
         });
         if (!response.ok) throw new Error('Falha ao cancelar');
         const updatedPedido = await response.json();
         onPedidoUpdated(updatedPedido);
         setIsCancelDialogOpen(false);
      } catch (error: any) { setCancelError(error.message); } finally { setCancelLoading(false); }
   };

   const isCanceled = pedido.statusProducao === 'cancelado';

   return (
      <>
         <div className="bg-phalis-gray/30 rounded-lg border border-phalis-gray p-0 overflow-hidden grid grid-cols-1 md:grid-cols-12">

            {/* COLUNA 1: Imagem e Info Básica */}
            <div className="md:col-span-3 p-4 bg-black/20 border-r border-phalis-gray/50 flex flex-col items-center text-center">
               <div className="relative w-full aspect-square rounded-md overflow-hidden bg-phalis-dark mb-3 border border-phalis-gray/50">
                  <Image src={itemImageUrl} alt={itemNome} fill className="object-contain" />
               </div>
               <h4 className="font-bold text-white text-lg leading-tight mb-1">{itemNome}</h4>
               <span className="text-xs text-gray-500 uppercase font-semibold bg-phalis-gray px-2 py-0.5 rounded">
                  {detalhes.type === 'unidade' ? 'Produto Unitário' : 'Produto por Metro'}
               </span>
            </div>

            {/* COLUNA 2: Especificações e Financeiro */}
            <div className="md:col-span-6 p-5 flex flex-col gap-6">

               {/* Bloco Técnico */}
               <div>
                  <h5 className="flex items-center gap-2 text-sm font-semibold text-phalis-action mb-3 border-b border-phalis-action/20 pb-1">
                     <FileText className="h-4 w-4" /> Especificações Técnicas
                  </h5>
                  <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                     <InfoBlock label="Papel / Material" value={getOptionLabel('papel')} />
                     <InfoBlock label="Tamanho" value={getOptionLabel('tamanho')} />
                     <InfoBlock label="Cores" value={getOptionLabel('cores')} />
                     <InfoBlock label="Acabamento" value={getOptionLabel('acabamento')} />

                     {detalhes.type === 'unidade' && (
                        <InfoBlock label="Quantidade" value={`${preco.quantidade} unid.`} highlight />
                     )}
                     {detalhes.type === 'metro' && (
                        <InfoBlock label="Dimensões" value={`${preco.largura.toFixed(2)}m x ${preco.altura.toFixed(2)}m`} highlight />
                     )}
                  </div>

                  {detalhes.observacao && (
                     <div className="mt-4 bg-yellow-500/5 border border-yellow-500/20 rounded p-2">
                        <p className="text-[10px] uppercase font-bold text-yellow-600/80 mb-0.5 flex items-center gap-1">
                           <AlertCircle className="h-3 w-3" /> Observações
                        </p>
                        <p className="text-sm text-gray-300">{detalhes.observacao}</p>
                     </div>
                  )}
               </div>

               {/* Bloco Financeiro Expandível */}
               <div>
                  <div className="flex items-center justify-between mb-3 border-b border-green-500/20 pb-1">
                     <h5 className="flex items-center gap-2 text-sm font-semibold text-green-400">
                        <DollarSign className="h-4 w-4" /> Resumo Financeiro
                     </h5>
                     <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs text-gray-500 hover:text-white hover:bg-transparent p-0"
                        onClick={(e) => { e.stopPropagation(); setShowFinanceDetails(!showFinanceDetails); }}
                     >
                        {showFinanceDetails ? "Ocultar Detalhes" : "Ver Detalhes de Custos"}
                        {showFinanceDetails ? <ChevronUp className="ml-1 h-3 w-3" /> : <ChevronDown className="ml-1 h-3 w-3" />}
                     </Button>
                  </div>

                  <div className="bg-black/30 rounded p-3 transition-all duration-300">

                     {/* Resumo Padrão (Sempre Visível) */}
                     {detalhes.type === 'unidade' ? (
                        <>
                           <MoneyRow label="Valor Venda (Total)" value={preco.vendaTotal} />
                           {preco.precoArte > 0 && <MoneyRow label="Arte" value={preco.precoArte} />}
                        </>
                     ) : (
                        <>
                           <MoneyRow label="Valor Venda (Total)" value={preco.valorTotalVenda} />
                           {preco.valorArte > 0 && <MoneyRow label="Arte" value={preco.valorArte} />}
                        </>
                     )}

                     {preco.desconto > 0 && <MoneyRow label="Desconto" value={preco.desconto} isDiscount />}
                     <MoneyRow label="TOTAL FINAL" value={preco.total} isTotal />

                     {/* Área Expandida (Caixa Preta) */}
                     {showFinanceDetails && (
                        <div className="mt-3 pt-3 border-t border-gray-700/50 space-y-1 animate-in slide-in-from-top-2">
                           <p className="text-[10px] uppercase font-bold text-gray-500 mb-2">Detalhamento de Custos & Lucro</p>

                           {/* Dados Unitários / m2 */}
                           <div className="grid grid-cols-2 gap-4 mb-2 pb-2 border-b border-gray-800">
                              <div>
                                 <span className="text-xs text-gray-500 block">Custo {detalhes.type === 'unidade' ? 'Unit.' : 'm²'}</span>
                                 <span className="text-sm text-gray-400 font-mono">R$ {custoUnitarioOuM2.toFixed(2)}</span>
                              </div>
                              <div className="text-right">
                                 <span className="text-xs text-gray-500 block">Venda {detalhes.type === 'unidade' ? 'Unit.' : 'm²'}</span>
                                 <span className="text-sm text-phalis-action font-mono">R$ {vendaUnitarioOuM2.toFixed(2)}</span>
                              </div>
                           </div>

                           {/* Totais de Custo */}
                           <MoneyRow label="Custo Total de Produção" value={custoTotalReal} isCost />

                           {/* Lucro */}
                           <div className="flex justify-between items-center py-1 mt-1 pt-1 border-t border-gray-800">
                              <span className="text-sm text-white flex items-center gap-1">
                                 <TrendingUp className="h-3 w-3" /> Lucro Estimado
                              </span>
                              <span className={cn("text-sm font-mono font-bold", lucroEstimado >= 0 ? "text-green-500" : "text-red-500")}>
                                 R$ {lucroEstimado.toFixed(2)}
                              </span>
                           </div>
                        </div>
                     )}
                  </div>
               </div>
            </div>

            {/* COLUNA 3: Gestão do Tempo (INTACTA) */}
            <div className="md:col-span-3 p-4 bg-phalis-gray/10 border-l border-phalis-gray/50 flex flex-col h-full">
               <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  Gestão do Tempo
               </h4>
               <div className="flex-1 overflow-y-auto max-h-[300px] pr-2 scrollbar-thin">
                  <ol className="list-none m-0 p-0">
                     {historicoCompleto.map((item, index) => (
                        <TimelineItem
                           key={index}
                           item={item}
                           isLast={index === historicoCompleto.length - 1}
                        />
                     ))}
                  </ol>
               </div>

               <div className="flex flex-col space-y-2 mt-4 pt-4 border-t border-gray-800">
                  {hasPermission('pedidos.editar') && (
                     <Button variant="outline" size="sm" className="w-full bg-phalis-dark border-gray-700 hover:bg-gray-700 hover:text-white" onClick={handleEdit} disabled={isCanceled}>
                        <Pencil className="h-4 w-4 mr-2" /> Editar
                     </Button>
                  )}
                  {hasPermission('pedidos.cancelar') && (
                     <Button variant="outline" size="sm" className="w-full bg-phalis-danger/20 text-phalis-danger border-phalis-danger/30 hover:bg-phalis-danger/30 hover:text-red-400" onClick={openCancelDialog} disabled={isCanceled}>
                        <XOctagon className="h-4 w-4 mr-2" /> Cancelar
                     </Button>
                  )}
               </div>
            </div>
         </div>

         {/* Modal de Cancelamento (Mantido) */}
         <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
            <AlertDialogContent className="bg-phalis-black border-gray-800 text-white">
               <AlertDialogHeader>
                  <AlertDialogTitle>Cancelar Pedido {pedido.id}?</AlertDialogTitle>
                  <AlertDialogDescription asChild>
                     <div className="text-gray-400 space-y-3">
                        <p>Cliente: <span className="font-medium text-white">{pedido.cliente.nome}</span><br />Produto: <span className="font-medium text-white">{pedido.itemNome}</span></p>
                        <p className="text-yellow-400">Esta ação não pode ser desfeita.</p>
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
                  <Button className="bg-phalis-danger text-white hover:bg-red-700" disabled={cancelLoading} onClick={handleCancelConfirm}>{cancelLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirmar"}</Button>
               </AlertDialogFooter>
            </AlertDialogContent>
         </AlertDialog>
      </>
   );
};

const DetalhesServico: React.FC<{ pedido: Pedido; onPedidoUpdated: (pedido: Pedido) => void; }> = ({ pedido, onPedidoUpdated }) => {
   const { hasPermission } = usePermission();
   const { detalhes, itemImageUrl, itemNome } = pedido;
   const router = useRouter();
   const { user } = useAuth();

   const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
   const [cancelMotivo, setCancelMotivo] = useState('');
   const [cancelLoading, setCancelLoading] = useState(false);
   const [cancelError, setCancelError] = useState('');

   if (detalhes.type !== 'servico') return null;
   const { preco } = detalhes;

   const historicoCompleto = useMemo(() => {
      const statusInicialFinanceiro = pedido.historicoFinanceiro[0]?.status || 'nao_pago';
      const criacaoEvent = {
         status: 'CRIADO', subStatus: `(${STATUS_NOME_MAP[statusInicialFinanceiro]})`,
         data: pedido.dataCriacao, user: pedido.criadoPor,
      };
      const eventosFinanceiros = pedido.historicoFinanceiro.slice(1);
      const eventosProducao = pedido.historicoProducao.slice(1);
      const todosEventos = [criacaoEvent, ...eventosFinanceiros, ...eventosProducao];
      todosEventos.sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
      return todosEventos;
   }, [pedido]);

   const handleEdit = (e: React.MouseEvent) => { e.stopPropagation(); router.push(`/pedido?id=${pedido.productId}&edit=${pedido.id}`); };
   const openCancelDialog = (e: React.MouseEvent) => { e.stopPropagation(); setCancelMotivo(''); setCancelError(''); setCancelLoading(false); setIsCancelDialogOpen(true); };

   const handleCancelConfirm = async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!cancelMotivo) { setCancelError("O motivo é obrigatório."); return; }
      setCancelLoading(true); setCancelError('');
      try {
         const response = await fetch(`/api/pedidos/${pedido.id}/cancelar`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userName: user?.nome || 'Usuário', motivo: cancelMotivo }),
         });
         if (!response.ok) throw new Error('Falha ao cancelar');
         const updatedPedido = await response.json();
         onPedidoUpdated(updatedPedido);
         setIsCancelDialogOpen(false);
      } catch (error: any) { setCancelError(error.message); } finally { setCancelLoading(false); }
   };

   const isCanceled = pedido.statusProducao === 'cancelado';

   return (
      <>
         <div className="bg-phalis-gray/30 rounded-lg border border-phalis-gray p-0 overflow-hidden grid grid-cols-1 md:grid-cols-12">

            {/* COLUNA 1: Imagem e Info (3 colunas) */}
            <div className="md:col-span-3 p-4 bg-black/20 border-r border-phalis-gray/50 flex flex-col items-center text-center">
               <div className="relative w-full aspect-square rounded-md overflow-hidden bg-phalis-dark mb-3 border border-phalis-gray/50">
                  <Image src={itemImageUrl} alt={itemNome} fill className="object-contain" />
               </div>
               <h4 className="font-bold text-white text-lg leading-tight mb-1">{itemNome}</h4>
               <span className="text-xs text-gray-500 uppercase font-semibold bg-phalis-gray px-2 py-0.5 rounded">Serviço / Arte</span>
            </div>

            {/* COLUNA 2: Detalhes do Serviço (6 colunas) */}
            <div className="md:col-span-6 p-5 flex flex-col gap-6 justify-center">
               {detalhes.observacao && (
                  <div>
                     <h5 className="text-sm font-semibold text-phalis-action mb-2 flex items-center gap-2">
                        <FileText className="h-4 w-4" /> Descrição do Serviço
                     </h5>
                     <p className="text-sm text-white whitespace-pre-wrap bg-black/20 p-3 rounded border border-white/5">
                        {detalhes.observacao}
                     </p>
                  </div>
               )}

               <div className="bg-black/30 rounded p-4 mt-auto">
                  <MoneyRow label="Valor Venda" value={preco.valorVenda} />
                  {preco.desconto > 0 && <MoneyRow label="Desconto" value={preco.desconto} isDiscount />}
                  <MoneyRow label="TOTAL FINAL" value={Math.max(0, preco.valorVenda - (preco.desconto || 0))} isTotal />
               </div>
            </div>

            {/* COLUNA 3: Gestão do Tempo (3 colunas - INTACTA) */}
            <div className="md:col-span-3 p-4 bg-phalis-gray/10 border-l border-phalis-gray/50 flex flex-col h-full">
               <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  Gestão do Tempo
               </h4>
               <div className="flex-1 overflow-y-auto max-h-[300px] pr-2 scrollbar-thin">
                  <ol className="list-none m-0 p-0">
                     {historicoCompleto.map((item, index) => (
                        <TimelineItem
                           key={index}
                           item={item}
                           isLast={index === historicoCompleto.length - 1}
                        />
                     ))}
                  </ol>
               </div>

               <div className="flex flex-col space-y-2 mt-4 pt-4 border-t border-gray-800">
                  {hasPermission('pedidos.editar') && (
                     <Button
                        variant="outline"
                        size="sm"
                        className="w-full bg-phalis-dark border-gray-700 hover:bg-gray-700 hover:text-white"
                        onClick={handleEdit}
                        disabled={isCanceled}
                     >
                        <Pencil className="h-4 w-4 mr-2" /> Editar
                     </Button>
                  )}
                  {hasPermission('pedidos.cancelar') && (
                     <Button
                        variant="outline"
                        size="sm"
                        className="w-full bg-phalis-danger/20 text-phalis-danger border-phalis-danger/30 hover:bg-phalis-danger/30 hover:text-red-400"
                        onClick={openCancelDialog}
                        disabled={isCanceled}
                     >
                        <XOctagon className="h-4 w-4 mr-2" /> Cancelar
                     </Button>
                  )}
               </div>
            </div>
         </div>

         {/* Modal Cancelamento (Mantido) */}
         <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
            <AlertDialogContent className="bg-phalis-black border-gray-800 text-white">
               <AlertDialogHeader>
                  <AlertDialogTitle>Cancelar Pedido {pedido.id}?</AlertDialogTitle>
                  <AlertDialogDescription asChild>
                     <div className="text-gray-400 space-y-3">
                        <p>
                           Cliente: <span className="font-medium text-white">{pedido.cliente.nome}</span><br />
                           Produto: <span className="font-medium text-white">{pedido.itemNome}</span>
                        </p>
                        <p className="text-yellow-400">Esta ação não pode ser desfeita.</p>
                        <div className="space-y-2 pt-2">
                           <Label htmlFor="motivo-servico" className="text-white">Motivo (Obrigatório)</Label>
                           <Textarea
                              id="motivo-servico"
                              className="bg-phalis-gray border-0"
                              value={cancelMotivo}
                              onChange={(e) => setCancelMotivo(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                           />
                           {cancelError && <p className="text-sm text-phalis-danger">{cancelError}</p>}
                        </div>
                     </div>
                  </AlertDialogDescription>
               </AlertDialogHeader>
               <AlertDialogFooter>
                  <AlertDialogCancel className="bg-gray-700 border-0 hover:text-white" onClick={(e) => e.stopPropagation()}>Voltar</AlertDialogCancel>
                  <Button className="bg-phalis-danger text-white hover:bg-red-700" disabled={cancelLoading} onClick={handleCancelConfirm}>
                     {cancelLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirmar"}
                  </Button>
               </AlertDialogFooter>
            </AlertDialogContent>
         </AlertDialog>
      </>
   );
};

const DetalhesPedidoRow: React.FC<DetalhesProps> = ({ pedido, onPedidoUpdated }) => {
   const produto = getProductById(pedido.productId);
   if (!produto) return <div className="text-red-500 p-4">Erro: Produto original (ID: {pedido.productId}) não encontrado.</div>;

   switch (pedido.detalhes.type) {
      case 'unidade':
      case 'metro':
         return <DetalhesUnidadeMetro pedido={pedido} produto={produto} onPedidoUpdated={onPedidoUpdated} />;
      case 'servico':
         return <DetalhesServico pedido={pedido} onPedidoUpdated={onPedidoUpdated} />;
      default:
         return <div>Detalhes indisponíveis.</div>;
   }
};

export default DetalhesPedidoRow;