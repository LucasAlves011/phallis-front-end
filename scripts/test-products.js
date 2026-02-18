const fs = require('fs');
const path = require('path');

// ==========================================
// CONFIGURAÇÃO
// ==========================================
const BASE_URL = 'http://localhost:8085'; // Backend Java
const TOKEN_ARG = process.argv[2]; // Token passado como argumento
const USERNAME = 'lucas'; // <--- ALTERE SE NECESSÁRIO
const PASSWORD = 'lucas123'; // <--- ALTERE SE NECESSÁRIO

// ==========================================
// UTILITÁRIOS
// ==========================================
async function login() {
   if (TOKEN_ARG) {
      console.log('[LOGIN] Usando token fornecido via argumento.');
      return TOKEN_ARG;
   }

   console.log(`[LOGIN] Tentando logar como admin...`);
   const credentials = Buffer.from(`${USERNAME}:${PASSWORD}`).toString('base64');

   try {
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
         method: 'GET',
         headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/json'
         }
      });

      if (!response.ok) {
         throw new Error(`Falha no login: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('[LOGIN] Sucesso! Token recebido.');
      return data.token;
   } catch (error) {
      console.error('[LOGIN] Erro:', error.message);
      process.exit(1);
   }
}

async function uploadImage(token) {
   console.log('[UPLOAD] Iniciando upload de imagem dummy...');

   // Cria um arquivo temporário dummy se não tiver imagem real
   const dummyPath = path.join(__dirname, 'dummy.txt');
   fs.writeFileSync(dummyPath, 'conteudo de imagem falsa apenas para teste');

   const formData = new FormData();
   const fileBlob = new Blob([fs.readFileSync(dummyPath)], { type: 'text/plain' });
   formData.append('file', fileBlob, 'teste-auto.txt');

   try {
      const response = await fetch(`${BASE_URL}/api/upload`, {
         method: 'POST',
         headers: {
            'Authorization': `Bearer ${token}`
         },
         body: formData
      });

      if (!response.ok) {
         throw new Error(`Falha no upload: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('[UPLOAD] Sucesso! URL Completa:', data.fileDownloadUri); // LOG EXPLÍCITO

      // Limpa
      fs.unlinkSync(dummyPath);

      return data.fileDownloadUri;
   } catch (error) {
      console.error('[UPLOAD] Erro:', error.message);
      // Retorna uma URL fake se falhar, só para não travar o teste dos produtos
      return 'http://localhost:8085/uploads/fallback.png';
   }
}

async function createProduct(token, productData) {
   console.log(`[PRODUTO] Criando produto tipo "${productData.pricingType}"...`);

   try {
      const response = await fetch(`${BASE_URL}/api/produtos`, {
         method: 'POST',
         headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
         },
         body: JSON.stringify(productData)
      });

      if (!response.ok) {
         const errorText = await response.text();
         throw new Error(`Falha ao criar: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log(`[PRODUTO] Sucesso! ID: ${data.id}, Nome: ${data.nome}`);
      return data;
   } catch (error) {
      console.error(`[PRODUTO] Erro ao criar ${productData.pricingType}:`, error.message);
   }
}

// ==========================================
// EXECUÇÃO
// ==========================================
(async () => {
   const token = await login();
   const imageUrl = await uploadImage(token);

   // 1. Produto UNIDADE (Cartão de Visita)
   await createProduct(token, {
      nome: "Teste Unidade (Auto)",
      descricao: "Gerado via script",
      imageUrl: imageUrl,
      pricingType: "unidade",
      options: {
         papel: [{ id: "couche", name: "Couché 300g" }],
         tamanho: [{ id: "padrao", name: "9x5cm" }],
         cores: [{ id: "4x0", name: "4x0" }],
         acabamento: [{ id: "verniz", name: "Verniz Total" }]
      }
   });

   // 2. Produto METRO (Adesivo)
   await createProduct(token, {
      nome: "Teste Metro (Auto)",
      descricao: "Gerado via script",
      imageUrl: imageUrl,
      pricingType: "metro",
      defaultM2Custo: 50.00,
      defaultM2Venda: 120.00,
      options: {
         papel: [{ id: "vinil", name: "Vinil Branco" }],
         tamanho: [],
         cores: [],
         acabamento: []
      }
   });

   // 3. Produto SERVIÇO (Instalação)
   await createProduct(token, {
      nome: "Teste Serviço (Auto)",
      descricao: "Gerado via script",
      imageUrl: imageUrl,
      pricingType: "servico",
      // Serviço não tem opções nem m2 padrão
   });

})();
