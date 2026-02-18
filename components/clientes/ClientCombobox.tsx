'use client';

import React, { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, PlusCircle, Loader2, Edit, Pencil } from 'lucide-react';
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

import { authenticatedFetch } from '@/lib/api'; // Adicionado

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
      // MUDANÇA: Usando authenticatedFetch para enviar o token
      authenticatedFetch('/api/clientes')
         .then(res => {
            if (!res.ok) throw new Error('Falha ao buscar clientes');
            return res.json();
         })
         .then((data: Cliente[]) => {
            if (Array.isArray(data)) {
               setClientes(data);
            } else {
               console.error("API de clientes não retornou um array:", data);
               setClientes([]);
            }
         })
         .catch(err => {
            console.error(err);
            setClientes([]);
         })
         .finally(() => {
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
                  className="flex-1 justify-between bg-phalis-nav hover:bg-phalis-nav-hover font-medium text-lg py-6 text-white border-0"
               >
                  {isLoading ? (
                     <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                     selectedClient ? selectedClient.nome : "Selecione o Cliente..."
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
               </Button>
            </PopoverTrigger>

            {/* ... */}

            <PopoverContent className="w-[--radix-popover-trigger-width] p-0 border-phalis-gray text-white">
               {/* ... (conteúdo do popover) */}
               <Command>
                  <CommandInput placeholder="Pesquisar cliente..." className="border-0" />
                  <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
                  <CommandList>
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
                  <Button
                     variant="ghost"
                     size="icon"
                     className="h-auto aspect-square shrink-0 bg-phalis-gray text-white hover:bg-phalis-gray/80 hover:text-white border-0 flex items-center justify-center p-0"
                  >
                     <Pencil className="h-5 w-5 text-white" />
                  </Button>
               }
            />
         )}
      </div>
   );
}