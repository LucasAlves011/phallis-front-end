'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { User, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';

const Header: React.FC = () => {
   const { user, logout } = useAuth();

   return (
      <header className="flex h-16 items-center justify-between bg-phalis-black px-4 shadow-md sticky top-0 z-50">

         {/* Lado Esquerdo: Logo E Nome do Usuário */}
         <div className="flex items-center gap-4">
            <Link href="/">
               <Image
                  src="/phalis-logo.svg"
                  alt="PHALIS Logo"
                  width={100}
                  height={40}
                  priority
               />
            </Link>

            {user && (
               <div className="flex items-center gap-2 border-l border-gray-700 pl-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-phalis-gray text-phalis-action">
                     <User className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium text-white">{user.nome}</span>
               </div>
            )}
         </div>

         {/* Lado Direito: Botões de Navegação E Logout */}
         <div className="flex items-center gap-3">

            <nav className="flex items-center gap-3">
               <Button asChild className="bg-phalis-nav hover:bg-phalis-nav-hover font-medium">
                  <Link href="/clientes">CLIENTES</Link>
               </Button>
               <Button asChild className="bg-yellow-500 text-black hover:bg-yellow-600 font-medium">
                  <Link href="/historico-pedidos">PEDIDOS</Link>
               </Button>
               <Button asChild className="bg-phalis-ciano text-black hover:bg-phalis-ciano-hover font-medium">
                  <Link href="/adm/produtos/novo">CADASTRO DE PRODUTO</Link>
               </Button>
               <Button asChild className="bg-phalis-ciano text-black hover:bg-phalis-ciano-hover font-medium">
                  <Link href="/adm/produtos">EDITAR PRODUTOS</Link>
               </Button>
            </nav>

            <Button
               variant="ghost"
               size="icon"
               className="text-gray-400 hover:text-phalis-danger hover:bg-phalis-danger/10"
               onClick={logout} // <-- Chama a função de logout
            >
               <LogOut className="h-5 w-5" />
               <span className="sr-only">Sair</span>
            </Button>


         </div>
      </header>
   );
};

export default Header;