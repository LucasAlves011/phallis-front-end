// Arquivo: app/(main)/clientes/page.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { type Cliente } from '@/lib/clientData';
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
import { Loader2, Plus, Edit } from 'lucide-react'; // Importar Edit

// Função de formatar WhatsApp
const formatarWhatsApp = (numero: string) => {
   if (!numero) return '#';
   const ddi = '55';
   const digitos = numero.replace(/\D/g, '');
   return `https://wa.me/${ddi}${digitos}`;
};

export default function ClientesPage() {
   const [clientes, setClientes] = useState<Cliente[]>([]);
   const [isLoading, setIsLoading] = useState(true);
   const [searchTerm, setSearchTerm] = useState('');

   useEffect(() => {
      fetch('/api/clientes')
         .then(res => res.json())
         .then((data: Cliente[]) => {
            setClientes(data);
            setIsLoading(false);
         });
   }, []);

   const clientesFiltrados = useMemo(() => {
      return clientes.filter(c =>
         c.nome.toLowerCase().includes(searchTerm.toLowerCase())
      );
   }, [clientes, searchTerm]);

   // ==========================================================
   // MUDANÇA AQUI: Callback unificado
   // ==========================================================
   const handleClientSaved = (savedCliente: Cliente) => {
      let clienteExiste = false;

      // Atualiza o cliente na lista se ele já existir (edição)
      const clientesAtualizados = clientes.map(c => {
         if (c.id === savedCliente.id) {
            clienteExiste = true;
            return savedCliente; // Retorna o cliente atualizado
         }
         return c;
      });

      if (clienteExiste) {
         setClientes(clientesAtualizados);
      } else {
         // Adiciona o novo cliente no topo (criação)
         setClientes([savedCliente, ...clientesAtualizados]);
      }
   };

   return (
      <div className="space-y-6">

         {/* Barra de Título, Pesquisa e Botão de Adicionar */}
         <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <h1 className="text-3xl font-bold text-white">Clientes</h1>
            <div className="flex w-full md:w-auto gap-2">
               <Input
                  placeholder="Pesquisar por nome..."
                  className="bg-phalis-gray border-0 w-full md:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
               />
               {/* MUDANÇA AQUI: Usando o novo modal */}
               <AddClientModal
                  mode="create"
                  onClientSaved={handleClientSaved}
                  triggerButton={
                     <Button className="bg-phalis-nav hover:bg-phalis-nav-hover">
                        <Plus className="mr-2 h-4 w-4" />
                        Cliente
                     </Button>
                  }
               />
            </div>
         </div>

         {/* Tabela de Clientes */}
         <div className="bg-phalis-black rounded-lg">
            <Table>
               <TableHeader>
                  <TableRow>
                     <TableHead>Nome</TableHead>
                     <TableHead>CPF/CNPJ</TableHead>
                     <TableHead>Email</TableHead>
                     {/* MUDANÇA AQUI: Adicionadas colunas */}
                     <TableHead>Telefone 1</TableHead>
                     <TableHead>Telefone 2</TableHead>
                     <TableHead className="w-[50px]">Ações</TableHead>
                  </TableRow>
               </TableHeader>
               <TableBody>
                  {isLoading ? (
                     <TableRow>
                        <TableCell colSpan={6} className="text-center">
                           <Loader2 className="h-6 w-6 animate-spin inline-block" />
                        </TableCell>
                     </TableRow>
                  ) : clientesFiltrados.length === 0 ? (
                     <TableRow>
                        <TableCell colSpan={6} className="text-center text-gray-400">
                           Nenhum cliente encontrado.
                        </TableCell>
                     </TableRow>
                  ) : (
                     clientesFiltrados.map((cliente) => (
                        <TableRow key={cliente.id}>
                           <TableCell>{cliente.nome}</TableCell>
                           <TableCell>{cliente.cpfCnpj || '---'}</TableCell>
                           <TableCell>{cliente.email || '---'}</TableCell>
                           <TableCell>
                              <a
                                 href={formatarWhatsApp(cliente.telefone1)}
                                 target="_blank"
                                 rel="noopener noreferrer"
                                 className="text-white hover:text-phalis-action hover:underline"
                              >
                                 {cliente.telefone1}
                              </a>
                           </TableCell>
                           {/* MUDANÇA AQUI: Nova coluna */}
                           <TableCell>{cliente.telefone2 || '---'}</TableCell>

                           {/* MUDANÇA AQUI: Botão de Edição */}
                           <TableCell>
                              <AddClientModal
                                 mode="edit"
                                 clienteToEdit={cliente}
                                 onClientSaved={handleClientSaved}
                                 triggerButton={
                                    <Button variant="ghost" size="icon" className="text-white hover:text-phalis-action">
                                       <Edit className="h-4 w-4" />
                                    </Button>
                                 }
                              />
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