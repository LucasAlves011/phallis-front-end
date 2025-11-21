'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, LogOut, Lock, KeyRound, Loader2, ChevronDown } from 'lucide-react'; // Adicionei ChevronDown para indicar menu
import { useAuth } from '@/lib/auth/AuthContext';
import { usePermission } from '@/lib/auth/usePermission';
import {
   Popover,
   PopoverContent,
   PopoverTrigger,
} from "@/components/ui/popover";
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle,
} from "@/components/ui/dialog";

const Header: React.FC = () => {
   const { user, logout } = useAuth();

   // Estados para o Modal de Senha
   const [isPasswordOpen, setIsPasswordOpen] = useState(false);
   const [isLoading, setIsLoading] = useState(false);
   const [currentPassword, setCurrentPassword] = useState('');
   const [newPassword, setNewPassword] = useState('');
   const [confirmPassword, setConfirmPassword] = useState('');
   const [error, setError] = useState('');
   const { hasPermission, hasAnyPermission } = usePermission();

   // Fecha o Popover ao clicar na opção
   const [isPopoverOpen, setIsPopoverOpen] = useState(false);

   const handleChangePassword = async () => {
      setError('');
      if (!currentPassword || !newPassword || !confirmPassword) {
         setError('Preencha todos os campos.');
         return;
      }
      if (newPassword !== confirmPassword) {
         setError('As novas senhas não conferem.');
         return;
      }

      setIsLoading(true);
      try {
         const response = await fetch('/api/users/me/password', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currentPassword, newPassword }),
         });

         if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Erro ao trocar senha.');
         }

         alert('Senha alterada com sucesso!');
         setIsPasswordOpen(false);
         // Limpar campos
         setCurrentPassword('');
         setNewPassword('');
         setConfirmPassword('');
      } catch (err: any) {
         setError(err.message);
      } finally {
         setIsLoading(false);
      }
   };

   return (
      <>
         <header className="flex h-16 items-center justify-between bg-phalis-black px-4 shadow-md sticky top-0 z-50">

            <div className="flex items-center gap-6">
               <Link href="/">
                  <Image
                     src="/phalis-logo.svg"
                     alt="PHALIS Logo"
                     width={100}
                     height={40}
                     priority
                  />
               </Link>

               <nav className="hidden md:flex items-center gap-3 border-l border-gray-700 pl-6">

                  {/* Só mostra Clientes se tiver permissão de visualizar */}
                  {hasPermission('clientes.visualizar') && (
                     <Button asChild className="bg-phalis-nav hover:bg-phalis-nav-hover font-medium text-white">
                        <Link href="/clientes">CLIENTES</Link>
                     </Button>
                  )}

                  {/* Só mostra Pedidos se tiver permissão de visualizar */}
                  {hasPermission('pedidos.visualizar') && (
                     <Button asChild className="bg-yellow-500 text-black hover:bg-yellow-600 font-medium">
                        <Link href="/historico-pedidos">PEDIDOS</Link>
                     </Button>
                  )}

                  {/* Produtos: Mostra se puder cadastrar OU editar */}
                  {hasAnyPermission(['produtos.cadastrar', 'produtos.editar', 'produtos.deletar']) && (
                     <Button asChild className="bg-phalis-ciano text-black hover:bg-phalis-ciano-hover font-medium">
                        <Link href="/adm/produtos">PRODUTOS</Link>
                     </Button>
                  )}

                  {/* Usuários: Apenas quem tem permissão específica */}
                  {hasPermission('usuarios.gerenciar') && (
                     <Button asChild className="bg-phalis-green text-black hover:bg-phalis-action-hover font-medium">
                        <Link href="/adm/usuarios">USUARIOS</Link>
                     </Button>
                  )}
               </nav>
            </div>

            <div className="flex items-center gap-4">

               {user && (
                  <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                     <PopoverTrigger asChild>
                        <button className="flex items-center gap-3 hover:bg-phalis-gray/50 p-2 rounded-md transition-colors outline-none group">
                           <div className="text-right hidden sm:block">
                              <p className="text-sm font-medium text-white leading-none group-hover:text-phalis-action transition-colors">
                                 {user.nome}
                              </p>
                              <p className="text-xs text-gray-400 mt-1 capitalize">{user.role}</p>
                           </div>
                           <div className="flex h-9 w-9 items-center justify-center rounded-full bg-phalis-gray text-phalis-action border border-gray-700 group-hover:border-phalis-action transition-colors">
                              <User className="h-5 w-5" />
                           </div>
                           <ChevronDown className="h-4 w-4 text-gray-500 group-hover:text-white transition-colors" />
                        </button>
                     </PopoverTrigger>

                     <PopoverContent className="w-56 bg-phalis-black border-gray-700 p-1 space-y-1" align="end">
                        {/* Opção 1: Trocar Senha */}
                        <Button
                           variant="ghost"
                           className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800 h-9"
                           onClick={() => {
                              setIsPopoverOpen(false);
                              setIsPasswordOpen(true);
                           }}
                        >
                           <KeyRound className="mr-2 h-4 w-4" />
                           Trocar Senha
                        </Button>

                        {/* Opção 2: Logout (Agora dentro do menu) */}
                        <Button
                           variant="ghost"
                           className="w-full justify-start text-phalis-danger hover:text-red-400 hover:bg-phalis-danger/10 h-9"
                           onClick={() => {
                              setIsPopoverOpen(false);
                              logout();
                           }}
                        >
                           <LogOut className="mr-2 h-4 w-4" />
                           Sair do Sistema
                        </Button>
                     </PopoverContent>
                  </Popover>
               )}
            </div>
         </header>

         <Dialog open={isPasswordOpen} onOpenChange={setIsPasswordOpen}>
            <DialogContent className="bg-phalis-black border-gray-800 text-white sm:max-w-[425px]">
               <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                     <Lock className="h-5 w-5 text-phalis-action" />
                     Alterar Senha
                  </DialogTitle>
                  <DialogDescription className="text-gray-400">
                     Digite sua senha atual e a nova senha desejada.
                  </DialogDescription>
               </DialogHeader>

               <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                     <Label htmlFor="current-pass">Senha Atual</Label>
                     <Input
                        id="current-pass"
                        type="password"
                        className="bg-phalis-gray border-0"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                     />
                  </div>
                  <div className="space-y-2">
                     <Label htmlFor="new-pass">Nova Senha</Label>
                     <Input
                        id="new-pass"
                        type="password"
                        className="bg-phalis-gray border-0"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                     />
                  </div>
                  <div className="space-y-2">
                     <Label htmlFor="confirm-pass">Confirmar Nova Senha</Label>
                     <Input
                        id="confirm-pass"
                        type="password"
                        className="bg-phalis-gray border-0"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                     />
                  </div>

                  {error && (
                     <p className="text-sm text-phalis-danger">{error}</p>
                  )}
               </div>

               <DialogFooter>
                  <Button
                     variant="ghost"
                     onClick={() => setIsPasswordOpen(false)}
                     className="hover:bg-gray-800 text-gray-300"
                  >
                     Cancelar
                  </Button>
                  <Button
                     onClick={handleChangePassword}
                     className="bg-phalis-action text-phalis-black hover:bg-phalis-action-hover"
                     disabled={isLoading}
                  >
                     {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar Nova Senha'}
                  </Button>
               </DialogFooter>
            </DialogContent>
         </Dialog>
      </>
   );
};

export default Header;