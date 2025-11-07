// Arquivo: components/clientes/AddClientModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogHeader,
   DialogTitle,
   DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
   Form,
   FormControl,
   FormField,
   FormItem,
   FormLabel,
   FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { type Cliente } from '@/lib/clientData';
import { Loader2 } from 'lucide-react';

// Schema de Validação (sem mudança)
const formSchema = z.object({
   nome: z.string().min(2, { message: "Nome deve ter pelo menos 2 caracteres." }),
   cpfCnpj: z.string().optional(),
   email: z.string().email({ message: "Email inválido." }).optional().or(z.literal('')),
   telefone1: z.string().min(10, { message: "Telefone principal é obrigatório." }),
   telefone2: z.string().optional(),
});
type FormData = z.infer<typeof formSchema>;

// ==========================================================
// MUDANÇA AQUI: Novas Props
// ==========================================================
interface AddClientModalProps {
   mode: 'create' | 'edit'; // Define o modo
   triggerButton: React.ReactNode; // O botão que abre o modal
   clienteToEdit?: Cliente | null; // Cliente para pré-preencher
   onClientSaved: (cliente: Cliente) => void; // Callback unificado
}

export const AddClientModal: React.FC<AddClientModalProps> = ({
   mode,
   triggerButton,
   clienteToEdit,
   onClientSaved
}) => {
   const [open, setOpen] = useState(false);
   const [isLoading, setIsLoading] = useState(false);

   const isEditMode = mode === 'edit';
   const title = isEditMode ? 'Editar Cliente' : 'Cadastrar Novo Cliente';

   const form = useForm<FormData>({
      resolver: zodResolver(formSchema),
      defaultValues: {
         nome: "", cpfCnpj: "", email: "", telefone1: "", telefone2: "",
      },
   });

   // Efeito para preencher o formulário quando o modal abrir em modo de edição
   useEffect(() => {
      if (isEditMode && clienteToEdit && open) {
         form.reset({
            nome: clienteToEdit.nome,
            cpfCnpj: clienteToEdit.cpfCnpj || '',
            email: clienteToEdit.email || '',
            telefone1: clienteToEdit.telefone1,
            telefone2: clienteToEdit.telefone2 || '',
         });
      } else if (!isEditMode && open) {
         form.reset(); // Limpa o formulário para 'create'
      }
   }, [open, isEditMode, clienteToEdit, form]);

   // Função de Submit (agora polimórfica)
   const onSubmit = async (data: FormData) => {
      setIsLoading(true);
      try {
         const response = await fetch(
            isEditMode ? `/api/clientes/${clienteToEdit?.id}` : '/api/clientes',
            {
               method: isEditMode ? 'PUT' : 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify(data),
            }
         );

         if (!response.ok) throw new Error('Falha ao salvar cliente');

         const savedCliente: Cliente = await response.json();

         onClientSaved(savedCliente); // Chama o callback unificado
         setOpen(false);

      } catch (error) {
         console.error(error);
      } finally {
         setIsLoading(false);
      }
   };

   return (
      <Dialog open={open} onOpenChange={setOpen}>
         {/* MUDANÇA AQUI: Usa a prop 'triggerButton' */}
         <DialogTrigger asChild>{triggerButton}</DialogTrigger>

         <DialogContent className="sm:max-w-[600px] bg-phalis-black border-phalis-gray text-white">
            <DialogHeader>
               {/* MUDANÇA AQUI: Título dinâmico */}
               <DialogTitle>{title}</DialogTitle>
               <DialogDescription>
                  Preencha os campos obrigatórios (*) para salvar.
               </DialogDescription>
            </DialogHeader>

            <Form {...form}>
               <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  {/* ... (O resto do formulário é igual) ... */}
                  <FormField
                     control={form.control}
                     name="nome"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Nome *</FormLabel>
                           <FormControl>
                              <Input placeholder="Nome Completo ou Razão Social" {...field} className="bg-phalis-gray border-0" />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />
                  <FormField
                     control={form.control}
                     name="cpfCnpj"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>CPF/CNPJ</FormLabel>
                           <FormControl>
                              <Input placeholder="000.000.000-00" {...field} className="bg-phalis-gray border-0" />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />
                  <FormField
                     control={form.control}
                     name="email"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Email</FormLabel>
                           <FormControl>
                              <Input placeholder="cliente@email.com" {...field} className="bg-phalis-gray border-0" />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                     <FormField
                        control={form.control}
                        name="telefone1"
                        render={({ field }) => (
                           <FormItem>
                              <FormLabel>Telefone 1 (Principal) *</FormLabel>
                              <FormControl>
                                 <Input placeholder="(81) 99999-9999" {...field} className="bg-phalis-gray border-0" />
                              </FormControl>
                              <FormMessage />
                           </FormItem>
                        )}
                     />
                     <FormField
                        control={form.control}
                        name="telefone2"
                        render={({ field }) => (
                           <FormItem>
                              <FormLabel>Telefone 2 (Secundário)</FormLabel>
                              <FormControl>
                                 <Input placeholder="(81) 3333-3333" {...field} className="bg-phalis-gray border-0" />
                              </FormControl>
                              <FormMessage />
                           </FormItem>
                        )}
                     />
                  </div>

                  <Button
                     type="submit"
                     className="w-full bg-phalis-action text-phalis-black font-bold hover:bg-phalis-action-hover"
                     disabled={isLoading}
                  >
                     {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Salvar Cliente'}
                  </Button>
               </form>
            </Form>
         </DialogContent>
      </Dialog>
   );
};