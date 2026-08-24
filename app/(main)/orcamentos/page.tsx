'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { type Orcamento } from '@/types/orcamento';
import TabelaOrcamentos from '@/components/orcamentos/TabelaOrcamentos';
import { useInView } from 'react-intersection-observer';
import { Loader2, FileText } from 'lucide-react';
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

import { MultiSelectFilter } from '@/components/ui/multi-select-filter';

const statusOrcamentoOptions = [
   { value: 'ABERTO', label: 'Aberto' },
   { value: 'CONVERTIDO', label: 'Convertido' },
   { value: 'CANCELADO', label: 'Cancelado' },
   { value: 'SUBSTITUIDO', label: 'Substituído' },
];

export default function OrcamentosPage() {
   const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
   const [page, setPage] = useState(0);
   const [hasMore, setHasMore] = useState(true);
   const [isLoading, setIsLoading] = useState(false);

   const { ref, inView } = useInView({ threshold: 0 });

   const searchParams = useSearchParams();
   const highlightId = searchParams.get('highlight');
   const { user } = useAuth();

   // Função auxiliar para converter query param em array
   const parseParamArray = (paramVal: string | null): string[] => {
      if (!paramVal || paramVal === 'todos') return [];
      return paramVal.split(',').map(s => s.trim()).filter(Boolean);
   };

   // Filtros inicializados com base nos parametros da URL
   const [filtroCliente, setFiltroCliente] = useState(searchParams.get('cliente') || '');
   const [filtroStatus, setFiltroStatus] = useState<string[]>(() => parseParamArray(searchParams.get('status')));

   // Sincroniza se a URL mudar
   useEffect(() => {
      const pStat = searchParams.get('status');
      const pCli = searchParams.get('cliente');
      setFiltroStatus(parseParamArray(pStat));
      if (pCli !== null && pCli !== undefined) setFiltroCliente(pCli);
   }, [searchParams]);

   // Timeout para debounce
   const debounceTimeout = React.useRef<NodeJS.Timeout | null>(null);

   const loadMoreOrcamentos = async (reset: boolean = false) => {
      const pageToLoad = reset ? 0 : page;
      if (!reset && isLoading) return;
      if (!reset && !hasMore) return;
      
      setIsLoading(true);

      const params = new URLSearchParams();
      params.append('page', pageToLoad.toString());
      params.append('size', '20');
      params.append('sort', 'dataCriacao,desc');
      
      if (filtroCliente.trim()) params.append('cliente', filtroCliente.trim());
      if (filtroStatus.length > 0) params.append('status', filtroStatus.join(','));

      try {
         const response = await authenticatedFetch(`/api/orcamentos?${params.toString()}`);
         if (!response.ok) throw new Error('Falha ao buscar orçamentos da API');

         const paginaRetornada = await response.json();
         const novosOrcamentos: Orcamento[] = paginaRetornada.content ?? paginaRetornada;
         const isLast: boolean = paginaRetornada.last ?? (novosOrcamentos.length < 20);

         if (novosOrcamentos.length > 0) {
            setOrcamentos(prev => reset ? novosOrcamentos : [...prev, ...novosOrcamentos]);
            setPage(pageToLoad + 1);
            setHasMore(!isLast);
         } else {
            if (reset) setOrcamentos([]);
            setHasMore(false);
         }
      } catch (error) {
         console.error("[OrcamentosPage] Erro ao buscar orçamentos:", error);
         if (reset) setOrcamentos([]);
         setHasMore(false);
      }

      setIsLoading(false);
   };

   // Scroll infinito
   useEffect(() => {
      if (inView) {
         loadMoreOrcamentos(false);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [inView]);

   // Efeito quando os filtros mudam: reinicia a lista
   useEffect(() => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
      debounceTimeout.current = setTimeout(() => {
         loadMoreOrcamentos(true);
      }, 500);

      return () => {
         if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [filtroCliente, filtroStatus]);

   if (!user) {
      return (
         <div className="flex justify-center items-center p-4 h-16">
            <Loader2 size={32} className="animate-spin text-phalis-action" />
         </div>
      );
   }

   return (
      <div className="space-y-6">
         <div className="flex items-center gap-3">
            <div className="p-2 bg-phalis-action/10 rounded-lg text-phalis-action">
               <FileText className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-bold text-white">Histórico de Orçamentos</h1>
         </div>

         {/* Barra de Filtros */}
         <div className="bg-phalis-black p-4 rounded-lg flex flex-col md:flex-row gap-4">
            <Input
               placeholder="Filtrar por código (ORC-XXX) ou cliente..."
               className="bg-phalis-gray border-0 text-white placeholder:text-gray-500"
               value={filtroCliente}
               onChange={(e) => setFiltroCliente(e.target.value)}
            />
            <MultiSelectFilter
               title="Status"
               options={statusOrcamentoOptions}
               selectedValues={filtroStatus}
               onChange={setFiltroStatus}
               className="md:w-56"
            />
         </div>

         {/* Tabela com Orçamentos */}
         <div className="bg-phalis-black rounded-lg border border-gray-800 overflow-x-auto">
            <TabelaOrcamentos
               orcamentos={orcamentos}
               highlightId={highlightId}
               isLoading={isLoading}
            />
         </div>

         {/* Loader e Fim dos resultados */}
         {hasMore && (
            <div ref={ref} className="flex justify-center items-center p-4 h-16">
               {isLoading && (
                  <>
                     <Loader2 size={32} className="animate-spin text-phalis-action" />
                     <span className="ml-2 text-gray-400">Carregando mais orçamentos...</span>
                  </>
               )}
            </div>
         )}
         {!hasMore && orcamentos.length > 0 && (
            <div className="text-center text-gray-500 p-4">
               Fim dos resultados.
            </div>
         )}
      </div>
   );
}
