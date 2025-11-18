// Arquivo: components/produtos/SortableProductItem.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { type Product } from '@/lib/productData';
import { Pencil, Trash2, GripVertical } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableProductItemProps {
   product: Product;
   onEdit: (id: string) => void;
   onDelete: (product: Product) => void;
}

export const SortableProductItem: React.FC<SortableProductItemProps> = ({ product, onEdit, onDelete }) => {

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
         className="flex items-center p-4 bg-phalis-black border-b border-gray-800 text-white"
      >
         {/* 4. O "Pegador" (Drag Handle) */}
         <button
            type="button"
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-2 text-gray-500"
         >
            <GripVertical className="h-5 w-5" />
         </button>

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
         <div className="flex-1 font-medium">{product.nome}</div>
         <div className="w-[100px] capitalize">{product.pricingType}</div>
         <div className="w-[140px] text-right space-x-2">
            <Button
               variant="ghost"
               size="icon"
               onClick={() => onEdit(product.id)}
               className="text-gray-400 hover:text-phalis-action hover:bg-phalis-action/10"
            >
               <Pencil className="h-4 w-4" />
            </Button>
            <Button
               variant="ghost"
               size="icon"
               onClick={() => onDelete(product)}
               className="text-gray-400 hover:text-phalis-danger hover:bg-phalis-danger/10"
            >
               <Trash2 className="h-4 w-4" />
            </Button>
         </div>
      </div>
   );
};