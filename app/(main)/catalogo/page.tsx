'use client';

import React, { useState, useEffect } from 'react'; // 1. MUDANÇA: Importar hooks
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { type Product } from '@/lib/productData'; // 2. MUDANÇA: Importar apenas o *tipo*
import { Loader2 } from 'lucide-react'; // 3. MUDANÇA: Importar o ícone de loading
import { authenticatedFetch } from '@/lib/api'; // 4. MUDANÇA: Importar fetch autenticado
import { usePermission } from '@/lib/auth/usePermission';

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
         <img
            src={product.imageUrl}
            alt={product.nome}
            width={125}
            height={125}
            className="object-cover rounded-md h-[125px] w-[125px]"
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
   const { hasPermission } = usePermission();

   // Estados para loading e dados
   const [produtos, setProdutos] = useState<Product[]>([]);
   const [isLoading, setIsLoading] = useState(true);

   const [error, setError] = useState('');

   // Hook para buscar os dados da API (MSW)
   useEffect(() => {
      setIsLoading(true);
      setError('');

      authenticatedFetch('/api/produtos')
         .then(res => {
            if (!res.ok) throw new Error(`Erro na API: ${res.status}`);
            return res.json();
         })
         .then((data: Product[]) => {
            if (Array.isArray(data)) {
               setProdutos(data);
            } else {
               console.error("Dados recebidos não são um array:", data);
               throw new Error('Formato inválido de resposta.');
            }
            setIsLoading(false);
         })
         .catch(err => {
            console.error("Falha ao buscar produtos do catálogo:", err);
            setError('Não foi possível carregar o catálogo. Tente novamente mais tarde.');
            setIsLoading(false);
         });
   }, []); // O array vazio [] garante que isso rode apenas uma vez

   // Função de clique (como você definiu)
   const handleCardClick = (produto: Product) => {

      // Se não tiver permissão para REALIZAR pedido, não faz nada ou alerta
      if (!hasPermission('pedidos.realizar')) {
         alert("Você tem permissão para ver, mas não para criar novos pedidos.");
         return;
      }

      const pagePath = '/pedido';
      const url = `${pagePath}?id=${produto.id}`;
      router.push(url);
   };

   return (
      <div className="w-full 2xl:w-4/5 2xl:mx-auto space-y-6">
         <h1 className="text-3xl font-bold text-white">Catálogo de Produtos</h1>

         {error && (
            <div className="bg-red-900/20 border border-red-900/50 text-red-200 p-4 rounded-md">
               <p>{error}</p>
            </div>
         )}

         {/* 5. MUDANÇA: Lógica de Loading */}
         {isLoading ? (
            // Se estiver carregando, mostra o spinner
            <div className="flex justify-center items-center p-12">
               <Loader2 className="h-12 w-12 animate-spin text-phalis-action" />
            </div>
         ) : !error && produtos.length === 0 ? (
            <div className="text-center text-gray-400 p-12">
               Nenhum produto encontrado.
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
