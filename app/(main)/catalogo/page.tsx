'use client';

import React, { useState, useEffect } from 'react'; // 1. MUDANÇA: Importar hooks
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { type Product } from '@/lib/productData'; // 2. MUDANÇA: Importar apenas o *tipo*
import { Loader2, Search, Share2, Check, ExternalLink } from 'lucide-react'; // 3. MUDANÇA: Importar o ícone de loading e search
import { authenticatedFetch } from '@/lib/api'; // 4. MUDANÇA: Importar fetch autenticado
import { usePermission } from '@/lib/auth/usePermission';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

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
   const [filtroBusca, setFiltroBusca] = useState('');
   const [copiado, setCopiado] = useState(false);

   const [error, setError] = useState('');

   const handleCopyPublicLink = () => {
      if (typeof window !== 'undefined') {
         const publicUrl = `${window.location.origin}/catalogo-online`;
         navigator.clipboard.writeText(publicUrl);
         setCopiado(true);
         setTimeout(() => setCopiado(false), 2500);
      }
   };

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
               // Apenas produtos que não estejam explicitamente desativados
               setProdutos(data.filter(p => p.ativo !== false));
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

   const produtosFiltrados = produtos.filter(p => p.nome.toLowerCase().includes(filtroBusca.toLowerCase()));

   return (
      <div className="w-full 2xl:w-4/5 2xl:mx-auto space-y-6">
         <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <h1 className="text-3xl font-bold text-white">Catálogo de Produtos</h1>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
               {/* Botão Copiar Link do Catálogo Público */}
               <Button
                  type="button"
                  onClick={handleCopyPublicLink}
                  className="w-full sm:w-auto h-12 px-4 rounded-md bg-phalis-gray hover:bg-[#383838] border border-gray-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-all shrink-0"
                  title="Copiar link do Catálogo Online Público"
               >
                  {copiado ? (
                     <>
                        <Check className="h-4 w-4 text-phalis-action" />
                        <span className="text-phalis-action font-bold">Link Copiado!</span>
                     </>
                  ) : (
                     <>
                        <Share2 className="h-4 w-4 text-phalis-action" />
                        <span>Copiar Link do Catálogo</span>
                     </>
                  )}
               </Button>

               {/* Botão Abrir Catálogo Público em Nova Aba */}
               <a
                  href="/catalogo-online"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:flex h-12 w-12 rounded-md bg-phalis-gray hover:bg-[#383838] border border-gray-700 text-gray-300 hover:text-white items-center justify-center transition-all shrink-0 shadow-sm"
                  title="Abrir Catálogo Público em Nova Aba"
               >
                  <ExternalLink className="h-4 w-4 text-phalis-action" />
               </a>

               {/* Campo de Pesquisa */}
               <div className="relative w-full sm:w-80 lg:w-96">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                     type="text"
                     placeholder="Pesquisar produto pelo nome..."
                     className="pl-10 bg-phalis-black border-gray-800 text-white placeholder:text-gray-500 h-12 text-base focus-visible:ring-phalis-action"
                     value={filtroBusca}
                     onChange={(e) => setFiltroBusca(e.target.value)}
                  />
               </div>
            </div>
         </div>

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
         ) : !error && produtosFiltrados.length === 0 ? (
            <div className="text-center text-gray-400 p-12">
               Nenhum produto encontrado.
            </div>
         ) : (
            // Se terminou, mostra a grade
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
               {/* 6. MUDANÇA: Mapeia o 'produtosFiltrados' */}
               {produtosFiltrados.map(produto => (
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
