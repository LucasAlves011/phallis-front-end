// Arquivo: lib/orderData.ts
import { type Product, type ProductOptions } from "./productData";
import { type Cliente, MOCK_CLIENTS } from "./clientData";

// --- TIPOS DE DADOS PARA OS PEDIDOS ---
export type StatusFinanceiro = 'nao_pago' | 'pago_50' | 'pago';
export type StatusProducao = 'pre_prod' | 'em_producao' | 'pronto_retirada' | 'concluido';

// Tipos de Histórico
export type HistoricoItem = {
   status: StatusFinanceiro | StatusProducao;
   data: string; // ISO String
};

// Tipos de Detalhes
type DetalhesPedidoUnidade = {
   type: 'unidade';
   opcoes: Record<string, string | null>;
   preco: { quantidade: number; precoCusto: number; precoVenda: number; precoArte: number; total: number };
};

type DetalhesPedidoMetro = {
   type: 'metro';
   opcoes: Record<string, string | null>;
   preco: { largura: number; altura: number; m2Custo: number; m2Venda: number; valorArte: number; total: number };
};

type DetalhesPedidoArte = {
   type: 'arte';
   preco: { descricao: string; observacao: string; valorVenda: number };
};

// O Objeto de Pedido Principal
export type Pedido = {
   id: string;
   dataCriacao: string; // Renomeado de 'data'
   cliente: Cliente;
   itemNome: string;
   itemImageUrl: string;
   productId: string;
   valor: number;
   statusFinanceiro: StatusFinanceiro;
   statusProducao: StatusProducao;
   // Novos campos de histórico
   historicoFinanceiro: HistoricoItem[];
   historicoProducao: HistoricoItem[];
   detalhes: DetalhesPedidoUnidade | DetalhesPedidoMetro | DetalhesPedidoArte;
};

// --- BANCO DE DADOS FICTÍCIO ---
export const MOCK_ORDERS: Pedido[] = Array.from({ length: 40 }).map((_, i) => {
   const id = (1000 + 40 - i).toString();
   const tipo = i % 3;
   const dataCriacao = new Date(Date.now() - i * 10000000).toISOString();

   if (tipo === 0) { // Pedido Metro
      return {
         id: `PED-${id}`,
         dataCriacao: dataCriacao,
         cliente: MOCK_CLIENTS[0],
         itemNome: 'Banner em Lona',
         itemImageUrl: '/images/catalogo/banner.png',
         productId: 'prod_001',
         valor: 150.00 + i * 5,
         statusFinanceiro: 'nao_pago',
         statusProducao: 'pre_prod',
         historicoFinanceiro: [{ status: 'nao_pago', data: dataCriacao }],
         historicoProducao: [{ status: 'pre_prod', data: dataCriacao }],
         detalhes: {
            type: 'metro',
            opcoes: { papel: 'lona_fosca', tamanho: 'm2', cores: '4x0', acabamento: 'bastao' },
            preco: { largura: 100, altura: 150, m2Custo: 20, m2Venda: 50, valorArte: 0, total: 150.00 + i * 5 }
         }
      };
   } else if (tipo === 1) { // Pedido Unidade
      return {
         id: `PED-${id}`,
         dataCriacao: dataCriacao,
         cliente: MOCK_CLIENTS[1],
         itemNome: 'Cartão de Visita',
         itemImageUrl: '/images/catalogo/cartao-de-visita.png',
         productId: 'prod_008',
         valor: 300.00 + i * 2,
         statusFinanceiro: 'pago_50',
         statusProducao: 'em_producao',
         historicoFinanceiro: [{ status: 'nao_pago', data: dataCriacao }, { status: 'pago_50', data: dataCriacao }],
         historicoProducao: [{ status: 'pre_prod', data: dataCriacao }, { status: 'em_producao', data: dataCriacao }],
         detalhes: {
            type: 'unidade',
            opcoes: { papel: 'couche_300', tamanho: '9x5', cores: '4x4', acabamento: 'lam_fosca' },
            preco: { quantidade: 1000, precoCusto: 100, precoVenda: 300, precoArte: 0, total: 300.00 + i * 2 }
         }
      };
   } else { // Pedido Arte
      return {
         id: `PED-${id}`,
         dataCriacao: dataCriacao,
         cliente: MOCK_CLIENTS[2],
         itemNome: 'Criação de Arte',
         itemImageUrl: '/images/catalogo/arte.png',
         productId: 'prod_028',
         valor: 120.00 + i,
         statusFinanceiro: 'pago',
         statusProducao: 'concluido',
         historicoFinanceiro: [{ status: 'nao_pago', data: dataCriacao }, { status: 'pago', data: dataCriacao }],
         historicoProducao: [{ status: 'pre_prod', data: dataCriacao }, { status: 'concluido', data: dataCriacao }],
         detalhes: {
            type: 'arte',
            preco: { descricao: 'Criação de logo', observacao: 'Cliente pediu 3 opções', valorVenda: 120.00 + i }
         }
      };
   }
});

// --- FUNÇÕES DE API FICTÍCIAS ---
export const fetchPedidos = async (page: number, limit: number = 20): Promise<Pedido[]> => {
   console.log(`Buscando pedidos: Página ${page}, Limite ${limit}`);
   const start = (page - 1) * limit;
   const end = start + limit;
   await new Promise(resolve => setTimeout(resolve, 500));
   return MOCK_ORDERS.slice(start, end);
};

// Novas funções de API para atualizar status
export const updateStatusFinanceiro = async (id: string, newStatus: StatusFinanceiro): Promise<Pedido | null> => {
   await new Promise(resolve => setTimeout(resolve, 300)); // Delay
   const pedido = MOCK_ORDERS.find(p => p.id === id);
   if (!pedido) return null;

   pedido.statusFinanceiro = newStatus;
   pedido.historicoFinanceiro.push({ status: newStatus, data: new Date().toISOString() });

   return pedido;
};

export const updateStatusProducao = async (id: string, newStatus: StatusProducao): Promise<Pedido | null> => {
   await new Promise(resolve => setTimeout(resolve, 300)); // Delay
   const pedido = MOCK_ORDERS.find(p => p.id === id);
   if (!pedido) return null;

   pedido.statusProducao = newStatus;
   pedido.historicoProducao.push({ status: newStatus, data: new Date().toISOString() });

   return pedido;
};