// Arquivo: lib/orderData.ts
import { type Product, type ProductOptions } from "./productData";
import { type Cliente } from "@/types/client";

// --- TIPOS DE DADOS PARA OS PEDIDOS ---
export type StatusFinanceiro = 'PAGO' | 'PARCIAL' | 'PENDENTE' | 'REEMBOLSADO';
export type StatusProducao = 'PRE_PROD' | 'EM_PRODUCAO' | 'ACABAMENTO' | 'PRONTO' | 'ENTREGUE' | 'CANCELADO';

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
   
   // Novos campos nivelados (achatados) pelo Backend:
   tipoPrecificacao?: 'UNIDADE' | 'METRO' | 'SERVICO' | null;
   valorCusto?: number | null;
   valorVenda?: number | null;
   valorDesconto?: number | null;
   quantidade?: number | null;
   largura?: number | null;
   altura?: number | null;
   observacao?: string | null;
   opcoes?: Record<string, string | null> | null;

   // Campos que não existem mais mas podem vir de legado:
   statusProducao?: StatusProducao | null;
   historicoProducao?: HistoricoItem[] | null;
   detalhes?: DetalhesPedidoUnidade | DetalhesPedidoMetro | DetalhesPedidoServico;
};

export type Pedido = {
   id: string | number;
   codigoVisual?: string;
   dataCriacao: string;
   criadoPor: any;
   cliente: Cliente;
   valor: number;
   hashRastreio?: string;
   statusFinanceiro: StatusFinanceiro;
   statusProducao: StatusProducao | null;
   // O histórico financeiro e produção foram retirados do payload principal,
   // mas mantidos na tipagem caso venham embutidos em versões velhas.
   historicoFinanceiro?: HistoricoItem[] | null;
   historicoProducao?: HistoricoItem[] | null;
   itens?: ItemPedido[];
   motivoCancelamento?: string | null;
   orcamentoVisual?: string | null;
   orcamentoId?: number | null;

   // Legado (Mantido como opcional para não quebrar o MOCK_ORDERS imediatamente)
   itemNome?: string;
   itemImageUrl?: string;
   productId?: string;
   detalhes?: DetalhesPedidoUnidade | DetalhesPedidoMetro | DetalhesPedidoServico;
};

export const statusFinanceiroOptions: { value: StatusFinanceiro, label: string }[] = [
   { value: 'PENDENTE', label: 'Pendente' },
   { value: 'PARCIAL', label: 'Pagamento Parcial' },
   { value: 'PAGO', label: 'Pago' },
   { value: 'REEMBOLSADO', label: 'Reembolsado' },
];

export const statusProducaoOptions: { value: StatusProducao, label: string }[] = [
   { value: 'PRE_PROD', label: 'Pré-Produção' },
   { value: 'EM_PRODUCAO', label: 'Em Produção' },
   { value: 'ACABAMENTO', label: 'Acabamento/Finalização' },
   { value: 'PRONTO', label: 'Pronto p/ Retirada/Envio' },
   { value: 'ENTREGUE', label: 'Entregue' },
   { value: 'CANCELADO', label: 'Cancelado' }
];

// ==========================================================
