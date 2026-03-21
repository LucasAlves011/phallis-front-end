// Arquivo: lib/api.ts

/**
 * Realiza um fetch adicionando automaticamente o header Authorization
 * caso exista um token salvo no localStorage.
 */
export async function authenticatedFetch(url: string, options: RequestInit = {}) {
   const token = typeof window !== 'undefined' ? localStorage.getItem('phallis_auth_token') : null;

   // Converter headers para objeto simples para garantir compatibilidade e controle
   const headers: Record<string, string> = {};

   if (options.headers) {
      if (options.headers instanceof Headers) {
         options.headers.forEach((v, k) => { headers[k] = v; });
      } else if (Array.isArray(options.headers)) {
         options.headers.forEach(([k, v]) => { headers[k] = v; });
      } else {
         Object.assign(headers, options.headers);
      }
   }

   if (token) {
      headers['Authorization'] = `Bearer ${token}`;
   }

   if (!headers['Content-Type'] && options.body) {
      headers['Content-Type'] = 'application/json';
   }

   const response = await fetch(url, {
      ...options,
      headers
   });

   // Tratamento global de 401 (Opcional, mas útil)
   if (response.status === 401 && typeof window !== 'undefined') {
      console.warn('[API] Não autorizado. Redirecionando para login...');
      localStorage.removeItem('phallis_auth_token');
      window.location.href = '/login';
   }

   return response;
}
