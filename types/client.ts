// Arquivo: types/client.ts

export type Role = 'admin' | 'user' | 'atendente';

export const PERMISSIONS_CONFIG = [
   // PEDIDOS (CATÁLOGO)
   { id: 'catalogo.ver', label: 'Ver Catálogo (Loja)', category: 'Pedidos' },
   { id: 'pedidos.realizar', label: 'Realizar Pedidos', category: 'Pedidos' },

   // PEDIDOS (GESTÃO)
   { id: 'pedidos.visualizar', label: 'Ver Lista de Pedidos', category: 'Pedidos' },
   { id: 'pedidos.editar', label: 'Editar Pedidos', category: 'Pedidos' },
   { id: 'pedidos.cancelar', label: 'Cancelar Pedidos', category: 'Pedidos' },
   { id: 'pedidos.status.producao', label: 'Evoluir Status de Produção', category: 'Pedidos' },
   { id: 'pedidos.status.financeiro', label: 'Evoluir Status Financeiro', category: 'Pedidos' },

   // RELATÓRIOS
   { id: 'relatorios.ver', label: 'Ver Relatórios e Dashboards', category: 'Relatórios' },

   // CLIENTES
   { id: 'clientes.visualizar', label: 'Verificar Lista de Clientes', category: 'Clientes' },
   { id: 'clientes.alterar', label: 'Alterar Clientes (Criar/Editar)', category: 'Clientes' },

   // PRODUTOS
   { id: 'produtos.cadastrar', label: 'Cadastrar Produtos', category: 'Produtos' },
   { id: 'produtos.editar', label: 'Editar Produtos', category: 'Produtos' },
   { id: 'produtos.deletar', label: 'Deletar Produtos', category: 'Produtos' },
   { id: 'produtos.ordenar', label: 'Alterar Ordem de Catálogo', category: 'Produtos' },

   // USUÁRIOS
   { id: 'usuarios.gerenciar', label: 'Gerenciar Usuários', category: 'Usuários' },
] as const;

export type Permission = typeof PERMISSIONS_CONFIG[number]['id'];

// Mapa de Dependências: Chave precisa do Valor
export const PERMISSION_DEPENDENCIES: Partial<Record<Permission, Permission>> = {
   // Pedidos
   'pedidos.realizar': 'catalogo.ver',
   'pedidos.editar': 'pedidos.visualizar',
   'pedidos.cancelar': 'pedidos.visualizar',
   'pedidos.status.producao': 'pedidos.visualizar',
   'pedidos.status.financeiro': 'pedidos.visualizar',

   // Clientes
   'clientes.alterar': 'clientes.visualizar',

   // Produtos (Quem deleta ou ordena, precisa poder editar)
   'produtos.deletar': 'produtos.editar',
   'produtos.ordenar': 'produtos.editar',
};

export type User = {
   id: string;
   username: string; // Adicionado
   nome: string;
   email: string;
   telefone?: string;
   cpfCnpj?: string;
   // Novos campos de segurança
   role: Role;
   active: boolean; // Se false, não consegue logar
   permissions: Permission[]; // Permissões granulares
};

export const ROLE_TEMPLATES: Record<string, Permission[]> = {
   admin: [], // Admin tem acesso total via código (God Mode)

   atendente: [
      'catalogo.ver',
      'pedidos.realizar',
      'pedidos.visualizar',
      'pedidos.editar',
      'pedidos.status.producao',
      'pedidos.status.financeiro',
      'relatorios.ver',
      'clientes.visualizar',
      'clientes.alterar'
   ],

   user: [
      'catalogo.ver',
      'pedidos.realizar',
      'pedidos.visualizar',
      'clientes.visualizar'
   ]
};

export type Cliente = {
   id: string;
   nome: string;
   cpfCnpj: string;
   email: string;
   telefone1: string;
   telefone2: string;
};
