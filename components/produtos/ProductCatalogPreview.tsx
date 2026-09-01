// Arquivo: components/produtos/ProductCatalogPreview.tsx
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
   Eye,
   Layers,
   Globe,
   EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
   DialogDescription,
} from "@/components/ui/dialog";

// Ícone oficial do WhatsApp
const WhatsAppIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
   <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 448 512"
      aria-hidden="true"
   >
      <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
   </svg>
);

const CATEGORIA_NOMES: Record<string, string> = {
   METRO: 'Sob Medida (m²)',
   UNIDADE: 'Por Unidade',
   SERVICO: 'Serviço Gráfico',
};

interface ProductCatalogPreviewProps {
   nome: string;
   nomeExibicao?: string;
   resumo?: string;
   descricaoDetalhada?: string;
   imageUrl: string | null;
   categoria: 'METRO' | 'UNIDADE' | 'SERVICO';
   destaque: boolean;
   visivelPublico: boolean;
   opcoes?: {
      papel?: string[];
      tamanho?: string[];
      cores?: string[];
      acabamento?: string[];
   };
}

export const ProductCatalogPreview: React.FC<ProductCatalogPreviewProps> = ({
   nome,
   nomeExibicao,
   resumo,
   descricaoDetalhada,
   imageUrl,
   categoria,
   destaque,
   visivelPublico,
   opcoes = {}
}) => {
   const [modalPreviewAberto, setModalPreviewAberto] = useState(false);

   const displayName = nomeExibicao?.trim() || nome.trim() || 'Nome do Produto';
   const displayResumo = resumo?.trim() || 'Resumo curto ou chamada comercial que os clientes verão no catálogo público.';
   const displayCategoriaNome = CATEGORIA_NOMES[categoria] || 'Produto';
   const displayImage = imageUrl || '/images/catalogo/phalis-kekw.png';
   const displayDescricao = descricaoDetalhada?.trim() || 'Descrição completa e detalhada com especificações técnicas e materiais disponíveis para este produto.';

   return (
      <div className="space-y-4">
         {/* Cabeçalho da Pré-Visualização */}
         <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
               <Eye size={14} className="text-phalis-action" />
               Pré-Visualização do Card
            </span>

            {visivelPublico ? (
               <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] py-0 px-2 flex items-center gap-1 font-bold">
                  <Globe size={11} />
                  Visível no Catálogo
               </Badge>
            ) : (
               <Badge className="bg-gray-800 text-gray-400 border border-gray-700 text-[10px] py-0 px-2 flex items-center gap-1">
                  <EyeOff size={11} />
                  Oculto no Catálogo
               </Badge>
            )}
         </div>

         {/* Card Idêntico ao Catálogo Online */}
         <div className="max-w-[280px] sm:max-w-[300px] mx-auto bg-[#242424] border border-gray-700/60 hover:border-phalis-action/50 rounded-2xl overflow-hidden flex flex-col justify-between shadow-2xl transition-all group select-none">
            {/* Imagem do Produto com Badges */}
            <div
               onClick={() => setModalPreviewAberto(true)}
               className="relative h-48 w-full bg-[#181818] flex items-center justify-center p-4 cursor-pointer overflow-hidden border-b border-gray-800"
               title="Clique para testar a abertura do modal"
            >
               <Image
                  src={displayImage}
                  alt={displayName}
                  width={150}
                  height={150}
                  className="object-contain max-h-36 w-auto group-hover:scale-105 transition-transform duration-300 drop-shadow-md"
               />

               {/* Badge de Destaque / Tipo */}
               <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
                  {destaque && (
                     <Badge className="bg-orange-500/20 text-orange-400 border border-orange-500/40 text-[10px] font-extrabold py-0.5 px-2 backdrop-blur-md shadow-sm">
                        Mais Pedido
                     </Badge>
                  )}
                  <Badge className="bg-black/75 text-phalis-ciano border border-phalis-ciano/30 text-[10px] font-semibold py-0.5 px-2 backdrop-blur-md">
                     {displayCategoriaNome}
                  </Badge>
               </div>

               {/* Botão Hover de Ver Detalhes */}
               <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                  <span className="bg-phalis-dark/95 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl border border-gray-600 flex items-center gap-1.5 shadow-lg">
                     <Eye size={14} className="text-phalis-action" /> Testar Modal
                  </span>
               </div>
            </div>

            {/* Informações do Produto */}
            <div className="p-4 flex-1 flex flex-col justify-between space-y-3.5">
               <div className="space-y-1">
                  <h3
                     onClick={() => setModalPreviewAberto(true)}
                     className="text-sm font-bold text-white group-hover:text-phalis-action transition-colors line-clamp-1 cursor-pointer"
                  >
                     {displayName}
                  </h3>
                  <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed font-normal">
                     {displayResumo}
                  </p>
               </div>

               {/* Rodapé do Card */}
               <div className="pt-2 border-t border-gray-700/50">
                  <div className="grid grid-cols-2 gap-2">
                     <Button
                        size="sm"
                        type="button"
                        variant="outline"
                        onClick={() => setModalPreviewAberto(true)}
                        className="h-8 rounded-xl border-gray-700 bg-phalis-gray hover:bg-gray-700 text-[11px] font-semibold text-gray-200 hover:text-white"
                     >
                        Detalhes
                     </Button>

                     <Button
                        size="sm"
                        type="button"
                        onClick={() => setModalPreviewAberto(true)}
                        className="h-8 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-black font-extrabold text-[11px] flex items-center justify-center gap-1 shadow-sm"
                     >
                        <WhatsAppIcon className="w-3 h-3 text-black" />
                        Orçar
                     </Button>
                  </div>
               </div>
            </div>
         </div>

         {/* Modal Interativo de Teste (Simulação do Catálogo Público) */}
         <Dialog open={modalPreviewAberto} onOpenChange={setModalPreviewAberto}>
            <DialogContent className="max-w-2xl bg-[#202020] border border-gray-700 text-white rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
               <div className="space-y-6">
                  <DialogHeader className="space-y-2">
                     <div className="flex items-center gap-2">
                        <Badge className="bg-phalis-ciano/15 text-phalis-ciano border border-phalis-ciano/30 text-xs font-bold">
                           {displayCategoriaNome}
                        </Badge>
                        {destaque && (
                           <Badge className="bg-orange-500/20 text-orange-400 border border-orange-500/40 text-xs font-bold">
                              Mais Pedido
                           </Badge>
                        )}
                        <span className="text-[10px] font-mono text-gray-400 ml-auto bg-black/40 px-2 py-0.5 rounded-md border border-gray-800">
                           Simulação de Pré-Visualização
                        </span>
                     </div>
                     <DialogTitle className="text-2xl font-extrabold text-white tracking-tight">
                        {displayName}
                     </DialogTitle>
                     <DialogDescription className="text-xs text-gray-300">
                        Confira as especificações técnicas, materiais e acabamentos disponíveis para este produto.
                     </DialogDescription>
                  </DialogHeader>

                  {/* Imagem + Resumo */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center bg-[#181818] p-4 rounded-2xl border border-gray-700/60">
                     <div className="sm:col-span-4 h-36 flex items-center justify-center bg-[#242424] rounded-xl p-3 border border-gray-800">
                        <Image
                           src={displayImage}
                           alt={displayName}
                           width={140}
                           height={140}
                           className="object-contain max-h-32 w-auto drop-shadow-md"
                        />
                     </div>
                     <div className="sm:col-span-8 space-y-2">
                        <p className="text-xs text-gray-300 leading-relaxed">
                           {displayDescricao}
                        </p>
                     </div>
                  </div>

                  {/* Opções Cadastradas */}
                  <div className="space-y-4 text-xs">
                     <h4 className="font-bold text-gray-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                        <Layers size={14} className="text-phalis-action" />
                        Opções e Variações Disponíveis no Formulário:
                     </h4>

                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {opcoes.papel && opcoes.papel.length > 0 && (
                           <div className="bg-[#262626] p-3 rounded-xl border border-gray-700/60 space-y-1.5">
                              <span className="text-[10px] font-bold text-phalis-ciano uppercase">Materiais / Papéis</span>
                              <div className="flex flex-wrap gap-1">
                                 {opcoes.papel.map(p => (
                                    <Badge key={p} variant="secondary" className="bg-phalis-gray text-gray-200 text-[10px] py-0.5 border border-gray-700">
                                       {p}
                                    </Badge>
                                 ))}
                              </div>
                           </div>
                        )}

                        {opcoes.tamanho && opcoes.tamanho.length > 0 && (
                           <div className="bg-[#262626] p-3 rounded-xl border border-gray-700/60 space-y-1.5">
                              <span className="text-[10px] font-bold text-phalis-rosa uppercase">Formatos / Tamanhos</span>
                              <div className="flex flex-wrap gap-1">
                                 {opcoes.tamanho.map(t => (
                                    <Badge key={t} variant="secondary" className="bg-phalis-gray text-gray-200 text-[10px] py-0.5 border border-gray-700">
                                       {t}
                                    </Badge>
                                 ))}
                              </div>
                           </div>
                        )}

                        {opcoes.cores && opcoes.cores.length > 0 && (
                           <div className="bg-[#262626] p-3 rounded-xl border border-gray-700/60 space-y-1.5">
                              <span className="text-[10px] font-bold text-phalis-yellow uppercase">Padrão de Cores</span>
                              <div className="flex flex-wrap gap-1">
                                 {opcoes.cores.map(c => (
                                    <Badge key={c} variant="secondary" className="bg-phalis-gray text-gray-200 text-[10px] py-0.5 border border-gray-700">
                                       {c}
                                    </Badge>
                                 ))}
                              </div>
                           </div>
                        )}

                        {opcoes.acabamento && opcoes.acabamento.length > 0 && (
                           <div className="bg-[#262626] p-3 rounded-xl border border-gray-700/60 space-y-1.5">
                              <span className="text-[10px] font-bold text-phalis-action uppercase">Acabamentos & Reforços</span>
                              <div className="flex flex-wrap gap-1">
                                 {opcoes.acabamento.map(a => (
                                    <Badge key={a} variant="secondary" className="bg-phalis-gray text-gray-200 text-[10px] py-0.5 border border-gray-700">
                                       {a}
                                    </Badge>
                                 ))}
                              </div>
                           </div>
                        )}
                     </div>
                  </div>

                  {/* Botão de Solicitação de Orçamento Direto no WhatsApp */}
                  <div className="pt-2">
                     <Button
                        type="button"
                        onClick={() => setModalPreviewAberto(false)}
                        className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-black font-extrabold h-12 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-[#25D366]/20 text-sm transition-all"
                     >
                        <WhatsAppIcon className="w-5 h-5 text-black" />
                        Pedir Orçamento deste Produto no WhatsApp
                     </Button>
                  </div>
               </div>
            </DialogContent>
         </Dialog>
      </div>
   );
};
