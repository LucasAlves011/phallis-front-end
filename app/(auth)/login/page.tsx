// Arquivo: app/(auth)/login/page.tsx
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from '@/lib/auth/AuthContext'; // Import do novo caminho
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
   // MUDANÇA: de 'email' para 'username'
   const [username, setUsername] = useState('');
   const [password, setPassword] = useState('');
   const [error, setError] = useState('');
   const [isLoading, setIsLoading] = useState(false);
   const router = useRouter();
   const { login } = useAuth();

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      setIsLoading(true);

      // MUDANÇA: Passando 'username' para a função de login
      const success = await login(username, password);

      if (success) {
         router.push('/');
      } else {
         setError('Credenciais inválidas. Tente novamente.');
         setIsLoading(false);
      }
   };

   return (
      <div className="flex min-h-screen items-center justify-center bg-phalis-dark p-4">
         <div className="w-full max-w-md rounded-lg bg-phalis-black p-8 shadow-lg">

            <div className="mb-8 flex justify-center">
               <Image
                  src="/phalis-logo.svg"
                  alt="PHALIS Logo"
                  width={224}
                  height={70}
                  priority
               />
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

               {/* MUDANÇA: Bloco de 'username' */}
               <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">
                     Usuário
                  </label>
                  <Input
                     type="text" // tipo mudou
                     id="username"
                     value={username}
                     onChange={(e) => setUsername(e.target.value)}
                     required
                     placeholder=""
                     className="bg-phalis-gray border-0"
                  />
               </div>

               <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                     Senha
                  </label>
                  <Input
                     type="password"
                     id="password"
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     required
                     placeholder=""
                     className="bg-phalis-gray border-0"
                  />
               </div>

               {error && (
                  <p className="text-center text-sm text-phalis-danger">
                     {error}
                  </p>
               )}

               <div>
                  <Button
                     type="submit"
                     className="w-full bg-phalis-action text-phalis-black font-bold text-lg py-6 hover:bg-phalis-action-hover"
                     disabled={isLoading}
                  >
                     {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : 'ENTRAR'}
                  </Button>
               </div>
            </form>
         </div>
      </div>
   );
}