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
   // ROTAS DE PEDIDOS
   // ==========================================================

   // Intercepta a chamada GET para /api/pedidos
   http.get('/api/pedidos', ({ request }) => {

      // Pega os parâmetros da URL (ex: /api/pedidos?page=1)
      const url = new URL(request.url);
      const page = parseInt(url.searchParams.get('page') || '1', 10);

      console.log(`[MSW] Interceptada chamada para /api/pedidos (Página: ${page})`);

      // Lógica de paginação
      const start = (page - 1) * LIMIT;
      const end = start + LIMIT;
      const pedidosPaginados = MOCK_ORDERS.slice(start, end);

      // Simula o delay da rede
      // await delay(500); // (O MSW v2 recomenda não usar delay no handler)

      // Retorna a resposta como JSON
      return HttpResponse.json(pedidosPaginados);
   }),

   http.post('/api/pedidos', async ({ request }) => {
      console.log('[MSW] Interceptada chamada para POST /api/pedidos');

      const dadosDoFormulario = await request.json() as any;

      // 1. Definir a data ANTES de criar o objeto
      const dataCriacao = new Date().toISOString();

      const valorDoPedido = dadosDoFormulario.produto.pricingType === 'arte'
         ? dadosDoFormulario.preco.valorVenda
         : dadosDoFormulario.preco.total;

      const novoPedido: Pedido = {
         id: `PED-${Math.floor(Math.random() * 9000) + 1000}`,
         dataCriacao: dataCriacao, // <-- 2. Usar a variável aqui
         cliente: dadosDoFormulario.cliente,
         itemNome: dadosDoFormulario.produto.nome,
         itemImageUrl: dadosDoFormulario.produto.imageUrl || '/images/catalogo/arte.png',
         productId: dadosDoFormulario.produto.id || 'prod_000',
         valor: valorDoPedido,
         statusFinanceiro: dadosDoFormulario.preco.pagamento,
         statusProducao: 'pre_prod',
         // 3. Usar a variável aqui também
         historicoFinanceiro: [{ status: dadosDoFormulario.preco.pagamento, data: dataCriacao }],
         historicoProducao: [{ status: 'pre_prod', data: dataCriacao }],
         detalhes: {
            type: dadosDoFormulario.produto.pricingType,
            opcoes: dadosDoFormulario.opcoes,
            preco: dadosDoFormulario.preco,
         } as any,
      };
      MOCK_ORDERS.unshift(novoPedido);
      return HttpResponse.json(novoPedido, { status: 201 });
   }),

   http.put('/api/pedidos/:id/financeiro', async ({ request, params }) => {
      const { id } = params;
      const { status } = await request.json() as { status: StatusFinanceiro };
      console.log(`[MSW] PUT /api/pedidos/${id}/financeiro -> ${status}`);

      const pedidoAtualizado = await updateStatusFinanceiro(id as string, status);
      if (pedidoAtualizado) {
         return HttpResponse.json(pedidoAtualizado);
      }
      return HttpResponse.json({ message: 'Pedido não encontrado' }, { status: 404 });
   }),

   // Rota PUT para Status de Produção
   http.put('/api/pedidos/:id/producao', async ({ request, params }) => {
      const { id } = params;
      const { status } = await request.json() as { status: StatusProducao };
      console.log(`[MSW] PUT /api/pedidos/${id}/producao -> ${status}`);

      const pedidoAtualizado = await updateStatusProducao(id as string, status);
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