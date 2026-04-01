// Arquivo: components/produtos/SortableProductItem.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { type Product } from '@/lib/productData';
import { Pencil, Trash2, GripVertical, Eye, EyeOff } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ca } from 'zod/v4/locales';

interface SortableProductItemProps {
   product: Product;
   onEdit: (id: string) => void;
   onDelete: (product: Product) => void;
   canEdit: boolean;
   canDelete: boolean;
   canReorder: boolean;
   onToggleAtivo: (id: string) => void;
}

export const SortableProductItem: React.FC<SortableProductItemProps> = ({ product, onEdit, onDelete, canEdit, canDelete, canReorder, onToggleAtivo }) => {

   // 1. Hooks do dnd-kit
   const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging, // Estado para saber se está sendo arrastado
   } = useSortable({ id: product.id });

   // 2. Estilo CSS para o 'arrastar'
   const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      zIndex: isDragging ? 10 : 'auto', // Põe o item na frente ao arrastar
      opacity: isDragging ? 0.8 : 1,
   };

   return (
      // 3. 'setNodeRef' e 'style' são aplicados ao container
      <div
         ref={setNodeRef}
         style={style}
         className={`flex items-center p-4 bg-phalis-black border-b border-gray-800 text-white ${product.ativo === false ? 'opacity-50 grayscale' : ''}`}
      >
         {/* O "Pegador" (Drag Handle) */}
         {canReorder && (<button
            type="button"
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-2 text-gray-500"
         >
            <GripVertical className="h-5 w-5" />
         </button>)}

         {/* Nova Coluna Ordem Corrigida */}
         <div className="w-[60px] flex justify-center border-r border-gray-800 pr-2 mr-2">
            <span className={`font-mono text-xs px-2 py-0.5 rounded-full ${product.ativo === false ? 'bg-red-900 text-gray-400' : 'bg-gray-800 text-white'}`}>
               #{product.orderIndex || 0}
            </span>
         </div>

         {/* Conteúdo da Linha (adaptado da <table>) */}
         <div className="w-[80px] px-4">
            <Image
               src={product.imageUrl}
               alt={product.nome}
               width={40}
               height={40}
               className="rounded-md object-cover"
            />
         </div>
         <div className="flex-1 font-medium space-x-2">
            <span>{product.nome}</span>
            {product.ativo === false && (
               <span className="text-xs bg-red-900/50 text-red-300 px-2 py-1 rounded-md border border-red-800/50">
                  INATIVO
               </span>
            )}
         </div>
         <div className="w-[100px] capitalize">
            <span className={`font-mono text-xxs uppercase px-2 py-0.5 rounded-full ${product.ativo === false ? 'bg-red-900 text-gray-400' : 'bg-gray-800 text-gray-200'}`}>
               {product.pricingType}
            </span>
         </div>
         <div className="w-[140px] text-right space-x-2">

            {canEdit && (<Button
               variant="ghost"
               size="icon"
               onClick={() => onToggleAtivo(product.id)}
               className="text-gray-400 hover:text-phalis-action hover:bg-phalis-action/10"
               title={product.ativo !== false ? "Desativar Produto" : "Ativar Produto"}
            >
               {product.ativo !== false ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </Button>)}

            {canEdit && (<Button
               variant="ghost"
               size="icon"
               onClick={() => onEdit(product.id)}
               className="text-gray-400 hover:text-phalis-action hover:bg-phalis-action/10"
            >
               <Pencil className="h-4 w-4" />
            </Button>)}

            {canDelete && (
               <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(product)}
                  className="text-gray-400 hover:text-phalis-danger hover:bg-phalis-danger/10"
               >
                  <Trash2 className="h-4 w-4" />
               </Button>)}
         </div>
      </div>
   );
};