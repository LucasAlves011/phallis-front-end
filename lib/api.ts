// Arquivo: lib/api.ts

/**
 * Realiza um fetch adicionando automaticamente o header Authorization
 * caso exista um token salvo no localStorage.
 */
export async function authenticatedFetch(url: string, options: RequestInit = {}) {
   const token = typeof window !== 'undefined' ? localStorage.getItem('phallis_auth_token') : null;

   const headers = new Headers(options.headers || {});
   if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
   }

   // Garantir Content-Type padrão para JSON se não houver body ou se for objeto
   if (!headers.has('Content-Type') && options.body) {
      headers.set('Content-Type', 'application/json');
   }

   const response = await fetch(url, {
      ...options,
      headers
   });

   // Tratamento global de 401 (Opcional, mas útil)
   if (response.status === 401 && typeof window !== 'undefined') {
      console.warn('[API] Não autorizado. Limpando sessão...');
      localStorage.removeItem('phallis_auth_token');
      // Redirecionamento pode ser feito aqui ou deixado para o AuthContext
      // window.location.href = '/login';
   }

   return response;
}
