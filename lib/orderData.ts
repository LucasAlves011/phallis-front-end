// Arquivo: lib/orderData.ts
import { type Product, type ProductOptions } from "./productData";
import { type Cliente, MOCK_CLIENTS } from "./clientData";

// --- TIPOS DE DADOS PARA OS PEDIDOS ---
export type StatusFinanceiro = 'nao_pago' | 'pago_50' | 'pago';
export type StatusProducao = 'pre_prod' | 'em_producao' | 'pronto_retirada' | 'concluido';

// MUDANÇA 1: Histórico agora tem 'user'
export type HistoricoItem = {
   status: StatusFinanceiro | StatusProducao;
   data: string; // ISO String
   user: string; // Nome do usuário que fez a ação
};

export const statusFinanceiroOptions: { value: StatusFinanceiro, label: string }[] = [
   { value: 'nao_pago', label: 'Não Pago' },
   { value: 'pago_50', label: 'Pago 50%' },
   { value: 'pago', label: 'Pago' },
];

export const statusProducaoOptions: { value: StatusProducao, label: string }[] = [
   { value: 'pre_prod', label: 'Pré-Produção' },
   { value: 'em_producao', label: 'Em Produção' },
   { value: 'pronto_retirada', label: 'Pronto p/ Retirada' },
   { value: 'concluido', label: 'Concluído' },
];

// ... (outros tipos de detalhes - sem mudança)
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

// MUDANÇA 2: 'Pedido' agora tem 'criadoPor' e histórico atualizado
export type Pedido = {
   id: string;
   dataCriacao: string;
   criadoPor: string; // <-- NOVO CAMPO
   cliente: Cliente;
   itemNome: string;
   itemImageUrl: string;
   productId: string;
   valor: number;
   statusFinanceiro: StatusFinanceiro;
   statusProducao: StatusProducao;
   historicoFinanceiro: HistoricoItem[]; // <-- Tipo atualizado
   historicoProducao: HistoricoItem[]; // <-- Tipo atualizado
   detalhes: DetalhesPedidoUnidade | DetalhesPedidoMetro | DetalhesPedidoArte;
};

// ==========================================================
// MUDANÇA AQUI: MOCK_ORDERS agora usa Metros (ex: 1.0, 1.5)
// ==========================================================
export const MOCK_ORDERS: Pedido[] = Array.from({ length: 40 }).map((_, i) => {
   const id = (1000 + 40 - i).toString();
   const tipo = i % 3;
   const dataCriacao = new Date(Date.now() - i * 10000000).toISOString();
   const mockUser = "Lucas Alves";

   if (tipo === 0) { // Pedido Metro
      return {
         id: `PED-${id}`,
         dataCriacao: dataCriacao,
         criadoPor: mockUser,
         cliente: MOCK_CLIENTS[0],
         itemNome: 'Banner em Lona',
         itemImageUrl: '/images/catalogo/banner.png',
         productId: 'prod_001',
         valor: 150.00 + i * 5,
         statusFinanceiro: 'nao_pago',
         statusProducao: 'pre_prod',
         historicoFinanceiro: [{ status: 'nao_pago', data: dataCriacao, user: mockUser }],
         historicoProducao: [{ status: 'pre_prod', data: dataCriacao, user: mockUser }],
         detalhes: {
            type: 'metro',
            opcoes: { papel: 'lona_fosca', tamanho: 'm2', cores: '4x0', acabamento: 'bastao' },
            // MUDANÇA: de 100/150 (cm) para 1.0/1.5 (m)
            preco: { largura: 1.0, altura: 1.5, m2Custo: 20, m2Venda: 50, valorArte: 0, total: 150.00 + i * 5 }
         }
      };
   } else if (tipo === 1) { // Pedido Unidade
      return {
         id: `PED-${id}`,
         dataCriacao: dataCriacao,
         criadoPor: mockUser,
         cliente: MOCK_CLIENTS[1],
         itemNome: 'Cartão de Visita',
         itemImageUrl: '/images/catalogo/cartao-de-visita.png',
         productId: 'prod_008',
         valor: 300.00 + i * 2,
         statusFinanceiro: 'pago_50',
         statusProducao: 'em_producao',
         historicoFinanceiro: [{ status: 'nao_pago', data: dataCriacao, user: mockUser }, { status: 'pago_50', data: dataCriacao, user: mockUser }],
         historicoProducao: [{ status: 'pre_prod', data: dataCriacao, user: mockUser }, { status: 'em_producao', data: dataCriacao, user: mockUser }],
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
         criadoPor: mockUser,
         cliente: MOCK_CLIENTS[2],
         itemNome: 'Criação de Arte',
         itemImageUrl: '/images/catalogo/arte.png',
         productId: 'prod_028',
         valor: 120.00 + i,
         statusFinanceiro: 'pago',
         statusProducao: 'concluido',
         historicoFinanceiro: [{ status: 'nao_pago', data: dataCriacao, user: mockUser }, { status: 'pago', data: dataCriacao, user: mockUser }],
         historicoProducao: [{ status: 'pre_prod', data: dataCriacao, user: mockUser }, { status: 'concluido', data: dataCriacao, user: mockUser }],
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

// MUDANÇA 4: Funções de update agora aceitam 'userName'
export const updateStatusFinanceiro = async (id: string, newStatus: StatusFinanceiro, userName: string): Promise<Pedido | null> => {
   await new Promise(resolve => setTimeout(resolve, 300));
   const pedido = MOCK_ORDERS.find(p => p.id === id);
   if (!pedido) return null;

   pedido.statusFinanceiro = newStatus;
   pedido.historicoFinanceiro.push({ status: newStatus, data: new Date().toISOString(), user: userName });

   return pedido;
};

export const updateStatusProducao = async (id: string, newStatus: StatusProducao, userName: string): Promise<Pedido | null> => {
   await new Promise(resolve => setTimeout(resolve, 300));
   const pedido = MOCK_ORDERS.find(p => p.id === id);
   if (!pedido) return null;

   pedido.statusProducao = newStatus;
   pedido.historicoProducao.push({ status: newStatus, data: new Date().toISOString(), user: userName });

   return pedido;
};