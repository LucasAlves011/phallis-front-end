// Arquivo: app/(main)/historico-pedidos/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
// 1. MUDANÇA: Importar 'useSearchParams'
import { useSearchParams } from 'next/navigation';
import { type Pedido } from '@/lib/orderData';
import TabelaPedidos from '@/components/pedidos/TabelaPedidos';
import { useInView } from 'react-intersection-observer';
import { Loader2 } from 'lucide-react';

export default function HistoricoPedidosPage() {
   const [pedidos, setPedidos] = useState<Pedido[]>([]);
   const [page, setPage] = useState(1);
   const [hasMore, setHasMore] = useState(true);
   const [isLoading, setIsLoading] = useState(false);

   const { ref, inView } = useInView({
      threshold: 0,
   });

   // 2. MUDANÇA: Ler o 'highlight' da URL
   const searchParams = useSearchParams();
   const highlightId = searchParams.get('highlight');

   const loadMorePedidos = async () => {
      // ... (lógica de carregar, sem mudança)
      if (isLoading || !hasMore) return;
      setIsLoading(true);
      try {
         const response = await fetch(`/api/pedidos?page=${page}`);
         if (!response.ok) throw new Error('Falha ao buscar pedidos da API');
         const novosPedidos: Pedido[] = await response.json();
         if (novosPedidos.length > 0) {
            setPedidos(prev => [...prev, ...novosPedidos]);
            setPage(prev => prev + 1);
         } else {
            setHasMore(false);
         }
      } catch (error) {
         console.error("[HistoricoPedidosPage] Erro ao buscar pedidos:", error);
         setHasMore(false);
      }
      setIsLoading(false);
   };

   useEffect(() => {
      if (inView && hasMore && !isLoading) {
         loadMorePedidos();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [inView, hasMore, isLoading]);

   const handlePedidoUpdated = (pedidoAtualizado: Pedido) => {
      setPedidos(prevPedidos =>
         prevPedidos.map(p =>
            p.id === pedidoAtualizado.id ? pedidoAtualizado : p
         )
      );
   };

   return (
      <div className="space-y-6">
         <h1 className="text-3xl font-bold text-white">Histórico de Pedidos</h1>

         {/* 3. MUDANÇA: Passando 'highlightId' para a tabela */}
         <TabelaPedidos
            pedidos={pedidos}
            onPedidoUpdated={handlePedidoUpdated}
            highlightId={highlightId}
         />

         {/* ... (Loader e Fim dos resultados - sem mudança) ... */}
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