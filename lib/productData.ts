// Arquivo: lib/productData.ts

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
  descricao: string;
  imageUrl: string;
  // O tipo de motor de preço
  pricingType: 'metro' | 'unidade' | 'arte';
  // Opcional: 'arte' não terá isso
  options?: ProductOptions;
};

// --- CONFIGURAÇÃO DAS COLUNAS (PARA ORDEM E RESET) ---
export const optionGroupsConfig = [
  { id: 'papel', name: '01. Papel / Material' },
  { id: 'tamanho', name: '02. Tamanho' },
  { id: 'cores', name: '03. Cores' },
  { id: 'acabamento', name: '04. Acabamento' },
] as const;

// --- NOSSA LISTA DE PRODUTOS (COM PRICINGTYPE) ---
export const produtosDoCatalogo: Product[] = [
  // NOVO PRODUTO DE ARTE
  {
    id: 'prod_028',
    nome: 'Criação de Arte',
    descricao: 'Design gráfico profissional',
    imageUrl: '/images/catalogo/phalis-kekw.png', // (Crie esta imagem)
    pricingType: 'arte',
    // 'options' é omitido
  },

  // --- PRODUTOS METRO (AGORA COM 4 OPÇÕES) ---
  {
    id: 'prod_001',
    nome: 'Banner',
    descricao: 'Por Metro Quadrado',
    imageUrl: '/images/catalogo/banner.png',
    pricingType: 'metro', // <-- TIPO METRO
    options: {
      papel: [{ id: 'lona_fosca', name: 'Lona Fosca 280g' }, { id: 'lona_brilho', name: 'Lona Brilho 340g' }],
      tamanho: [{ id: 'm2', name: 'Metro Quadrado (m²)' }],
      cores: [{ id: '4x0', name: '4x0 (Colorido)' }],
      acabamento: [{ id: 'bastao', name: 'Bastão e Cordinha' }, { id: 'ilhos', name: 'Apenas Ilhós' }],
    }
  },
  {
    id: 'prod_002',
    nome: 'Faixa',
    descricao: 'Por Metro Quadrado',
    imageUrl: '/images/catalogo/faixa.png',
    pricingType: 'metro', // <-- TIPO METRO
    options: {
      papel: [{ id: 'lona_brilho_340', name: 'Lona Brilho 340g' }],
      tamanho: [{ id: 'm2', name: 'Metro Quadrado (m²)' }],
      cores: [{ id: '4x0', name: '4x0 (Colorido)' }],
      acabamento: [{ id: 'bastao_madeira', name: 'Bastão de Madeira e Cordinha' }, { id: 'ilhos', name: 'Apenas Ilhós (para amarrar)' }]
    }
  },
  {
    id: 'prod_003',
    nome: 'Porta Banner Roll-Up + Banner',
    descricao: 'Por Metro Quadrado',
    imageUrl: '/images/catalogo/roll-up.png',
    pricingType: 'metro', // <-- TIPO METRO
    options: {
      papel: [{ id: 'lona_fosca_280', name: 'Lona Fosca 280g' }],
      tamanho: [{ id: '80x200', name: '80x200cm' }, { id: '100x200', name: '100x200cm' }],
      cores: [{ id: '4x0', name: '4x0 (Colorido)' }],
      acabamento: [{ id: 'estrutura_aluminio', name: 'Estrutura de Alumínio' }]
    }
  },

  // --- PRODUTOS UNIDADE (O RESTO DA LISTA) ---
  {
    id: 'prod_004',
    nome: 'Totem Eliptico Dobrável',
    descricao: 'Por Unidade',
    imageUrl: '/images/catalogo/totem.png',
    pricingType: 'unidade', // <-- TIPO UNIDADE
    options: {
      papel: [{ id: 'papelao_rigido', name: 'Papelão Rígido com Impressão' }],
      tamanho: [{ id: '150cm', name: '150cm Altura' }, { id: '180cm', name: '180cm Altura' }],
      cores: [{ id: '4x0', name: '4x0 (Colorido)' }],
      acabamento: [{ id: 'corte_elipse', name: 'Corte Elíptico e Dobras' }]
    }
  },
  {
    id: 'prod_005',
    nome: 'Calendário de Mesa',
    descricao: 'Por Unidade',
    imageUrl: '/images/catalogo/calendario-mesa.png',
    pricingType: 'unidade',
    options: {
      papel: [{ id: 'couche_115', name: 'Couchê 115g (Folhas)' }],
      tamanho: [{ id: 'padrao', name: 'Tamanho Padrão (15x10cm)' }],
      cores: [{ id: '4x4', name: '4x4 (Colorido)' }],
      acabamento: [{ id: 'porta_caneta', name: 'Com Porta Caneta' }, { id: 'simples', name: 'Simples (Triangular)' }]
    }
  },
  {
    id: 'prod_006',
    nome: 'Calendário de Parede',
    descricao: 'Por Unidade',
    imageUrl: '/images/catalogo/calendario-parede.png',
    pricingType: 'unidade',
    options: {
      papel: [{ id: 'couche_115', name: 'Couchê 115g' }],
      tamanho: [{ id: 'a3', name: 'A3 (30x42cm)' }, { id: 'a4', name: 'A4 (21x30cm)' }],
      cores: [{ id: '4x0', name: '4x0 (Colorido)' }],
      acabamento: [{ id: 'wireo', name: 'Wire-O' }, { id: 'grampo', name: 'Grampo' }]
    }
  },
  {
    id: 'prod_007',
    nome: 'Imã de Geladeira',
    descricao: 'Por Unidade',
    imageUrl: '/images/catalogo/ima-de-geladeira-com-calendario.png',
    pricingType: 'unidade',
    options: {
      papel: [{ id: 'papel_ima', name: 'Papel com Manta Magnética' }],
      tamanho: [{ id: '5x4', name: '5x4cm' }, { id: '8x5', name: '8x5cm' }],
      cores: [{ id: '4x0', name: '4x0 (Colorido)' }],
      acabamento: [{ id: 'verniz_total', name: 'Verniz Total Frente' }, { id: 'com_calendario', name: 'Com Calendário' }, { id: 'sem_calendario', name: 'Sem Calendário' }]
    }
  },
  {
    id: 'prod_008',
    nome: 'Cartão de Visita',
    descricao: 'Por Unidade',
    imageUrl: '/images/catalogo/cartao-de-visita.png',
    pricingType: 'unidade',
    options: {
      papel: [{ id: 'couche_250', name: 'Couchê 250g' }, { id: 'couche_300', name: 'Couchê 300g' }],
      tamanho: [{ id: '9x5', name: '9x5cm' }],
      cores: [{ id: '4x0', name: '4x0 (Colorido Frente)' }, { id: '4x4', name: '4x4 (Colorido Frente e Verso)' }],
      acabamento: [{ id: 'uv_total', name: 'Verniz UV Total' }, { id: 'lam_fosca', name: 'Laminação Fosca' }]
    }
  },
  {
    id: 'prod_009',
    nome: 'Tags',
    descricao: 'Por Unidade',
    imageUrl: '/images/catalogo/tags.png',
    pricingType: 'unidade',
    options: {
      papel: [{ id: 'couche_300', name: 'Couchê 300g' }, { id: 'kraft_250', name: 'Kraft 250g' }],
      tamanho: [{ id: '5x9', name: '5x9cm' }],
      cores: [{ id: '4x4', name: '4x4 (Frente e Verso)' }],
      acabamento: [{ id: 'com_furo', name: 'Com Furo' }, { id: 'sem_furo', name: 'Sem Furo' }]
    }
  },
  {
    id: 'prod_010',
    nome: 'Panfletos 1.000 und',
    descricao: 'Por Unidade',
    imageUrl: '/images/catalogo/panfleto.png',
    pricingType: 'unidade',
    options: {
      papel: [{ id: 'couche_90', name: 'Couchê 90g' }, { id: 'couche_115', name: 'Couchê 115g' }],
      tamanho: [{ id: 'a5', name: 'A5 (15x21cm)' }, { id: 'a4', name: 'A4 (21x30cm)' }],
      cores: [{ id: '4x0', name: '4x0 (Frente)' }, { id: '4x4', name: '4x4 (Frente e Verso)' }],
      acabamento: [{ id: 'corte_reto', name: 'Corte Reto' }]
    }
  },
  {
    id: 'prod_011',
    nome: 'Adesivos Lacre para Delivery',
    descricao: 'Por Unidade',
    imageUrl: '/images/catalogo/adesivo-lacre.png',
    pricingType: 'unidade',
    options: {
      papel: [{ id: 'couche_adesivo', name: 'Couchê Adesivo' }, { id: 'vinil_adesivo', name: 'Vinil Adesivo (À prova dágua)' }],
      tamanho: [{ id: '10x4', name: '10x4cm' }, { id: '5x5', name: '5x5cm (Redondo)' }],
      cores: [{ id: '4x0', name: '4x0 (Colorido)' }],
      acabamento: [{ id: 'reto', name: 'Corte Reto' }, { id: 'especial', name: 'Corte Especial' }]
    }
  },
  {
    id: 'prod_012',
    nome: 'Capa de Carnê',
    descricao: 'Por Unidade',
    imageUrl: '/images/catalogo/capa-de-carne-4x4.png',
    pricingType: 'unidade',
    options: {
      papel: [{ id: 'couche_250', name: 'Couchê 250g' }],
      tamanho: [{ id: 'padrao', name: 'Tamanho Padrão (20x15cm Aberto)' }],
      cores: [{ id: '4x0', name: '4x0 (Externo)' }, { id: '4x4', name: '4x4 (Externo e Interno)' }],
      acabamento: [{ id: 'vinco', name: 'Apenas Vinco Central' }]
    }
  },
  {
    id: 'prod_013',
    nome: 'Cartaz',
    descricao: 'Por Unidade',
    imageUrl: '/images/catalogo/cartaz.png',
    pricingType: 'unidade',
    options: {
      papel: [{ id: 'couche_115', name: 'Couchê 115g' }],
      tamanho: [{ id: 'a3', name: 'A3 (30x42cm)' }, { id: 'a2', name: 'A2 (42x60cm)' }],
      cores: [{ id: '4x0', name: '4x0 (Frente)' }],
      acabamento: [{ id: 'sem_acabamento', name: 'Sem Acabamento' }]
    }
  },
  {
    id: 'prod_014',
    nome: 'Envelope Saco para A4 Aberto',
    descricao: 'Por Unidade',
    imageUrl: '/images/catalogo/envelope-saco.png',
    pricingType: 'unidade',
    options: {
      papel: [{ id: 'offset_90', name: 'Offset 90g' }, { id: 'offset_120', name: 'Offset 120g' }],
      tamanho: [{ id: 'saco_a4', name: 'Para A4 (24x34cm)' }],
      cores: [{ id: '1x0', name: '1x0 (Preto)' }, { id: '4x0', name: '4x0 (Colorido)' }],
      acabamento: [{ id: 'colado', name: 'Fechamento Colado' }]
    }
  },
  {
    id: 'prod_015',
    nome: 'Folder',
    descricao: 'Por Unidade',
    imageUrl: '/images/catalogo/folder.png',
    pricingType: 'unidade',
    options: {
      papel: [{ id: 'couche_115', name: 'Couchê 115g' }, { id: 'couche_150', name: 'Couchê 150g' }],
      tamanho: [{ id: 'a4', name: 'A4 (21x30cm)' }, { id: 'a5', name: 'A5 (15x21cm)' }],
      cores: [{ id: '4x4', name: '4x4 (Frente e Verso)' }],
      acabamento: [{ id: '1_dobra', name: '1 Dobra Central' }, { id: '2_dobras', name: '2 Dobras (Sanfona)' }]
    }
  },
  {
    id: 'prod_016',
    nome: 'Marcador de Página 4.8x17.75cm',
    descricao: 'Por Unidade',
    imageUrl: '/images/catalogo/marcador-de-pagina.png',
    pricingType: 'unidade',
    options: {
      papel: [{ id: 'couche_300', name: 'Couchê 300g' }],
      tamanho: [{ id: '4.8x17.75', name: '4.8x17.75cm' }],
      cores: [{ id: '4x4', name: '4x4 (Frente e Verso)' }],
      acabamento: [{ id: 'lam_fosca', name: 'Laminação Fosca' }]
    }
  },
  {
    id: 'prod_017',
    nome: 'Papel de Bandeja',
    descricao: 'Por Unidade',
    imageUrl: '/images/catalogo/papel-bandeja.png',
    pricingType: 'unidade',
    options: {
      papel: [{ id: 'offset_75', name: 'Offset 75g' }, { id: 'kraft_80', name: 'Kraft 80g' }],
      tamanho: [{ id: 'a3', name: 'A3 (30x42cm)' }],
      cores: [{ id: '1x0', name: '1x0 (Preto)' }, { id: '4x0', name: '4x0 (Colorido)' }],
      acabamento: [{ id: 'corte_reto', name: 'Corte Reto' }]
    }
  },
  {
    id: 'prod_018',
    nome: 'Pasta Orelha',
    descricao: 'Por Unidade',
    imageUrl: '/images/catalogo/pasta-orelha.png',
    pricingType: 'unidade',
    options: {
      papel: [{ id: 'couche_300', name: 'Couchê 300g' }],
      tamanho: [{ id: 'a4', name: 'Para A4' }],
      cores: [{ id: '4x0', name: '4x0 (Externo)' }],
      acabamento: [{ id: 'uv_total', name: 'Verniz UV Total + Orelha' }, { id: 'lam_fosca', name: 'Laminação Fosca + Orelha' }]
    }
  },
  {
    id: 'prod_019',
    nome: 'Postal',
    descricao: 'Por Unidade',
    imageUrl: '/images/catalogo/postal.png',
    pricingType: 'unidade',
    options: {
      papel: [{ id: 'couche_300', name: 'Couchê 300g' }],
      tamanho: [{ id: '10x15', name: '10x15cm' }],
      cores: [{ id: '4x4', name: '4x4 (Frente e Verso)' }],
      acabamento: [{ id: 'sem_acabamento', name: 'Sem Acabamento' }]
    }
  },
  {
    id: 'prod_020',
    nome: 'Receituário - Quant em folhas',
    descricao: 'Por Unidade',
    imageUrl: '/images/catalogo/receituario.png',
    pricingType: 'unidade',
    options: {
      papel: [{ id: 'offset_90', name: 'Offset 90g' }, { id: 'sulfite_75', name: 'Sulfite 75g' }],
      tamanho: [{ id: 'a5', name: 'A5 (15x21cm)' }],
      cores: [{ id: '1x0', name: '1x0 (Preto)' }, { id: '4x0', name: '4x0 (Colorido)' }],
      acabamento: [{ id: 'blocado_100', name: 'Blocado (100 folhas)' }, { id: 'folhas_soltas', name: 'Folhas Soltas' }]
    }
  },
  {
    id: 'prod_021',
    nome: 'Sacolas',
    descricao: 'Por Unidade',
    imageUrl: '/images/catalogo/sacola.png',
    pricingType: 'unidade',
    options: {
      papel: [{ id: 'kraft_150', name: 'Kraft 150g' }, { id: 'offset_180', name: 'Offset 180g' }],
      tamanho: [{ id: 'p', name: 'Pequena' }, { id: 'm', name: 'Média' }, { id: 'g', name: 'Grande' }],
      cores: [{ id: '1x0', name: '1x0 (Preto)' }],
      acabamento: [{ id: 'cordao', name: 'Alça de Cordão' }, { id: 'papel', name: 'Alça de Papel Torcido' }]
    }
  },
  {
    id: 'prod_022',
    nome: 'Tapete Lava Jato',
    descricao: 'Por Unidade',
    imageUrl: '/images/catalogo/lava-jato.png',
    pricingType: 'unidade',
    options: {
      papel: [{ id: 'offset_75', name: 'Offset 75g' }, { id: 'papel_jornal', name: 'Papel Jornal' }],
      tamanho: [{ id: 'padrao', name: 'Tamanho Padrão (30x40cm)' }],
      cores: [{ id: '1x0', name: '1x0 (Preto)' }, { id: '4x0', name: '4x0 (Colorido)' }],
      acabamento: [{ id: 'corte_reto', name: 'Corte Reto' }]
    }
  },
  {
    id: 'prod_023',
    nome: 'Timbrado',
    descricao: 'Por Unidade',
    imageUrl: '/images/catalogo/timbrado.png',
    pricingType: 'unidade',
    options: {
      papel: [{ id: 'offset_90', name: 'Offset 90g' }, { id: 'sulfite_75', name: 'Sulfite 75g' }],
      tamanho: [{ id: 'a4', name: 'A4 (21x30cm)' }],
      cores: [{ id: '4x0', name: '4x0 (Colorido)' }],
      acabamento: [{ id: 'corte_reto', name: 'Corte Reto' }]
    }
  },
  {
    id: 'prod_024',
    nome: 'Ventarola / Abanador',
    descricao: 'Por Unidade',
    imageUrl: '/images/catalogo/abanador.png',
    pricingType: 'unidade',
    options: {
      papel: [{ id: 'pvc_03', name: 'PVC 0.3mm' }, { id: 'couche_300_lam', name: 'Couchê 300g + Laminação' }],
      tamanho: [{ id: 'redondo', name: 'Redondo (18cm)' }, { id: 'especial', name: 'Corte Especial' }],
      cores: [{ id: '4x4', name: '4x4 (Frente e Verso)' }],
      acabamento: [{ id: 'corte_especial', name: 'Corte e Haste' }]
    }
  },
  {
    id: 'prod_025',
    nome: 'Caixa de Hambúrguer',
    descricao: 'Por Unidade',
    imageUrl: '/images/catalogo/caixa-de-hamburguer.png',
    pricingType: 'unidade',
    options: {
      papel: [{ id: 'triplex_alimento', name: 'Cartão Triplex (Próprio p/ Alimento)' }, { id: 'kraft_alimento', name: 'Kraft (Próprio p/ Alimento)' }],
      tamanho: [{ id: 'padrao', name: 'Padrão' }],
      cores: [{ id: '4x0', name: '4x0 (Colorido Externo)' }],
      acabamento: [{ id: 'corte_vinco_colagem', name: 'Corte, Vinco e Colagem' }]
    }
  },
  {
    id: 'prod_026',
    nome: 'Caixa para Panetone',
    descricao: 'Por Unidade',
    imageUrl: '/images/catalogo/caixa-de-panetone.png',
    pricingType: 'unidade',
    options: {
      papel: [{ id: 'triplex', name: 'Cartão Triplex' }],
      tamanho: [{ id: '500g', name: '500g' }, { id: '1kg', name: '1kg' }],
      cores: [{ id: '4x0', name: '4x0 (Colorido Externo)' }],
      acabamento: [{ id: 'corte_vinco_colagem', name: 'Corte, Vinco e Colagem' }]
    }
  },
  {
    id: 'prod_027',
    nome: 'Caixa de Sushi',
    descricao: 'Por Unidade',
    imageUrl: '/images/catalogo/caixa-de-sushi-grande.png',
    pricingType: 'unidade',
    options: {
      papel: [{ id: 'triplex_alimento', name: 'Cartão Triplex (Próprio p/ Alimento)' }],
      tamanho: [{ id: 'padrao', name: 'Padrão' }, { id: 'grande', name: 'Grande' }],
      cores: [{ id: '4x0', name: '4x0 (Colorido Externo)' }],
      acabamento: [{ id: 'corte_vinco_colagem', name: 'Corte, Vinco e Colagem' }]
    }
  }
];

// --- FUNÇÃO PARA BUSCAR O PRODUTO ---
export const getProductById = (id: string): Product | undefined => {
  return produtosDoCatalogo.find(produto => produto.id === id);
};