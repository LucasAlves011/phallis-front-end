// Arquivo: app/(main)/adm/usuarios/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
   Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
   Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Shield, UserCog } from 'lucide-react';
import {
   User,
   Permission,
   PERMISSIONS_CONFIG,
   PERMISSION_DEPENDENCIES,
   ROLE_TEMPLATES
} from '@/types/client';
import { usePermission } from '@/lib/auth/usePermission';
import { useAuth } from '@/lib/auth/AuthContext';
import { authenticatedFetch } from '@/lib/api'; // Adicionado

// Helper para agrupar permissões por categoria
const groupedPermissions = PERMISSIONS_CONFIG.reduce((acc, perm) => {
   if (!acc[perm.category]) acc[perm.category] = [];
   acc[perm.category].push(perm);
   return acc;
}, {} as Record<string, typeof PERMISSIONS_CONFIG[number][]>);

export default function GerenciarUsuariosPage() {
   const [users, setUsers] = useState<User[]>([]);
   const [isLoading, setIsLoading] = useState(true);
   const { isAdmin } = usePermission();

   const [isDialogOpen, setIsDialogOpen] = useState(false);
   const [editingUser, setEditingUser] = useState<Partial<User> | null>(null);
   const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>([]);

   const [searchTerm, setSearchTerm] = useState('');

   useEffect(() => {
      authenticatedFetch('/api/users?size=100')
         .then(res => {
            if (!res.ok) throw new Error('Falha ao buscar usuários');
            return res.json();
         })
         .then(data => {
            // Spring retorna Page<T> com .content, suportamos fallback para array
            const lista: User[] = Array.isArray(data) ? data : (data?.content ?? []);
            setUsers(lista);
            setIsLoading(false);
         })
         .catch(err => {
            console.error(err);
            setIsLoading(false);
         });
   }, []);

   const usuariosFiltrados = users.filter(u =>
      u.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase())
   );

   const handleEditClick = (user: User) => {
      setEditingUser(user);
      setSelectedPermissions(user.permissions || []);
      setIsDialogOpen(true);
   };

   // ...resto inalterado até handleCreateClick
   const handleCreateClick = () => {
      setEditingUser({
         nome: '', email: null, username: '', password: '', role: 'user', active: true
      } as any);
      setSelectedPermissions([]);
      setIsDialogOpen(true);
   };

   // Nova função para aplicar o template quando trocar a Role
   const handleRoleChange = (newRole: 'admin' | 'atendente' | 'user') => {
      // Atualiza a role visualmente
      setEditingUser(prev => ({ ...prev!, role: newRole }));

      // Se for admin, limpamos as permissões (pois ele tem God Mode)
      // Se for outro, aplicamos o template pré-definido
      if (newRole === 'admin') {
         setSelectedPermissions([]);
      } else {
         setSelectedPermissions([...ROLE_TEMPLATES[newRole]]);
      }
   };

   const { user: currentUser } = useAuth(); // Pegue o usuário logado

   // --- FUNÇÃO DE SEGURANÇA ---
   // Retorna TRUE se o usuário logado tem poder sobre o usuário alvo
   const canManageTargetUser = (targetUser: User) => {
      // 1. Ninguém pode se auto-bloquear ou auto-editar aqui (opcional, mas recomendado para evitar travas)
      if (currentUser?.id === targetUser.id) return false;

      // 2. Se eu sou Admin, posso tudo
      if (currentUser?.role === 'admin') return true;

      // 3. Se o alvo é Admin e eu não sou, NÃO posso tocar
      if (targetUser.role === 'admin') return false;

      // 4. Caso contrário (Vendedor editando User/Vendedor), pode
      return true;
   };

   // LÓGICA DE DEPENDÊNCIA DE PERMISSÕES
   const handlePermissionToggle = (permId: Permission) => {
      setSelectedPermissions(prev => {
         const isAdding = !prev.includes(permId);
         let newPermissions = [...prev];

         if (isAdding) {
            newPermissions.push(permId);
            const dependency = PERMISSION_DEPENDENCIES[permId];
            if (dependency && !newPermissions.includes(dependency)) {
               newPermissions.push(dependency);
            }
         } else {
            newPermissions = newPermissions.filter(p => p !== permId);
            PERMISSIONS_CONFIG.forEach(p => {
               if (PERMISSION_DEPENDENCIES[p.id] === permId) {
                  newPermissions = newPermissions.filter(child => child !== p.id);
               }
            });
         }
         return newPermissions;
      });
   };

   const handleSave = async () => {
      if (!editingUser) return;

      const payload = {
         ...editingUser,
         permissions: selectedPermissions
      };

      const url = editingUser.id ? `/api/users/${editingUser.id}` : '/api/users';
      const method = editingUser.id ? 'PUT' : 'POST';

      try {
         const res = await authenticatedFetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
         });

         if (!res.ok) throw new Error('Erro ao salvar');

         const userRes = await authenticatedFetch('/api/users?size=100');
         const data = await userRes.json();
         const lista: User[] = Array.isArray(data) ? data : (data?.content ?? []);
         setUsers(lista);
         setIsDialogOpen(false);
      } catch (err) {
         console.error(err);
         alert("Erro ao salvar usuário.");
      }
   };

   const toggleActive = async (user: User) => {
      // Otimista
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, active: !u.active } : u));

      try {
         const res = await authenticatedFetch(`/api/users/${user.id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ active: !user.active })
         });
         if (!res.ok) throw new Error("Falha ao atualizar status");
      } catch (err) {
         console.error(err);
         // Reverte em caso de erro
         setUsers(prev => prev.map(u => u.id === user.id ? { ...u, active: user.active } : u));
         alert("Erro ao alterar status do usuário.");
      }
   };

   return (
      <div className="w-full 2xl:w-4/5 2xl:mx-auto space-y-6">

         {/* Barra de Título, Pesquisa e Botão de Adicionar (Padrão Unificado) */}
         <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-phalis-black/50 p-4 rounded-lg">
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
               <Shield className="text-phalis-action h-7 w-7" />
               Equipe
            </h1>

            <div className="flex w-full md:w-auto gap-2">
               <Input
                  placeholder="Pesquisar funcionário..."
                  className="bg-phalis-gray border-0 w-full md:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
               />
               <Button onClick={handleCreateClick} className="bg-phalis-action text-phalis-black hover:bg-phalis-action-hover whitespace-nowrap">
                  <Plus className="mr-2 h-4 w-4" /> Novo Usuário
               </Button>
            </div>
         </div>

         <div className="bg-phalis-black rounded-lg border border-gray-800">
            <Table>
               <TableHeader>
                  <TableRow className="border-gray-800">
                     <TableHead className="text-gray-400">Nome</TableHead>
                     <TableHead className="text-gray-400">Usuário</TableHead>
                     <TableHead className="text-gray-400">Role</TableHead>
                     <TableHead className="text-gray-400">Status</TableHead>
                     <TableHead className="text-right text-gray-400">Ações</TableHead>
                  </TableRow>
               </TableHeader>
               <TableBody>
                  {isLoading ? (
                     <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                           <Loader2 className="animate-spin h-8 w-8 mx-auto text-phalis-action" />
                        </TableCell>
                     </TableRow>
                  ) : users.map(user => {
                     const isAllowed = canManageTargetUser(user); // Calcula permissão para esta linha

                     return (
                        <TableRow key={user.id} className={`border-gray-800 ${!isAllowed ? 'opacity-50' : ''}`}>
                           <TableCell className="text-white font-medium">{user.nome}</TableCell>
                           <TableCell className="text-gray-400">{user.username}</TableCell>
                           <TableCell>
                              <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className={user.role === 'admin' ? 'bg-purple-600' : 'bg-gray-700'}>
                                 {user.role}
                              </Badge>
                           </TableCell>

                           <TableCell>
                              <div className="flex items-center space-x-2">
                                 <Switch
                                    checked={user.active}
                                    onCheckedChange={() => toggleActive(user)}
                                    className="data-[state=checked]:bg-phalis-action"
                                    disabled={!isAllowed} // <--- PROTEÇÃO AQUI
                                 />
                                 <span className="text-gray-300">
                                    {user.active ? 'Ativo' : 'Bloqueado'}
                                 </span>
                              </div>
                           </TableCell>

                           <TableCell className="text-right">
                              <Button
                                 variant="ghost"
                                 size="icon"
                                 onClick={() => handleEditClick(user)}
                                 disabled={!isAllowed} // <--- PROTEÇÃO AQUI
                              >
                                 <UserCog className="h-4 w-4 text-gray-400 hover:text-white" />
                              </Button>
                           </TableCell>
                        </TableRow>
                     )
                  })}
               </TableBody>
            </Table>
         </div>

         <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="bg-phalis-black border-gray-800 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
               <DialogHeader>
                  <DialogTitle>
                     {editingUser?.id ? 'Editar Usuário' : 'Criar Novo Usuário'}
                  </DialogTitle>
               </DialogHeader>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                  <div className="space-y-2">
                     <Label>Nome</Label>
                     <Input
                        value={editingUser?.nome || ''}
                        onChange={e => setEditingUser(prev => ({ ...prev!, nome: e.target.value }))}
                        className="bg-phalis-gray border-0"
                     />
                  </div>
                  <div className="space-y-2">
                     <Label>Login (Username)</Label>
                     <Input
                        value={editingUser?.username || ''}
                        disabled={!!editingUser?.id}
                        onChange={e => setEditingUser(prev => ({ ...prev!, username: e.target.value }))}
                        className="bg-phalis-gray border-0"
                     />
                  </div>
                  {/* Campo de Senha - Se for edição, é opcional e label muda */}
                  <div className="space-y-2 md:col-span-2">
                     <Label>{editingUser?.id ? 'Nova Senha (deixe em branco para manter)' : 'Senha Inicial'}</Label>
                     <Input
                        type="password"
                        value={(editingUser as any)?.password || ''}
                        onChange={e => setEditingUser(prev => ({ ...prev!, password: e.target.value }))}
                        className="bg-phalis-gray border-0"
                     />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                     <Label className="font-semibold">Tipo de Usuário (Role)</Label>
                     <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {['user', 'atendente', 'admin'].map(role => (
                           <div
                              key={role}
                              className={`p-3 border rounded-lg cursor-pointer select-none text-center transition ${editingUser?.role === role
                                 ? 'bg-phalis-action text-black border-phalis-action'
                                 : 'bg-phalis-gray/30 border-gray-700 hover:bg-phalis-gray/50'
                                 }`}
                              onClick={() => handleRoleChange(role as any)}
                           >
                              {role.toUpperCase()}
                           </div>
                        ))}
                     </div>
                  </div>
               </div>


               {/* ÁREA DE PERMISSÕES REFEITA */}
               <div className="border-t border-gray-800 pt-6">
                  <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                     <Shield className="h-4 w-4 text-phalis-action" />
                     Permissões de Acesso
                  </h4>
                  {/* DICA VISUAL: Se for admin, desabilite ou esconda os checkboxes para evitar confusão */}
                  {editingUser?.role === 'admin' ? (
                     <div className="border-t border-gray-800 pt-6 text-center text-green-400 py-8">
                        <Shield className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Administradores possuem acesso total ao sistema.</p>
                        <p className="text-xs text-gray-500">(Permissões individuais ignoradas)</p>
                     </div>
                  ) : (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {Object.entries(groupedPermissions).map(([category, perms]) => (
                           <div key={category} className="space-y-3 bg-phalis-gray/10 p-4 rounded-lg border border-gray-800">
                              <h5 className="text-phalis-action font-bold text-sm uppercase">{category}</h5>
                              <div className="space-y-2">
                                 {perms.map(perm => {
                                    const dependencyId = PERMISSION_DEPENDENCIES[perm.id];
                                    const dependencyLabel = dependencyId
                                       ? PERMISSIONS_CONFIG.find(p => p.id === dependencyId)?.label
                                       : null;

                                    return (
                                       <div key={perm.id} className="flex items-start space-x-3">
                                          <Checkbox
                                             id={perm.id}
                                             checked={selectedPermissions.includes(perm.id)}
                                             onCheckedChange={() => handlePermissionToggle(perm.id)}
                                             className="mt-1 border-white data-[state=checked]:bg-phalis-action data-[state=checked]:text-black"
                                          />
                                          <div className="grid gap-1.5 leading-none">
                                             <label
                                                htmlFor={perm.id}
                                                className="text-sm font-medium leading-snug text-gray-200 cursor-pointer select-none"
                                             >
                                                {perm.label}
                                             </label>
                                             {dependencyLabel && (
                                                <p className="text-xs text-gray-400 font-normal">
                                                   Requer: {dependencyLabel}
                                                </p>
                                             )}
                                          </div>
                                       </div>
                                    );
                                 })}
                              </div>
                           </div>
                        ))}
                     </div>)}
               </div>

               <DialogFooter>
                  <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                  <Button onClick={handleSave} className="bg-phalis-action text-phalis-black hover:bg-phalis-action-hover">
                     Salvar
                  </Button>
               </DialogFooter>
            </DialogContent>
         </Dialog>
      </div>
   );
}
