// Arquivo: app/(main)/clientes/page.tsx
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { type Cliente } from '@/types/client'; // MUDANÇA: Importando do tipo, não do arquivo de mock
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from "@/components/ui/table";
import { AddClientModal } from '@/components/clientes/AddClientModal';
import { Loader2, Plus, Edit, RefreshCw, AlertCircle } from 'lucide-react';
import { usePermission } from '@/lib/auth/usePermission';
import { authenticatedFetch } from '@/lib/api';

// Função de formatar WhatsApp
const formatarWhatsApp = (numero: string) => {
   if (!numero) return '#';
   const ddi = '55';
   const digitos = numero.replace(/\D/g, '');
   return `https://wa.me/${ddi}${digitos}`;
};

export default function ClientesPage() {
   const [clientes, setClientes] = useState<Cliente[]>([]);
   const { hasPermission } = usePermission();
   const [isLoading, setIsLoading] = useState(true);
   const [error, setError] = useState('');
   const [searchTerm, setSearchTerm] = useState('');

   const fetchClientes = useCallback(() => {
      setIsLoading(true);
      setError('');
      authenticatedFetch('/api/clientes')
         .then(async (res) => {
            if (!res.ok) {
               // Tenta ler o erro do backend ou usa genérico
               const text = await res.text();
               throw new Error(text || 'Falha ao buscar clientes do servidor.');
            }
            return res.json();
         })
         .then((data: Cliente[]) => {
            if (Array.isArray(data)) {
               setClientes(data);
            } else {
               throw new Error('Formato de dados inválido recebido do servidor.');
            }
         })
         .catch(err => {
            console.error("Erro ao carregar clientes:", err);
            setError('Não foi possível carregar a lista de clientes. Verifique sua conexão.');
         })
         .finally(() => {
            setIsLoading(false);
         });
   }, []);

   useEffect(() => {
      fetchClientes();
   }, [fetchClientes]);

   const clientesFiltrados = useMemo(() => {
      return clientes.filter(c =>
         c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
         c.cpfCnpj?.includes(searchTerm) ||
         c.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
   }, [clientes, searchTerm]);

   // 1. Proteção de Rota (Bloqueia a tela toda)
   if (!hasPermission('clientes.visualizar')) {
      return <div className="p-8 text-center text-gray-400">Acesso negado.</div>;
   }

   const handleClientSaved = (savedCliente: Cliente) => {
      setClientes(prev => {
         const exists = prev.some(c => c.id === savedCliente.id);
         if (exists) {
            return prev.map(c => c.id === savedCliente.id ? savedCliente : c);
         }
         return [savedCliente, ...prev];
      });
   };

   return (
      <div className="space-y-6">

         {/* Barra de Título, Pesquisa e Botão de Adicionar */}
         <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-phalis-black/50 p-4 rounded-lg">
            <div className="flex items-center gap-3">
               <h1 className="text-3xl font-bold text-white">Clientes</h1>
               <Button
                  variant="ghost"
                  size="icon"
                  onClick={fetchClientes}
                  disabled={isLoading}
                  title="Recarregar Lista"
                  className="text-gray-400 hover:text-white"
               >
                  <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
               </Button>
            </div>

            <div className="flex w-full md:w-auto gap-2">
               <Input
                  placeholder="Pesquisar por nome, CPF ou email..."
                  className="bg-phalis-gray border-0 w-full md:w-80"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
               />

               {hasPermission('clientes.alterar') && (
                  <AddClientModal
                     mode="create"
                     onClientSaved={handleClientSaved}
                     triggerButton={
                        <Button className="bg-phalis-nav hover:bg-phalis-nav-hover whitespace-nowrap">
                           <Plus className="mr-2 h-4 w-4" />
                           Novo Cliente
                        </Button>
                     }
                  />
               )}
            </div>
         </div>

         {/* Estado de Erro */}
         {error && (
            <div className="bg-red-900/20 border border-red-900/50 text-red-200 p-4 rounded-md flex items-center gap-3">
               <AlertCircle className="h-5 w-5" />
               <p>{error}</p>
               <Button variant="link" onClick={fetchClientes} className="text-white underline ml-auto">
                  Tentar novamente
               </Button>
            </div>
         )}

         {/* Tabela de Clientes */}
         <div className="bg-phalis-black rounded-lg border border-gray-800">
            <Table>
               <TableHeader>
                  <TableRow className="hover:bg-transparent border-gray-800">
                     <TableHead className="text-gray-400">Nome</TableHead>
                     <TableHead className="text-gray-400">CPF/CNPJ</TableHead>
                     <TableHead className="text-gray-400">Email</TableHead>
                     <TableHead className="text-gray-400">Telefone 1</TableHead>
                     <TableHead className="text-gray-400">Telefone 2</TableHead>
                     <TableHead className="text-gray-400 w-[50px]">Ações</TableHead>
                  </TableRow>
               </TableHeader>
               <TableBody>
                  {isLoading ? (
                     <TableRow className="hover:bg-transparent border-gray-800">
                        <TableCell colSpan={6} className="h-32 text-center">
                           <div className="flex justify-center items-center">
                              <Loader2 className="h-8 w-8 animate-spin text-phalis-action" />
                              <span className="ml-2 text-gray-400">Carregando clientes...</span>
                           </div>
                        </TableCell>
                     </TableRow>
                  ) : clientesFiltrados.length === 0 ? (
                     <TableRow className="hover:bg-transparent border-gray-800">
                        <TableCell colSpan={6} className="h-32 text-center text-gray-500">
                           {error ? 'Não foi possível carregar os dados.' : 'Nenhum cliente encontrado.'}
                        </TableCell>
                     </TableRow>
                  ) : (
                     clientesFiltrados.map((cliente) => (
                        <TableRow key={cliente.id} className="hover:bg-gray-900/50 border-gray-800">
                           <TableCell className="font-medium text-white">{cliente.nome}</TableCell>
                           <TableCell className="text-gray-300">{cliente.cpfCnpj || '-'}</TableCell>
                           <TableCell className="text-gray-300">{cliente.email || '-'}</TableCell>
                           <TableCell>
                              <a
                                 href={formatarWhatsApp(cliente.telefone1)}
                                 target="_blank"
                                 rel="noopener noreferrer"
                                 className="text-phalis-action hover:underline flex items-center gap-1"
                              >
                                 {cliente.telefone1}
                              </a>
                           </TableCell>
                           <TableCell className="text-gray-300">{cliente.telefone2 || '-'}</TableCell>

                           <TableCell>
                              {hasPermission('clientes.alterar') && (
                                 <AddClientModal
                                    mode="edit"
                                    clienteToEdit={cliente}
                                    onClientSaved={handleClientSaved}
                                    triggerButton={
                                       <Button variant="ghost" size="icon" className="text-gray-400 hover:text-phalis-action hover:bg-phalis-action/10">
                                          <Edit className="h-4 w-4" />
                                       </Button>
                                    }
                                 />
                              )}
                           </TableCell>
                        </TableRow>
                     ))
                  )}
               </TableBody>
            </Table>
         </div>
      </div>
   );
}
