// Arquivo: lib/clientData.ts

// --- TIPOS ---
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

// --- MOCK DATA ---
export const MOCK_CLIENTS: Cliente[] = [
   { id: 'cli_001', nome: 'Cliente Metro 1 (Original)', cpfCnpj: '111.222.333-44', email: 'cliente1@email.com', telefone1: '(81) 99999-0001', telefone2: '' },
   { id: 'cli_002', nome: 'Cliente Unidade 2 (Original)', cpfCnpj: '22.333.444/0001-55', email: 'cliente2@email.com', telefone1: '(81) 98888-0002', telefone2: '' },
   { id: 'cli_003', nome: 'Cliente Arte 3 (Original)', cpfCnpj: '', email: 'cliente3@email.com', telefone1: '(81) 97777-0003', telefone2: '(81) 3444-5555' },
   { id: 'cli_004', nome: 'Ana Silva', cpfCnpj: '', email: 'ana.silva@email.com', telefone1: '(81) 99901-9901', telefone2: '' },
   { id: 'cli_005', nome: 'Bruno Costa', cpfCnpj: '', email: 'bruno.costa@email.com', telefone1: '(81) 99902-9902', telefone2: '' },
   { id: 'cli_006', nome: 'Carla Dias', cpfCnpj: '', email: 'carla.dias@email.com', telefone1: '(81) 99903-9903', telefone2: '' },
   { id: 'cli_007', nome: 'Daniel Moreira', cpfCnpj: '', email: 'd.moreira@email.com', telefone1: '(81) 99904-9904', telefone2: '' },
   { id: 'cli_008', nome: 'Elisa Fernandes', cpfCnpj: '', email: 'elisa.f@email.com', telefone1: '(81) 99905-9905', telefone2: '' },
   { id: 'cli_009', nome: 'Fábio Guedes', cpfCnpj: '', email: 'fabio_guedes@email.com', telefone1: '(81) 99906-9906', telefone2: '' },
   { id: 'cli_010', nome: 'Gabriela Lima', cpfCnpj: '', email: 'gabriela.lima@email.com', telefone1: '(81) 99907-9907', telefone2: '' },
   { id: 'cli_011', nome: 'Hugo Santos', cpfCnpj: '', email: 'hugo.santos@email.com', telefone1: '(81) 99908-9908', telefone2: '' },
   { id: 'cli_013', nome: 'Isabela Pereira', cpfCnpj: '', email: 'isabela.p@email.com', telefone1: '(81) 99909-9909', telefone2: '' },
   { id: 'cli_014', nome: 'João Medeiros', cpfCnpj: '', email: 'joao.medeiros@email.com', telefone1: '(81) 99910-9910', telefone2: '' },
   { id: 'cli_015', nome: 'Karina Oliveira', cpfCnpj: '', email: 'karina.oliveira@email.com', telefone1: '(81) 99911-9911', telefone2: '' },
   { id: 'cli_012', nome: 'Leonardo Barros', cpfCnpj: '', email: 'leo.barros@email.com', telefone1: '(81) 99912-9912', telefone2: '' },
   { id: 'cli_016', nome: 'Mariana Farias', cpfCnpj: '', email: 'mariana.farias@email.com', telefone1: '(81) 99913-9913', telefone2: '' },
   { id: 'cli_017', nome: 'Nícolas Azevedo', cpfCnpj: '', email: 'nicolas.azevedo@email.com', telefone1: '(81) 99914-9914', telefone2: '' },
   { id: 'cli_018', nome: 'Olívia Ribeiro', cpfCnpj: '', email: 'olivia.ribeiro@email.com', telefone1: '(81) 99915-9915', telefone2: '' },
   { id: 'cli_019', nome: 'Paulo Cavalcanti', cpfCnpj: '', email: 'paulo.cavalcanti@email.com', telefone1: '(81) 99916-9916', telefone2: '' },
   { id: 'cli_020', nome: 'Rafaela Albuquerque', cpfCnpj: '', email: 'rafaela.albuq@email.com', telefone1: '(81) 99917-9917', telefone2: '' },
   { id: 'cli_021', nome: 'Samuel Rocha', cpfCnpj: '', email: 'samuel.rocha@email.com', telefone1: '(81) 99918-9918', telefone2: '' },
   { id: 'cli_022', nome: 'Tatiana Correia', cpfCnpj: '', email: 'tati.correia@email.com', telefone1: '(81) 99919-9919', telefone2: '' },
   { id: 'cli_023', nome: 'Ulisses Bezerra', cpfCnpj: '', email: 'ulisses.b@email.com', telefone1: '(81) 99920-9920', telefone2: '' },
   { id: 'cli_024', nome: 'Vanessa Andrade', cpfCnpj: '', email: 'vanessa.andrade@email.com', telefone1: '(81) 99921-9921', telefone2: '' },
   { id: 'cli_025', nome: 'William Arruda', cpfCnpj: '', email: 'william.arruda@email.com', telefone1: '(81) 99922-9922', telefone2: '' },
   { id: 'cli_026', nome: 'Xavier Pinto', cpfCnpj: '', email: 'xavier.pinto@email.com', telefone1: '(81) 99923-9923', telefone2: '' },
   { id: 'cli_027', nome: 'Yara Monteiro', cpfCnpj: '', email: 'yara.monteiro@email.com', telefone1: '(81) 99924-9924', telefone2: '' },
   { id: 'cli_028', nome: 'Zeca Tavares', cpfCnpj: '', email: 'zeca.tavares@email.com', telefone1: '(81) 99925-9925', telefone2: '' },
   { id: 'cli_029', nome: 'Amanda Borges', cpfCnpj: '', email: 'amanda.borges@email.com', telefone1: '(81) 99926-9926', telefone2: '' }
];

// Funções de cliente (mantidas iguais, mas agora com tipos exportados)
export const fetchClients = async (): Promise<Cliente[]> => {
   await new Promise(resolve => setTimeout(resolve, 300));
   return MOCK_CLIENTS;
};
export const addClient = async (data: Omit<Cliente, 'id'>): Promise<Cliente> => {
   await new Promise(resolve => setTimeout(resolve, 500));
   const novoCliente: Cliente = { ...data, id: `cli_${Math.random().toString(36).substr(2, 9)}` };
   MOCK_CLIENTS.unshift(novoCliente);
   return novoCliente;
};
export const editClient = async (id: string, data: Omit<Cliente, 'id'>): Promise<Cliente | null> => {
   await new Promise(resolve => setTimeout(resolve, 500));
   const index = MOCK_CLIENTS.findIndex(c => c.id === id);
   if (index === -1) return null;
   MOCK_CLIENTS[index] = { ...data, id };
   return MOCK_CLIENTS[index];
};