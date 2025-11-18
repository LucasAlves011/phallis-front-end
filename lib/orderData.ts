// Arquivo: lib/orderData.ts
import { type Product, type ProductOptions } from "./productData";
import { type Cliente, MOCK_CLIENTS } from "./clientData";

// --- TIPOS DE DADOS PARA OS PEDIDOS ---
export type StatusFinanceiro = 'nao_pago' | 'pago_50' | 'pago';
export type StatusProducao = 'pre_prod' | 'em_producao' | 'pronto_retirada' | 'concluido';

export type HistoricoItem = {
   status: StatusFinanceiro | StatusProducao;
   data: string;
   user: string;
};

// ==========================================================
// MUDANÇA 1: Atualizar os Tipos de Detalhes
// ==========================================================
type DetalhesPedidoUnidade = {
   type: 'unidade';
   opcoes: Record<string, string | null>;
   // Campo para o tamanho personalizado
   dimensoesPersonalizadas?: { larguraCm: string, alturaCm: string } | null;
   // Preço agora inclui os totais (embora sejam iguais)
   preco: {
      quantidade: number;
      precoCusto: number;
      precoVenda: number;
      precoArte: number;
      total: number;
      custoTotal: number; // Adicionado
      vendaTotal: number; // Adicionado
   };
};

type DetalhesPedidoMetro = {
   type: 'metro';
   opcoes: Record<string, string | null>;
   // Preço agora inclui os totais calculados
   preco: {
      largura: number;
      altura: number;
      m2Custo: number;
      m2Venda: number;
      valorArte: number;
      total: number;
      valorTotalCusto: number; // Adicionado
      valorTotalVenda: number; // Adicionado
   };
};

type DetalhesPedidoArte = {
   type: 'arte';
   preco: { observacao: string; valorVenda: number };
};

// ... (Tipo Pedido - sem mudança)
export type Pedido = {
   id: string;
   dataCriacao: string;
   criadoPor: string;
   cliente: Cliente;
   itemNome: string;
   itemImageUrl: string;
   productId: string;
   valor: number;
   statusFinanceiro: StatusFinanceiro;
   statusProducao: StatusProducao;
   historicoFinanceiro: HistoricoItem[];
   historicoProducao: HistoricoItem[];
   detalhes: DetalhesPedidoUnidade | DetalhesPedidoMetro | DetalhesPedidoArte;
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


// ==========================================================
// MUDANÇA 2: Atualizar o MOCK_ORDERS com os novos campos
// ==========================================================
export const MOCK_ORDERS: Pedido[] = Array.from({ length: 40 }).map((_, i) => {
   const id = (1000 + 40 - i).toString();
   const tipo = i % 3;
   const dataCriacao = new Date(Date.now() - i * 10000000).toISOString();
   const mockUser = "Lucas Alves";

   if (tipo === 0) { // Pedido Metro
      const preco = { largura: 1.0, altura: 1.5, m2Custo: 20, m2Venda: 50, valorArte: 0, total: 75.00, valorTotalCusto: 30.00, valorTotalVenda: 75.00 };
      return {
         id: `PED-${id}`, dataCriacao: dataCriacao, criadoPor: mockUser, cliente: MOCK_CLIENTS[0],
         itemNome: 'Lona', itemImageUrl: '/images/catalogo/banner.png', productId: 'prod_001',
         valor: preco.total + i * 5, statusFinanceiro: 'nao_pago', statusProducao: 'pre_prod',
         historicoFinanceiro: [{ status: 'nao_pago', data: dataCriacao, user: mockUser }],
         historicoProducao: [{ status: 'pre_prod', data: dataCriacao, user: mockUser }],
         detalhes: {
            type: 'metro',
            opcoes: { papel: 'Lona UV', tamanho: '', cores: '4x0', acabamento: 'Madeirinhas e Ponteiras' },
            preco: { ...preco, total: 150.00 + i * 5 } // Adiciona os novos campos
         }
      };
   } else if (tipo === 1) { // Pedido Unidade
      const preco = { quantidade: 1000, precoCusto: 100, precoVenda: 300, precoArte: 0, total: 300.00, custoTotal: 100.00, vendaTotal: 300.00 };
      return {
         id: `PED-${id}`, dataCriacao: dataCriacao, criadoPor: mockUser, cliente: MOCK_CLIENTS[1],
         itemNome: 'Cartão de Visita', itemImageUrl: '/images/catalogo/cartao-de-visita.png', productId: 'prod_008',
         valor: preco.total + i * 2, statusFinanceiro: 'pago_50', statusProducao: 'em_producao',
         historicoFinanceiro: [{ status: 'nao_pago', data: dataCriacao, user: mockUser }, { status: 'pago_50', data: dataCriacao, user: mockUser }],
         historicoProducao: [{ status: 'pre_prod', data: dataCriacao, user: mockUser }, { status: 'em_producao', data: dataCriacao, user: mockUser }],
         detalhes: {
            type: 'unidade',
            opcoes: { papel: 'couché_300g', tamanho: '9.1x5.1cm_arte_(8.8', cores: '4x4', acabamento: 'laminação_fosca_fre' },
            dimensoesPersonalizadas: null, // Adicionado
            preco: { ...preco, total: 300.00 + i * 2 } // Adiciona os novos campos
         }
      };
   } else { // Pedido Arte
      return {
         id: `PED-${id}`, dataCriacao: dataCriacao, criadoPor: mockUser, cliente: MOCK_CLIENTS[2],
         itemNome: 'Criação de Arte', itemImageUrl: '/images/catalogo/arte.png', productId: 'prod_028',
         valor: 120.00 + i, statusFinanceiro: 'pago', statusProducao: 'concluido',
         historicoFinanceiro: [{ status: 'nao_pago', data: dataCriacao, user: mockUser }, { status: 'pago', data: dataCriacao, user: mockUser }],
         historicoProducao: [{ status: 'pre_prod', data: dataCriacao, user: mockUser }, { status: 'concluido', data: dataCriacao, user: mockUser }],
         detalhes: {
            type: 'arte',
            // @ts-expect-error
            preco: { observacao: 'Cliente pediu 3 opções', valorVenda: 120.00 + i }
         }
      };
   }
});

// --- FUNÇÕES DE API FICTÍCIAS ---
export const fetchPedidos = async (page: number, limit: number = 20): Promise<Pedido[]> => {
   // ... (sem mudança)
   console.log(`Buscando pedidos: Página ${page}, Limite ${limit}`);
   const start = (page - 1) * limit;
   const end = start + limit;
   await new Promise(resolve => setTimeout(resolve, 500));
   return MOCK_ORDERS.slice(start, end);
};
export const updateStatusFinanceiro = async (id: string, newStatus: StatusFinanceiro, userName: string): Promise<Pedido | null> => {
   // ... (sem mudança)
   await new Promise(resolve => setTimeout(resolve, 300));
   const pedido = MOCK_ORDERS.find(p => p.id === id);
   if (!pedido) return null;
   pedido.statusFinanceiro = newStatus;
   pedido.historicoFinanceiro.push({ status: newStatus, data: new Date().toISOString(), user: userName });
   return pedido;
};
export const updateStatusProducao = async (id: string, newStatus: StatusProducao, userName: string): Promise<Pedido | null> => {
   // ... (sem mudança)
   await new Promise(resolve => setTimeout(resolve, 300));
   const pedido = MOCK_ORDERS.find(p => p.id === id);
   if (!pedido) return null;
   pedido.statusProducao = newStatus;
   pedido.historicoProducao.push({ status: newStatus, data: new Date().toISOString(), user: userName });
   return pedido;
};