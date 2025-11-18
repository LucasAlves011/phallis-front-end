// Arquivo: app/(main)/adm/produtos/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ProductForm } from '@/components/produtos/ProductForm';
import { type Product } from '@/lib/productData';
import { Loader2 } from 'lucide-react';

export default function EditarProdutoPage() {
   const params = useParams();
   const id = params.id as string;

   const [produto, setProduto] = useState<Product | null>(null);
   const [isLoading, setIsLoading] = useState(true);

   useEffect(() => {
      if (id) {
         setIsLoading(true);
         fetch(`/api/produtos/${id}`)
            .then(res => res.json())
            .then(data => {
               setProduto(data);
               setIsLoading(false);
            })
            .catch(err => {
               console.error(err);
               setIsLoading(false);
               // (Idealmente, redirecionar para 404)
            });
      }
   }, [id]);

   if (isLoading) {
      return (
         <div className="flex min-h-[50vh] items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-phalis-action" />
         </div>
      );
   }

   if (!produto) {
      return <div className="text-center text-white">Produto não encontrado.</div>;
   }

   // Renderiza o formulário no modo "edit" (com initialData)
   return <ProductForm initialData={produto} />;
}