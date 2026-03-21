
const API_URL = 'http://localhost:8085';
const USERNAME = 'lucas';
const PASSWORD = 'lucas123';

async function testOrder() {
   try {
      // 1. LOGIN
      console.log('1. Autenticando com Basic Auth...');
      const credentials = Buffer.from(`${USERNAME}:${PASSWORD}`).toString('base64');
      const loginRes = await fetch(`${API_URL}/api/auth/login`, {
         method: 'GET',
         headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/json'
         }
      });

      if (!loginRes.ok) throw new Error(`Falha no login: ${await loginRes.text()}`);
      const loginData = await loginRes.json();
      const token = loginData.token;
      console.log('Login OK. Token recebido:', token.substring(0, 20) + '...');

      // 2. OBTER USER INFO (Para montar payload) // Simplesmente por curiosidade, se não, pode ser ignorado
      const meRes = await fetch(`${API_URL}/api/users/me`, {
         headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!meRes.ok) throw new Error(`Falha ao obter user info: ${await meRes.text()}`);
      const user = await meRes.json();
      console.log('User OK:', user.username);

      // 3. OBTER UM CLIENTE (Necessário para o pedido)
      // Vamos tentar listar clientes para pegar o ID de um
      const clientsRes = await fetch(`${API_URL}/api/clientes`, {
         headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!clientsRes.ok) {
         console.warn('Falha ao listar clientes, tentando criar pedido sem cliente válido ou mockado.');
      }
      const clients = await clientsRes.json();
      const cliente = clients.content && clients.content.length > 0 ? clients.content[0] : null;

      if (!cliente) {
         console.error('Nenhum cliente encontrado para teste. Crie um cliente primeiro.');
         // Ou criar um mock se o backend aceitar
      } else {
         console.log(`Usando cliente: ${cliente.nome} (${cliente.id})`);
      }

      // 4. OBTER UM PRODUTO (Necessário para o pedido)
      const productsRes = await fetch(`${API_URL}/api/produtos`, {
         headers: { 'Authorization': `Bearer ${token}` }
      });
      const products = await productsRes.json();
      // O endpoint de produtos pode retornar paginado ou lista direta, ajustar conforme necessário
      const produto = products.content ? products.content[0] : products[0];

      if (!produto) {
         console.error('Nenhum produto encontrado.');
         return;
      }
      console.log(`Usando produto: ${produto.nome} (${produto.id})`);

      // 5. TENTAR CRIAR PEDIDO (POST /api/pedidos)
      console.log('5. Criando Pedido (Payload Mínimo)...');

      const payload = {
         user: user,
         cliente: cliente,
         produto: produto,
         opcoes: { papel: "teste", tamanho: "teste" }, // Dados mockados
         observacao: "Teste de script",
         preco: {
            quantidade: 1,
            precoCusto: 10.0,
            precoVenda: 20.0,
            pagamento: "nao_pago",
            total: 20.0
         },
         statusFinanceiro: "nao_pago"
      };

      const orderRes = await fetch(`${API_URL}/api/pedidos`, {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
         },
         body: JSON.stringify(payload)
      });

      if (orderRes.ok) {
         const order = await orderRes.json();
         console.log('Pedido criado com SUCESSO! ID:', order.id);
      } else {
         console.error('ERRO AO CRIAR PEDIDO:', orderRes.status, await orderRes.text());
      }

      // TESTE EXTRA: E se o token for inválido?
      console.log('\n--- TESTE: Token Inválido ---');
      try {
         const badTokenRes = await fetch(`${API_URL}/api/pedidos`, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer invalido123`
            },
            body: JSON.stringify(payload)
         });
         console.log('Status Token Inválido:', badTokenRes.status);
         console.log('Body Token Inválido:', await badTokenRes.text());
      } catch (e) {
         console.log("Erro no fetch invalido", e);
      }

      // TESTE EXTRA: E se não enviar token?
      console.log('\n--- TESTE: Sem Token ---');
      try {
         const noTokenRes = await fetch(`${API_URL}/api/pedidos`, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
         });
         console.log('Status Sem Token:', noTokenRes.status);
         console.log('Body Sem Token:', await noTokenRes.text());
      } catch (e) {
         console.log("Erro no fetch sem token", e);
      }

   } catch (err) {
      console.error('Erro geral:', err);
   }
}

testOrder();
