'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { type User } from '@/lib/clientData';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AuthContextType {
   user: User | null;
   isLoading: boolean;
   login: (username: string, pass: string) => Promise<boolean>;
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
      try {
         const response = await fetch('/api/users/me');
         if (response.ok) {
            const userData = await response.json();
            setUser(userData);
         } else {
            setUser(null);
         }
      } catch (error) {
         setUser(null);
      } finally {
         setIsLoading(false); // <--- Este é o loading global da sessão
      }
   };

   useEffect(() => {
      checkAuth();
   }, []);

   // ==========================================================
   // MUDANÇA AQUI: Função de Login
   // Removemos todos os 'setIsLoading' daqui.
   // ==========================================================
   const login = async (username: string, pass: string) => {
      // REMOVIDO: setIsLoading(true);
      try {
         const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password: pass }),
         });

         if (response.ok) {
            const userData = await response.json();
            setUser(userData);
            // REMOVIDO: setIsLoading(false);
            return true; // Sucesso
         } else {
            // REMOVIDO: setIsLoading(false);
            return false; // Falha
         }
      } catch (error) {
         // REMOVIDO: setIsLoading(false);
         return false; // Falha
      }
   };

   // Função de Logout (sem mudança)
   const logout = async () => {
      await fetch('/api/auth/logout', { method: 'POST' });
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