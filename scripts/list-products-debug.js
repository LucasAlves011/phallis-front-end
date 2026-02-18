// Sem require, usando fetch nativo do Node 18+

async function listProducts() {
   try {
      console.log('Autenticando...');
      const loginRes = await fetch('http://localhost:8085/api/auth/login', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ username: 'admin', password: 'admin' }) // Tentando admin/123 de novo? Nao, vou tentar admin/admin.
      });

      if (!loginRes.ok) {
         console.log('Falha no login:', await loginRes.text());
         return;
      }

      const tokenData = await loginRes.json();
      const token = tokenData.token;
      console.log('Login OK. Buscando produtos...');

      const res = await fetch('http://localhost:8085/api/produtos', {
         headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
         console.log('Falha ao listar produtos:', await res.text());
         return;
      }

      const produtos = await res.json();
      console.log('--- Produtos Encontrados ---');
      produtos.forEach(p => {
         console.log(`ID: ${p.id}`);
         console.log(`Nome: ${p.nome}`);
         console.log(`Imagem URL: ${p.imageUrl}`);
         console.log('---');
      });

   } catch (err) {
      console.error('Erro:', err);
   }
}

listProducts();
