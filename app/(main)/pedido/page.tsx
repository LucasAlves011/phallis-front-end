'use client';

import React, { useEffect, useState, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
   optionGroupsConfig,
   type Product,
   type ProductOptions
} from '@/lib/productData';
import { authenticatedFetch } from '@/lib/api';
import { type Pedido } from '@/lib/orderData';
import { useCart } from '@/lib/cartStore';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from 'next/link';
import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from "@/components/ui/table";
import { Textarea } from '@/components/ui/textarea';
import { MoneyInput } from '@/components/ui/money-input';
import { Loader2, Search, ShoppingCart, Zap, Check, TrendingUp } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import { SuffixInput } from '@/components/ui/suffix-input';
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

// --- TIPOS COMPARTILHADOS ---
type Selections = Record<typeof optionGroupsConfig[number]['id'], string | null>;
type PrecoItem = { qtd: number; preco: number; };
type PrecoData = {
   nomeProduto: string;
   qtdMinima: number;
   precoMinimo: number;
   precos: PrecoItem[];
};

// ==========================================================
// COMPONENTES VISUAIS REUTILIZÁVEIS
// ==========================================================

const ProductInfoCard = ({ produto }: { produto: Product }) => (
   <div className="bg-phalis-black rounded-2xl p-4 border border-gray-800 shadow-xl flex flex-col flex-1 min-h-0">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
         <h2 className="text-lg font-black text-white tracking-tight truncate pr-2" title={produto.nome}>
            {produto.nome}
         </h2>
         <span className="text-[10px] uppercase font-extrabold tracking-wider text-phalis-action bg-phalis-action/10 px-3 py-0.5 rounded-full border border-phalis-action/20 flex-shrink-0">
            {produto.pricingType || 'UNIDADE'}
         </span>
      </div>

      {/* Vitrine Flexível com Backdrop Glow */}
      <div className="relative flex-1 min-h-[220px] w-full rounded-xl overflow-hidden bg-[#121212] border border-white/5 flex items-center justify-center p-4 group">
         {produto.imageUrl && (
            <div
               className="absolute inset-0 scale-125 opacity-30 blur-2xl pointer-events-none transition-all duration-500 group-hover:scale-150 group-hover:opacity-45"
               style={{
                  backgroundImage: `url(${produto.imageUrl})`,
                  backgroundPosition: 'center',
                  backgroundSize: 'cover'
               }}
            />
         )}

         <div className="relative z-10 w-full h-full flex items-center justify-center">
            <Image
               src={produto.imageUrl || "https://placehold.co/400x400?text=Sem+Foto"}
               alt={produto.nome}
               width={320}
               height={320}
               className="object-contain max-h-full max-w-full drop-shadow-2xl transition-transform duration-300 group-hover:scale-105 select-none"
               priority
            />
         </div>
      </div>

      {produto.descricao && (
         <p className="text-xs text-gray-400 leading-relaxed mt-2.5 line-clamp-2 flex-shrink-0" title={produto.descricao}>
            {produto.descricao}
         </p>
      )}
   </div>
);

const OrderSummaryCard = ({ ficha }: { ficha: { label: string; value: string }[] }) => (
   <div className="bg-phalis-black rounded-2xl p-4 border border-gray-800 shadow-xl space-y-2.5 flex-shrink-0">
      <div className="flex items-center justify-between border-b border-gray-800 pb-2">
         <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Ficha do Pedido:
         </h3>
         <span className="text-[11px] text-gray-400 font-medium">Especificações</span>
      </div>

      <div className="space-y-1.5 text-xs">
         {ficha.map((item) => (
            <div key={item.label} className="bg-[#181818] px-3 py-2 rounded-xl border border-gray-800/80 flex items-center justify-between gap-3">
               <span className="text-gray-400 font-bold flex-shrink-0">{item.label}:</span>
               <span className="text-white font-medium text-right truncate" title={item.value}>{item.value}</span>
            </div>
         ))}
      </div>
   </div>
);

const OrderFooter = ({
   total,
   isValid,
   isLoading,
   onConfirm,
   onFinalize,
   labelConfirm = "ADICIONAR AO CARRINHO",
   labelTotal = "TOTAL DO PEDIDO",
   missingItems = []
}: {
   total: number;
   isValid: boolean;
   isLoading: boolean;
   onConfirm: () => void;
   onFinalize?: () => void;
   labelConfirm?: string;
   labelTotal?: string;
   missingItems?: string[];
}) => (
   <div className="bg-phalis-black rounded-2xl px-6 py-3.5 border border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-2xl flex-shrink-0">
      <div className="flex items-baseline gap-3 text-white w-full sm:w-auto">
         <span className="text-xs text-gray-400 font-extrabold uppercase tracking-wider">{labelTotal}:</span>
         <span className="text-3xl font-black text-phalis-action">R$ {total.toFixed(2)}</span>
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto">
         <div className="relative group flex-1 sm:flex-initial">
            <Button
               type="button"
               disabled={!isValid || isLoading}
               onClick={onConfirm}
               className="w-full sm:w-auto bg-phalis-gray text-white hover:bg-gray-700 font-bold text-xs py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
               {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
               ) : (
                  <>
                     {labelConfirm.includes("ATUALIZAR") ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
                     <span className="whitespace-nowrap">{labelConfirm}</span>
                  </>
               )}
            </Button>
            {!isValid && missingItems.length > 0 && (
               <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block z-50 animate-in fade-in duration-200">
                  <div className="bg-gray-900 border border-gray-700 text-white text-xs rounded-xl p-3 shadow-xl max-w-xs">
                     <p className="font-semibold text-yellow-400 mb-1.5">Campos pendentes:</p>
                     <ul className="space-y-1">
                        {missingItems.map((item, i) => (
                           <li key={i} className="flex items-center gap-1.5 text-gray-300">
                              <span className="h-1.5 w-1.5 rounded-full bg-red-400 flex-shrink-0" />
                              {item}
                           </li>
                        ))}
                     </ul>
                     <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-gray-900 border-r border-b border-gray-700 transform rotate-45" />
                  </div>
               </div>
            )}
         </div>

         {onFinalize && (
            <div className="relative group flex-1 sm:flex-initial">
               <Button
                  type="button"
                  disabled={!isValid || isLoading}
                  onClick={onFinalize}
                  className="w-full sm:w-auto bg-phalis-action text-phalis-black hover:bg-phalis-action-hover font-extrabold text-sm py-4 px-8 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 disabled:opacity-50"
               >
                  {isLoading ? (
                     <Loader2 className="h-4 w-4 animate-spin text-phalis-black" />
                  ) : (
                     <>
                        <Zap className="h-4 w-4 fill-black" />
                        <span className="whitespace-nowrap">FINALIZAR AGORA</span>
                     </>
                  )}
               </Button>
               {!isValid && missingItems.length > 0 && (
                  <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block z-50 animate-in fade-in duration-200">
                     <div className="bg-gray-900 border border-gray-700 text-white text-xs rounded-xl p-3 shadow-xl max-w-xs">
                        <p className="font-semibold text-yellow-400 mb-1.5">Campos pendentes:</p>
                        <ul className="space-y-1">
                           {missingItems.map((item, i) => (
                              <li key={i} className="flex items-center gap-1.5 text-gray-300">
                                 <span className="h-1.5 w-1.5 rounded-full bg-red-400 flex-shrink-0" />
                                 {item}
                              </li>
                           ))}
                        </ul>
                        <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-gray-900 border-r border-b border-gray-700 transform rotate-45" />
                     </div>
                  </div>
               )}
            </div>
         )}
      </div>
   </div>
);

// ==========================================================
// 1. FORMULÁRIO "UNIDADE"
// ==========================================================
interface FormularioUnidadeProps {
   produto: Product & { options: ProductOptions };
   pedidoParaEditar: Pedido | null;
}

const FormularioUnidade: React.FC<FormularioUnidadeProps> = ({ produto, pedidoParaEditar }) => {
   const router = useRouter();
   const [isLoading, setIsLoading] = useState(false);
   const { user } = useAuth();
   const { addItem, updateItem } = useCart();

   const isEditMode = !!pedidoParaEditar && String(pedidoParaEditar.id).startsWith('cart_');

   const [selections, setSelections] = useState<Selections>({ papel: null, tamanho: null, cores: null, acabamento: null });
   const [isPersonalizado, setIsPersonalizado] = useState(false);
   const [larguraCm, setLarguraCm] = useState('');
   const [alturaCm, setAlturaCm] = useState('');
   const [observacao, setObservacao] = useState('');
   const [quantidade, setQuantidade] = useState('');
   const [precoCusto, setPrecoCusto] = useState('');
   const [precoVenda, setPrecoVenda] = useState('');
   const [precoArte, setPrecoArte] = useState('');
   const [desconto, setDesconto] = useState('');

   const [isPrecoLoading, setIsPrecoLoading] = useState(false);
   const [precoData, setPrecoData] = useState<PrecoData | null>(null);
   const [selectedQtd, setSelectedQtd] = useState<number | null>(null);

   const autoPersonalizado = useMemo(() => produto.options.tamanho.length === 0, [produto]);

   useEffect(() => {
      const d = pedidoParaEditar?.detalhes || pedidoParaEditar?.itens?.[0]?.detalhes;
      if (pedidoParaEditar && d?.type?.toUpperCase() === 'UNIDADE') {
         const detalhes = d as any;
         setSelections(detalhes.opcoes as Selections);
         setObservacao(detalhes.observacao || '');
         setQuantidade(detalhes.preco.quantidade.toString());
         setPrecoCusto(detalhes.preco.precoCusto.toString());
         setPrecoVenda(detalhes.preco.precoVenda.toString());
         setPrecoArte(detalhes.preco.precoArte?.toString() || '');
         setDesconto(detalhes.preco.desconto?.toString() || '');

         if (detalhes.dimensoesPersonalizadas) {
            setIsPersonalizado(true);
            setLarguraCm(detalhes.dimensoesPersonalizadas.larguraCm);
            setAlturaCm(detalhes.dimensoesPersonalizadas.alturaCm);
         } else {
            setIsPersonalizado(autoPersonalizado);
         }
      } else {
         setIsPersonalizado(autoPersonalizado);
         setLarguraCm('');
         setAlturaCm('');
         setSelections({ papel: null, tamanho: autoPersonalizado ? 'personalizado' : null, cores: null, acabamento: null });
         setPrecoData(null);
         setSelectedQtd(null);
      }
   }, [produto, autoPersonalizado, pedidoParaEditar]);

   const handleSelectOption = (clickedGroupId: keyof Selections, optionId: string) => {
      if (selections[clickedGroupId] === optionId) return;
      if (clickedGroupId === 'tamanho') setIsPersonalizado(false);

      const newSelections: Selections = { ...selections };
      const clickedIndex = optionGroupsConfig.findIndex(group => group.id === clickedGroupId);
      newSelections[clickedGroupId] = optionId;

      for (let i = clickedIndex + 1; i < optionGroupsConfig.length; i++) {
         const groupIdToReset = optionGroupsConfig[i].id;
         if (autoPersonalizado && groupIdToReset === 'tamanho') continue;
         newSelections[groupIdToReset] = null;
      }
      setSelections(newSelections);
   };

   const handlePersonalizadoClick = () => {
      if (selections.tamanho === 'personalizado') return;
      setIsPersonalizado(true);
      setSelections(prev => ({ ...prev, tamanho: 'personalizado', cores: null, acabamento: null }));
   };

   const custoTotal = useMemo(() => (Number(precoCusto) || 0), [precoCusto]);
   const vendaTotal = useMemo(() => (Number(precoVenda) || 0), [precoVenda]);
   const total = useMemo(() => {
      const subTotal = vendaTotal + (Number(precoArte) || 0);
      const valorDesconto = Number(desconto) || 0;
      return Math.max(0, subTotal - valorDesconto);
   }, [vendaTotal, precoArte, desconto]);

   const qtdNum = Math.max(1, parseInt(quantidade) || 1);
   const unitario = qtdNum > 0 ? vendaTotal / qtdNum : 0;
   const lucroBruto = Math.max(0, total - custoTotal);
   const margem = total > 0 ? (lucroBruto / total) * 100 : 0;

   const isTamanhoCompleto = useMemo(() => {
      if (!selections.tamanho) return false;
      if (selections.tamanho === 'personalizado') return !!(larguraCm && alturaCm);
      return true;
   }, [selections.tamanho, larguraCm, alturaCm]);

   const isBuilderCompleto = useMemo(() => {
      const othersComplete = !!(selections.papel && selections.cores && selections.acabamento);
      return othersComplete && isTamanhoCompleto;
   }, [selections, isTamanhoCompleto]);

   const isPrecoCompleto = useMemo(() => (Number(quantidade) || 0) > 0 && !!precoCusto && !!precoVenda, [quantidade, precoCusto, precoVenda]);
   const isValid = isBuilderCompleto && isPrecoCompleto;

   const fichaDoPedido = useMemo(() => {
      return optionGroupsConfig.map((groupConfig, index) => {
         const options = produto.options[groupConfig.id];
         let selectedValue = '...';
         const selectedOptionId = selections[groupConfig.id];

         if (groupConfig.id === 'tamanho' && isPersonalizado) {
            selectedValue = `Personalizado (${larguraCm || 'L'}cm x ${alturaCm || 'A'}cm)`;
         } else if (selectedOptionId) {
            const selectedOption = options.find((opt: any) => opt.id === selectedOptionId);
            if (selectedOption) selectedValue = selectedOption.name;
         }
         return { label: `0${index + 1}. ${groupConfig.name.split('. ')[1] || groupConfig.name}`, value: selectedValue };
      });
   }, [produto, selections, isPersonalizado, larguraCm, alturaCm]);

   const handleConsultarPreco = async () => {
      if (!isBuilderCompleto) return;
      setIsPrecoLoading(true); setPrecoData(null); setSelectedQtd(null);

      const papelName = produto.options.papel.find(o => o.id === selections.papel)?.name;
      const tamanhoName = isPersonalizado ? `Personalizado ${larguraCm}x${alturaCm}cm` : produto.options.tamanho.find(o => o.id === selections.tamanho)?.name;
      const coresName = produto.options.cores.find(o => o.id === selections.cores)?.name;
      const acabamentoName = produto.options.acabamento.find(o => o.id === selections.acabamento)?.name;

      try {
         const response = await authenticatedFetch(`/api/consultar-preco/${encodeURIComponent(produto.nome)}`, {
            method: 'POST',
            body: JSON.stringify({ papel: papelName, tamanho: tamanhoName, cores: coresName, acabamento: acabamentoName }),
         });
         if (!response.ok) throw new Error('API de preço falhou');
         const data: PrecoData = await response.json();
         setPrecoData(data);
         setPrecoCusto(data.precoMinimo.toFixed(2));
         setQuantidade(data.qtdMinima.toString());
         setSelectedQtd(data.qtdMinima);
      } catch (error) {
         console.error("Erro ao consultar preço:", error);
      } finally {
         setIsPrecoLoading(false);
      }
   };

   const commitToCart = (shouldFinalize = false) => {
      if (!isValid) return;

      const opcaoNomes: Record<string, string> = {};
      Object.entries(selections).forEach(([key, val]) => {
         if (!val) return;
         if (key === 'tamanho' && val === 'personalizado') {
            opcaoNomes[key] = `${larguraCm}x${alturaCm}cm`;
         } else {
            const opt = (produto.options as any)[key]?.find((o: any) => o.id === val);
            if (opt) opcaoNomes[key] = opt.name;
         }
      });

      const itemData = {
         productId: produto.id,
         itemNome: produto.nome,
         itemImageUrl: produto.imageUrl,
         valor: total,
         detalhes: {
            type: 'unidade',
            opcoes: selections,
            opcaoNomes,
            observacao,
            dimensoesPersonalizadas: isPersonalizado ? { larguraCm, alturaCm } : null,
            preco: {
               quantidade: (Number(quantidade) || 0),
               precoCusto: (Number(precoCusto) || 0),
               precoVenda: (Number(precoVenda) || 0),
               precoArte: (Number(precoArte) || 0),
               desconto: (Number(desconto) || 0),
               total, custoTotal, vendaTotal
            }
         }
      };

      if (isEditMode) {
         updateItem(pedidoParaEditar!.id as string, itemData);
      } else {
         addItem(itemData);
      }

      router.push(shouldFinalize ? '/carrinho' : '/catalogo');
   };

   const missingItems = useMemo(() => {
      const items: string[] = [];
      if (!selections.papel) items.push('Papel / Material');
      if (!isTamanhoCompleto) items.push('Tamanho');
      if (!selections.cores) items.push('Cores');
      if (!selections.acabamento) items.push('Acabamento');
      if (!(Number(quantidade) > 0)) items.push('Quantidade');
      if (!precoCusto) items.push('Preço Custo');
      if (!precoVenda) items.push('Preço Venda');
      return items;
   }, [selections, isTamanhoCompleto, quantidade, precoCusto, precoVenda]);

   const options = produto.options || { papel: [], tamanho: [], cores: [], acabamento: [] };

   return (
      <div className="w-full fhd:h-[calc(100vh-120px)] fhd:max-h-[calc(100vh-120px)] flex flex-col justify-between gap-4">
         {/* GRID PRINCIPAL EM 3 COLUNAS */}
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 flex-1 min-h-0 items-stretch">

            {/* COLUNA ESQUERDA: Card do Produto + Ficha + Tabela Preço */}
            <div className="lg:col-span-1 flex flex-col gap-4 h-full min-h-0 fhd:overflow-y-auto pr-1">
               <ProductInfoCard produto={produto} />
               <OrderSummaryCard ficha={fichaDoPedido} />

               {produto.consultaPreco && !pedidoParaEditar && (
                  <div className="space-y-2 flex-shrink-0">
                     <Button
                        type="button"
                        onClick={handleConsultarPreco}
                        disabled={!isBuilderCompleto || isPrecoLoading}
                        className="w-full bg-phalis-nav hover:bg-phalis-nav-hover text-white text-xs font-bold py-2.5 rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
                     >
                        {isPrecoLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                        Consultar Preço na Tabela
                     </Button>
                     {isPrecoLoading && (
                        <div className="flex justify-center items-center p-3 bg-phalis-black rounded-xl border border-gray-800">
                           <Loader2 className="h-5 w-5 animate-spin text-phalis-action" />
                        </div>
                     )}
                     {precoData && (
                        <div className="bg-phalis-black rounded-2xl p-3 border border-gray-800 shadow-xl max-h-56 overflow-y-auto animate-in fade-in duration-300">
                           <h4 className="text-xs font-bold text-white mb-2 flex items-center justify-between">
                              <span>Preços - {precoData.nomeProduto}</span>
                              <span className="text-[10px] text-gray-400 font-normal">Clique para aplicar</span>
                           </h4>
                           <Table className="text-white text-xs">
                              <TableHeader>
                                 <TableRow className="border-gray-800">
                                    <TableHead className="text-gray-400 text-xs h-7">Qtd</TableHead>
                                    <TableHead className="text-gray-400 text-right text-xs h-7">Preço Custo</TableHead>
                                 </TableRow>
                              </TableHeader>
                              <TableBody>
                                 {precoData.precos.map((item) => (
                                    <TableRow
                                       key={item.qtd}
                                       className={cn(
                                          "cursor-pointer hover:bg-phalis-gray/50 border-gray-800/50 transition-colors h-7",
                                          selectedQtd === item.qtd && "bg-phalis-action/20 text-phalis-action font-bold"
                                       )}
                                       onClick={() => {
                                          setQuantidade(item.qtd.toString());
                                          setPrecoCusto(item.preco.toFixed(2));
                                          setPrecoVenda('');
                                          setSelectedQtd(item.qtd);
                                       }}
                                    >
                                       <TableCell className="py-1">{item.qtd} un</TableCell>
                                       <TableCell className="text-right py-1 font-mono">R$ {item.preco.toFixed(2)}</TableCell>
                                    </TableRow>
                                 ))}
                              </TableBody>
                           </Table>
                        </div>
                     )}
                  </div>
               )}
            </div>

            {/* COLUNA MEIO & DIREITA: Opções + Textarea + Precificação */}
            <div className="lg:col-span-2 flex flex-col gap-4 h-full min-h-0">

               {/* 4 Colunas de Opções Técnicas */}
               <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-phalis-black/60 p-4 rounded-2xl border border-gray-800 shadow-xl flex-shrink-0">

                  {/* 01. Papel */}
                  <div className="space-y-2">
                     <h3 className="text-xs font-bold text-white uppercase tracking-wider">{optionGroupsConfig[0].name}</h3>
                     <div className="space-y-1.5">
                        {options.papel.map((option) => (
                           <Button
                              key={option.id}
                              type="button"
                              onClick={() => handleSelectOption('papel', option.id)}
                              className={`w-full h-auto text-wrap py-2.5 px-3 justify-center text-center text-xs font-bold rounded-xl transition-all ${selections.papel === option.id
                                 ? 'bg-phalis-danger text-white hover:bg-red-700 shadow-md ring-2 ring-red-400'
                                 : 'bg-phalis-gray text-white hover:bg-gray-700'
                                 }`}
                           >
                              {option.name}
                           </Button>
                        ))}
                     </div>
                  </div>

                  {/* 02. Tamanho */}
                  <div className="space-y-2">
                     <h3 className="text-xs font-bold text-white uppercase tracking-wider">{optionGroupsConfig[1].name}</h3>
                     <div className="space-y-1.5">
                        {options.tamanho.map((option) => (
                           <Button
                              key={option.id}
                              type="button"
                              onClick={() => handleSelectOption('tamanho', option.id)}
                              disabled={!selections.papel}
                              className={`w-full h-auto text-wrap py-2.5 px-3 justify-center text-center text-xs font-bold rounded-xl transition-all ${selections.tamanho === option.id
                                 ? 'bg-phalis-danger text-white hover:bg-red-700 shadow-md ring-2 ring-red-400'
                                 : 'bg-phalis-gray text-white hover:bg-gray-700'
                                 } disabled:opacity-30`}
                           >
                              {option.name}
                           </Button>
                        ))}

                        {options.tamanho.length > 0 && (
                           <Button
                              type="button"
                              onClick={handlePersonalizadoClick}
                              disabled={!selections.papel}
                              className={`w-full h-auto text-wrap py-2.5 px-3 justify-center text-center text-xs font-bold rounded-xl transition-all ${selections.tamanho === 'personalizado'
                                 ? 'bg-phalis-danger text-white hover:bg-red-700 shadow-md ring-2 ring-red-400'
                                 : 'bg-phalis-gray text-white hover:bg-gray-700'
                                 } disabled:opacity-30`}
                           >
                              Personalizada
                           </Button>
                        )}

                        {isPersonalizado && (
                           <div className="pt-1 animate-in fade-in duration-200">
                              <div className="bg-phalis-gray rounded-xl p-2.5 space-y-2 border border-gray-700">
                                 <SuffixInput
                                    suffix="cm"
                                    type="number"
                                    placeholder="Largura (cm) *"
                                    value={larguraCm}
                                    onChange={e => setLarguraCm(e.target.value)}
                                    disabled={!selections.papel}
                                    className="bg-phalis-dark border-0 h-8 text-xs font-bold"
                                 />
                                 <SuffixInput
                                    suffix="cm"
                                    type="number"
                                    placeholder="Altura (cm) *"
                                    value={alturaCm}
                                    onChange={e => setAlturaCm(e.target.value)}
                                    disabled={!selections.papel}
                                    className="bg-phalis-dark border-0 h-8 text-xs font-bold"
                                 />
                              </div>
                           </div>
                        )}
                     </div>
                  </div>

                  {/* 03. Cores */}
                  <div className="space-y-2">
                     <h3 className="text-xs font-bold text-white uppercase tracking-wider">{optionGroupsConfig[2].name}</h3>
                     <div className="space-y-1.5">
                        {options.cores.map((option) => (
                           <Button
                              key={option.id}
                              type="button"
                              onClick={() => handleSelectOption('cores', option.id)}
                              disabled={!isTamanhoCompleto}
                              className={`w-full h-auto text-wrap py-2.5 px-3 justify-center text-center text-xs font-bold rounded-xl transition-all ${selections.cores === option.id
                                 ? 'bg-phalis-danger text-white hover:bg-red-700 shadow-md ring-2 ring-red-400'
                                 : 'bg-phalis-gray text-white hover:bg-gray-700'
                                 } disabled:opacity-30`}
                           >
                              {option.name}
                           </Button>
                        ))}
                     </div>
                  </div>

                  {/* 04. Acabamento */}
                  <div className="space-y-2">
                     <h3 className="text-xs font-bold text-white uppercase tracking-wider">{optionGroupsConfig[3].name}</h3>
                     <div className="space-y-1.5">
                        {options.acabamento.map((option) => (
                           <Button
                              key={option.id}
                              type="button"
                              onClick={() => handleSelectOption('acabamento', option.id)}
                              disabled={!selections.cores}
                              className={`w-full h-auto text-wrap py-2.5 px-3 justify-center text-center text-xs font-bold rounded-xl transition-all ${selections.acabamento === option.id
                                 ? 'bg-phalis-danger text-white hover:bg-red-700 shadow-md ring-2 ring-red-400'
                                 : 'bg-phalis-gray text-white hover:bg-gray-700'
                                 } disabled:opacity-30`}
                           >
                              {option.name}
                           </Button>
                        ))}
                     </div>
                  </div>

               </div>

               {/* Observações e Painel Financeiro Redesenhado */}
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0">

                  {/* Observações com Textarea Flexível */}
                  <div className="lg:col-span-7 bg-phalis-black/60 p-4 rounded-2xl border border-gray-800 flex flex-col shadow-xl min-h-0">
                     <Label className="text-gray-200 text-xs font-bold uppercase tracking-wider block mb-2 flex-shrink-0">
                        Observações / Detalhes de Produção
                     </Label>
                     <Textarea
                        placeholder="Digite informações complementares sobre o produto, tipo de corte, acabamento ou entrega..."
                        className="flex-1 min-h-[140px] h-full bg-phalis-gray border-0 text-sm rounded-xl focus:ring-1 focus:ring-phalis-action resize-none"
                        value={observacao}
                        onChange={(e) => setObservacao(e.target.value)}
                     />
                     <span className="text-[11px] text-gray-500 mt-2 block flex-shrink-0">Texto impresso no orçamento e na ordem de serviço.</span>
                  </div>

                  {/* PAINEL FINANCEIRO CONSOLIDADO */}
                  <div className="lg:col-span-5 bg-phalis-black rounded-2xl p-4 border border-gray-800 shadow-xl flex flex-col justify-between min-h-0">

                     {/* Cabeçalho */}
                     <div className="border-b border-gray-800 pb-2.5 flex-shrink-0">
                        <h3 className="text-xs font-black text-white uppercase tracking-wider">Precificação & Valores</h3>
                        <span className="text-[10px] text-gray-400 block font-medium">Cobrança por Unidade</span>
                     </div>

                     {/* Sub-blocos */}
                     <div className="space-y-2.5 my-auto">

                        {/* Bloco 1: Custos */}
                        <div className="bg-[#181818] p-2.5 rounded-xl border border-gray-800/90 space-y-1.5">
                           <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                                 <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                                 Custo de Produção
                              </span>
                              <span className="text-xs text-gray-300 font-mono">
                                 Custo: <strong className="text-red-400 font-bold text-xs">R$ {custoTotal.toFixed(2)}</strong>
                              </span>
                           </div>

                           <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-0.5">
                                 <Label htmlFor="qtd" className="text-[10px] text-gray-400 font-semibold">Quantidade *</Label>
                                 <Input
                                    id="qtd"
                                    type="number"
                                    value={quantidade}
                                    onChange={e => setQuantidade(e.target.value)}
                                    className="bg-[#242424] border-gray-700 h-8 text-xs font-bold text-white"
                                    min={1}
                                    onWheel={(e) => e.currentTarget.blur()}
                                    onKeyDown={(e) => { if (e.key === '-' || e.key === 'e' || e.key === 'E') e.preventDefault(); }}
                                 />
                              </div>
                              <div className="space-y-0.5">
                                 <Label htmlFor="custo" className="text-[10px] text-gray-400 font-semibold">Preço Custo Total *</Label>
                                 <MoneyInput
                                    id="custo"
                                    value={precoCusto}
                                    onChange={e => setPrecoCusto(e.target.value)}
                                    className="bg-[#242424] border-gray-700 h-8 text-xs font-bold text-red-400"
                                 />
                              </div>
                           </div>
                        </div>

                        {/* Bloco 2: Venda & Desconto */}
                        <div className="bg-[#181818] p-2.5 rounded-xl border border-gray-800/90 space-y-1.5">
                           <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                                 <span className="w-1.5 h-1.5 rounded-full bg-phalis-action"></span>
                                 Fluxo de Venda
                              </span>
                           </div>

                           <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-0.5">
                                 <Label htmlFor="venda" className="text-[10px] text-gray-400 font-semibold">Preço Venda Total *</Label>
                                 <MoneyInput
                                    id="venda"
                                    value={precoVenda}
                                    onChange={e => setPrecoVenda(e.target.value)}
                                    className="bg-[#242424] border-gray-700 h-8 text-xs font-bold text-phalis-action"
                                 />
                              </div>
                              <div className="space-y-0.5">
                                 <Label htmlFor="desconto" className="text-[10px] text-gray-400 font-semibold">Desconto (Op.)</Label>
                                 <MoneyInput
                                    id="desconto"
                                    value={desconto}
                                    onChange={e => setDesconto(e.target.value)}
                                    className="bg-[#242424] border-gray-700 h-8 text-xs text-yellow-400"
                                    placeholder="0,00"
                                 />
                              </div>
                           </div>
                        </div>

                        {/* Bloco 3: Finalização (Arte Opcional) */}
                        <div className="bg-[#181818] px-3 py-2 rounded-xl border border-gray-800/90 flex items-center justify-between gap-3">
                           <Label htmlFor="arte" className="text-[10px] 2xl:text-[11px] text-gray-400 font-semibold flex items-center gap-1.5 whitespace-nowrap">
                              Taxa de Criação / Ajuste de Arte:
                           </Label>
                           <div className="w-24 2xl:w-28 flex-shrink-0">
                              <MoneyInput
                                 id="arte"
                                 value={precoArte}
                                 onChange={e => setPrecoArte(e.target.value)}
                                 className="bg-[#242424] border-gray-700 h-7 text-xs text-blue-400"
                                 placeholder="0,00"
                              />
                           </div>
                        </div>

                     </div>

                     {/* Bloco 4: Cartão de Rentabilidade e Fechamento */}
                     <div className="bg-gradient-to-r from-[#121212] via-[#161616] to-[#121212] p-2 2xl:p-2.5 rounded-xl border border-gray-800 flex items-center justify-between gap-1.5 2xl:gap-2 text-xs flex-shrink-0">
                        <div className="min-w-0">
                           <span className="text-[9px] 2xl:text-[10px] text-gray-400 block font-semibold uppercase tracking-wider whitespace-nowrap">Subtotal:</span>
                           <strong className="text-phalis-action text-[11px] 2xl:text-sm font-mono block whitespace-nowrap leading-tight">
                              R$ {vendaTotal.toFixed(2)}
                           </strong>
                        </div>
                        <div className="border-l border-gray-800/80 pl-2 2xl:pl-3 min-w-0">
                           <span className="text-[9px] 2xl:text-[10px] text-gray-400 block font-semibold uppercase tracking-wider whitespace-nowrap">Unitário:</span>
                           <strong className="text-gray-200 text-[11px] 2xl:text-sm font-mono block whitespace-nowrap leading-tight">
                              R$ {unitario.toFixed(2)} <span className="text-[9px] 2xl:text-xs font-sans text-gray-400">/ un</span>
                           </strong>
                        </div>
                        <div className="text-right border-l border-gray-800/80 pl-2 2xl:pl-3 min-w-0">
                           <span className="text-[9px] 2xl:text-[10px] text-gray-400 block font-semibold flex items-center justify-end gap-1 uppercase tracking-wider whitespace-nowrap">
                              <TrendingUp className="h-2.5 w-2.5 2xl:h-3 2xl:w-3 text-emerald-400 flex-shrink-0" /> Margem<span className="hidden 2xl:inline"> Estimada</span>:
                           </span>
                           <span className={cn("text-[11px] 2xl:text-sm font-black whitespace-nowrap leading-tight block", margem >= 30 ? 'text-emerald-400' : 'text-yellow-400')}>
                              {margem.toFixed(1)}% <span className="text-[9px] 2xl:text-xs font-semibold text-gray-300 block 2xl:inline whitespace-nowrap">(Lucro: R$ {lucroBruto.toFixed(2)})</span>
                           </span>
                        </div>
                     </div>

                  </div>

               </div>

            </div>

         </div>

         {/* RODAPÉ ANCORADO */}
         <OrderFooter
            total={total}
            isValid={isValid}
            isLoading={isLoading}
            onConfirm={() => commitToCart(false)}
            onFinalize={isEditMode ? undefined : () => commitToCart(true)}
            labelConfirm={isEditMode ? "ATUALIZAR ITEM" : "ADICIONAR AO CARRINHO"}
            missingItems={missingItems}
         />
      </div>
   );
};

// ==========================================================
// 2. FORMULÁRIO "METRO" (M²)
// ==========================================================
interface FormularioMetroProps {
   produto: Product & { options: ProductOptions };
   pedidoParaEditar: Pedido | null;
}

const FormularioMetro: React.FC<FormularioMetroProps> = ({ produto, pedidoParaEditar }) => {
   const router = useRouter();
   const [isLoading, setIsLoading] = useState(false);
   const { user } = useAuth();
   const { addItem, updateItem } = useCart();
   const isEditMode = !!pedidoParaEditar && String(pedidoParaEditar.id).startsWith('cart_');

   const [selections, setSelections] = useState<Selections>({ papel: null, tamanho: null, cores: null, acabamento: null });
   const [observacoes, setObservacoes] = useState('');
   const [largura, setLargura] = useState('');
   const [altura, setAltura] = useState('');
   const [valorArte, setValorArte] = useState('');
   const [m2Custo, setM2Custo] = useState('');
   const [m2Venda, setM2Venda] = useState('');
   const [desconto, setDesconto] = useState('');

   const autoPersonalizado = useMemo(() => produto.options.tamanho.length === 0, [produto]);

   useEffect(() => {
      const d = pedidoParaEditar?.detalhes || pedidoParaEditar?.itens?.[0]?.detalhes;
      if (pedidoParaEditar && d?.type?.toUpperCase() === 'METRO') {
         const detalhes = d as any;
         setSelections(detalhes.opcoes as Selections);
         setObservacoes(detalhes.observacao || '');
         setLargura(detalhes.preco.largura?.toString() || '');
         setAltura(detalhes.preco.altura?.toString() || '');
         setM2Custo(detalhes.preco.m2Custo?.toString() || '');
         setM2Venda(detalhes.preco.m2Venda?.toString() || '');
         setValorArte(detalhes.preco.valorArte?.toString() || '');
         setDesconto(detalhes.preco.desconto?.toString() || '');
      } else {
         setSelections({ papel: null, tamanho: autoPersonalizado ? 'personalizado' : null, cores: null, acabamento: null });
         setLargura('');
         setAltura('');
         setM2Custo(produto.defaultM2Custo?.toString() || '');
         setM2Venda(produto.defaultM2Venda?.toString() || '');
      }
   }, [produto, autoPersonalizado, pedidoParaEditar]);

   const handleSelectOption = (clickedGroupId: keyof Selections, optionId: string) => {
      if (selections[clickedGroupId] === optionId) return;
      const newSelections: Selections = { ...selections };
      const clickedIndex = optionGroupsConfig.findIndex(group => group.id === clickedGroupId);
      newSelections[clickedGroupId] = optionId;
      for (let i = clickedIndex + 1; i < optionGroupsConfig.length; i++) {
         const groupIdToReset = optionGroupsConfig[i].id;
         if (autoPersonalizado && groupIdToReset === 'tamanho') continue;
         newSelections[groupIdToReset] = null;
      }
      setSelections(newSelections);
   };

   const metrosQuadrados = useMemo(() => ((parseFloat(largura) || 0) * (parseFloat(altura) || 0)), [largura, altura]);
   const valorTotalCusto = useMemo(() => metrosQuadrados * (parseFloat(m2Custo) || 0), [metrosQuadrados, m2Custo]);
   const valorTotalVenda = useMemo(() => metrosQuadrados * (parseFloat(m2Venda) || 0), [metrosQuadrados, m2Venda]);
   const total = useMemo(() => Math.max(0, (valorTotalVenda + (Number(valorArte) || 0)) - (Number(desconto) || 0)), [valorTotalVenda, valorArte, desconto]);

   const lucroBruto = Math.max(0, total - valorTotalCusto);
   const margem = total > 0 ? (lucroBruto / total) * 100 : 0;

   const isBuilderCompleto = useMemo(() => {
      const othersComplete = !!(selections.papel && selections.cores && selections.acabamento);
      if (!othersComplete) return false;
      return !!(largura && altura);
   }, [selections, largura, altura]);

   const isPrecoCompleto = useMemo(() => !!(m2Custo && m2Venda), [m2Custo, m2Venda]);
   const isValid = isBuilderCompleto && isPrecoCompleto;

   const fichaDoPedido = useMemo(() => {
      return optionGroupsConfig.map((groupConfig, index) => {
         const options = produto.options[groupConfig.id];
         let selectedValue = '...';
         const selectedOptionId = selections[groupConfig.id];
         if (groupConfig.id === 'tamanho') {
            selectedValue = (largura && altura)
               ? `${largura}m x ${altura}m (${metrosQuadrados.toFixed(2)}m²)`
               : (selectedOptionId ? (options.find((opt: any) => opt.id === selectedOptionId)?.name || '...') : 'Dimensões pendentes');
         } else if (selectedOptionId) {
            const selectedOption = options.find((opt: any) => opt.id === selectedOptionId);
            if (selectedOption) selectedValue = selectedOption.name;
         }
         return { label: `0${index + 1}. ${groupConfig.name.split('. ')[1] || groupConfig.name}`, value: selectedValue };
      });
   }, [produto, selections, largura, altura, metrosQuadrados]);

   const commitToCart = (shouldFinalize = false) => {
      if (!isValid) return;

      const opcaoNomes: Record<string, string> = {};
      Object.entries(selections).forEach(([key, val]) => {
         if (!val) return;
         if (key === 'tamanho') {
            opcaoNomes[key] = `${largura}x${altura}m`;
         } else {
            const opt = (produto.options as any)[key]?.find((o: any) => o.id === val);
            if (opt) opcaoNomes[key] = opt.name;
         }
      });

      const itemData = {
         productId: produto.id,
         itemNome: produto.nome,
         itemImageUrl: produto.imageUrl,
         valor: total,
         detalhes: {
            type: 'metro',
            opcoes: selections,
            opcaoNomes,
            observacao: observacoes,
            preco: {
               largura: (Number(largura) || 0),
               altura: (Number(altura) || 0),
               valorArte: (Number(valorArte) || 0),
               m2Custo: (Number(m2Custo) || 0),
               m2Venda: (Number(m2Venda) || 0),
               desconto: (Number(desconto) || 0),
               total,
               valorTotalCusto,
               valorTotalVenda
            }
         }
      };

      if (isEditMode) {
         updateItem(pedidoParaEditar!.id as string, itemData);
      } else {
         addItem(itemData);
      }

      router.push(shouldFinalize ? '/carrinho' : '/catalogo');
   };

   const missingItems = useMemo(() => {
      const items: string[] = [];
      if (!selections.papel) items.push('Papel / Material');
      if (!largura || !altura) items.push('Dimensões (Largura/Altura)');
      if (!selections.cores) items.push('Cores');
      if (!selections.acabamento) items.push('Acabamento');
      if (!m2Custo) items.push('Valor m² de Custo');
      if (!m2Venda) items.push('Valor m² de Venda');
      return items;
   }, [selections, largura, altura, m2Custo, m2Venda]);

   const options = produto.options || { papel: [], tamanho: [], cores: [], acabamento: [] };

   return (
      <div className="w-full fhd:h-[calc(100vh-120px)] fhd:max-h-[calc(100vh-120px)] flex flex-col justify-between gap-4">
         {/* GRID PRINCIPAL EM 3 COLUNAS */}
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 flex-1 min-h-0 items-stretch">

            {/* COLUNA ESQUERDA: Card do Produto + Ficha */}
            <div className="lg:col-span-1 flex flex-col gap-4 h-full min-h-0 fhd:overflow-y-auto pr-1">
               <ProductInfoCard produto={produto} />
               <OrderSummaryCard ficha={fichaDoPedido} />
            </div>

            {/* COLUNA MEIO & DIREITA: Opções + Textarea + Precificação */}
            <div className="lg:col-span-2 flex flex-col gap-4 h-full min-h-0">

               {/* 4 Colunas de Opções Técnicas */}
               <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-phalis-black/60 p-4 rounded-2xl border border-gray-800 shadow-xl flex-shrink-0">

                  {/* 01. Papel */}
                  <div className="space-y-2">
                     <h3 className="text-xs font-bold text-white uppercase tracking-wider">{optionGroupsConfig[0].name}</h3>
                     <div className="space-y-1.5">
                        {options.papel.map((option) => (
                           <Button
                              key={option.id}
                              type="button"
                              onClick={() => handleSelectOption('papel', option.id)}
                              className={`w-full h-auto text-wrap py-2.5 px-3 justify-center text-center text-xs font-bold rounded-xl transition-all ${selections.papel === option.id
                                 ? 'bg-phalis-danger text-white hover:bg-red-700 shadow-md ring-2 ring-red-400'
                                 : 'bg-phalis-gray text-white hover:bg-gray-700'
                                 }`}
                           >
                              {option.name}
                           </Button>
                        ))}
                     </div>
                  </div>

                  {/* 02. Tamanho / Dimensões em Metros */}
                  <div className="space-y-2">
                     <h3 className="text-xs font-bold text-white uppercase tracking-wider">{optionGroupsConfig[1].name}</h3>
                     <div className="space-y-1.5">
                        {options.tamanho.map((option) => (
                           <Button
                              key={option.id}
                              type="button"
                              onClick={() => handleSelectOption('tamanho', option.id)}
                              disabled={!selections.papel}
                              className={`w-full h-auto text-wrap py-2.5 px-3 justify-center text-center text-xs font-bold rounded-xl transition-all ${selections.tamanho === option.id
                                 ? 'bg-phalis-danger text-white hover:bg-red-700 shadow-md ring-2 ring-red-400'
                                 : 'bg-phalis-gray text-white hover:bg-gray-700'
                                 } disabled:opacity-30`}
                           >
                              {option.name}
                           </Button>
                        ))}

                        <div className="pt-1 animate-in fade-in duration-200">
                           <div className="bg-phalis-gray rounded-xl p-2.5 space-y-2 border border-gray-700">
                              <SuffixInput
                                 id="largura"
                                 suffix="m"
                                 type="number"
                                 step="0.01"
                                 placeholder="Largura (m) *"
                                 value={largura}
                                 onChange={e => setLargura(e.target.value)}
                                 disabled={!selections.papel}
                                 className="bg-phalis-dark border-0 h-8 text-xs font-bold"
                              />
                              <SuffixInput
                                 id="altura"
                                 suffix="m"
                                 type="number"
                                 step="0.01"
                                 placeholder="Altura (m) *"
                                 value={altura}
                                 onChange={e => setAltura(e.target.value)}
                                 disabled={!selections.papel}
                                 className="bg-phalis-dark border-0 h-8 text-xs font-bold"
                              />
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* 03. Cores */}
                  <div className="space-y-2">
                     <h3 className="text-xs font-bold text-white uppercase tracking-wider">{optionGroupsConfig[2].name}</h3>
                     <div className="space-y-1.5">
                        {options.cores.map((option) => (
                           <Button
                              key={option.id}
                              type="button"
                              onClick={() => handleSelectOption('cores', option.id)}
                              disabled={!selections.papel || !(largura && altura)}
                              className={`w-full h-auto text-wrap py-2.5 px-3 justify-center text-center text-xs font-bold rounded-xl transition-all ${selections.cores === option.id
                                 ? 'bg-phalis-danger text-white hover:bg-red-700 shadow-md ring-2 ring-red-400'
                                 : 'bg-phalis-gray text-white hover:bg-gray-700'
                                 } disabled:opacity-30`}
                           >
                              {option.name}
                           </Button>
                        ))}
                     </div>
                  </div>

                  {/* 04. Acabamento */}
                  <div className="space-y-2">
                     <h3 className="text-xs font-bold text-white uppercase tracking-wider">{optionGroupsConfig[3].name}</h3>
                     <div className="space-y-1.5">
                        {options.acabamento.map((option) => (
                           <Button
                              key={option.id}
                              type="button"
                              onClick={() => handleSelectOption('acabamento', option.id)}
                              disabled={!selections.cores}
                              className={`w-full h-auto text-wrap py-2.5 px-3 justify-center text-center text-xs font-bold rounded-xl transition-all ${selections.acabamento === option.id
                                 ? 'bg-phalis-danger text-white hover:bg-red-700 shadow-md ring-2 ring-red-400'
                                 : 'bg-phalis-gray text-white hover:bg-gray-700'
                                 } disabled:opacity-30`}
                           >
                              {option.name}
                           </Button>
                        ))}
                     </div>
                  </div>

               </div>

               {/* Observações e Painel Financeiro Redesenhado */}
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0">

                  {/* Observações com Textarea Flexível */}
                  <div className="lg:col-span-7 bg-phalis-black/60 p-4 rounded-2xl border border-gray-800 flex flex-col shadow-xl min-h-0">
                     <Label className="text-gray-200 text-xs font-bold uppercase tracking-wider block mb-2 flex-shrink-0">
                        Observações / Detalhes de Produção
                     </Label>
                     <Textarea
                        placeholder="Digite informações e instruções técnicas complementares sobre fechamento de arquivo, faca de corte, acabamento ou entrega..."
                        className="flex-1 min-h-[140px] h-full bg-phalis-gray border-0 text-sm rounded-xl focus:ring-1 focus:ring-phalis-action resize-none"
                        value={observacoes}
                        onChange={(e) => setObservacoes(e.target.value)}
                     />
                     <span className="text-[11px] text-gray-500 mt-2 block flex-shrink-0">Texto impresso no orçamento e na ordem de serviço.</span>
                  </div>

                  {/* PAINEL FINANCEIRO CONSOLIDADO (METRO) */}
                  <div className="lg:col-span-5 bg-phalis-black rounded-2xl p-4 border border-gray-800 shadow-xl flex flex-col justify-between min-h-0">

                     {/* Cabeçalho */}
                     <div className="border-b border-gray-800 pb-2.5 flex-shrink-0">
                        <h3 className="text-xs font-black text-white uppercase tracking-wider">Precificação & Valores</h3>
                        <span className="text-[10px] text-gray-400 block font-medium">Cobrança por Metro Quadrado (m²)</span>
                     </div>

                     {/* Sub-blocos */}
                     <div className="space-y-2.5 my-auto">

                        {/* Bloco 1: Custos */}
                        <div className="bg-[#181818] p-2.5 rounded-xl border border-gray-800/90 space-y-1.5">
                           <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                                 <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                                 Custo de Fabricação
                              </span>
                              <span className="text-xs text-gray-300 font-mono">
                                 Custo: <strong className="text-red-400 font-bold text-xs">R$ {valorTotalCusto.toFixed(2)}</strong>
                              </span>
                           </div>

                           <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-0.5">
                                 <Label className="text-[10px] text-gray-400 font-semibold">Valor do m² Custo *</Label>
                                 <MoneyInput
                                    value={m2Custo}
                                    onChange={e => setM2Custo(e.target.value)}
                                    className="bg-[#242424] border-gray-700 h-8 text-xs font-bold text-red-400"
                                 />
                              </div>
                              <div className="space-y-0.5">
                                 <Label className="text-[10px] text-gray-400 font-semibold">Área Calculada</Label>
                                 <div className="bg-[#242424] border border-gray-700 rounded-md h-8 px-2 flex items-center text-xs text-white font-mono font-bold">
                                    {metrosQuadrados.toFixed(2)} m²
                                 </div>
                              </div>
                           </div>
                        </div>

                        {/* Bloco 2: Venda & Desconto */}
                        <div className="bg-[#181818] p-2.5 rounded-xl border border-gray-800/90 space-y-1.5">
                           <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                                 <span className="w-1.5 h-1.5 rounded-full bg-phalis-action"></span>
                                 Venda ao Cliente
                              </span>
                           </div>

                           <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-0.5">
                                 <Label className="text-[10px] text-gray-400 font-semibold">Valor do m² Venda *</Label>
                                 <MoneyInput
                                    value={m2Venda}
                                    onChange={e => setM2Venda(e.target.value)}
                                    className="bg-[#242424] border-gray-700 h-8 text-xs font-bold text-phalis-action"
                                 />
                              </div>
                              <div className="space-y-0.5">
                                 <Label className="text-[10px] text-gray-400 font-semibold">Desconto (Op.)</Label>
                                 <MoneyInput
                                    value={desconto}
                                    onChange={e => setDesconto(e.target.value)}
                                    className="bg-[#242424] border-gray-700 h-8 text-xs text-yellow-400"
                                    placeholder="0,00"
                                 />
                              </div>
                           </div>
                        </div>

                        {/* Bloco 3: Finalização (Arte Opcional) */}
                        <div className="bg-[#181818] px-3 py-2 rounded-xl border border-gray-800/90 flex items-center justify-between gap-3">
                           <Label className="text-[10px] 2xl:text-[11px] text-gray-400 font-semibold flex items-center gap-1.5 whitespace-nowrap">
                              Taxa de Criação / Ajuste de Arte:
                           </Label>
                           <div className="w-24 2xl:w-28 flex-shrink-0">
                              <MoneyInput
                                 value={valorArte}
                                 onChange={e => setValorArte(e.target.value)}
                                 className="bg-[#242424] border-gray-700 h-7 text-xs text-blue-400"
                                 placeholder="0,00"
                              />
                           </div>
                        </div>

                     </div>

                     {/* Bloco 4: Cartão de Rentabilidade e Fechamento */}
                     <div className="bg-gradient-to-r from-[#121212] via-[#161616] to-[#121212] p-2 2xl:p-2.5 rounded-xl border border-gray-800 flex items-center justify-between gap-1.5 2xl:gap-2 text-xs flex-shrink-0">
                        <div className="min-w-0">
                           <span className="text-[9px] 2xl:text-[10px] text-gray-400 block font-semibold uppercase tracking-wider whitespace-nowrap">Subtotal:</span>
                           <strong className="text-phalis-action text-[11px] 2xl:text-sm font-mono block whitespace-nowrap leading-tight">
                              R$ {valorTotalVenda.toFixed(2)}
                           </strong>
                        </div>
                        <div className="border-l border-gray-800/80 pl-2 2xl:pl-3 min-w-0">
                           <span className="text-[9px] 2xl:text-[10px] text-gray-400 block font-semibold uppercase tracking-wider whitespace-nowrap">Área Total:</span>
                           <strong className="text-gray-200 text-[11px] 2xl:text-sm font-mono block whitespace-nowrap leading-tight">
                              {metrosQuadrados.toFixed(2)} m²
                           </strong>
                        </div>
                        <div className="text-right border-l border-gray-800/80 pl-2 2xl:pl-3 min-w-0">
                           <span className="text-[9px] 2xl:text-[10px] text-gray-400 block font-semibold flex items-center justify-end gap-1 uppercase tracking-wider whitespace-nowrap">
                              <TrendingUp className="h-2.5 w-2.5 2xl:h-3 2xl:w-3 text-emerald-400 flex-shrink-0" /> Margem<span className="hidden 2xl:inline"> Estimada</span>:
                           </span>
                           <span className={cn("text-[11px] 2xl:text-sm font-black whitespace-nowrap leading-tight block", margem >= 30 ? 'text-emerald-400' : 'text-yellow-400')}>
                              {margem.toFixed(1)}% <span className="text-[9px] 2xl:text-xs font-semibold text-gray-300 block 2xl:inline whitespace-nowrap">(Lucro: R$ {lucroBruto.toFixed(2)})</span>
                           </span>
                        </div>
                     </div>

                  </div>

               </div>

            </div>

         </div>

         {/* RODAPÉ ANCORADO */}
         <OrderFooter
            total={total}
            isValid={isValid}
            isLoading={isLoading}
            onConfirm={() => commitToCart(false)}
            onFinalize={isEditMode ? undefined : () => commitToCart(true)}
            labelConfirm={isEditMode ? "ATUALIZAR ITEM" : "ADICIONAR AO CARRINHO"}
            missingItems={missingItems}
         />
      </div>
   );
};

// ==========================================================
// 3. FORMULÁRIO "SERVIÇO"
// ==========================================================
interface FormularioServicoProps {
   produto: Product;
   pedidoParaEditar: Pedido | null;
}

const FormularioServico: React.FC<FormularioServicoProps> = ({ produto, pedidoParaEditar }) => {
   const router = useRouter();
   const [isLoading, setIsLoading] = useState(false);
   const { user } = useAuth();
   const { addItem, updateItem } = useCart();
   const isEditMode = !!pedidoParaEditar && String(pedidoParaEditar.id).startsWith('cart_');

   const [observacao, setObservacao] = useState('');
   const [valorVenda, setValorVenda] = useState('');
   const [desconto, setDesconto] = useState('');

   useEffect(() => {
      const d = pedidoParaEditar?.detalhes || pedidoParaEditar?.itens?.[0]?.detalhes;
      if (pedidoParaEditar && d?.type?.toUpperCase() === 'SERVICO') {
         const detalhes = d as any;
         setObservacao(detalhes.observacao || '');
         setValorVenda(detalhes.preco.valorVenda?.toString() || '');
         setDesconto(detalhes.preco.desconto?.toString() || '');
      }
   }, [pedidoParaEditar]);

   const isFormCompleto = useMemo(() => !!(observacao && valorVenda), [observacao, valorVenda]);
   const total = useMemo(() => Math.max(0, (Number(valorVenda) || 0) - (Number(desconto) || 0)), [valorVenda, desconto]);

   const commitToCart = (shouldFinalize = false) => {
      if (!isFormCompleto) return;

      const itemData = {
         productId: produto.id,
         itemNome: produto.nome,
         itemImageUrl: produto.imageUrl,
         valor: total,
         detalhes: {
            type: 'servico',
            observacao,
            preco: {
               valorVenda: (Number(valorVenda) || 0),
               desconto: (Number(desconto) || 0),
               total
            }
         }
      };

      if (isEditMode) {
         updateItem(pedidoParaEditar!.id as string, itemData);
      } else {
         addItem(itemData);
      }

      router.push(shouldFinalize ? '/carrinho' : '/catalogo');
   };

   const missingItems = useMemo(() => {
      const items: string[] = [];
      if (!observacao) items.push('Descrição / Observações');
      if (!valorVenda) items.push('Valor Total da Venda');
      return items;
   }, [observacao, valorVenda]);

   return (
      <div className="w-full fhd:h-[calc(100vh-120px)] fhd:max-h-[calc(100vh-120px)] flex flex-col justify-between gap-4">
         {/* GRID PRINCIPAL EM 3 COLUNAS */}
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 flex-1 min-h-0 items-stretch">

            {/* COLUNA ESQUERDA: Card do Produto + Informações */}
            <div className="lg:col-span-1 flex flex-col gap-4 h-full min-h-0 fhd:overflow-y-auto pr-1">
               <ProductInfoCard produto={produto} />
               <div className="bg-phalis-black rounded-2xl p-4 border border-gray-800 shadow-xl space-y-2 flex-shrink-0">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Ficha do Pedido:</h3>
                  <p className="text-xs text-gray-400 italic">Este serviço não possui opções de configuração técnica de materiais.</p>
               </div>
            </div>

            {/* COLUNA MEIO & DIREITA: Observações + Precificação */}
            <div className="lg:col-span-2 flex flex-col gap-4 h-full min-h-0">
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0">

                  {/* Descrição / Observações do Serviço */}
                  <div className="lg:col-span-7 bg-phalis-black/60 p-4 rounded-2xl border border-gray-800 flex flex-col shadow-xl min-h-0">
                     <Label className="text-gray-200 text-xs font-bold uppercase tracking-wider block mb-2 flex-shrink-0">
                        Descrição / Observações do Serviço *
                     </Label>
                     <Textarea
                        placeholder="Descreva detalhadamente o serviço executado (ex: vetorização de logotipo, criação de layout, manutenção técnica, instalação externa, etc.)..."
                        className="flex-1 min-h-[140px] h-full bg-phalis-gray border-0 text-sm rounded-xl focus:ring-1 focus:ring-phalis-action resize-none"
                        value={observacao}
                        onChange={(e) => setObservacao(e.target.value)}
                     />
                     <span className="text-[11px] text-gray-500 mt-2 block flex-shrink-0">Texto impresso na ordem de serviço e recibo do cliente.</span>
                  </div>

                  {/* PAINEL FINANCEIRO (SERVIÇO) */}
                  <div className="lg:col-span-5 bg-phalis-black rounded-2xl p-4 border border-gray-800 shadow-xl flex flex-col justify-between min-h-0">

                     <div className="border-b border-gray-800 pb-2.5 flex-shrink-0">
                        <h3 className="text-xs font-black text-white uppercase tracking-wider">Precificação & Valores</h3>
                        <span className="text-[10px] text-gray-400 block font-medium">Cobrança Direta de Serviço</span>
                     </div>

                     <div className="space-y-2.5 my-auto">
                        <div className="bg-[#181818] p-3 rounded-xl border border-gray-800/90 space-y-2">
                           <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                                 <span className="w-1.5 h-1.5 rounded-full bg-phalis-action"></span>
                                 Valor Cobrado
                              </span>
                              <span className="text-xs text-gray-300 font-mono">
                                 Total: <strong className="text-phalis-action font-bold text-xs">R$ {(Number(valorVenda) || 0).toFixed(2)}</strong>
                              </span>
                           </div>

                           <div className="space-y-2">
                              <div className="space-y-0.5">
                                 <Label className="text-[10px] text-gray-400 font-semibold">Valor Total da Venda *</Label>
                                 <MoneyInput
                                    value={valorVenda}
                                    onChange={(e) => setValorVenda(e.target.value)}
                                    className="bg-[#242424] border-gray-700 h-8 text-xs font-bold text-phalis-action"
                                 />
                              </div>

                              <div className="space-y-0.5">
                                 <Label className="text-[10px] text-gray-400 font-semibold">Desconto Concedido (Opcional)</Label>
                                 <MoneyInput
                                    value={desconto}
                                    onChange={e => setDesconto(e.target.value)}
                                    className="bg-[#242424] border-gray-700 h-8 text-xs text-yellow-400"
                                    placeholder="0,00"
                                 />
                              </div>
                           </div>
                        </div>
                     </div>

                     {/* Resumo Final */}
                     <div className="bg-gradient-to-r from-[#121212] via-[#161616] to-[#121212] p-2 2xl:p-2.5 rounded-xl border border-gray-800 flex items-center justify-between text-xs flex-shrink-0">
                        <div className="min-w-0">
                           <span className="text-[9px] 2xl:text-[10px] text-gray-400 block font-semibold uppercase tracking-wider whitespace-nowrap">Modalidade:</span>
                           <strong className="text-white text-[11px] 2xl:text-sm font-mono block whitespace-nowrap leading-tight">Serviço Avulso</strong>
                        </div>
                        <div className="text-right min-w-0">
                           <span className="text-[9px] 2xl:text-[10px] text-gray-400 block font-semibold uppercase tracking-wider whitespace-nowrap">Total a Cobrar:</span>
                           <span className="text-[11px] 2xl:text-sm font-black text-phalis-action font-mono block whitespace-nowrap leading-tight">
                              R$ {total.toFixed(2)}
                           </span>
                        </div>
                     </div>

                  </div>

               </div>
            </div>

         </div>

         {/* RODAPÉ ANCORADO */}
         <OrderFooter
            total={total}
            isValid={isFormCompleto}
            isLoading={isLoading}
            onConfirm={() => commitToCart(false)}
            onFinalize={isEditMode ? undefined : () => commitToCart(true)}
            labelConfirm={isEditMode ? "ATUALIZAR ITEM" : "ADICIONAR AO CARRINHO"}
            missingItems={missingItems}
         />
      </div>
   );
};

// ==========================================================
// PÁGINA PRINCIPAL (ROTEADOR)
// ==========================================================
function PedidosPageContent() {
   const [produto, setProduto] = useState<Product | null>(null);
   const [loading, setLoading] = useState(true);
   const searchParams = useSearchParams();
   const { user } = useAuth();
   const { itens: itensNoCarrinho } = useCart();
   const [pedidoParaEditar, setPedidoParaEditar] = useState<Pedido | null>(null);

   const produtoId = searchParams.get('id');
   const editPedidoId = searchParams.get('edit');
   const editCartId = searchParams.get('editCart');

   useEffect(() => {
      setLoading(true); setProduto(null); setPedidoParaEditar(null);
      if (!produtoId) { setLoading(false); return; }

      authenticatedFetch(`/api/produtos/${produtoId}`)
         .then(res => {
            if (!res.ok) throw new Error('Produto não encontrado');
            return res.json();
         })
         .then((produtoBackend: Product) => {
            setProduto(produtoBackend);

            if (editCartId) {
               // Edição de item do carrinho
               const itemCarrinho = itensNoCarrinho.find(i => i.id === editCartId);
               if (itemCarrinho) {
                  setPedidoParaEditar({
                     id: itemCarrinho.id,
                     detalhes: itemCarrinho.detalhes
                  } as any);
               }
               setLoading(false);
            } else if (editPedidoId) {
               // Edição de pedido existente no banco
               authenticatedFetch(`/api/pedidos/${editPedidoId}`)
                  .then(res => res.json())
                  .then((pedidoData: Pedido) => {
                     setPedidoParaEditar(pedidoData);
                  })
                  .catch(err => console.error("Erro ao buscar pedido:", err))
                  .finally(() => setLoading(false));
            } else {
               setLoading(false);
            }
         })
         .catch(err => {
            console.error("Erro ao buscar produto:", err);
            setLoading(false);
         });

   }, [produtoId, editPedidoId, editCartId, itensNoCarrinho]);

   if (loading || !user) {
      return (
         <div className="flex flex-col items-center justify-center min-h-[500px] space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-phalis-action" />
            <p className="text-gray-400 text-sm">Carregando detalhes do produto...</p>
         </div>
      );
   }

   if (!produto) {
      return (
         <div className="text-center text-gray-400 py-16">
            <p className="text-lg">Nenhum produto selecionado ou ID inválido.</p>
            <Button asChild className="mt-4 bg-phalis-nav hover:bg-phalis-nav-hover text-white rounded-xl">
               <Link href="/catalogo">Ir para o Catálogo</Link>
            </Button>
         </div>
      );
   }

   switch (produto.pricingType) {
      case 'UNIDADE':
         return <FormularioUnidade produto={produto as Product & { options: ProductOptions }} pedidoParaEditar={pedidoParaEditar} />;
      case 'METRO':
         return <FormularioMetro produto={produto as Product & { options: ProductOptions }} pedidoParaEditar={pedidoParaEditar} />;
      case 'SERVICO':
         return <FormularioServico produto={produto} pedidoParaEditar={pedidoParaEditar} />;
      default:
         return <div className="text-white p-6">Tipo de produto desconhecido.</div>;
   }
}

export default function PedidosPage() {
   return (
      <Suspense fallback={
         <div className="flex flex-col items-center justify-center min-h-[500px] space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-phalis-action" />
            <p className="text-gray-400 text-sm">Carregando...</p>
         </div>
      }>
         <PedidosPageContent />
      </Suspense>
   );
}
