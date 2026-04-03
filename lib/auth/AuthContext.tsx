'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { type User } from '@/types/client';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AuthContextType {
   user: User | null;
   isLoading: boolean;
   login: (username: string, pass: string, turnstileToken?: string) => Promise<boolean>;
   logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
   const context = useContext(AuthContext);
   if (!context) {
      throw new Error('useAuth deve ser usado dentro de um AuthProvider');
   }
   return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
   const [user, setUser] = useState<User | null>(null);
   const [isLoading, setIsLoading] = useState(true);
   const router = useRouter();

   // Função de "Verificar Login" (sem mudança)
   const checkAuth = async () => {
      const savedToken = localStorage.getItem('phallis_auth_token');

      if (!savedToken) {
         setIsLoading(false);
         return;
      }

      try {
         const response = await fetch('/api/users/me', {
            headers: {
               'Authorization': `Bearer ${savedToken}`,
               'Content-Type': 'application/json'
            }
         });
         if (response.ok) {
            const userData = await response.json();
            setUser(userData);
         } else {
            setUser(null);
            localStorage.removeItem('phallis_auth_token');
         }
      } catch (error) {
         setUser(null);
         localStorage.removeItem('phallis_auth_token');
      } finally {
         setIsLoading(false); // <--- Este é o loading global da sessão
      }
   };

   useEffect(() => {
      checkAuth();
   }, []);

   // ==========================================================
   // MUDANÇA AQUI: Função de Login
   // ==========================================================
   const login = async (username: string, pass: string, turnstileToken?: string) => {
      try {
         const basicAuth = btoa(`${username}:${pass}`);
         const response = await fetch(`/api/auth/login`, {
            method: 'GET',
            headers: {
               'Content-Type': 'application/json',
               'Authorization': `Basic ${basicAuth}`,
               'X-Requested-With': 'XMLHttpRequest',
               // Envia o token apenas se existir (no login sempre vai, mas de forma segura)
               ...(turnstileToken && { 'X-Turnstile-Token': turnstileToken })
            },
         });

         if (response.ok) {
            const tokenData = await response.json(); // TokenOutDTO { token, type, ... }
            const jwtToken = tokenData.token;

            // Agora busca os dados do usuário logado usando o novo token
            const meResponse = await fetch('/api/users/me', {
               headers: {
                  'Authorization': `Bearer ${jwtToken}`,
                  'Content-Type': 'application/json'
               }
            });

            if (meResponse.ok) {
               const userData = await meResponse.json();
               setUser(userData);
               localStorage.setItem('phallis_auth_token', jwtToken);
               return true;
            }
            return false;
         } else {
            return false;
         }
      } catch (error) {
         return false; // Falha
      }
   };

   // Função de Logout (sem mudança)
   const logout = async () => {
      // Opcional: Avisar o backend. Mas o importante é limpar localmente.
      try {
         const token = localStorage.getItem('phallis_auth_token');
         await fetch('/api/auth/logout', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
         });
      } catch (e) { }

      localStorage.removeItem('phallis_auth_token');
      setUser(null);
      router.push('/login');
   };

   // Esta tela de loading global agora só aparece no PRIMEIRO
   // carregamento do site, enquanto 'checkAuth' roda.
   if (isLoading) {
      return (
         <div className="flex min-h-screen items-center justify-center bg-phalis-dark">
            <Loader2 className="h-10 w-10 animate-spin text-phalis-action" />
         </div>
      );
   }

   return (
      <AuthContext.Provider value={{ user, isLoading, login, logout }}>
         {children}
      </AuthContext.Provider>
   );
};
