// Arquivo: lib/productData.ts
import { type Cliente } from "@/types/client";

// --- TIPOS DE DADOS ---

export type ProductOption = {
  id: string;
  name: string;
};

export type ProductOptions = {
  papel: ProductOption[];
  tamanho: ProductOption[];
  cores: ProductOption[];
  acabamento: ProductOption[];
};

export type Product = {
  id: string;
  nome: string;
  descricao?: string; // Descrição é opcional
  imageUrl: string;
  pricingType: 'METRO' | 'UNIDADE' | 'SERVICO';
  consultaPreco?: boolean;
  options?: ProductOptions;
  defaultM2Custo?: number;
  defaultM2Venda?: number;
  orderIndex?: number;
  ativo?: boolean;
};

// --- CONFIGURAÇÃO DAS COLUNAS (PARA ORDEM E RESET) ---
export const optionGroupsConfig = [
  { id: 'papel', name: '01. Papel / Material' },
  { id: 'tamanho', name: '02. Tamanho' },
  { id: 'cores', name: '03. Cores' },
  { id: 'acabamento', name: '04. Acabamento' },
] as const;

// ==========================================================
// MUDANÇA: 'produtosDoCatalogo' agora é o JSON bruto (sem função 'formatarOpcoes')
