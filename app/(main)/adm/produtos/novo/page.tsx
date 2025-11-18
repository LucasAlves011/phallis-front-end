// Arquivo: app/(main)/adm/produtos/novo/page.tsx
'use client';

import { ProductForm } from "@/components/produtos/ProductForm";

export default function CadastrarProdutoPage() {
   // Renderiza o formulário no modo "create" (sem initialData)
   return <ProductForm />;
}