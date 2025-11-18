'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import {
   AlertDialog,
   AlertDialogAction,
   AlertDialogCancel,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogHeader,
   AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { type Product } from '@/lib/productData';
import { Loader2, Plus, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';

// Importar tudo do dnd-kit
import {
   DndContext,
   closestCenter,
   KeyboardSensor,
   PointerSensor,
   useSensor,
   useSensors,
   DragEndEvent,
} from '@dnd-kit/core';
import {
   arrayMove,
   SortableContext,
   sortableKeyboardCoordinates,
   verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { SortableProductItem } from '@/components/produtos/SortableProductItem';


export default function GerenciarProdutosPage() {
   const [produtos, setProdutos] = useState<Product[]>([]);
   const [isLoading, setIsLoading] = useState(true);
   const router = useRouter();

   // Estados do Dialog (Sem mudança)
   const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
   const [productToDelete, setProductToDelete] = useState<Product | null>(null);
   const [password, setPassword] = useState('');
   const [deleteLoading, setDeleteLoading] = useState(false);
   const [deleteError, setDeleteError] = useState('');

   useEffect(() => {
      setIsLoading(true);
      fetch('/api/produtos')
         .then(res => res.json())
         .then((data: Product[]) => {
            setProdutos(data);
            setIsLoading(false);
         })
         .catch(err => {
            console.error("Falha ao buscar produtos:", err);
            setIsLoading(false);
         });
   }, []);

   const handleEdit = (id: string) => {
      router.push(`/adm/produtos/${id}`);
   };

   const openDeleteDialog = (produto: Product) => {
      setProductToDelete(produto);
      setIsDeleteDialogOpen(true);
      setPassword('');
      setDeleteError('');
      setDeleteLoading(false);
   };

   const handleDeleteConfirm = async () => {
      if (!productToDelete) return;
      setDeleteLoading(true);
      setDeleteError('');
      try {
         const response = await fetch(`/api/produtos/${productToDelete.id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: password }),
         });
         if (response.status === 403) {
            throw new Error('Senha incorreta.');
         }
         if (!response.ok) {
            throw new Error('Falha ao deletar o produto.');
         }
         setProdutos(prev => prev.filter(p => p.id !== productToDelete.id));
         setIsDeleteDialogOpen(false);
      } catch (error: any) {
         setDeleteError(error.message);
      } finally {
         setDeleteLoading(false);
      }
   };

   // ==========================================================
   // MUDANÇA AQUI: Lógica do Drag and Drop
   // ==========================================================

   // Configura os sensores
   const sensors = useSensors(
      useSensor(PointerSensor, {
         // CORREÇÃO: Inicia o "arrastar" após mover 5 pixels (quase instantâneo)
         // Remove o delay padrão que causava a "travada".
         activationConstraint: {
            distance: 5,
         },
      }),
      useSensor(KeyboardSensor, {
         coordinateGetter: sortableKeyboardCoordinates,
      })
   );

   // Função chamada ao soltar o item
   const handleDragEnd = (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
         setProdutos((items) => {
            const oldIndex = items.findIndex(item => item.id === active.id);
            const newIndex = items.findIndex(item => item.id === over.id);

            const newOrderList = arrayMove(items, oldIndex, newIndex);
            const newOrderIds = newOrderList.map(item => item.id);

            // Envia a nova ordem para a API (sem esperar)
            fetch('/api/produtos/reorder', {
               method: 'PUT',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ productIds: newOrderIds }),
            }).catch(err => console.error("Falha ao salvar a nova ordem.", err));

            return newOrderList;
         });
      }
   };


   return (
      <DndContext
         sensors={sensors}
         collisionDetection={closestCenter}
         onDragEnd={handleDragEnd}
      >
         <div className="w-full 2xl:w-4/5 2xl:mx-auto space-y-6">

            {/* --- Cabeçalho (Sem mudança) --- */}
            <div className="flex justify-between items-center">
               <h1 className="text-3xl font-bold text-white">Gerenciar Produtos</h1>
               <Button asChild className="bg-phalis-action text-phalis-black hover:bg-phalis-action-hover">
                  <Link href="/adm/produtos/novo">
                     <Plus className="mr-2 h-4 w-4" />
                     Cadastrar Novo Produto
                  </Link>
               </Button>
            </div>

            {/* --- Tabela/Lista Arrastável (Sem mudança) --- */}
            <div className="bg-phalis-black rounded-lg">
               {isLoading ? (
                  <div className="flex justify-center items-center p-12">
                     <Loader2 className="h-12 w-12 animate-spin text-phalis-action" />
                  </div>
               ) : (
                  <div>
                     {/* O "Cabeçalho" da nossa nova lista */}
                     <div className="flex items-center p-4 border-b border-gray-800 text-sm font-medium text-gray-400">
                        <div className="w-10"></div> {/* Espaço do Handle */}
                        <div className="w-[80px] px-4">Imagem</div>
                        <div className="flex-1">Nome</div>
                        <div className="w-[100px]">Tipo</div>
                        <div className="w-[140px] text-right">Ações</div>
                     </div>

                     {/* A Lista Arrastável */}
                     <SortableContext
                        items={produtos}
                        strategy={verticalListSortingStrategy}
                     >
                        {produtos.map((produto) => (
                           <SortableProductItem
                              key={produto.id}
                              product={produto}
                              onEdit={handleEdit}
                              onDelete={openDeleteDialog}
                           />
                        ))}
                     </SortableContext>
                  </div>
               )}
            </div>

            {/* O Dialog de Confirmação (Sem mudança) */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
               <AlertDialogContent className="bg-phalis-black border-gray-800 text-white">
                  <AlertDialogHeader>
                     <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
                     <AlertDialogDescription className="text-gray-400">
                        Isso irá deletar permanentemente o produto:
                        <br />
                        <strong className="text-white">{productToDelete?.nome}</strong>
                        <br /><br />
                        Para confirmar, digite sua senha de administrador:
                     </AlertDialogDescription>
                     <Input
                        type="password"
                        placeholder="••••••••"
                        className="bg-phalis-gray border-0"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                     />
                     {deleteError && (
                        <p className="text-sm text-phalis-danger">{deleteError}</p>
                     )}
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                     <AlertDialogCancel
                        className="bg-gray-700 border-0 hover:bg-gray-600 hover:text-white"
                        onClick={() => setDeleteLoading(false)}
                     >
                        Cancelar
                     </AlertDialogCancel>
                     <Button
                        className="bg-phalis-danger text-white hover:bg-red-700"
                        disabled={deleteLoading}
                        onClick={handleDeleteConfirm}
                     >
                        {deleteLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sim, deletar produto"}
                     </Button>
                  </AlertDialogFooter>
               </AlertDialogContent>
            </AlertDialog>

         </div>
      </DndContext>
   );
}