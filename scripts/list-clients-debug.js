
async function listClients() {
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

      console.log('Buscando clientes...');
      const res = await fetch('http://localhost:8085/api/clientes', {
         headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
         console.log('Falha ao listar clientes:', await res.text());
         return;
      }

      const clientes = await res.json();
      console.log('--- Clientes Encontrados ---');
      if (Array.isArray(clientes)) {
         console.log(`Total: ${clientes.length}`);
         clientes.forEach(c => {
            console.log(`ID: ${c.id} | Nome: ${c.nome} | Tel: ${c.telefone1}`);
         });
      } else {
         console.log('Resposta não é array:', clientes);
      }

   } catch (err) {
      console.error('Erro:', err);
   }
}

listClients();
