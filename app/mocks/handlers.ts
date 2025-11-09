// Arquivo: app/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

// Vamos reutilizar nossos dados e tipos!
import {
  MOCK_ORDERS,
  type Pedido,
  updateStatusFinanceiro,
  updateStatusProducao,
  type StatusFinanceiro,
  type StatusProducao
} from '@/lib/orderData';

import { produtosDoCatalogo } from '@/lib/productData';

import { fetchClients, addClient, editClient, type Cliente, type User } from '@/lib/clientData';

const MOCK_USERS_DB: (User & { password: string, username: string })[] = [
   {
      id: 'user_1',
      nome: 'Lucas Alves', // O usuário principal
      email: 'lucas@phalis.com',
      username: 'lucas', // O login que já funciona
      password: '123'
   },
   {
      id: 'user_2',
      nome: 'Phallis Admin', // Novo usuário
      email: 'phallis@phalis.com',
      username: 'phallis',
      password: '123' // Senha simples para o mock
   },
   {
      id: 'user_3',
      nome: 'Bob Silva', // Segundo novo usuário
      email: 'bob@phalis.com',
      username: 'bob',
      password: '123' // Senha simples para o mock
   }
];

let currentlyLoggedInUser: User | null = null;
let hasMockCookie = false; // Simula a existência do cookie

const LIMIT = 20; // 20 pedidos por página

export const handlers = [


   // ==========================================================
   // MUDANÇA AQUI: Nova rota GET para /api/produtos (o catálogo)
   // ==========================================================
   http.get('/api/produtos', async () => {
      console.log('[MSW] Interceptada chamada para GET /api/produtos');
      // await delay(300); // Simula um pequeno delay de rede
      return HttpResponse.json(produtosDoCatalogo);
   }),

   // ==========================================================
   // ROTAS DE PEDIDOS
   // ==========================================================

   // Intercepta a chamada GET para /api/pedidos
   http.get('/api/pedidos', ({ request }) => {
      const url = new URL(request.url);
      const page = parseInt(url.searchParams.get('page') || '1', 10);

      // 1. Pega os novos parâmetros de filtro
      const cliente = url.searchParams.get('cliente');
      const financeiro = url.searchParams.get('financeiro') as StatusFinanceiro | null;
      const status = url.searchParams.get('status') as StatusProducao | null;

      console.log(`[MSW] GET /api/pedidos (Página: ${page}, Cliente: ${cliente}, Financeiro: ${financeiro}, Status: ${status})`);

      // 2. Aplica os filtros ao MOCK_ORDERS
      let filteredOrders = MOCK_ORDERS;

      if (cliente) {
         filteredOrders = filteredOrders.filter(p =>
            p.cliente.nome.toLowerCase().includes(cliente.toLowerCase())
         );
      }
      if (financeiro) {
         filteredOrders = filteredOrders.filter(p => p.statusFinanceiro === financeiro);
      }
      if (status) {
         filteredOrders = filteredOrders.filter(p => p.statusProducao === status);
      }

      // 3. Pagina os resultados *filtrados*
      const start = (page - 1) * LIMIT;
      const end = start + LIMIT;
      const pedidosPaginados = filteredOrders.slice(start, end);

      return HttpResponse.json(pedidosPaginados);
   }),

   http.post('/api/pedidos', async ({ request }) => {
      console.log('[MSW] Interceptada chamada para POST /api/pedidos');

      const dadosDoFormulario = await request.json() as any;
      const dataCriacao = new Date().toISOString();
      const valorDoPedido = dadosDoFormulario.produto.pricingType === 'arte'
         ? dadosDoFormulario.preco.valorVenda
         : dadosDoFormulario.preco.total;

      // Pega o nome do usuário que está no payload
      const userName = dadosDoFormulario.user?.nome || 'Usuário Desconhecido';

      const novoPedido: Pedido = {
         id: `PED-${Math.floor(Math.random() * 9000) + 1000}`,
         dataCriacao: dataCriacao,
         criadoPor: userName, // <-- SALVA O CRIADOR
         cliente: dadosDoFormulario.cliente,
         itemNome: dadosDoFormulario.produto.nome,
         itemImageUrl: dadosDoFormulario.produto.imageUrl || '/images/catalogo/arte.png',
         productId: dadosDoFormulario.produto.id || 'prod_000',
         valor: valorDoPedido,
         statusFinanceiro: dadosDoFormulario.preco.pagamento,
         statusProducao: 'pre_prod',
         historicoFinanceiro: [{ status: dadosDoFormulario.preco.pagamento, data: dataCriacao, user: userName }],
         historicoProducao: [{ status: 'pre_prod', data: dataCriacao, user: userName }],
         detalhes: {
            type: dadosDoFormulario.produto.pricingType,
            opcoes: dadosDoFormulario.opcoes,
            preco: dadosDoFormulario.preco,
         } as any,
      };
      MOCK_ORDERS.unshift(novoPedido);
      return HttpResponse.json(novoPedido, { status: 201 });
   }),

   // MUDANÇA 2: Rota PUT agora recebe 'userName'
   http.put('/api/pedidos/:id/financeiro', async ({ request, params }) => {
      const { id } = params;
      // Pega o 'status' e o 'userName' do body
      const { status, userName } = await request.json() as { status: StatusFinanceiro, userName: string };
      console.log(`[MSW] PUT /api/pedidos/${id}/financeiro -> ${status} por ${userName}`);

      const pedidoAtualizado = await updateStatusFinanceiro(id as string, status, userName);
      if (pedidoAtualizado) {
         return HttpResponse.json(pedidoAtualizado);
      }
      return HttpResponse.json({ message: 'Pedido não encontrado' }, { status: 404 });
   }),

   // MUDANÇA 3: Rota PUT agora recebe 'userName'
   http.put('/api/pedidos/:id/producao', async ({ request, params }) => {
      const { id } = params;
      const { status, userName } = await request.json() as { status: StatusProducao, userName: string };
      console.log(`[MSW] PUT /api/pedidos/${id}/producao -> ${status} por ${userName}`);

      const pedidoAtualizado = await updateStatusProducao(id as string, status, userName);
      if (pedidoAtualizado) {
         return HttpResponse.json(pedidoAtualizado);
      }
      return HttpResponse.json({ message: 'Pedido não encontrado' }, { status: 404 });
   }),


   // ==========================================================
   // ROTAS DE CLIENTES
   // ==========================================================

   http.get('/api/clientes', async () => {
      console.log('[MSW] Interceptada chamada para GET /api/clientes');
      const clientes = await fetchClients();
      return HttpResponse.json(clientes);
   }),

   http.post('/api/clientes', async ({ request }) => {
      console.log('[MSW] Interceptada chamada para POST /api/clientes');

      // Lê os dados do 'body' da requisição
      const newClientData = await request.json() as Omit<Cliente, 'id'>;

      // Adiciona o cliente ao nosso 'banco'
      const clienteCriado = await addClient(newClientData);

      // Retorna o novo cliente com status 201 (Created)
      return HttpResponse.json(clienteCriado, { status: 201 });
   }),


   http.put('/api/clientes/:id', async ({ request, params }) => {
      const { id } = params;
      const updatedData = await request.json() as Omit<Cliente, 'id'>;

      console.log(`[MSW] Interceptada chamada para PUT /api/clientes/${id}`);

      const clienteAtualizado = await editClient(id as string, updatedData);

      if (clienteAtualizado) {
         return HttpResponse.json(clienteAtualizado);
      } else {
         return HttpResponse.json({ message: 'Cliente não encontrado' }, { status: 404 });
      }
   }),


   // ==========================================================
   // NOVAS ROTAS DE AUTENTICAÇÃO
   // ==========================================================

   // 1. Rota de Login
   http.post('/api/auth/login', async ({ request }) => {
      const { username, password } = await request.json() as any;

      console.log(`[MSW] Tentativa de login para: ${username}`);
      // await delay(500);

      // Procura o usuário no "banco"
      const foundUser = MOCK_USERS_DB.find(
         user => user.username === username && user.password === password
      );

      if (foundUser) {
         // Extrai os dados públicos (sem a senha)
         const { password, ...userPublicData } = foundUser;

         // Define o estado global do mock
         currentlyLoggedInUser = userPublicData;
         hasMockCookie = true;

         console.log(`[MSW] Login bem-sucedido para: ${userPublicData.nome}`);

         return HttpResponse.json(userPublicData, {
            status: 200,
            headers: {
               'Set-Cookie': 'session-token=mocked_jwt_token; HttpOnly; Path=/; Max-Age=3600'
            }
         });
      }

      // Falha
      currentlyLoggedInUser = null;
      hasMockCookie = false;
      console.log('[MSW] Login falhou: Credenciais inválidas');

      return HttpResponse.json(
         { message: 'Credenciais inválidas' },
         { status: 401 }
      );
   }),

   // ==========================================================
   // MUDANÇA 4: Rota "Quem sou eu?" atualizada
   // ==========================================================
   http.get('/api/users/me', ({ cookies }) => {
      console.log('[MSW] Verificando sessão (GET /api/users/me)');

      // Verifica se o cookie (simulado pelo 'hasMockCookie') E o usuário logado existem
      if (hasMockCookie && currentlyLoggedInUser) {
         // Sucesso! Retorna o usuário que fez login.
         console.log(`[MSW] Sessão válida. Usuário: ${currentlyLoggedInUser.nome}`);
         return HttpResponse.json(currentlyLoggedInUser);
      }

      // Falha!
      console.log('[MSW] Sessão inválida ou expirada.');
      return HttpResponse.json(
         { message: 'Não autorizado' },
         { status: 401 }
      );
   }),

   // ==========================================================
   // MUDANÇA 5: Rota de Logout atualizada
   // ==========================================================
   http.post('/api/auth/logout', () => {
      console.log('[MSW] Logout (POST /api/auth/logout)');

      // Limpa o estado global do mock
      currentlyLoggedInUser = null;
      hasMockCookie = false;

      return HttpResponse.json(null, {
         status: 200,
         headers: {
            'Set-Cookie': 'session-token=; HttpOnly; Path=/; Max-Age=0'
         }
      });
   }),

   // Você pode adicionar outras rotas aqui:
   // http.post('/api/pedidos', ...)
   // http.put('/api/pedidos/:id/status', ...)
];