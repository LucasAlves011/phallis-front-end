'use client';

import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

// Tipo de um item no carrinho (produto configurado, pronto para virar ItemPedido)
export type CartItem = {
   id: string;               // id único do item no carrinho (gerado no front)
   productId: string;
   itemNome: string;
   itemImageUrl: string;
   valor: number;
   detalhes: Record<string, unknown>; // JSON genérico com type, opcoes, preco, etc.
};

type CartContextType = {
   itens: CartItem[];
   addItem: (item: Omit<CartItem, 'id'>) => void;
   removeItem: (id: string) => void;
   clearCart: () => void;
   totalItens: number;
   valorTotal: number;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
   const [itens, setItens] = useState<CartItem[]>([]);

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
   }, []);

   const totalItens = itens.length;
   const valorTotal = itens.reduce((sum, item) => sum + item.valor, 0);

   return (
      <CartContext.Provider value={{ itens, addItem, removeItem, clearCart, totalItens, valorTotal }}>
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
