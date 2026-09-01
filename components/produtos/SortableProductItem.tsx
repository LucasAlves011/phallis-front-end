import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { type Product } from '@/lib/productData';
import { Pencil, Trash2, GripVertical, Eye, EyeOff, Globe, Globe2 } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableProductItemProps {
   product: Product;
   onEdit: (id: string) => void;
   onDelete: (product: Product) => void;
   canEdit: boolean;
   canDelete: boolean;
   canReorder: boolean;
   onToggleAtivo: (id: string) => void;
   onTogglePublico?: (id: string) => void;
}

export const SortableProductItem: React.FC<SortableProductItemProps> = ({
   product,
   onEdit,
   onDelete,
   canEdit,
   canDelete,
   canReorder,
   onToggleAtivo,
   onTogglePublico
}) => {

   // 1. Hooks do dnd-kit
   const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
   } = useSortable({ id: product.id });

   const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      zIndex: isDragging ? 10 : 'auto',
      opacity: isDragging ? 0.8 : 1,
   };

   const isVisivelPublico = product.visivelCatalogoPublico !== false;

   return (
      <div
         ref={setNodeRef}
         style={style}
         className={`flex items-center p-4 bg-phalis-black border-b border-gray-800 text-white ${product.ativo === false ? 'opacity-60 grayscale' : ''}`}
      >
         {/* O "Pegador" (Drag Handle) */}
         {canReorder && (
            <button
               type="button"
               {...attributes}
               {...listeners}
               className="cursor-grab active:cursor-grabbing p-2 text-gray-500"
            >
               <GripVertical className="h-5 w-5" />
            </button>
         )}

         {/* Coluna Ordem */}
         <div className="w-[60px] flex justify-center border-r border-gray-800 pr-2 mr-2">
            <span className={`font-mono text-xs px-2 py-0.5 rounded-full ${product.ativo === false ? 'bg-red-900 text-gray-400' : 'bg-gray-800 text-white'}`}>
               #{product.orderIndex || 0}
            </span>
         </div>

         {/* Imagem do Produto */}
         <div className="w-[80px] px-4">
            <Image
               src={product.imageUrl}
               alt={product.nome}
               width={40}
               height={40}
               className="rounded-md object-cover"
            />
         </div>

         {/* Nome e Badges de Status */}
         <div className="flex-1 font-medium space-x-2 flex items-center flex-wrap gap-1.5">
            <span>{product.nome}</span>
            {product.ativo === false && (
               <span className="text-[10px] bg-red-950 text-red-400 px-2 py-0.5 rounded-md border border-red-800 font-semibold">
                  INATIVO NO SISTEMA
               </span>
            )}
            {!isVisivelPublico && (
               <span className="text-[10px] bg-purple-950 text-purple-300 px-2 py-0.5 rounded-md border border-purple-800 font-semibold">
                  OCULTO NO CATÁLOGO PÚBLICO
               </span>
            )}
         </div>

         {/* Tipo de Precificação */}
         <div className="w-[100px] capitalize">
            <span className={`font-mono text-xxs uppercase px-2 py-0.5 rounded-full ${product.ativo === false ? 'bg-red-900 text-gray-400' : 'bg-gray-800 text-gray-200'}`}>
               {product.pricingType}
            </span>
         </div>

         {/* Ações e Controles de Visibilidade */}
         <div className="w-[180px] text-right space-x-1 flex items-center justify-end">

            {/* BOTÃO 1: Catálogo Interno (Ativo / Inativo) */}
            {canEdit && (
               <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onToggleAtivo(product.id)}
                  className={`h-9 w-9 ${product.ativo !== false ? 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/40' : 'text-gray-600 hover:text-gray-400'}`}
                  title={product.ativo !== false ? "Catálogo Interno: Ativo (Clique para desativar do sistema)" : "Catálogo Interno: Inativo (Clique para ativar)"}
               >
                  {product.ativo !== false ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
               </Button>
            )}

            {/* BOTÃO 2: Catálogo Público (Visível / Oculto para Clientes) */}
            {canEdit && onTogglePublico && (
               <Button
                  variant="ghost"
                  size="icon"
                  disabled={product.ativo === false}
                  onClick={() => onTogglePublico(product.id)}
                  className={`h-9 w-9 ${
                     product.ativo === false
                        ? 'opacity-25 cursor-not-allowed text-gray-700 hover:bg-transparent hover:text-gray-700'
                        : isVisivelPublico
                        ? 'text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/40'
                        : 'text-gray-600 hover:text-gray-400'
                  }`}
                  title={
                     product.ativo === false
                        ? "Produto inativo no sistema (ative o produto para gerenciar sua visibilidade no catálogo público)"
                        : isVisivelPublico
                        ? "Catálogo Público: Visível para clientes (Clique para ocultar do link)"
                        : "Catálogo Público: Oculto (Clique para exibir no link)"
                  }
               >
                  <Globe className="h-4 w-4" />
               </Button>
            )}

            {/* Botão Editar */}
            {canEdit && (
               <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(product.id)}
                  className="h-9 w-9 text-gray-400 hover:text-phalis-action hover:bg-phalis-action/10"
                  title="Editar Produto"
               >
                  <Pencil className="h-4 w-4" />
               </Button>
            )}

            {/* Botão Excluir */}
            {canDelete && (
               <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(product)}
                  className="h-9 w-9 text-gray-400 hover:text-phalis-danger hover:bg-phalis-danger/10"
                  title="Excluir Produto"
               >
                  <Trash2 className="h-4 w-4" />
               </Button>
            )}
         </div>
      </div>
   );
};