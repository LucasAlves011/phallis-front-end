import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const Header: React.FC = () => {
   return (
      <header className="flex h-16 items-center justify-between bg-phalis-black px-4 shadow-md sticky top-0 z-50">

         {/* Lado Esquerdo: Logo */}
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
         </div>

         {/* Centro: Botões de Navegação */}
         <nav className="flex items-center gap-3">
            <Button asChild className="bg-phalis-rosa hover:bg-phalis-nav-hover font-medium font-bold">
               <Link href="/clientes">CLIENTES</Link>
            </Button>
            <Button asChild className="bg-phalis-yellow hover:bg-phalis-nav-hover font-medium font-bold">
               <Link href="/historico-pedidos">PEDIDOS</Link>
            </Button>
         </nav>
      </header>
   );
};

export default Header;