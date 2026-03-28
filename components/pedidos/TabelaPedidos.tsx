'use client';

import React, { useState } from 'react';
import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from "@/components/ui/table";
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from "@/components/ui/select";
import {
   Pedido,
   StatusFinanceiro,
   StatusProducao,
   statusFinanceiroOptions,
   statusProducaoOptions
} from '@/lib/orderData';
import DetalhesPedidoRow from './DetalhesPedidoRow';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { type User } from '@/types/client';
import { usePermission } from '@/lib/auth/usePermission';
import { authenticatedFetch } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';

interface TabelaPedidosProps {
   pedidos: Pedido[];
   onPedidoUpdated: (pedido: Pedido) => void;
   highlightId: string | null;
   currentUser: User;
   isLoading?: boolean;
}

const financeiroBadgeColors: Record<StatusFinanceiro, string> = {
   PENDENTE: 'bg-red-600 text-white',
   PARCIAL: 'bg-yellow-500 text-black',
   PAGO: 'bg-green-600 text-white',
   REEMBOLSADO: 'bg-gray-500 text-white',
};
const financeiroHoverColors: Record<StatusFinanceiro, string> = {
   PENDENTE: 'hover:bg-red-700',
   PARCIAL: 'hover:bg-yellow-600',
   PAGO: 'hover:bg-green-700',
   REEMBOLSADO: 'hover:bg-gray-600',
};

const producaoBadgeColors: Record<StatusProducao, string> = {
   PRE_PROD: 'bg-gray-500 text-white hover:bg-gray-600',
   EM_PRODUCAO: 'bg-blue-600 text-white hover:bg-blue-700',
   ACABAMENTO: 'bg-indigo-600 text-white hover:bg-indigo-700',
   PRONTO: 'bg-purple-600 text-white hover:bg-purple-700',
   ENTREGUE: 'bg-green-600 text-white hover:bg-green-700',
   CANCELADO: 'bg-gray-700 text-gray-400 border-gray-600'
};

// ... (Funções formatarWhatsApp e formatarData - sem mudança)
const formatarWhatsApp = (numero: string | undefined | null) => {
   if (!numero) return '#';
   const ddi = '55';
   const digitos = numero.replace(/\D/g, '');
   return `https://wa.me/${ddi}${digitos}`;
};
const formatarData = (isoString: string) => {
   return new Date(isoString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
   });
};

const TabelaPedidos: React.FC<TabelaPedidosProps> = ({ pedidos, onPedidoUpdated, highlightId, currentUser, isLoading = false }) => {
   const [openRowId, setOpenRowId] = useState<string | null>(null);
   const [loadingStatus, setLoadingStatus] = useState<Record<string, boolean>>({});
   const { hasPermission } = usePermission();

   const handleStatusChange = async (
      pedidoId: string,
      tipo: 'financeiro' | 'producao',
      value: string
   ) => {
      const loadingKey = `${tipo}-${pedidoId}`;
      setLoadingStatus(prev => ({ ...prev, [loadingKey]: true }));
      try {
         let url = '';
         let body: any = {};

         if (tipo === 'producao') {
            url = `/api/pedidos/${pedidoId}/producao`;
            body = { status: value };
         } else if (tipo === 'financeiro') {
            url = `/api/pedidos/${pedidoId}/pagamento`;
            const pedidoInfo = pedidos.find(p => String(p.id) === pedidoId);
            const valor = pedidoInfo?.valor || Number(pedidoInfo?.valor) || 0;
            body = {
               valorPago: value === 'PARCIAL' ? valor / 2 : valor,
               formaPagamento: 'DINHEIRO',
               observacao: 'Atualização rápida via Tabela'
            };
         }

         const response = await authenticatedFetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
         });
         if (!response.ok) throw new Error('Falha ao atualizar status');
         const data = await response.json();
         if (tipo === 'financeiro') {
            const pedidoAtual = pedidos.find(p => String(p.id) === pedidoId);
            if (pedidoAtual) {
               onPedidoUpdated({
                  ...pedidoAtual,
                  statusFinanceiro: data.status as StatusFinanceiro
               });
            }
         } else {
            onPedidoUpdated(data as Pedido);
         }
      } catch (error) {
         console.error(`Erro ao atualizar ${tipo} do pedido ${pedidoId}:`, error);
      } finally {
         setLoadingStatus(prev => ({ ...prev, [loadingKey]: false }));
      }
   };

   const toggleRow = (pedidoId: string) => {
      setOpenRowId(prevId => (prevId === pedidoId ? null : pedidoId));
   };

   return (
      <Table>
         <TableHeader>
            <TableRow className="hover:bg-transparent border-gray-800">
               <TableHead className="w-[120px] text-gray-400">Pedido</TableHead>
               <TableHead className="w-[150px] text-gray-400">Data/Hora</TableHead>
               <TableHead className="text-gray-400">Cliente</TableHead>
               <TableHead className="text-gray-400">Contato</TableHead>
               <TableHead className="text-gray-400">Item</TableHead>
               <TableHead className="w-[180px] text-gray-400">Financeiro</TableHead>
               <TableHead className="text-gray-400">Valor</TableHead>
               <TableHead className="w-[200px] text-gray-400">Status</TableHead>
            </TableRow>
         </TableHeader>

         <TableBody>
            {isLoading && pedidos.length === 0 ? (
               Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={`skeleton-${i}`}>
                     <TableCell><Skeleton className="h-8 w-16" /></TableCell>
                     <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                     <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                     <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                     <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                     <TableCell><Skeleton className="h-8 w-24 rounded-full" /></TableCell>
                     <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                     <TableCell><Skeleton className="h-8 w-24 rounded-full" /></TableCell>
                  </TableRow>
               ))
            ) : null}

            {pedidos.map((pedido) => {
               const isCanceled = pedido.statusProducao === 'CANCELADO';

               return (
                  <React.Fragment key={pedido.id}>

                     <TableRow
                        data-state={openRowId === String(pedido.id) ? 'open' : 'closed'}
                        className={cn(
                           "cursor-pointer hover:bg-phalis-gray/50 data-[state=open]:bg-phalis-gray",
                           pedido.id === highlightId && 'animate-flashCiano',
                           isCanceled && 'line-through text-gray-600 hover:bg-phalis-gray/30'
                        )}
                        onClick={() => toggleRow(String(pedido.id))}
                     >
                        <TableCell>
                           <div className="font-medium text-white">{pedido.codigoVisual || '-'}</div>
                           <div className="text-xs text-gray-500">#{pedido.id}</div>
                        </TableCell>
                        <TableCell className="text-xs" suppressHydrationWarning={true}>
                           {formatarData(pedido.dataCriacao)}
                        </TableCell>
                        <TableCell>{pedido.cliente.nome}</TableCell>
                        <TableCell>
                           <a
                              href={formatarWhatsApp(pedido.cliente.telefone1)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={cn(
                                 "text-white hover:text-phalis-action hover:underline",
                                 isCanceled && "pointer-events-none"
                              )}
                              onClick={(e) => e.stopPropagation()}
                           >
                              {pedido.cliente.telefone1 || '---'}
                           </a>
                        </TableCell>
                        <TableCell>
                           {pedido.itens && pedido.itens.length > 0 ? (
                              <div className="flex items-center gap-2">
                                 <span>{pedido.itens[0].itemNome}</span>
                                 {pedido.itens.length > 1 && (
                                    <span className="bg-phalis-gray text-gray-300 text-xs px-2 py-0.5 rounded-full">
                                       +{pedido.itens.length - 1} item(s)
                                    </span>
                                 )}
                              </div>
                           ) : (
                              pedido.itemNome || 'Sem itens'
                           )}
                        </TableCell>
                        <TableCell>
                           <Select
                              value={pedido.statusFinanceiro}
                              onValueChange={(value) => handleStatusChange(String(pedido.id), 'financeiro', value)}
                              disabled={loadingStatus[`financeiro-${pedido.id}`] || isCanceled || !hasPermission('pedidos.status.financeiro')}
                           >
                              <SelectTrigger
                                 className={cn(
                                    "font-semibold border-0 rounded-full px-3 py-1 text-xs",
                                    // 1. Aplica a cor base
                                    financeiroBadgeColors[pedido.statusFinanceiro],
                                    // 2. Aplica o hover SÓ SE NÃO ESTIVER cancelado
                                    !isCanceled && financeiroHoverColors[pedido.statusFinanceiro],
                                    // 3. Aplica o override de cancelado (que agora não tem hover)
                                    isCanceled && "bg-gray-700 text-gray-400"
                                 )}
                                 onClick={(e) => e.stopPropagation()}
                              >
                                 {loadingStatus[`financeiro-${pedido.id}`] ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                 ) : (
                                    <SelectValue className="flex-1 text-center" />
                                 )}
                              </SelectTrigger>
                              <SelectContent className="bg-phalis-gray border-0">
                                 {statusFinanceiroOptions.map(opt => (
                                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                 ))}
                              </SelectContent>
                           </Select>
                        </TableCell>

                        <TableCell>R$ {(Number(pedido.valor) || 0).toFixed(2)}</TableCell>

                        <TableCell>
                           <Select
                              value={pedido.statusProducao || ""}
                              onValueChange={(value) => handleStatusChange(String(pedido.id), 'producao', value)}
                              disabled={loadingStatus[`producao-${pedido.id}`] || isCanceled || !hasPermission('pedidos.status.producao')}
                           >
                              <SelectTrigger
                                 className={cn(
                                    "font-semibold border-0 rounded-full px-3 py-1 text-xs",
                                    pedido.statusProducao ? producaoBadgeColors[pedido.statusProducao] : "bg-gray-700 text-gray-400",
                                    isCanceled && "bg-gray-700 text-gray-400 hover:bg-gray-700"
                                 )}
                                 onClick={(e) => e.stopPropagation()}
                              >
                                 {loadingStatus[`producao-${pedido.id}`] ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                 ) : (
                                    <SelectValue placeholder="Indefinido" className="flex-1 text-center truncate" />
                                 )}
                              </SelectTrigger>
                              <SelectContent className="bg-phalis-gray border-0">
                                 {statusProducaoOptions.map(opt => (
                                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                 ))}
                              </SelectContent>
                           </Select>
                        </TableCell>
                     </TableRow>

                     {openRowId === String(pedido.id) && (
                        <TableRow className="bg-phalis-dark hover:bg-phalis-dark">
                           <TableCell colSpan={8} className="p-4">
                              <DetalhesPedidoRow
                                 pedido={pedido}
                                 onPedidoUpdated={onPedidoUpdated}
                              />
                           </TableCell>
                        </TableRow>
                     )}
                  </React.Fragment>
               )
            })}
         </TableBody>
      </Table>
   );
};

export default TabelaPedidos;
