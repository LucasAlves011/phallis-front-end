'use client';

import React, { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, PlusCircle, Loader2, Edit } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from "@/components/ui/button";
import {
   Command,
   CommandEmpty,
   CommandGroup,
   CommandInput,
   CommandItem,
   CommandList,
} from "@/components/ui/command";
import {
   Popover,
   PopoverContent,
   PopoverTrigger,
} from "@/components/ui/popover";
import { AddClientModal } from './AddClientModal';
import { type Cliente } from '@/lib/clientData';
import { usePermission } from '@/lib/auth/usePermission';

interface ClientComboboxProps {
   selectedClientId: string | null;
   onSelectClient: (cliente: Cliente | null) => void;
}

export function ClientCombobox({ selectedClientId, onSelectClient }: ClientComboboxProps) {
   const [open, setOpen] = useState(false);
   const [clientes, setClientes] = useState<Cliente[]>([]);
   const [isLoading, setIsLoading] = useState(false);
   const { hasPermission } = usePermission();

   useEffect(() => {
      setIsLoading(true);
      fetch('/api/clientes')
         .then(res => res.json())
         .then((data: Cliente[]) => {
            setClientes(data);
            setIsLoading(false);
         });
   }, []);

   const handleClientSaved = (savedCliente: Cliente) => {
      let clienteExiste = false;
      const clientesAtualizados = clientes.map(c => {
         if (c.id === savedCliente.id) {
            clienteExiste = true;
            return savedCliente;
         }
         return c;
      });

      if (clienteExiste) {
         setClientes(clientesAtualizados);
      } else {
         setClientes([savedCliente, ...clientesAtualizados]);
      }

      onSelectClient(savedCliente);
      setOpen(false); // Fecha o combobox
   };

   const selectedClient = clientes.find(c => c.id === selectedClientId);

   return (
      <div className="flex w-full gap-2">
         <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
               <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between bg-phalis-nav hover:bg-phalis-nav-hover font-medium text-lg py-6 text-white border-0"
               >
                  {isLoading ? (
                     <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                     selectedClient ? selectedClient.nome : "Selecione o Cliente..."
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
               </Button>
            </PopoverTrigger>

            {/* ========================================================== */}
            {/* MUDANÇA 1: Removido 'bg-phalis-black'. Agora ele usará
            o 'bg-popover' padrão (phalis-dark) que definimos no globals.css */}
            {/* ========================================================== */}
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0 border-phalis-gray text-white">
               <Command>
                  <CommandInput placeholder="Pesquisar cliente..." className="border-0" />
                  <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
                  <CommandList>

                     {/* A Lista de Clientes */}
                     <CommandGroup heading="Clientes Cadastrados">
                        {clientes.map((cliente) => (
                           <CommandItem
                              key={cliente.id}
                              value={`${cliente.nome} ${cliente.telefone1}`}
                              onSelect={() => {
                                 onSelectClient(cliente);
                                 setOpen(false);
                              }}
                           >
                              <Check
                                 className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedClientId === cliente.id ? "opacity-100" : "opacity-0"
                                 )}
                              />
                              {cliente.nome} - {cliente.telefone1}
                           </CommandItem>
                        ))}
                     </CommandGroup>
                  </CommandList>
               </Command>

               {/* O Modal de Adicionar */}
               {hasPermission('clientes.alterar') && (<div className="border-t border-phalis-gray p-1">
                  <AddClientModal
                     mode="create"
                     onClientSaved={handleClientSaved}
                     triggerButton={
                        <Button
                           variant="ghost"
                           // ==========================================================
                           // MUDANÇA 2: Adicionado 'hover:bg-phalis-gray' para
                           // imitar o hover dos itens da lista.
                           // ==========================================================
                           className="w-full justify-start text-phalis-action hover:text-phalis-action hover:bg-phalis-gray"
                        >
                           <PlusCircle className="mr-2 h-4 w-4" />
                           Cadastrar Novo Cliente
                        </Button>
                     }
                  />
               </div>)}
            </PopoverContent>
         </Popover>

         {/* Botão de Edição Rápida (Sem mudança) */}
         {selectedClient && (
            <AddClientModal
               mode="edit"
               clienteToEdit={selectedClient}
               onClientSaved={handleClientSaved}
               triggerButton={
                  <Button variant="outline" size="icon" className="h-full bg-phalis-gray border-0 py-6">
                     <Edit className="h-5 w-5" />
                  </Button>
               }
            />
         )}
      </div>
   );
}