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
import { type User } from '@/lib/clientData';
import { usePermission } from '@/lib/auth/usePermission';

interface TabelaPedidosProps {
   pedidos: Pedido[];
   onPedidoUpdated: (pedido: Pedido) => void;
   highlightId: string | null;
   currentUser: User;
}

const financeiroBadgeColors: Record<StatusFinanceiro, string> = {
   nao_pago: 'bg-red-600 text-white',
   pago_50: 'bg-yellow-500 text-black',
   pago: 'bg-green-600 text-white',
};
const financeiroHoverColors: Record<StatusFinanceiro, string> = {
   nao_pago: 'hover:bg-red-700',
   pago_50: 'hover:bg-yellow-600',
   pago: 'hover:bg-green-700',
};

const producaoBadgeColors: Record<StatusProducao, string> = {
   pre_prod: 'bg-gray-500 text-white hover:bg-gray-600',
   em_producao: 'bg-blue-600 text-white hover:bg-blue-700',
   pronto_retirada: 'bg-purple-600 text-white hover:bg-purple-700',
   concluido: 'bg-green-600 text-white hover:bg-green-700',
   cancelado: 'bg-gray-700 text-gray-400 border-gray-600'
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

const TabelaPedidos: React.FC<TabelaPedidosProps> = ({ pedidos, onPedidoUpdated, highlightId, currentUser }) => {
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
         const url = `/api/pedidos/${pedidoId}/${tipo}`;
         const response = await fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               status: value,
               userName: currentUser.nome
            }),
         });
         if (!response.ok) throw new Error('Falha ao atualizar status');
         const pedidoAtualizado: Pedido = await response.json();
         onPedidoUpdated(pedidoAtualizado);
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
            <TableRow>
               <TableHead className="w-[100px]">Nº Pedido</TableHead>
               <TableHead className="w-[150px]">Data/Hora</TableHead>
               <TableHead>Cliente</TableHead>
               <TableHead>Contato</TableHead>
               <TableHead>Item</TableHead>
               <TableHead className="w-[180px]">Financeiro</TableHead>
               <TableHead>Valor</TableHead>
               <TableHead className="w-[200px]">Status</TableHead>
            </TableRow>
         </TableHeader>

         <TableBody>
            {pedidos.map((pedido) => {
               const isCanceled = pedido.statusProducao === 'cancelado';

               return (
                  <React.Fragment key={pedido.id}>

                     <TableRow
                        data-state={openRowId === pedido.id ? 'open' : 'closed'}
                        className={cn(
                           "cursor-pointer hover:bg-phalis-gray/50 data-[state=open]:bg-phalis-gray",
                           pedido.id === highlightId && 'animate-flashCiano',
                           isCanceled && 'line-through text-gray-600 hover:bg-phalis-gray/30'
                        )}
                        onClick={() => toggleRow(pedido.id)}
                     >
                        <TableCell>{pedido.id}</TableCell>
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
                        <TableCell>{pedido.itemNome}</TableCell>
                        <TableCell>
                           <Select
                              value={pedido.statusFinanceiro}
                              onValueChange={(value) => handleStatusChange(pedido.id, 'financeiro', value)}
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

                        <TableCell>R$ {pedido.valor.toFixed(2)}</TableCell>

                        <TableCell>
                           <Select
                              value={pedido.statusProducao}
                              onValueChange={(value) => handleStatusChange(pedido.id, 'producao', value)}
                              disabled={loadingStatus[`producao-${pedido.id}`] || isCanceled || !hasPermission('pedidos.status.producao')}
                           >
                              <SelectTrigger
                                 className={cn(
                                    "font-semibold border-0 rounded-full px-3 py-1 text-xs",
                                    producaoBadgeColors[pedido.statusProducao]
                                 )}
                                 onClick={(e) => e.stopPropagation()}
                              >
                                 {loadingStatus[`producao-${pedido.id}`] ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                 ) : (
                                    <SelectValue className="flex-1 text-center" />
                                 )}
                              </SelectTrigger>
                              <SelectContent className="bg-phalis-gray border-0">
                                 {isCanceled && (
                                    <SelectItem value="cancelado" disabled>Cancelado</SelectItem>
                                 )}
                                 {pedido.statusProducao === 'pre_prod' && (
                                    <SelectItem value="pre_prod" disabled>Pré-Produção</SelectItem>
                                 )}
                                 {statusProducaoOptions.map(opt => (
                                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                 ))}
                              </SelectContent>
                           </Select>
                        </TableCell>
                     </TableRow>

                     {openRowId === pedido.id && (
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