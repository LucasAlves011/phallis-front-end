'use client';

import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { type Cliente } from '@/types/client';

// Tipo de um item no carrinho (produto configurado, pronto para virar ItemPedido)
export type CartItem = {
   id: string;               // id único do item no carrinho (gerado no front)
   productId: string;
   itemNome: string;
   itemImageUrl: string;
   valor: number;
   detalhes: Record<string, unknown>; // JSON genérico com type, opcoes, preco, etc.
};

export type EditOrderInfo = {
   id: number;
   codigoVisual: string;
   cliente: { id: string; nome: string };
   totalPago: number;
   statusFinanceiro: string;
   statusProducao: string;
};

export type OrigemOrcamentoInfo = {
   id: number;
   codigoVisual: string;
};

type CartContextType = {
   itens: CartItem[];
   addItem: (item: Omit<CartItem, 'id'>) => void;
   removeItem: (id: string) => void;
   clearCart: () => void;
   updateItem: (id: string, updatedItem: Partial<CartItem>) => void;
   totalItens: number;
   valorTotal: number;
   editingOrder: EditOrderInfo | null;
   loadOrderForEdit: (order: EditOrderInfo, loadedItems: CartItem[]) => void;
   selectedClient: Cliente | null;
   setSelectedClient: (cliente: Cliente | null) => void;
   origemOrcamento: OrigemOrcamentoInfo | null;
   loadOrcamentoToCart: (client: Cliente | null, loadedItems: CartItem[], orcamentoInfo?: OrigemOrcamentoInfo | null) => void;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
   const [itens, setItens] = useState<CartItem[]>([]);
   const [editingOrder, setEditingOrder] = useState<EditOrderInfo | null>(null);
   const [selectedClient, setSelectedClient] = useState<Cliente | null>(null);
   const [origemOrcamento, setOrigemOrcamento] = useState<OrigemOrcamentoInfo | null>(null);

   const loadOrderForEdit = useCallback((order: EditOrderInfo, loadedItems: CartItem[]) => {
      setEditingOrder(order);
      setItens(loadedItems);
      setOrigemOrcamento(null);
   }, []);

   const loadOrcamentoToCart = useCallback((client: Cliente | null, loadedItems: CartItem[], orcamentoInfo?: OrigemOrcamentoInfo | null) => {
      setEditingOrder(null);
      setSelectedClient(client);
      setItens(loadedItems);
      setOrigemOrcamento(orcamentoInfo || null);
   }, []);

   const addItem = useCallback((item: Omit<CartItem, 'id'>) => {
      const newItem: CartItem = {
         ...item,
         id: `cart_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      };
      setItens(prev => [...prev, newItem]);
   }, []);

   const removeItem = useCallback((id: string) => {
      setItens(prev => prev.filter(item => item.id !== id));
   }, []);

   const clearCart = useCallback(() => {
      setItens([]);
      setEditingOrder(null);
      setSelectedClient(null);
      setOrigemOrcamento(null);
   }, []);

   const updateItem = useCallback((id: string, updatedItem: Partial<CartItem>) => {
      setItens(prev => prev.map(item => item.id === id ? { ...item, ...updatedItem } : item));
   }, []);

   const totalItens = itens.length;
   const valorTotal = itens.reduce((sum, item) => sum + item.valor, 0);

   return (
      <CartContext.Provider value={{ itens, addItem, removeItem, clearCart, updateItem, totalItens, valorTotal, editingOrder, loadOrderForEdit, selectedClient, setSelectedClient, origemOrcamento, loadOrcamentoToCart }}>
         {children}
      </CartContext.Provider>
   );
}

export function useCart() {
   const context = useContext(CartContext);
   if (!context) {
      throw new Error('useCart deve ser usado dentro de um CartProvider');
   }
   return context;
}
