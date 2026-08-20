import { type Cliente } from './client';

export type StatusOrcamento = 'ABERTO' | 'CONVERTIDO' | 'CANCELADO' | 'SUBSTITUIDO';

export type ItemOrcamento = {
   id?: number;
   productId?: number;
   itemNome: string;
   itemImageUrl?: string;
   valor: number;
   tipoPrecificacao?: string;
   valorCusto?: number;
   valorArte?: number;
   valorVenda?: number;
   valorDesconto?: number;
   quantidade?: number;
   largura?: number;
   altura?: number;
   observacao?: string;
   opcoes?: Record<string, any>;
};

export type Orcamento = {
   id: number;
   codigoVisual: string;
   dataCriacao: string;
   criadoPor?: {
      id: number;
      username: string;
      nome: string;
   } | null;
   cliente?: Cliente | null;
   itens: ItemOrcamento[];
   valor: number;
   status: StatusOrcamento;
   pedidoVisual?: string | null;
   pedidoId?: number | null;
   motivoCancelamento?: string | null;
   dataCancelamento?: string | null;
   canceladoPor?: {
      id: number;
      username: string;
      nome: string;
   } | null;
   orcamentoSubstitutoVisual?: string | null;
   orcamentoSubstitutoId?: number | null;
};
