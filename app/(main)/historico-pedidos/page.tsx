// Arquivo: app/(main)/historico-pedidos/page.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
// 1. MUDANÇA: Importar os novos componentes e hooks
import {
   type Pedido,
   statusFinanceiroOptions,
   statusProducaoOptions
} from '@/lib/orderData';
import TabelaPedidos from '@/components/pedidos/TabelaPedidos';
import { useInView } from 'react-intersection-observer';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import { authenticatedFetch } from '@/lib/api'; // Adicionado
import { Input } from '@/components/ui/input';
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from "@/components/ui/select";
import { useDebounce } from 'use-debounce';

export default function HistoricoPedidosPage() {
   const [pedidos, setPedidos] = useState<Pedido[]>([]);
   const [page, setPage] = useState(1);
   const [hasMore, setHasMore] = useState(true);
   const [isLoading, setIsLoading] = useState(false);

   const { ref, inView } = useInView({
      threshold: 0,
   });

   const searchParams = useSearchParams();
   const highlightId = searchParams.get('highlight');
   const { user } = useAuth();

   // ==========================================================
   // MUDANÇA 2: Estados para os filtros
   // ==========================================================
   const [filtroCliente, setFiltroCliente] = useState('');
   const [filtroFinanceiro, setFiltroFinanceiro] = useState('todos');
   const [filtroStatus, setFiltroStatus] = useState('todos');

   // Debounce para o input de texto (espera 500ms após o usuário parar de digitar)
   const [debouncedCliente] = useDebounce(filtroCliente, 500);

   // Ref para impedir o 'loadMore' de rodar no 'useEffect' de filtros
   const isFilterReset = useRef(false);

   // ==========================================================
   // MUDANÇA 3: 'loadMorePedidos' agora lê os filtros
   // ==========================================================
   const loadMorePedidos = async (isReset: boolean = false) => {
      if (isLoading) return;
      setIsLoading(true);

      const pageToFetch = isReset ? 1 : page;

      // 1. Monta a URL com os parâmetros de filtro
      const params = new URLSearchParams();
      params.append('page', pageToFetch.toString());
      if (debouncedCliente) params.append('cliente', debouncedCliente);
      if (filtroFinanceiro !== 'todos') params.append('financeiro', filtroFinanceiro);
      if (filtroStatus !== 'todos') params.append('status', filtroStatus);

      try {
         const response = await authenticatedFetch(`/api/pedidos?${params.toString()}`);
         if (!response.ok) throw new Error('Falha ao buscar pedidos da API');

         const novosPedidos: Pedido[] = await response.json();

         if (novosPedidos.length > 0) {
            // Se for um 'reset', substitui a lista. Senão, anexa.
            setPedidos(prev => (isReset ? novosPedidos : [...prev, ...novosPedidos]));
            setPage(pageToFetch + 1);
            setHasMore(true);
         } else {
            if (isReset) setPedidos([]); // Limpa se a busca não retornar nada
            setHasMore(false);
         }
      } catch (error) {
         console.error("[HistoricoPedidosPage] Erro ao buscar pedidos:", error);
         setHasMore(false);
      }

      setIsLoading(false);
   };

   // ==========================================================
   // MUDANÇA 4: useEffect para o SCROLL (carrega mais)
   // ==========================================================
   useEffect(() => {
      // Não roda se um reset de filtro acabou de acontecer
      if (inView && hasMore && !isLoading && !isFilterReset.current) {
         loadMorePedidos(false); // Chama no modo "anexar"
      }
      // Reseta o 'lock' do filtro
      if (isFilterReset.current) {
         isFilterReset.current = false;
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [inView, hasMore, isLoading]);

   // ==========================================================
   // MUDANÇA 5: useEffect para os FILTROS (reseta e carrega)
   // ==========================================================
   useEffect(() => {
      // Seta o 'lock' para impedir o 'inView' de rodar ao mesmo tempo
      isFilterReset.current = true;
      // Reseta a lista e busca a página 1
      loadMorePedidos(true);
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [debouncedCliente, filtroFinanceiro, filtroStatus]); // Dependências


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
            <Loader2 className="h-8 w-8 animate-spin text-phalis-action" />
         </div>
      );
   }

   return (
      <div className="space-y-6">
         <h1 className="text-3xl font-bold text-white">Histórico de Pedidos</h1>

         {/* ========================================================== */}
         {/* MUDANÇA 6: A nova Barra de Filtros */}
         {/* ========================================================== */}
         <div className="bg-phalis-black p-4 rounded-lg flex flex-col md:flex-row gap-4">
            <Input
               placeholder="Filtrar por nome do cliente..."
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

         <TabelaPedidos
            pedidos={pedidos}
            onPedidoUpdated={handlePedidoUpdated}
            highlightId={highlightId}
            currentUser={user}
         />

         {/* Loader e Fim dos resultados */}
         {hasMore && (
            <div ref={ref} className="flex justify-center items-center p-4 h-16">
               {isLoading && (
                  <>
                     <Loader2 className="h-8 w-8 animate-spin text-phalis-action" />
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