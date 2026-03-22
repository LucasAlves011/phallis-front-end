'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useCart, type CartItem } from '@/lib/cartStore';
import { type Cliente } from '@/types/client';
import { ClientCombobox } from '@/components/clientes/ClientCombobox';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from "@/components/ui/select";
import { authenticatedFetch } from '@/lib/api';
import { useAuth } from '@/lib/auth/AuthContext';
import { Loader2, Trash2, ShoppingCart, Plus } from 'lucide-react';

// ==============================
// Componente de cada item do carrinho
// ==============================
const CartItemCard = ({ item, onRemove }: { item: CartItem; onRemove: (id: string) => void }) => {
   const detalhes = item.detalhes as Record<string, unknown>;
   const type = detalhes.type as string;

   const getResumo = () => {
      if (type === 'unidade') {
         const preco = detalhes.preco as Record<string, unknown>;
         return `${preco.quantidade || '-'} un. | Custo: R$ ${Number(preco.precoCusto || 0).toFixed(2)} | Venda: R$ ${Number(preco.precoVenda || 0).toFixed(2)}`;
      }
      if (type === 'metro') {
         const preco = detalhes.preco as Record<string, unknown>;
         return `${preco.largura || '-'}m × ${preco.altura || '-'}m | m²Venda: R$ ${Number(preco.m2Venda || 0).toFixed(2)}`;
      }
      if (type === 'servico') {
         return (detalhes.observacao as string) || 'Serviço';
      }
      return '';
   };

   return (
      <div className="bg-phalis-black rounded-lg p-4 flex items-center gap-4 group">
         <div className="h-16 w-16 rounded-md overflow-hidden bg-phalis-gray flex-shrink-0 relative">
            <Image src={item.itemImageUrl} alt={item.itemNome} fill className="object-cover" />
         </div>
         <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold text-base truncate">{item.itemNome}</h3>
            <p className="text-gray-400 text-sm truncate">{getResumo()}</p>
         </div>
         <div className="text-right flex-shrink-0">
            <p className="text-white font-bold text-lg">R$ {item.valor.toFixed(2)}</p>
            <span className="text-xs text-gray-500 capitalize">{type}</span>
         </div>
         <Button
            variant="ghost"
            size="icon"
            className="text-gray-500 hover:text-phalis-danger hover:bg-phalis-danger/10 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
            onClick={() => onRemove(item.id)}
         >
            <Trash2 className="h-4 w-4" />
         </Button>
      </div>
   );
};

// ==============================
// Página principal do Carrinho
// ==============================
export default function CarrinhoPage() {
   const { itens, removeItem, clearCart, valorTotal } = useCart();
   const [cliente, setCliente] = useState<Cliente | null>(null);
   const [pagamento, setPagamento] = useState<string | null>(null);
   const [formaPagamento, setFormaPagamento] = useState<string | null>(null);
   const [isLoading, setIsLoading] = useState(false);
   const router = useRouter();
   const { user } = useAuth();

   const isFormCompleto = itens.length > 0 && !!cliente && !!pagamento && (pagamento === 'PENDENTE' || !!formaPagamento);

   const handleFinalizar = async () => {
      if (!isFormCompleto || !cliente || !user) return;
      setIsLoading(true);

      const payload = {
         clientId: cliente.id,
         statusFinanceiro: pagamento,
         formaPagamento: pagamento === 'PENDENTE' ? null : formaPagamento,
         total: valorTotal,
         itens: itens.map(item => {
            const det = item.detalhes as any;
            const preco = det.preco || {};
            const type = det.type;

            return {
               productId: item.productId,
               valor: item.valor,
               tipoPrecificacao: type,
               valorCusto: type === 'unidade' ? preco.precoCusto : (type === 'metro' ? preco.m2Custo : null),
               valorVenda: type === 'unidade' ? preco.precoVenda : (type === 'metro' ? preco.m2Venda : preco.valorVenda),
               valorDesconto: preco.desconto || null,
               quantidade: type === 'unidade' ? preco.quantidade : null,
               largura: type === 'metro' ? preco.largura : null,
               altura: type === 'metro' ? preco.altura : null,
               observacao: det.observacao || null,
               opcoes: det.opcoes || null,
            };
         }),
      };

      try {
         const response = await authenticatedFetch('/api/pedidos', {
            method: 'POST',
            body: JSON.stringify(payload),
         });
         if (!response.ok) throw new Error('Falha ao criar pedido');
         const salvo = await response.json();
         clearCart();
         router.push(`/historico-pedidos?highlight=${salvo.id}`);
      } catch (error) {
         console.error(error);
         alert('Erro ao finalizar pedido.');
      } finally {
         setIsLoading(false);
      }
   };

   // Carrinho vazio
   if (itens.length === 0) {
      return (
         <div className="w-full 2xl:w-4/5 2xl:mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-white">Carrinho</h1>
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
               <ShoppingCart className="h-16 w-16 text-gray-600" />
               <p className="text-gray-400 text-lg">Seu carrinho está vazio.</p>
               <p className="text-gray-500 text-sm">Adicione produtos a partir do catálogo.</p>
               <Button asChild className="bg-phalis-action text-phalis-black hover:bg-phalis-action-hover font-bold mt-4">
                  <Link href="/catalogo">
                     <Plus className="h-4 w-4 mr-2" />
                     Ir para o Catálogo
                  </Link>
               </Button>
            </div>
         </div>
      );
   }

   return (
      <div className="w-full 2xl:w-4/5 2xl:mx-auto space-y-6">
         <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-white">Carrinho</h1>
            <Button
               variant="ghost"
               className="text-gray-400 hover:text-phalis-danger hover:bg-phalis-danger/10"
               onClick={clearCart}
            >
               <Trash2 className="h-4 w-4 mr-2" />
               Limpar Carrinho
            </Button>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Coluna Esquerda: Lista de Itens */}
            <div className="lg:col-span-2 space-y-3">
               {itens.map(item => (
                  <CartItemCard key={item.id} item={item} onRemove={removeItem} />
               ))}

               <Button asChild variant="outline" className="w-full border-dashed border-gray-600 text-gray-400 hover:border-phalis-action hover:text-phalis-action bg-transparent hover:bg-transparent">
                  <Link href="/catalogo">
                     <Plus className="h-4 w-4 mr-2" />
                     Adicionar mais produtos
                  </Link>
               </Button>
            </div>

            {/* Coluna Direita: Resumo + Finalização */}
            <div className="space-y-4">
               <div className="bg-phalis-black rounded-lg p-5 space-y-4">
                  <h2 className="text-lg font-semibold text-white">Finalização</h2>

                  {/* Seleção de Cliente */}
                  <div className="space-y-1">
                     <Label className="text-gray-300 text-sm ml-1">Cliente *</Label>
                     <ClientCombobox selectedClientId={cliente?.id || null} onSelectClient={setCliente} />
                  </div>

                  {/* Status Financeiro */}
                  <div className="space-y-1">
                     <Label className="text-gray-300 text-sm ml-1">Status Financeiro *</Label>
                     <Select value={pagamento || ""} onValueChange={setPagamento}>
                        <SelectTrigger className="bg-phalis-gray border-0">
                           <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent className="bg-phalis-gray border-0">
                           <SelectItem value="PENDENTE">Não Pago</SelectItem>
                           <SelectItem value="PARCIAL">Pago 50%</SelectItem>
                           <SelectItem value="PAGO">Pago</SelectItem>
                        </SelectContent>
                     </Select>
                  </div>

                  {/* Forma de Pagamento */}
                  {pagamento !== 'PENDENTE' && (
                     <div className="space-y-1">
                        <Label className="text-gray-300 text-sm ml-1">Forma de Pagamento *</Label>
                        <Select value={formaPagamento || ""} onValueChange={setFormaPagamento}>
                           <SelectTrigger className="bg-phalis-gray border-0">
                              <SelectValue placeholder="Selecione..." />
                           </SelectTrigger>
                           <SelectContent className="bg-phalis-gray border-0">
                              <SelectItem value="PIX">PIX</SelectItem>
                              <SelectItem value="CREDITO">Crédito</SelectItem>
                              <SelectItem value="DEBITO">Débito</SelectItem>
                              <SelectItem value="DINHEIRO">Dinheiro</SelectItem>
                           </SelectContent>
                        </Select>
                     </div>
                  )}
               </div>

               {/* Resumo de Valores */}
               <div className="bg-phalis-black rounded-lg p-5 space-y-3">
                  <div className="flex justify-between text-sm text-gray-400">
                     <span>Itens ({itens.length})</span>
                     <span className="text-white">R$ {valorTotal.toFixed(2)}</span>
                  </div>
                  <hr className="border-gray-700" />
                  <div className="flex justify-between items-center">
                     <span className="text-lg font-semibold text-white">Total</span>
                     <span className="text-2xl font-bold text-phalis-action">R$ {valorTotal.toFixed(2)}</span>
                  </div>
               </div>

               {/* Botão Finalizar */}
               <Button
                  disabled={!isFormCompleto || isLoading}
                  onClick={handleFinalizar}
                  className="w-full bg-phalis-action text-phalis-black font-bold text-lg py-6 hover:bg-phalis-action-hover disabled:opacity-50"
               >
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : 'FINALIZAR PEDIDO'}
               </Button>

               {!isFormCompleto && (
                  <p className="text-xs text-gray-500 text-center">
                     {!cliente && 'Selecione um cliente. '}
                     {!pagamento && 'Selecione o status financeiro. '}
                     {pagamento && pagamento !== 'PENDENTE' && !formaPagamento && 'Selecione a forma de pagamento.'}
                  </p>
               )}
            </div>
         </div>
      </div>
   );
}
