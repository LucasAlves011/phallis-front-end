// Arquivo: lib/orderData.ts
import { type Product, type ProductOptions } from "./productData";
import { type Cliente } from "@/types/client";

// --- TIPOS DE DADOS PARA OS PEDIDOS ---
export type StatusFinanceiro = 'nao_pago' | 'pago_50' | 'pago';
export type StatusProducao = 'pre_prod' | 'em_producao' | 'pronto_retirada' | 'concluido' | 'cancelado';

export type HistoricoItem = {
   status: StatusFinanceiro | StatusProducao;
   data: string;
   user: string;
   motivo?: string;
};

type DetalhesPedidoUnidade = {
   type: 'UNIDADE';
   opcoes: Record<string, string | null>;
   dimensoesPersonalizadas?: { larguraCm: string, alturaCm: string } | null;
   observacao?: string;
   preco: {
      quantidade: number;
      precoCusto: number;
      precoVenda: number;
      precoArte: number;
      desconto: number;
      total: number;
      custoTotal: number;
      vendaTotal: number;
   };
};

type DetalhesPedidoMetro = {
   type: 'METRO';
   opcoes: Record<string, string | null>;
   dimensoesPersonalizadas?: { larguraCm: string, alturaCm: string } | null;
   observacao?: string;
   preco: {
      largura: number;
      altura: number;
      m2Custo: number;
      m2Venda: number;
      valorArte: number;
      desconto: number;
      total: number;
      valorTotalCusto: number;
      valorTotalVenda: number;
   };
};

type DetalhesPedidoServico = {
   type: 'SERVICO';
   opcoes?: Record<string, string | null>;
   dimensoesPersonalizadas?: { larguraCm: string, alturaCm: string } | null;
   observacao?: string;
   preco: { valorVenda: number, desconto: number, pagamento: string };
};

export type ItemPedido = {
   id: string | number;
   productId: string | number;
   itemNome: string;
   itemImageUrl: string;
   valor: number;
   statusProducao: StatusProducao | null;
   historicoProducao: HistoricoItem[] | null;
   detalhes: DetalhesPedidoUnidade | DetalhesPedidoMetro | DetalhesPedidoServico;
};

export type Pedido = {
   id: string | number;
   codigoVisual?: string;
   dataCriacao: string;
   criadoPor: any;
   cliente: Cliente;
   valor: number;
   statusFinanceiro: StatusFinanceiro;
   statusProducao: StatusProducao | null;
   historicoFinanceiro: HistoricoItem[] | null;
   historicoProducao: HistoricoItem[] | null;
   itens?: ItemPedido[];
   motivoCancelamento?: string | null;

   // Legado (Mantido como opcional para não quebrar o MOCK_ORDERS imediatamente)
   itemNome?: string;
   itemImageUrl?: string;
   productId?: string;
   detalhes?: DetalhesPedidoUnidade | DetalhesPedidoMetro | DetalhesPedidoServico;
};

export const statusFinanceiroOptions: { value: StatusFinanceiro, label: string }[] = [
   { value: 'nao_pago', label: 'Não Pago' },
   { value: 'pago_50', label: 'Pago 50%' },
   { value: 'pago', label: 'Pago' },
];

export const statusProducaoOptions: { value: StatusProducao, label: string }[] = [
   // { value: 'pre_prod', label: 'Pré-Produção' },
   { value: 'em_producao', label: 'Em Produção' },
   { value: 'pronto_retirada', label: 'Pronto p/ Retirada' },
   { value: 'concluido', label: 'Concluído' },
];

// ==========================================================
