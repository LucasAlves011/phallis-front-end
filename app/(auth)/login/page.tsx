'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
   const [username, setUsername] = useState('');
   const [password, setPassword] = useState('');
   const [error, setError] = useState('');
   const router = useRouter();

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setError('');

      if (username === 'admin' && password === 'admin') {
         router.push('/');
      } else {
         setError('Usuário ou senha inválidos');
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

               <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">
                     Usuário
                  </label>
                  <Input
                     type="text"
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
                  >
                     ENTRAR
                  </Button>
               </div>
            </form>
         </div>
      </div>
   );
}