'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { produtosDoCatalogo, type Product } from '@/lib/productData';

// --- O ComponentE do Card (COM MUDANÇAS) ---
interface ProductCardProps {
   product: Product;
   onClick: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
   return (
      <motion.div
         initial={{ opacity: 0, y: 10 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.3 }}
         whileHover={{ y: -8 }}
         onClick={() => onClick(product)}

         // MUDANÇA 1: Card com fundo branco e sombra
         className="rounded-lg bg-white shadow-lg
                 relative overflow-hidden group
                 cursor-pointer
                 p-4
                 flex flex-col items-center gap-3"
      >

         {/* Imagem (sem mudança) */}
         <Image
            src={product.imageUrl}
            alt={product.nome}
            width={125}
            height={125}
            className="object-cover rounded-md"
            priority={true}
         />

         {/* MUDANÇA 2: Texto com cores escuras */}
         <div className="w-full text-left">
            <h3 className="font-bold text-gray-900">{product.nome}</h3>
            <p className="text-sm text-gray-600">{product.descricao}</p>
         </div>

      </motion.div>
   );
};


// --- A Página Principal do Catálogo (COM MUDANÇA) ---
export default function CatalogoPage() {
   const router = useRouter();

   const handleCardClick = (produto: Product) => {
      const pagePath = '/pedido';
      const url = `${pagePath}?id=${produto.id}`;
      router.push(url);
   };

   return (
      // MUDANÇA 3: Container com 80% de largura e centralizado
      <div className="w-full 2xl:w-4/5 2xl:mx-auto space-y-6">

         <h1 className="text-3xl font-bold text-white">Catálogo de Produtos</h1>

         {/* A grade de 6 colunas (sem mudança) */}
         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {produtosDoCatalogo.map(produto => (
               <ProductCard
                  key={produto.id}
                  product={produto}
                  onClick={handleCardClick}
               />
            ))}
         </div>
      </div>
   );
}