// Arquivo: app/(main)/historico-pedidos/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
   type Pedido,
   statusFinanceiroOptions,
   statusProducaoOptions
} from '@/lib/orderData';
import TabelaPedidos from '@/components/pedidos/TabelaPedidos';
import { useInView } from 'react-intersection-observer';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import { authenticatedFetch } from '@/lib/api';
import { Input } from '@/components/ui/input';
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from "@/components/ui/select";

export default function HistoricoPedidosPage() {
   const [pedidos, setPedidos] = useState<Pedido[]>([]);
   const [page, setPage] = useState(0);
   const [hasMore, setHasMore] = useState(true);
   const [isLoading, setIsLoading] = useState(false);

   const { ref, inView } = useInView({ threshold: 0 });

   const searchParams = useSearchParams();
   const highlightId = searchParams.get('highlight');
   const { user } = useAuth();

   // ==========================================================
   // Estados dos filtros (server-side)
   // ==========================================================
   const [filtroCliente, setFiltroCliente] = useState('');
   const [filtroFinanceiro, setFiltroFinanceiro] = useState('todos');
   const [filtroStatus, setFiltroStatus] = useState('todos');

   // Timeout para debounce
   const debounceTimeout = React.useRef<NodeJS.Timeout | null>(null);

   const loadMorePedidos = async (reset: boolean = false) => {
      // Se estiver resertando os dados, usamos a página 0. Caso contrário a próxima.
      const pageToLoad = reset ? 0 : page;
      if (!reset && isLoading) return;
      if (!reset && !hasMore) return;
      
      setIsLoading(true);

      const params = new URLSearchParams();
      params.append('page', pageToLoad.toString());
      params.append('size', '20');
      params.append('sort', 'dataCriacao,desc');
      
      if (filtroCliente.trim()) params.append('cliente', filtroCliente.trim());
      if (filtroFinanceiro !== 'todos') params.append('financeiro', filtroFinanceiro);
      if (filtroStatus !== 'todos') params.append('status', filtroStatus);

      try {
         const response = await authenticatedFetch(`/api/pedidos?${params.toString()}`);
         if (!response.ok) throw new Error('Falha ao buscar pedidos da API');

         const paginaRetornada = await response.json();
         const novosPedidos: Pedido[] = paginaRetornada.content ?? paginaRetornada;
         const isLast: boolean = paginaRetornada.last ?? (novosPedidos.length < 20);

         if (novosPedidos.length > 0) {
            setPedidos(prev => reset ? novosPedidos : [...prev, ...novosPedidos]);
            setPage(pageToLoad + 1);
            setHasMore(!isLast);
         } else {
            if (reset) setPedidos([]);
            setHasMore(false);
         }
      } catch (error) {
         console.error("[HistoricoPedidosPage] Erro ao buscar pedidos:", error);
         if (reset) setPedidos([]);
         setHasMore(false);
      }

      setIsLoading(false);
   };

   // Scroll infinito
   useEffect(() => {
      if (inView) {
         loadMorePedidos(false);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [inView]);

   // Efeito quando os filtros mudam: reinicia a lista
   useEffect(() => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
      debounceTimeout.current = setTimeout(() => {
         loadMorePedidos(true);
      }, 500);

      return () => {
         if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [filtroCliente, filtroFinanceiro, filtroStatus]);

   const handlePedidoUpdated = (pedidoAtualizado: Pedido) => {
      setPedidos(prevPedidos =>
         prevPedidos.map(p =>
            p.id === pedidoAtualizado.id ? pedidoAtualizado : p
         )
      );
   };

   if (!user) {
      return (
         <div className="flex justify-center items-center p-4 h-16">
            <Loader2 size={32} className="animate-spin text-phalis-action" />
         </div>
      );
   }

   return (
      <div className="space-y-6">
         <h1 className="text-3xl font-bold text-white">Histórico de Pedidos</h1>

         {/* Barra de Filtros */}
         <div className="bg-phalis-black p-4 rounded-lg flex flex-col md:flex-row gap-4">
            <Input
               placeholder="Filtrar por código (PED-XXX) ou cliente..."
               className="bg-phalis-gray border-0"
               value={filtroCliente}
               onChange={(e) => setFiltroCliente(e.target.value)}
            />
            <Select value={filtroFinanceiro} onValueChange={setFiltroFinanceiro}>
               <SelectTrigger className="bg-phalis-gray border-0">
                  <SelectValue placeholder="Status Financeiro" />
               </SelectTrigger>
               <SelectContent className="bg-phalis-gray border-0">
                  <SelectItem value="todos">Todos (Financeiro)</SelectItem>
                  {statusFinanceiroOptions.map(opt => (
                     <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
               </SelectContent>
            </Select>
            <Select value={filtroStatus} onValueChange={setFiltroStatus}>
               <SelectTrigger className="bg-phalis-gray border-0">
                  <SelectValue placeholder="Status Produção" />
               </SelectTrigger>
               <SelectContent className="bg-phalis-gray border-0">
                  <SelectItem value="todos">Todos (Produção)</SelectItem>
                  {statusProducaoOptions.map(opt => (
                     <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
               </SelectContent>
            </Select>
         </div>

         {/* Tabela com pedidos FILTRADOS */}
         <div className="bg-phalis-black rounded-lg border border-gray-800 overflow-x-auto">
            <TabelaPedidos
               pedidos={pedidos}
               onPedidoUpdated={handlePedidoUpdated}
               highlightId={highlightId}
               currentUser={user}
               isLoading={isLoading}
            />
         </div>

         {/* Loader e Fim dos resultados */}
         {hasMore && (
            <div ref={ref} className="flex justify-center items-center p-4 h-16">
               {isLoading && (
                  <>
                     <Loader2 size={32} className="animate-spin text-phalis-action" />
                     <span className="ml-2 text-gray-400">Carregando mais pedidos...</span>
                  </>
               )}
            </div>
         )}
         {!hasMore && (
            <div className="text-center text-gray-500 p-4">
               Fim dos resultados.
            </div>
         )}
      </div>
   );
}