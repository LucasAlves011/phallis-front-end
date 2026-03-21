
async function listProducts() {
   try {
      console.log('Autenticando...');
      const loginRes = await fetch('http://localhost:8085/api/auth/login', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ username: 'admin', password: 'admin' })
      });

      if (!loginRes.ok) {
         console.log('Falha no login:', await loginRes.text());
         return;
      }

      const tokenData = await loginRes.json();
      const token = tokenData.token;
      console.log('Login OK. Token obtido.');

      console.log('Buscando produtos...');
      const res = await fetch('http://localhost:8085/api/produtos', {
         headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
         console.log('Falha ao listar produtos:', await res.text());
         return;
      }

      const produtos = await res.json();
      console.log('--- Produtos Encontrados ---');
      if (Array.isArray(produtos)) {
         console.log(`Total: ${produtos.length}`);
         produtos.forEach(p => {
            console.log(`ID: ${p.id} | Nome: ${p.nome} | Imagem: ${p.imageUrl}`);
         });
      } else {
         console.log('Resposta não é array:', produtos);
      }

   } catch (err) {
      console.error('Erro:', err);
   }
}

listProducts();
