'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ShieldAlert, LogOut, Loader2 } from 'lucide-react';
import { authenticatedFetch } from '@/lib/api';

export default function ForcePasswordChangeModal() {
   const { user, logout } = useAuth();
   const [isLoading, setIsLoading] = useState(false);
   const [currentPassword, setCurrentPassword] = useState('');
   const [newPassword, setNewPassword] = useState('');
   const [confirmPassword, setConfirmPassword] = useState('');
   const [error, setError] = useState('');

   // Renderiza a barreira APENAS se estiver logado E com senha provisória ativa
   if (!user || !user.senhaProvisoria) {
      return null;
   }

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');

      if (!currentPassword || !newPassword || !confirmPassword) {
         setError('Por favor, preencha todos os campos.');
         return;
      }

      if (newPassword !== confirmPassword) {
         setError('A nova senha e a confirmação não coincidem.');
         return;
      }

      setIsLoading(true);
      try {
         const response = await authenticatedFetch('/api/users/me/password', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currentPassword, newPassword }),
         });

         if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.message || 'Senha atual incorreta ou erro no servidor.');
         }

         // Sucesso! A API desligou a flag senhaProvisoria.
         // Recarregar a página forçará o AuthContext a ler o ME e destrancar a tela.
         window.location.reload();

      } catch (err: any) {
         setError(err.message);
      } finally {
         setIsLoading(false);
      }
   };

   return (
      <div className="fixed inset-0 z-[99999] bg-phalis-dark flex flex-col items-center justify-center p-4">
         
         <div className="w-full max-w-md bg-phalis-black rounded-2xl border border-gray-800 shadow-2xl p-8 animate-in fade-in zoom-in duration-300">
            <div className="flex flex-col items-center mb-6 text-center">
               <div className="h-16 w-16 bg-phalis-action/10 rounded-full flex items-center justify-center mb-4">
                  <ShieldAlert className="h-8 w-8 text-phalis-action" />
               </div>
               <h2 className="text-2xl font-bold text-white mb-2">Segurança Exigida</h2>
               <p className="text-gray-400 text-sm">
                  Olá, <span className="text-white font-medium">{user.nome}</span>! Sua conta está usando uma senha inicial de administrador. Para sua segurança e privacidade, você deve criar uma nova senha agora para acessar o sistema.
               </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
               {error && (
                  <div className="p-3 rounded bg-red-500/10 border border-red-500/50 text-red-500 text-sm text-center">
                     {error}
                  </div>
               )}

               <div className="space-y-2">
                  <Label>Senha Atual (Aquela que te passaram)</Label>
                  <Input 
                     type="password"
                     value={currentPassword}
                     onChange={e => setCurrentPassword(e.target.value)}
                     className="bg-phalis-gray border-0"
                     autoFocus
                  />
               </div>

               <div className="space-y-2">
                  <Label>Nova Senha (Sua senha secreta)</Label>
                  <Input 
                     type="password"
                     value={newPassword}
                     onChange={e => setNewPassword(e.target.value)}
                     className="bg-phalis-gray border-0"
                  />
               </div>

               <div className="space-y-2">
                  <Label>Confirmar Nova Senha</Label>
                  <Input 
                     type="password"
                     value={confirmPassword}
                     onChange={e => setConfirmPassword(e.target.value)}
                     className="bg-phalis-gray border-0"
                     placeholder="Repita a senha secreta"
                  />
               </div>

               <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-phalis-action text-phalis-black hover:bg-phalis-action-hover h-12 font-bold mt-4"
               >
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Salvar Senha e Acessar'}
               </Button>
            </form>

            <div className="mt-6 text-center">
               <button 
                  onClick={logout}
                  className="text-gray-500 inline-flex items-center gap-2 hover:text-white transition-colors text-sm"
               >
                  <LogOut className="h-4 w-4" />
                  Sair do Sistema
               </button>
            </div>
         </div>

      </div>
   );
}
