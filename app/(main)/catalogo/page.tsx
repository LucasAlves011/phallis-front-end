'use client';

import React, { useState, useEffect } from 'react'; // 1. MUDANÇA: Importar hooks
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { type Product } from '@/lib/productData'; // 2. MUDANÇA: Importar apenas o *tipo*
import { Loader2 } from 'lucide-react'; // 3. MUDANÇA: Importar o ícone de loading

// --- O Componente do Card (Sem mudanças) ---
// (Este subcomponente está perfeito como você colou)
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
         className="rounded-lg bg-white shadow-lg
                 relative overflow-hidden group
                 cursor-pointer
                 p-4
                 flex flex-col items-center gap-3"
      >
         <Image
            src={product.imageUrl}
            alt={product.nome}
            width={125}
            height={125}
            className="object-cover rounded-md"
            priority={true}
         />
         <div className="w-full text-left">
            <h3 className="font-bold text-gray-900">{product.nome}</h3>
            {/* <p className="text-sm text-gray-600">{product.descricao}</p> */}
         </div>
      </motion.div>
   );
};


// ==========================================================
// MUDANÇA 4: A Página Principal do Catálogo 
// ==========================================================
export default function CatalogoPage() {
   const router = useRouter();

   // Estados para loading e dados
   const [produtos, setProdutos] = useState<Product[]>([]);
   const [isLoading, setIsLoading] = useState(true);

   // Hook para buscar os dados da API (MSW)
   useEffect(() => {
      setIsLoading(true);

      fetch('/api/produtos')
         .then(res => res.json())
         .then((data: Product[]) => {
            setProdutos(data);
            setIsLoading(false);
         })
         .catch(err => {
            console.error("Falha ao buscar produtos do catálogo:", err);
            setIsLoading(false);
         });
   }, []); // O array vazio [] garante que isso rode apenas uma vez

   // Função de clique (como você definiu)
   const handleCardClick = (produto: Product) => {
      // (Atenção: verifique se sua rota é /pedido ou /pedidos)
      const pagePath = '/pedido';
      const url = `${pagePath}?id=${produto.id}`;
      router.push(url);
   };

   return (
      <div className="w-full 2xl:w-4/5 2xl:mx-auto space-y-6">
         <h1 className="text-3xl font-bold text-white">Catálogo de Produtos</h1>

         {/* 5. MUDANÇA: Lógica de Loading */}
         {isLoading ? (
            // Se estiver carregando, mostra o spinner
            <div className="flex justify-center items-center p-12">
               <Loader2 className="h-12 w-12 animate-spin text-phalis-action" />
            </div>
         ) : (
            // Se terminou, mostra a grade
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
               {/* 6. MUDANÇA: Mapeia o 'produtos' do estado, não o importado */}
               {produtos.map(produto => (
                  <ProductCard
                     key={produto.id}
                     product={produto}
                     onClick={handleCardClick}
                  />
               ))}
            </div>
         )}
      </div>
   );
}