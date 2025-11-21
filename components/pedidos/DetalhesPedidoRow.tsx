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
import { Pencil, XOctagon, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import { usePermission } from '@/lib/auth/usePermission';

type DetalhesProps = {
   pedido: Pedido;
   onPedidoUpdated: (pedido: Pedido) => void;
};

// ... (formatarData, DetailRow, Mapas de Estilo, TimelineItem - Sem mudanças) ...
const formatarData = (isoString: string) => {
   return new Date(isoString).toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
   });
};
const DetailRow = ({ label, value }: { label: string, value: React.ReactNode }) => (
   <div className="py-2 border-b border-phalis-gray/50 text-sm">
      <span className="text-gray-400">{label}: </span>
      <span className="font-medium text-white">{value}</span>
   </div>
);
const STATUS_NOME_MAP: Record<string, string> = {
   nao_pago: 'Não Pago', pago_50: 'Pago 50%', pago: 'Pago',
   pre_prod: 'Pré-Produção', em_producao: 'Em Produção',
   pronto_retirada: 'Pronto p/ Retirada', concluido: 'Concluído',
   CRIADO: 'Pedido Criado',
   cancelado: 'Cancelado',
};
const STATUS_COR_MAP: Record<string, string> = {
   nao_pago: 'bg-red-600', pago_50: 'bg-yellow-500', pago: 'bg-green-600',
   pre_prod: 'bg-gray-500', em_producao: 'bg-blue-600',
   pronto_retirada: 'bg-purple-600', concluido: 'bg-green-600',
   CRIADO: 'bg-gray-500',
   cancelado: 'bg-gray-700',
};
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
            {item.subStatus && (
               <div className="text-xs text-gray-400">{item.subStatus}</div>
            )}
            {item.motivo && (
               <div className="text-xs text-red-400 italic mt-1">
                  Motivo: {item.motivo}
               </div>
            )}
            <div className="text-xs text-gray-500">{formatarData(item.data)}</div>
         </div>
      </li>
   );
};


// --- Renderizadores Específicos ---

const DetalhesUnidadeMetro: React.FC<{ pedido: Pedido; produto: Product; onPedidoUpdated: (pedido: Pedido) => void; }> = ({ pedido, produto, onPedidoUpdated }) => {
   const { hasPermission } = usePermission();

   const { detalhes, itemImageUrl, itemNome } = pedido;
   const router = useRouter();
   const { user } = useAuth();

   const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
   const [cancelMotivo, setCancelMotivo] = useState('');
   const [cancelLoading, setCancelLoading] = useState(false);
   const [cancelError, setCancelError] = useState('');

   if (detalhes.type !== 'unidade' && detalhes.type !== 'metro') return null;
   const { opcoes } = detalhes;

   const historicoCompleto = useMemo(() => {
      // ... (lógica do histórico - sem mudança)
      const statusInicialFinanceiro = pedido.historicoFinanceiro[0]?.status || 'nao_pago';
      const criacaoEvent = {
         status: 'CRIADO',
         subStatus: `(${STATUS_NOME_MAP[statusInicialFinanceiro]})`,
         data: pedido.dataCriacao,
         user: pedido.criadoPor,
      };
      const eventosFinanceiros = pedido.historicoFinanceiro.slice(1);
      const eventosProducao = pedido.historicoProducao.slice(1);
      const todosEventos = [criacaoEvent, ...eventosFinanceiros, ...eventosProducao,];
      todosEventos.sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
      return todosEventos;
   }, [pedido]);

   const handleEdit = (e: React.MouseEvent) => {
      e.stopPropagation();
      router.push(`/pedido?id=${pedido.productId}&edit=${pedido.id}`);
   };

   // ... (Funções de Cancelar - sem mudança)
   const openCancelDialog = (e: React.MouseEvent) => {
      e.stopPropagation();
      setCancelMotivo('');
      setCancelError('');
      setCancelLoading(false);
      setIsCancelDialogOpen(true);
   };
   const handleCancelConfirm = async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!cancelMotivo) {
         setCancelError("O motivo é obrigatório.");
         return;
      }
      setCancelLoading(true);
      setCancelError('');
      try {
         const response = await fetch(`/api/pedidos/${pedido.id}/cancelar`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               userName: user?.nome || 'Usuário',
               motivo: cancelMotivo
            }),
         });
         if (response.status === 400) throw new Error('O motivo é obrigatório.');
         if (!response.ok) throw new Error('Falha ao cancelar o pedido');
         const updatedPedido = await response.json();
         onPedidoUpdated(updatedPedido);
         setIsCancelDialogOpen(false);
      } catch (error: any) {
         setCancelError(error.message);
      } finally {
         setCancelLoading(false);
      }
   };

   const isCanceled = pedido.statusProducao === 'cancelado';

   return (
      <>
         <div className="bg-phalis-gray rounded-lg p-4 grid grid-cols-1 md:grid-cols-4 gap-4">

            {/* Coluna 1: Imagem (RESTAURADO) */}
            <div className="md:col-span-1">
               <div className="relative w-full h-40 rounded-md overflow-hidden bg-phalis-dark">
                  <Image src={itemImageUrl} alt={itemNome} fill className="object-contain" />
               </div>
            </div>

            {/* Coluna 2: Opções (RESTAURADO) */}
            <div className="md:col-span-1">
               <h4 className="text-lg font-semibold text-white mb-2">{itemNome}</h4>
               {optionGroupsConfig.map(group => {
                  const optionId = opcoes[group.id] || 'N/A';
                  let optionLabel = optionId;
                  if (group.id === 'tamanho' && detalhes.type === 'unidade' && detalhes.dimensoesPersonalizadas) {
                     const { larguraCm, alturaCm } = detalhes.dimensoesPersonalizadas;
                     optionLabel = `Personalizado (${larguraCm}cm x ${alturaCm}cm)`;
                  } else {
                     optionLabel = produto.options?.[group.id]?.find(o => o.id === optionId)?.name || optionId;
                  }
                  return <DetailRow key={group.id} label={group.name.split('. ')[1]} value={optionLabel} />
               })}
            </div>

            {/* Coluna 3: Valores (RESTAURADO) */}
            <div className="md:col-span-1">
               <h4 className="text-lg font-semibold text-white mb-2">Valores</h4>
               {detalhes.type === 'unidade' && (
                  <>
                     <DetailRow label="Quantidade" value={detalhes.preco.quantidade} />
                     <DetailRow label="Custo (Total)" value={`R$ ${detalhes.preco.custoTotal.toFixed(2)}`} />
                     <DetailRow label="Venda (Total)" value={`R$ ${detalhes.preco.vendaTotal.toFixed(2)}`} />
                     <DetailRow label="Arte" value={`R$ ${detalhes.preco.precoArte.toFixed(2)}`} />
                     <DetailRow label="Desconto" value={`R$ ${detalhes.preco.desconto?.toFixed(2) || '0.00'}`} />
                     <DetailRow label="TOTAL" value={
                        <span className="text-xl font-bold text-phalis-action">

                           R$ {detalhes.preco.total.toFixed(2)}
                        </span>
                     } />
                  </>
               )}
               {detalhes.type === 'metro' && (
                  <>

                     <DetailRow label="Largura" value={`${detalhes.preco.largura.toFixed(2)} m`} />
                     <DetailRow label="Altura" value={`${detalhes.preco.altura.toFixed(2)} m`} />
                     <DetailRow label="Custo (m²)" value={`R$ ${detalhes.preco.m2Custo.toFixed(2)}`} />
                     <DetailRow label="Custo Total" value={`R$ ${detalhes.preco.valorTotalCusto.toFixed(2)}`} />
                     <DetailRow label="Venda (m²)" value={`R$ ${detalhes.preco.m2Venda.toFixed(2)}`} />
                     <DetailRow label="Venda Total" value={`R$ ${detalhes.preco.valorTotalVenda.toFixed(2)}`} />
                     <DetailRow label="Arte" value={`R$ ${detalhes.preco.valorArte.toFixed(2)}`} />
                     <DetailRow label="Desconto" value={`R$ ${detalhes.preco.desconto?.toFixed(2) || '0.00'}`} />
                     <DetailRow label="TOTAL" value={
                        <span className="text-xl font-bold text-phalis-action">

                           R$ {detalhes.preco.total.toFixed(2)}
                        </span>
                     } />
                  </>
               )}
            </div>

            {/* Coluna 4 (Gestão do Tempo e Ações) */}
            <div className="md:col-span-1 space-y-4">
               <h4 className="text-lg font-semibold text-white mb-2">Gestão do Tempo</h4>
               <ol className="list-none m-0 p-0">
                  {historicoCompleto.map((item, index) => (
                     <TimelineItem
                        key={index}
                        item={item}
                        isLast={index === historicoCompleto.length - 1}
                     />
                  ))}
               </ol>
               <div className="flex flex-col space-y-2">
                  {hasPermission('pedidos.editar') && ( <Button
                     variant="outline"
                     size="sm"
                     className="w-full bg-phalis-dark border-gray-700 hover:bg-gray-700 hover:text-white"
                     onClick={handleEdit}
                     disabled={isCanceled}
                  >
                     <Pencil className="h-4 w-4 mr-2" />
                     Editar Pedido
                  </Button> )}

                  {hasPermission('pedidos.cancelar') && ( <Button
                     variant="outline"
                     size="sm"
                     className="w-full bg-phalis-danger/20 text-phalis-danger border-phalis-danger/30 hover:bg-phalis-danger/30 hover:text-red-400"
                     onClick={openCancelDialog}
                     disabled={isCanceled}
                  >
                     <XOctagon className="h-4 w-4 mr-2" />
                     Cancelar Pedido
                  </Button>)}
               </div>
            </div>
         </div>

         {/* O AlertDialog (RESTAURADO) */}
         <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
            <AlertDialogContent className="bg-phalis-black border-gray-800 text-white">
               <AlertDialogHeader>
                  <AlertDialogTitle>Cancelar Pedido {pedido.id}?</AlertDialogTitle>

                  {/* ========================================================== */}
                  {/* MUDANÇA 1: Trocar <AlertDialogDescription> por <div asChild> */}
                  {/* ========================================================== */}
                  <AlertDialogDescription asChild>
                     <div className="text-gray-400 space-y-3">
                        <p>
                           Cliente: <span className="font-medium text-white">{pedido.cliente.nome}</span>
                           <br />
                           Produto: <span className="font-medium text-white">{pedido.itemNome}</span>
                        </p>
                        <p className="text-yellow-400">Esta ação não pode ser desfeita.</p>

                        {(pedido.statusFinanceiro === 'pago' || pedido.statusFinanceiro === 'pago_50') && (
                           <div className="p-3 bg-yellow-900/50 border border-yellow-700 rounded-md text-yellow-300">
                              <span className="font-bold">Atenção:</span> Este pedido já possui pagamento. Lembre-se de reembolsar o cliente ou realocar o valor.
                           </div>
                        )}

                        <div className="space-y-2 pt-2">
                           <Label htmlFor="motivo" className="text-white">Motivo do Cancelamento (Obrigatório)</Label>
                           <Textarea
                              id="motivo"
                              placeholder="Ex: Cliente desistiu, erro no pedido..."
                              className="bg-phalis-gray border-0"
                              value={cancelMotivo}
                              onChange={(e) => setCancelMotivo(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                           />
                           {cancelError && (
                              <p className="text-sm text-phalis-danger">{cancelError}</p>
                           )}
                        </div>
                     </div>
                  </AlertDialogDescription>
               </AlertDialogHeader>
               <AlertDialogFooter>
                  <AlertDialogCancel
                     className="bg-gray-700 border-0 hover:bg-gray-600 hover:text-white"
                     onClick={(e) => e.stopPropagation()}
                  >
                     Voltar
                  </AlertDialogCancel>
                  <Button
                     className="bg-phalis-danger text-white hover:bg-red-700"
                     disabled={cancelLoading}
                     onClick={handleCancelConfirm}
                  >
                     {cancelLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirmar Cancelamento"}
                  </Button>
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
      // ... (lógica do histórico - sem mudança)
      const statusInicialFinanceiro = pedido.historicoFinanceiro[0]?.status || 'nao_pago';
      const criacaoEvent = {
         status: 'CRIADO',
         subStatus: `(${STATUS_NOME_MAP[statusInicialFinanceiro]})`,
         data: pedido.dataCriacao,
         user: pedido.criadoPor,
      };
      const eventosFinanceiros = pedido.historicoFinanceiro.slice(1);
      const eventosProducao = pedido.historicoProducao.slice(1);
      const todosEventos = [criacaoEvent, ...eventosFinanceiros, ...eventosProducao,];
      todosEventos.sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
      return todosEventos;
   }, [pedido]);

   const handleEdit = (e: React.MouseEvent) => {
      e.stopPropagation();
      router.push(`/pedido?id=${pedido.productId}&edit=${pedido.id}`);
   };

   const openCancelDialog = (e: React.MouseEvent) => {
      e.stopPropagation();
      setCancelMotivo('');
      setCancelError('');
      setCancelLoading(false);
      setIsCancelDialogOpen(true);
   };

   const handleCancelConfirm = async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!cancelMotivo) {
         setCancelError("O motivo é obrigatório.");
         return;
      }
      setCancelLoading(true);
      setCancelError('');

      try {
         const response = await fetch(`/api/pedidos/${pedido.id}/cancelar`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               userName: user?.nome || 'Usuário',
               motivo: cancelMotivo
            }),
         });
         if (!response.ok) throw new Error('Falha ao cancelar o pedido');

         const updatedPedido = await response.json();
         onPedidoUpdated(updatedPedido);
         setIsCancelDialogOpen(false);

      } catch (error: any) {
         setCancelError(error.message);
      } finally {
         setCancelLoading(false);
      }
   };

   const isCanceled = pedido.statusProducao === 'cancelado';

   return (
      <>
         <div className="bg-phalis-gray rounded-lg p-4 grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* Coluna 1: Imagem (RESTAURADO) */}
            <div className="md:col-span-1">
               <div className="relative w-full h-40 rounded-md overflow-hidden bg-phalis-dark">
                  <Image src={itemImageUrl} alt={itemNome} fill className="object-contain" />
               </div>
            </div>

            {/* Coluna 2: Detalhes (RESTAURADO) */}
            <div className="md:col-span-1">
               <h4 className="text-lg font-semibold text-white mb-2">{itemNome}</h4>
               <DetailRow label="Descrição/Observações" value={preco.observacao} />
               <DetailRow label="Valor Venda" value={
                  <span className="text-xl font-bold text-phalis-action">
                     R$ {preco.valorVenda.toFixed(2)}
                  </span>
               } />
            </div>

            {/* Coluna 3 (Gestão do Tempo) */}
            <div className="md:col-span-1 space-y-4">
               <h4 className="text-lg font-semibold text-white mb-2">Gestão do Tempo</h4>
               <ol className="list-none m-0 p-0">
                  {historicoCompleto.map((item, index) => (
                     <TimelineItem
                        key={index}
                        item={item}
                        isLast={index === historicoCompleto.length - 1}
                     />
                  ))}
               </ol>

               <div className="flex flex-col space-y-2">
                  {hasPermission('pedidos.editar') && ( <Button
                     variant="outline"
                     size="sm"
                     className="w-full bg-phalis-dark border-gray-700 hover:bg-gray-700 hover:text-white"
                     onClick={handleEdit}
                     disabled={isCanceled}
                  >
                     <Pencil className="h-4 w-4 mr-2" />
                     Editar Pedido
                  </Button> )}

                  {hasPermission('pedidos.cancelar') && (
                  <Button
                     variant="outline"
                     size="sm"
                     className="w-full bg-phalis-danger/20 text-phalis-danger border-phalis-danger/30 hover:bg-phalis-danger/30 hover:text-red-400"
                     onClick={openCancelDialog}
                     disabled={isCanceled}
                  >
                     <XOctagon className="h-4 w-4 mr-2" />
                     Cancelar Pedido
                  </Button>)}
               </div>
            </div>
         </div>

         {/* ========================================================== */}
         {/* MUDANÇA 2: O AlertDialog (RESTAURADO) */}
         {/* ========================================================== */}
         <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
            <AlertDialogContent className="bg-phalis-black border-gray-800 text-white">
               <AlertDialogHeader>
                  <AlertDialogTitle>Cancelar Pedido {pedido.id}?</AlertDialogTitle>
                  <AlertDialogDescription asChild>
                     <div className="text-gray-400 space-y-3">
                        <p>
                           Cliente: <span className="font-medium text-white">{pedido.cliente.nome}</span>
                           <br />
                           Produto: <span className="font-medium text-white">{pedido.itemNome}</span>
                        </p>
                        <p className="text-yellow-400">Esta ação não pode ser desfeita.</p>
                        {(pedido.statusFinanceiro === 'pago' || pedido.statusFinanceiro === 'pago_50') && (
                           <div className="p-3 bg-yellow-900/50 border border-yellow-700 rounded-md text-yellow-300">
                              <span className="font-bold">Atenção:</span> Este pedido já possui pagamento. Lembre-se de reembolsar o cliente ou realocar o valor.
                           </div>
                        )}
                        <div className="space-y-2 pt-2">
                           <Label htmlFor="motivo-servico" className="text-white">Motivo do Cancelamento (Obrigatório)</Label>
                           <Textarea
                              id="motivo-servico"
                              placeholder="Ex: Cliente desistiu, erro no pedido..."
                              className="bg-phalis-gray border-0"
                              value={cancelMotivo}
                              onChange={(e) => setCancelMotivo(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                           />
                           {cancelError && (
                              <p className="text-sm text-phalis-danger">{cancelError}</p>
                           )}
                        </div>
                     </div>
                  </AlertDialogDescription>
               </AlertDialogHeader>
               <AlertDialogFooter>
                  <AlertDialogCancel
                     className="bg-gray-700 border-0 hover:bg-gray-600 hover:text-white"
                     onClick={(e) => e.stopPropagation()}
                  >
                     Voltar
                  </AlertDialogCancel>
                  <Button
                     className="bg-phalis-danger text-white hover:bg-red-700"
                     disabled={cancelLoading}
                     onClick={handleCancelConfirm}
                  >
                     {cancelLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirmar Cancelamento"}
                  </Button>
               </AlertDialogFooter>
            </AlertDialogContent>
         </AlertDialog>
      </>
   );
};

// --- Componente Principal ---
const DetalhesPedidoRow: React.FC<DetalhesProps> = ({ pedido, onPedidoUpdated }) => {
   const produto = getProductById(pedido.productId);

   if (!produto) {
      return <div className="text-red-500 p-4">Erro: Produto original (ID: {pedido.productId}) não encontrado.</div>
   }

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