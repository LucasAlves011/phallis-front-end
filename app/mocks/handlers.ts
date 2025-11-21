// Arquivo: app/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

// Vamos reutilizar nossos dados e tipos!
import {
   MOCK_ORDERS,
   type Pedido,
   updateStatusFinanceiro,
   updateStatusProducao,
   type StatusFinanceiro,
   type StatusProducao,
   cancelarPedido
} from '@/lib/orderData';

import { produtosDoCatalogo, deleteProduct, reorderProducts, type Product } from '@/lib/productData';

import { fetchClients, addClient, editClient, type Cliente, type User } from '@/lib/clientData';

// ==========================================================
// MUDANÇA 1: Banco de Usuários com Roles e Permissões
// ==========================================================
let MOCK_USERS_DB: (User & { password: string, username: string })[] = [
   {
      id: 'user_1',
      nome: 'Lucas Alves',
      email: 'lucas@phalis.com',
      username: 'lucas',
      password: '123',
      role: 'admin',
      active: true,
      // Admin tem acesso a TUDO
      permissions: [
         'catalogo.ver', 'pedidos.realizar',
         'pedidos.visualizar', 'pedidos.editar', 'pedidos.cancelar',
         'pedidos.status.producao', 'pedidos.status.financeiro',
         'clientes.visualizar', 'clientes.alterar',
         'produtos.cadastrar', 'produtos.editar', 'produtos.deletar', 'produtos.ordenar',
         'usuarios.gerenciar'
      ]
   },
   {
      id: 'user_2',
      nome: 'Phalis Phillipe',
      email: 'vendedor@phalis.com',
      username: 'phalis',
      password: '123',
      role: 'user',
      active: true,
      // Vendedor típico
      permissions: [
         'catalogo.ver',
         'pedidos.realizar',
         'pedidos.visualizar',
         'clientes.visualizar',
         'clientes.alterar'
      ]
   },
   {
      id: 'user_3',
      nome: 'Bob da Silva',
      email: 'bloq@phalis.com',
      username: 'bob',
      password: '123',
      role: 'user',
      active: false,
      permissions: []
   }
];

let currentlyLoggedInUser: User | null = null;
let hasMockCookie = false; // Simula a existência do cookie

const LIMIT = 20; // 20 pedidos por página

export const handlers = [


   // ==========================================================
   // MUDANÇA 1: NOVA ROTA (GET por ID)
   // ==========================================================
   http.get('/api/produtos/:id', async ({ params }) => {
      const { id } = params;
      console.log(`[MSW] GET /api/produtos/${id}`);
      const produto = produtosDoCatalogo.find(p => p.id === id);

      if (produto) {
         return HttpResponse.json(produto);
      }
      return HttpResponse.json({ message: 'Produto não encontrado' }, { status: 404 });
   }),

   // ==========================================================
   // MUDANÇA 2: NOVA ROTA (POST - Criar)
   // ==========================================================
   http.post('/api/produtos', async ({ request }) => {
      const novoProduto = await request.json() as Product;
      // Adiciona o novo produto no INÍCIO da lista
      produtosDoCatalogo.unshift(novoProduto);
      console.log('[MSW] POST /api/produtos', novoProduto);
      return HttpResponse.json(novoProduto, { status: 201 });
   }),

   // ==========================================================
   // MUDANÇA 3: NOVA ROTA (PUT - Atualizar)
   // ==========================================================
   http.put('/api/produtos/:id', async ({ request, params }) => {
      const { id } = params;
      const updatedData = await request.json() as Product;

      const index = produtosDoCatalogo.findIndex(p => p.id === id);
      if (index !== -1) {
         produtosDoCatalogo[index] = updatedData;
         console.log(`[MSW] PUT /api/produtos/${id}`, updatedData);
         return HttpResponse.json(updatedData);
      }
      return HttpResponse.json({ message: 'Produto não encontrado' }, { status: 404 });
   }),

   // ==========================================================
   // MUDANÇA 3: NOVA ROTA (DELETE com senha)
   // ==========================================================
   http.delete('/api/produtos/:id', async ({ request, params }) => {
      const { id } = params;
      const { password } = await request.json() as { password: string };

      // 1. Checa se o usuário está logado
      if (!currentlyLoggedInUser) {
         return HttpResponse.json({ message: 'Não autorizado' }, { status: 401 });
      }

      // 2. Acha o usuário logado no "banco"
      const userInDb = MOCK_USERS_DB.find(u => u.id === currentlyLoggedInUser.id);

      // 3. Checa a senha
      if (!userInDb || userInDb.password !== password) {
         console.log('[MSW] Falha ao deletar: Senha incorreta');
         return HttpResponse.json({ message: 'Senha incorreta' }, { status: 403 }); // 403 Forbidden
      }

      // 4. Deleta o produto
      const deleted = deleteProduct(id as string);
      if (deleted) {
         console.log(`[MSW] Produto ${id} deletado`);
         return HttpResponse.json(null, { status: 204 }); // 204 No Content
      }

      return HttpResponse.json({ message: 'Produto não encontrado' }, { status: 404 });
   }),

   http.put('/api/produtos/reorder', async ({ request }) => {
      console.log('[MSW] Interceptada chamada para PUT /api/produtos/reorder');
      const { productIds } = await request.json() as { productIds: string[] };

      if (!productIds) {
         return HttpResponse.json({ message: 'IDs não fornecidos' }, { status: 400 });
      }

      reorderProducts(productIds);

      console.log('[MSW] PUT /api/produtos/reorder', productIds);
      return HttpResponse.json({ success: true });
   }),

   http.put('/api/pedidos/:id', async ({ request, params }) => {
      const { id } = params;
      const updatedData = await request.json() as any; // (O payload do formulário)

      const index = MOCK_ORDERS.findIndex(p => p.id === id);

      if (index !== -1) {
         // Atualiza o pedido no "banco"
         // (Combinamos o pedido antigo com os novos dados)
         MOCK_ORDERS[index] = {
            ...MOCK_ORDERS[index], // Mantém ID, dataCriacao, etc.
            cliente: updatedData.cliente,
            opcoes: updatedData.opcoes,
            detalhes: { // Recria os detalhes
               ...MOCK_ORDERS[index].detalhes,
               opcoes: updatedData.opcoes,
               dimensoesPersonalizadas: updatedData.dimensoesPersonalizadas,
               preco: updatedData.preco,
            },
            valor: updatedData.preco.total,
            statusFinanceiro: updatedData.preco.pagamento,
            // (Nota: A atualização de status de produção é separada)
         };

         console.log(`[MSW] PUT /api/pedidos/${id}`, MOCK_ORDERS[index]);
         return HttpResponse.json(MOCK_ORDERS[index]);
      }

      return HttpResponse.json({ message: 'Pedido não encontrado' }, { status: 404 });
   }),

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

   // ==========================================================
   //  NOVA ROTA (PUT - Cancelar)
   // ==========================================================
   http.put('/api/pedidos/:id/cancelar', async ({ request, params }) => {
      const { id } = params;
      const { userName, motivo } = await request.json() as { userName: string, motivo: string };

      if (!motivo) {
         return HttpResponse.json({ message: 'O motivo é obrigatório' }, { status: 400 });
      }

      console.log(`[MSW] PUT /api/pedidos/${id}/cancelar por ${userName}`);

      const pedidoAtualizado = await cancelarPedido(id as string, userName, motivo);
      if (pedidoAtualizado) {
         return HttpResponse.json(pedidoAtualizado);
      }
      return HttpResponse.json({ message: 'Pedido não encontrado' }, { status: 404 });
   }),

   // ==========================================================
   // MUDANÇA AQUI: Rota POST agora salva os novos campos
   // ==========================================================
   http.post('/api/pedidos', async ({ request }) => {
      console.log('[MSW] Interceptada chamada para POST /api/pedidos');

      const dadosDoFormulario = await request.json() as any;
      const dataCriacao = new Date().toISOString();

      const valorDoPedido = dadosDoFormulario.produto.pricingType === 'servico'
         ? dadosDoFormulario.preco.valorVenda
         : dadosDoFormulario.preco.total;

      const userName = dadosDoFormulario.user?.nome || 'Usuário Desconhecido';

      // Lógica para construir o 'detalhes' corretamente
      let detalhesDoPedido: any;
      if (dadosDoFormulario.produto.pricingType === 'unidade') {
         detalhesDoPedido = {
            type: 'unidade',
            opcoes: dadosDoFormulario.opcoes,
            dimensoesPersonalizadas: dadosDoFormulario.dimensoesPersonalizadas, // <-- SALVO AQUI
            preco: dadosDoFormulario.preco, // Já contém custoTotal, vendaTotal, etc.
            observacao: dadosDoFormulario.observacao,
         };
      } else if (dadosDoFormulario.produto.pricingType === 'metro') {
         detalhesDoPedido = {
            type: 'metro',
            opcoes: dadosDoFormulario.opcoes,
            preco: dadosDoFormulario.preco, // Já contém valorTotalCusto, valorTotalVenda, etc.
            observacao: dadosDoFormulario.observacao,
         };
      } else {
         detalhesDoPedido = {
            type: 'servico',
            preco: dadosDoFormulario.preco,
            observacao: dadosDoFormulario.observacao,
         };
      }

      const novoPedido: Pedido = {
         id: `PED-${Math.floor(Math.random() * 9000) + 1000}`,
         dataCriacao: dataCriacao,
         criadoPor: userName,
         cliente: dadosDoFormulario.cliente,
         itemNome: dadosDoFormulario.produto.nome,
         itemImageUrl: dadosDoFormulario.produto.imageUrl || '/images/catalogo/arte.png',
         productId: dadosDoFormulario.produto.id || 'prod_000',
         valor: valorDoPedido,
         statusFinanceiro: dadosDoFormulario.preco.pagamento,
         statusProducao: 'pre_prod',
         historicoFinanceiro: [{ status: dadosDoFormulario.preco.pagamento, data: dataCriacao, user: userName }],
         historicoProducao: [{ status: 'pre_prod', data: dataCriacao, user: userName }],
         detalhes: detalhesDoPedido, // <-- CORRIGIDO
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

   http.get('/api/pedidos/:id', async ({ params }) => {
      const { id } = params;
      console.log(`[MSW] GET /api/pedidos/${id}`);
      const pedido = MOCK_ORDERS.find(p => p.id === id);

      if (pedido) {
         return HttpResponse.json(pedido);
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

      const foundUser = MOCK_USERS_DB.find(user => user.username === username && user.password === password);

      if (foundUser) {
         // MUDANÇA: Checar se está ativo
         if (!foundUser.active) {
            return HttpResponse.json({ message: 'Usuário desativado. Contate o administrador.' }, { status: 403 });
         }

         const { password, ...userPublicData } = foundUser;
         currentlyLoggedInUser = userPublicData;
         hasMockCookie = true;
         return HttpResponse.json(userPublicData, { status: 200, headers: { 'Set-Cookie': 'session-token=mocked_jwt_token; HttpOnly; Path=/; Max-Age=3600' } });
      }
      currentlyLoggedInUser = null;
      hasMockCookie = false;
      return HttpResponse.json({ message: 'Credenciais inválidas' }, { status: 401 });
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

   // ==========================================================
   // MUDANÇA 2: Novas Rotas de Gerenciamento de Usuários
   // ==========================================================

   // Listar Usuários (Apenas Admin deveria ver, na teoria)
   http.get('/api/users', async () => {
      // Retorna os usuários sem a senha
      const safeUsers = MOCK_USERS_DB.map(({ password, ...u }) => u);
      return HttpResponse.json(safeUsers);
   }),

   // Criar Usuário
   http.post('/api/users', async ({ request }) => {
      const newUser = await request.json() as any;

      const userWithId = {
         ...newUser,
         id: `user_${Math.random().toString(36).substr(2, 9)}`,
         active: true, // Padrão
      };

      // (Em um app real, criptografaríamos a senha aqui)
      MOCK_USERS_DB.push(userWithId);

      const { password, ...safeUser } = userWithId;
      return HttpResponse.json(safeUser, { status: 201 });
   }),

   // Editar Usuário (Permissões, Ativar/Desativar)
   http.put('/api/users/:id', async ({ request, params }) => {
      const { id } = params;
      const updates = await request.json() as Partial<User>;

      const actingUser = MOCK_USERS_DB.find(u => u.id === currentlyLoggedInUser.id);
      const targetUser = MOCK_USERS_DB.find(u => u.id === params.id);

      const index = MOCK_USERS_DB.findIndex(u => u.id === id);
      if (index === -1) {
         return HttpResponse.json({ message: 'Usuário não encontrado' }, { status: 404 });
      }

      if (targetUser.role === 'admin' && actingUser.role !== 'admin') {
         return HttpResponse.json(
            { message: 'Você não tem permissão para modificar um Administrador.' },
            { status: 403 }
         );
      }

      // Atualiza os campos
      MOCK_USERS_DB[index] = { ...MOCK_USERS_DB[index], ...updates };

      const { password, ...safeUser } = MOCK_USERS_DB[index];
      return HttpResponse.json(safeUser);
   }),

   // ==========================================================
   // MUDANÇA AQUI: Nova rota POST para /consultar-preco
   // ==========================================================
   http.post('http://localhost:8030/consultar-preco/:nomeProduto', async ({ request, params }) => {
      const { nomeProduto } = params;
      const opcoes = await request.json();

      console.log(`[MSW] POST /consultar-preco/${nomeProduto}`);
      console.log('[MSW] Opções Recebidas:', opcoes);

      // Simula o delay da API real
      // await delay(1000);

      // Retorna o seu JSON de exemplo
      const mockResponse = {
         nomeProduto: nomeProduto,
         dataExtracao: new Date().toISOString(),
         qtdMinima: 1,
         precoMinimo: 33.60,
         tamanhoPasso: 1,
         precos: [
            { qtd: 1, preco: 33.60 },
            { qtd: 2, preco: 67.20 },
            { qtd: 3, preco: 100.80 },
            { qtd: 4, preco: 134.40 },
            { qtd: 5, preco: 168.00 },
            { qtd: 10, preco: 336.00 },
         ]
      };

      return HttpResponse.json(mockResponse);
   }),

   // ==========================================================
   // MUDANÇA: Rota para Trocar Senha
   // ==========================================================
   http.put('/api/users/me/password', async ({ request }) => {
      const { currentPassword, newPassword } = await request.json() as any;

      console.log('[MSW] Tentativa de troca de senha');

      // Verifica se há usuário logado no mock
      if (!currentlyLoggedInUser) {
         return HttpResponse.json({ message: 'Não autorizado' }, { status: 401 });
      }

      // Encontra o usuário no banco fictício
      const userInDb = MOCK_USERS_DB.find(u => u.id === currentlyLoggedInUser!.id);

      if (!userInDb) {
         return HttpResponse.json({ message: 'Usuário não encontrado' }, { status: 404 });
      }

      // Verifica a senha atual
      if (userInDb.password !== currentPassword) {
         return HttpResponse.json({ message: 'Senha atual incorreta.' }, { status: 400 });
      }

      // Atualiza a senha
      userInDb.password = newPassword;
      console.log(`[MSW] Senha do usuário ${userInDb.username} alterada com sucesso.`);

      return HttpResponse.json({ success: true });
   }),
];