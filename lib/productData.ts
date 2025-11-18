// Arquivo: lib/productData.ts
import { type Cliente, MOCK_CLIENTS } from "./clientData";

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
  pricingType: 'metro' | 'unidade' | 'arte';
  consultaPreco?: boolean;
  options?: ProductOptions;
  defaultM2Custo?: number;
  defaultM2Venda?: number;
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
// ==========================================================
export let produtosDoCatalogo: Product[] = [
  {
    "id": "prod_099",
    "nome": "Criação de Arte",
    "descricao": "",
    "imageUrl": "/images/catalogo/phalis-kekw.png",
    "pricingType": "arte"
  },
  {
    "id": "prod_001",
    "nome": "Lona",
    "descricao": "",
    "imageUrl": "/images/catalogo/banner.png",
    "pricingType": "metro",
    "options": {
      "papel": [
        { "id": "lona_normal", "name": "Lona Normal" },
        { "id": "lona_uv", "name": "Lona UV" }
      ],
      "tamanho": [],
      "cores": [
        { "id": "4x0", "name": "4x0" }
      ],
      "acabamento": [
        { "id": "madeirinhas_e_ponteiras", "name": "Madeirinhas e Ponteiras" },
        { "id": "ilhos", "name": "Ilhós" },
        { "id": "sem_acabamento", "name": "Sem acabamento" }
      ]
    },
    "defaultM2Custo": 29,
    "defaultM2Venda": 60
  },
  {
    "id": "prod_011",
    "nome": "Adesivos Lacre para Delivery",
    "descricao": "",
    "imageUrl": "/images/catalogo/adesivo-lacre.png",
    "pricingType": "unidade",
    "options": {
      "papel": [
        { "id": "couché_adesivo", "name": "Couché Adesivo" }
      ],
      "tamanho": [
        { "id": "38x10cm_arte_35x97cm_final", "name": "3.8x10cm Arte (3.5X9.7cm Final)" },
        { "id": "22x74cm_arte_20x72cm_final", "name": "2.2x7.4cm Arte (2.0X7.2cm Final)" }
      ],
      "cores": [
        { "id": "4x0", "name": "4x0" }
      ],
      "acabamento": [
        { "id": "meio_corte_padrão_entregue_em", "name": "Meio Corte Padrão Entregue em Bobinas de 33cm" }
      ]
    },
    "consultaPreco": true
  },
  {
    "id": "prod_025",
    "nome": "Caixa de Hambúrguer",
    "descricao": "",
    "imageUrl": "/images/catalogo/caixa-de-hamburguer.png",
    "pricingType": "unidade",
    "options": {
      "papel": [
        { "id": "kraft_240g", "name": "Kraft 240g" },
        { "id": "triplex_250g", "name": "Triplex 250g" }
      ],
      "tamanho": [
        { "id": "466x304cm_aberto_12x9cm_fecha", "name": "46.6x30.4cm aberto (12X9cm fechado)" }
      ],
      "cores": [
        { "id": "1x0", "name": "1x0" },
        { "id": "4x0", "name": "4x0" }
      ],
      "acabamento": [
        { "id": "corte_e_vinco", "name": "Corte e Vinco" }
      ]
    }
  },
  {
    "id": "prod_027",
    "nome": "Caixa de Sushi",
    "descricao": "",
    "imageUrl": "/images/catalogo/caixa-de-sushi-grande.png",
    "pricingType": "unidade",
    "options": {
      "papel": [
        { "id": "triplex_300g", "name": "Triplex 300g" }
      ],
      "tamanho": [
        { "id": "455x32cm_aberto_15x215cm_fec", "name": "45.5x32cm aberto (15X21.5cm fechado) grande" }
      ],
      "cores": [
        { "id": "4x0", "name": "4x0" }
      ],
      "acabamento": [
        { "id": "corte_e_vinco_plastbrilho_fre", "name": "Corte e Vinco + Plast.Brilho Frente e Verso" }
      ]
    }
  },
  {
    "id": "prod_026",
    "nome": "Caixa para Panetone",
    "descricao": "",
    "imageUrl": "/images/catalogo/caixa-de-panetone.png",
    "pricingType": "unidade",
    "options": {
      "papel": [
        { "id": "triplex_300g", "name": "Triplex 300g" }
      ],
      "tamanho": [
        { "id": "506x35cm_aberto_12lx128ax12p", "name": "50.6x35cm aberto (12LX12.8AX12P fechado)" },
        { "id": "61x435cm_aberto_15lx16ax15p_", "name": "61x43.5cm aberto (15LX16AX15P fechado)" }
      ],
      "cores": [
        { "id": "4x0", "name": "4x0" }
      ],
      "acabamento": [
        { "id": "lam_fsc_fverniz_loccorte_e_vi", "name": "Lam Fsc F+Verniz Loc+Corte e vinco + colagem" },
        { "id": "lam_fsc_fcorte_e_vinco_colag", "name": "Lam Fsc F+Corte e vinco + colagem" }
      ]
    }
  },
  {
    "id": "prod_new_01",
    "nome": "Caixas de Batata",
    "descricao": "",
    "imageUrl": "/images/catalogo/caixa-de-batata.png",
    "pricingType": "unidade",
    "options": {
      "papel": [
        { "id": "kraft_240g", "name": "Kraft 240g" },
        { "id": "triplex_250g", "name": "Triplex 250g" }
      ],
      "tamanho": [
        { "id": "40x206cm_aberto_10x9cm_fecha", "name": "40x20.6cm aberto (10X9cm fechado) Pequena" },
        { "id": "327x228cm_aberto_10x12cm_fe", "name": "32.7x22.8cm aberto (10X12cm fechado) Médio" }
      ],
      "cores": [
        { "id": "1x0", "name": "1x0" },
        { "id": "4x0", "name": "4x0" }
      ],
      "acabamento": [
        { "id": "corte_e_vinco", "name": "Corte e Vinco" }
      ]
    }
  },
  {
    "id": "prod_005",
    "nome": "Calendário de Mesa",
    "descricao": "",
    "imageUrl": "/images/catalogo/calendario-mesa.png",
    "pricingType": "unidade",
    "options": {
      "papel": [
        { "id": "couché_300g", "name": "Couché 300g" }
      ],
      "tamanho": [
        { "id": "102x273cm_arte_98x259cm_fina", "name": "10.2x27.3cm Arte (9.8X25.9cm Final)" },
        { "id": "153x364cm_arte_15x249cm_fina", "name": "15.3x36.4cm Arte (15X24.9cm Final)" }
      ],
      "cores": [
        { "id": "4x0", "name": "4x0" }
      ],
      "acabamento": [
        { "id": "corte_e_vinco_verniz_total", "name": "Corte e Vinco + Verniz Total" }
      ]
    }
  },
  {
    "id": "prod_006",
    "nome": "Calendário de Parede",
    "descricao": "",
    "imageUrl": "/images/catalogo/calendario-parede.png",
    "pricingType": "unidade",
    "options": {
      "papel": [
        { "id": "triplex_250g", "name": "Triplex 250g" },
        { "id": "triplex_300g", "name": "Triplex 300g" }
      ],
      "tamanho": [
        { "id": "214x304cm_arte_21x30cm_final", "name": "21.4x30.4cm Arte (21X30cm Final)" },
        { "id": "304x424cm_arte_30x42cm_final", "name": "30.4x42.4cm Arte (30X42cm Final)" },
        { "id": "238x322cm_arte_23x32cm_final", "name": "23.8x32.2cm Arte (23X32cm Final)" },
        { "id": "324x474cm_arte_32x47cm_final", "name": "32.4x47.4cm Arte (32X47cm Final)" }
      ],
      "cores": [
        { "id": "4x0", "name": "4x0" }
      ],
      "acabamento": [
        { "id": "verniz_uv_total_furo", "name": "Verniz UV Total + Furo" }
      ]
    }
  },
  {
    "id": "prod_012",
    "nome": "Capa de Carnê",
    "descricao": "",
    "imageUrl": "/images/catalogo/capa-de-carne-4x4.png",
    "pricingType": "unidade",
    "options": {
      "papel": [
        { "id": "couché_brilho_90g", "name": "Couché Brilho 90g" }
      ],
      "tamanho": [
        { "id": "432x104cm_arte_428x10cm_fech", "name": "43.2x10.4cm Arte (42.8X10cm Fechado)" }
      ],
      "cores": [
        { "id": "4x0", "name": "4x0" },
        { "id": "4x4", "name": "4x4" }
      ],
      "acabamento": [
        { "id": "refile", "name": "Refile" }
      ]
    }
  },
  {
    "id": "prod_008",
    "nome": "Cartão de Visita",
    "descricao": "",
    "imageUrl": "/images/catalogo/cartao-de-visita.png",
    "pricingType": "unidade",
    "options": {
      "papel": [
        { "id": "couché_300g", "name": "Couché 300g" },
        { "id": "couché_250g", "name": "Couché 250g" }
      ],
      "tamanho": [
        { "id": "91x51cm_arte_88x48cm_final", "name": "9.1x5.1cm Arte (8.8X4.8cm Final)" }
      ],
      "cores": [
        { "id": "4x0", "name": "4x0" },
        { "id": "4x4", "name": "4x4" },
        { "id": "4x1", "name": "4x1" }
      ],
      "acabamento": [
        { "id": "verniz_total_frente", "name": "Verniz Total Frente" },
        { "id": "laminação_fosca_frente_e_vers", "name": "Laminação Fosca Frente e Verso" },
        { "id": "laminação_fosca_fv_verniz_loc", "name": "Laminação Fosca FV + Verniz Local." },
        { "id": "laminação_fosca_fv_cantos_arr", "name": "Laminação Fosca FV + Cantos Arred." },
        { "id": "lam_fsc_fvverniz_loccantos_ar", "name": "Lam Fsc FV+Verniz Loc+Cantos Arred." },
        { "id": "verniz_total_frente_cantos_ar", "name": "Verniz Total Frente + Cantos Arred" }
      ]
    }
  },
  {
    "id": "prod_013",
    "nome": "Cartaz",
    "descricao": "",
    "imageUrl": "/images/catalogo/cartaz.png",
    "pricingType": "unidade",
    "options": {
      "papel": [
        { "id": "couché_brilho_115g", "name": "Couché Brilho 115g" },
        { "id": "couché_brilho_90g", "name": "Couché Brilho 90g" },
        { "id": "couché_brilho_150g", "name": "Couché Brilho 150g" }
      ],
      "tamanho": [
        { "id": "316x441cm_arte_31x435cm_fina", "name": "31.6x44.1cm Arte (31X43.5cm Final)" },
        { "id": "426x626cm_arte_42x62cm_final", "name": "42.6x62.6cm Arte (42X62cm Final)" }
      ],
      "cores": [
        { "id": "4x0", "name": "4x0" }
      ],
      "acabamento": [
        { "id": "refile", "name": "Refile" }
      ]
    }
  },
  {
    "id": "prod_014",
    "nome": "Envelope Saco para A4 Aberto",
    "descricao": "",
    "imageUrl": "/images/catalogo/envelope-saco.png",
    "pricingType": "unidade",
    "options": {
      "papel": [
        { "id": "offset_90g", "name": "Offset 90g" }
      ],
      "tamanho": [
        { "id": "478x375cm_aberto_23x317cm_fe", "name": "47.8x37.5cm aberto (23X31.7cm fechado)" }
      ],
      "cores": [
        { "id": "4x0", "name": "4x0" }
      ],
      "acabamento": [
        { "id": "corte_e_vinco_colagem", "name": "Corte e Vinco + Colagem" }
      ]
    }
  },
  {
    "id": "prod_new_02",
    "nome": "Envelopes para A4 Dobrado",
    "descricao": "",
    "imageUrl": "/images/catalogo/envelope-carta.png",
    "pricingType": "unidade",
    "options": {
      "papel": [
        { "id": "offset_90g", "name": "Offset 90g" }
      ],
      "tamanho": [
        { "id": "261x286cm_aberto_115x23cm_fe", "name": "26.1x28.6cm aberto (11.5X23cm fechado) Carta" },
        { "id": "241x281cm_aberto113x23cm_fch", "name": "24.1x28.1cm aberto(11.3X23cm fchd)Aba Lateral" }
      ],
      "cores": [
        { "id": "4x0", "name": "4x0" }
      ],
      "acabamento": [
        { "id": "corte_e_vinco_colagem", "name": "Corte e Vinco + Colagem" }
      ]
    }
  },
  {
    "id": "prod_015",
    "nome": "Folder",
    "descricao": "",
    "imageUrl": "/images/catalogo/folder.png",
    "pricingType": "unidade",
    "options": {
      "papel": [
        { "id": "couché_brilho_150g", "name": "Couché Brilho 150g" },
        { "id": "couché_brilho_90g", "name": "Couché Brilho 90g" },
        { "id": "couché_brilho_115g", "name": "Couché Brilho 115g" }
      ],
      "tamanho": [
        { "id": "304x214cm_arte_10x21cm_fecha", "name": "30.4x21.4cm Arte (10X21cm Fechado) 2 Dobras" },
        { "id": "304x214cm_arte_15x21cm_fecha", "name": "30.4x21.4cm Arte (15X21cm Fechado)" },
        { "id": "204x144cm_arte_10x14cm_fecha", "name": "20.4x14.4cm Arte (10X14cm fechado)" },
        { "id": "284x204cm_arte_14x20cm_fecha", "name": "28.4x20.4cm Arte (14X20cm Fechado)" }
      ],
      "cores": [
        { "id": "4x4", "name": "4x4" }
      ],
      "acabamento": [
        { "id": "2_dobras", "name": "2 Dobras" },
        { "id": "dobra_e_refile", "name": "Dobra e refile" }
      ]
    }
  },
  {
    "id": "prod_007",
    "nome": "Imã de Geladeira",
    "descricao": "",
    "imageUrl": "/images/catalogo/ima-de-geladeira-com-calendario.png",
    "pricingType": "unidade",
    "options": {
      "papel": [
        { "id": "couché_250g_manta_magnética", "name": "Couché 250g + Manta Magnética" },
        { "id": "couché_250g_manta_magnética_c", "name": "Couché 250g + Manta Magnética + Calendário" }
      ],
      "tamanho": [
        { "id": "53x43cm_arte_5x4cm_final", "name": "5.3x4.3cm Arte (5X4cm Final)" }
      ],
      "cores": [
        { "id": "4x0", "name": "4x0" }
      ],
      "acabamento": [
        { "id": "verniz_total_uv_refile", "name": "Verniz Total UV + Refile" }
      ]
    }
  },
  {
    "id": "prod_016",
    "nome": "Marcador de Página 4.8x17.75cm",
    "descricao": "",
    "imageUrl": "/images/catalogo/marcador-de-pagina.png",
    "pricingType": "unidade",
    "options": {
      "papel": [
        { "id": "couché_300g", "name": "Couché 300g" }
      ],
      "tamanho": [
        { "id": "51x180cm_arte_48x1775cm_fina", "name": "5.1x18.0cm Arte (4.8X17.75cm Final)" }
      ],
      "cores": [
        { "id": "4x0", "name": "4x0" },
        { "id": "4x4", "name": "4x4" }
      ],
      "acabamento": [
        { "id": "verniz_total_frente", "name": "Verniz Total Frente" },
        { "id": "laminação_fosca_frente_e_vers", "name": "Laminação Fosca Frente e Verso" },
        { "id": "laminação_fosca_fv_verniz_loc", "name": "Laminação Fosca FV + Verniz Local." }
      ]
    }
  },
  {
    "id": "prod_new_03",
    "nome": "Não Perturbe",
    "descricao": "",
    "imageUrl": "/images/catalogo/nao-perturbe.png",
    "pricingType": "unidade",
    "options": {
      "papel": [
        { "id": "couché_300g", "name": "Couché 300g" }
      ],
      "tamanho": [
        { "id": "91x1995cm_arte_88x1965cm_fin", "name": "9.1x19.95cm Arte (8.8X19.65cm Final)" }
      ],
      "cores": [
        { "id": "4x0", "name": "4x0" },
        { "id": "4x1", "name": "4x1" },
        { "id": "4x4", "name": "4x4" }
      ],
      "acabamento": [
        { "id": "verniz_total_frente", "name": "Verniz Total Frente" }
      ]
    }
  },
  {
    "id": "prod_010",
    "nome": "Panfletos",
    "descricao": "",
    "imageUrl": "/images/catalogo/panfleto.png",
    "pricingType": "unidade",
    "options": {
      "papel": [
        { "id": "couché_brilho_90g", "name": "Couché Brilho 90g" }
      ],
      "tamanho": [
        { "id": "104x144cm_arte_10x14cm_final", "name": "10.4x14.4cm Arte (10X14cm Final)" },
        { "id": "144x204cm_arte_14x20cm_final", "name": "14.4x20.4cm Arte (14X20cm Final)" },
        { "id": "214x304cm_arte_21x30cm_final", "name": "21.4x30.4cm Arte (21X30cm Final)" },
        { "id": "204x284cm_aberto_20x28cm_fin", "name": "20.4x28.4cm Aberto (20X28cm Final) ECONÔMICO" },
        { "id": "74x104cm_arte_7x10cm_final", "name": "7.4x10.4cm Arte (7X10cm Final)" }
      ],
      "cores": [
        { "id": "4x0", "name": "4x0" },
        { "id": "4x4", "name": "4x4" }
      ],
      "acabamento": [
        { "id": "refile", "name": "Refile" }
      ]
    }
  },
  {
    "id": "prod_017",
    "nome": "Papel de Bandeja",
    "descricao": "",
    "imageUrl": "/images/catalogo/papel-bandeja.png",
    "pricingType": "unidade",
    "options": {
      "papel": [
        { "id": "offset_56g", "name": "Offset 56g" }
      ],
      "tamanho": [
        { "id": "35x245cm_arte_344x239cm_fina", "name": "35x24.5cm Arte (34.4X23.9cm Final)" }
      ],
      "cores": [
        { "id": "4x0", "name": "4x0" }
      ],
      "acabamento": [
        { "id": "refile", "name": "Refile" }
      ]
    }
  },
  {
    "id": "prod_new_04",
    "nome": "Pasta Bolso",
    "descricao": "",
    "imageUrl": "/images/catalogo/pasta-bolso.png",
    "pricingType": "unidade",
    "options": {
      "papel": [
        { "id": "triplex_250g", "name": "Triplex 250g" },
        { "id": "triplex_300g", "name": "Triplex 300g" }
      ],
      "tamanho": [
        { "id": "469x406cm_aberto_225x31cm_fe", "name": "46.9x40.6cm Aberto (22.5X31cm Fechado)" }
      ],
      "cores": [
        { "id": "4x0", "name": "4x0" },
        { "id": "4x4", "name": "4x4" }
      ],
      "acabamento": [
        { "id": "verniz_total_uv_fr_corte_e_vi", "name": "Verniz Total UV FR + Corte e Vinco + Colagem" },
        { "id": "laminação_fosca_fr_corte_e_vi", "name": "Laminação Fosca FR + Corte e Vinco + Colagem" }
      ]
    }
  },
  {
    "id": "prod_018",
    "nome": "Pasta Orelha",
    "descricao": "",
    "imageUrl": "/images/catalogo/pasta-orelha.png",
    "pricingType": "unidade",
    "options": {
      "papel": [
        { "id": "triplex_250g", "name": "Triplex 250g" },
        { "id": "triplex_300g", "name": "Triplex 300g" }
      ],
      "tamanho": [
        { "id": "45x32cm_arte_22x31cm_fechado", "name": "45x32cm Arte (22X31cm fechado)" }
      ],
      "cores": [
        { "id": "4x0", "name": "4x0" },
        { "id": "4x4", "name": "4x4" }
      ],
      "acabamento": [
        { "id": "verniz_total_uv_frente_corte", "name": "Verniz Total UV Frente + Corte e Vinco" },
        { "id": "laminação_fosca_frente_corte_", "name": "Laminação Fosca Frente + Corte e Vinco" }
      ]
    }
  },
  {
    "id": "prod_new_05",
    "nome": "Pasta Orelha com Janela",
    "descricao": "",
    "imageUrl": "/images/catalogo/pasta-orelha-com-janela.png",
    "pricingType": "unidade",
    "options": {
      "papel": [
        { "id": "triplex_250g", "name": "Triplex 250g" }
      ],
      "tamanho": [
        { "id": "45x32cm_arte_22x31cm_fechado", "name": "45x32cm Arte (22X31cm fechado)" }
      ],
      "cores": [
        { "id": "4x0", "name": "4x0" }
      ],
      "acabamento": [
        { "id": "verniz_total_uv_frente_corte", "name": "Verniz Total UV Frente + Corte e Vinco" }
      ]
    }
  },
  {
    "id": "prod_003",
    "nome": "Porta Banner Roll-Up + Banner",
    "descricao": "",
    "imageUrl": "/images/catalogo/roll-up.png",
    "pricingType": "metro",
    "options": {
      "papel": [
        { "id": "lona_front_380g", "name": "Lona Front 380g" }
      ],
      "tamanho": [
        { "id": "80x200cm_arte_79x199cm_final", "name": "80x200cm Arte (79X199cm Final)" }
      ],
      "cores": [
        { "id": "4x0", "name": "4x0" }
      ],
      "acabamento": [
        { "id": "padrao", "name": "Padrão" }
      ]
    }
  },
  {
    "id": "prod_019",
    "nome": "Postal",
    "descricao": "",
    "imageUrl": "/images/catalogo/postal.png",
    "pricingType": "unidade",
    "options": {
      "papel": [
        { "id": "couché_300g", "name": "Couché 300g" },
        { "id": "couché_250g", "name": "Couché 250g" }
      ],
      "tamanho": [
        { "id": "91x99cm_arte_88x975cm_final", "name": "9.1x9.9cm Arte (8.8X9.75cm Final)" },
        { "id": "91x15cm_arte_88x147cm_final", "name": "9.1x15cm Arte (8.8X14.7cm Final)" }
      ],
      "cores": [
        { "id": "4x4", "name": "4x4" },
        { "id": "4x1", "name": "4x1" },
        { "id": "4x0", "name": "4x0" }
      ],
      "acabamento": [
        { "id": "laminação_fosca_fv_verniz_loc", "name": "Laminação Fosca FV + Verniz Local." },
        { "id": "verniz_total_frente", "name": "Verniz Total Frente" }
      ]
    }
  },
  {
    "id": "prod_020",
    "nome": "Receituário - Quant em folhas",
    "descricao": "",
    "imageUrl": "/images/catalogo/receituario.png",
    "pricingType": "unidade",
    "options": {
      "papel": [
        { "id": "offset_75g", "name": "Offset 75g" },
        { "id": "offset_90g", "name": "Offset 90g" }
      ],
      "tamanho": [
        { "id": "156x216cm_arte_15x21cm_final", "name": "15.6x21.6cm Arte (15X21cm Final)" }
      ],
      "cores": [
        { "id": "4x0", "name": "4x0" }
      ],
      "acabamento": [
        { "id": "refile", "name": "Refile" },
        { "id": "refile_blocagem_a_cada_50_fol", "name": "Refile + Blocagem a cada 50 folhas" }
      ]
    }
  },
  {
    "id": "prod_new_06",
    "nome": "Rótulos e Adesivos",
    "descricao": "",
    "imageUrl": "/images/catalogo/rotulos-e-adesivos.png",
    "pricingType": "unidade",
    "options": {
      "papel": [
        { "id": "couché_adesivo", "name": "Couché Adesivo" },
        { "id": "bopp_branco_brilho", "name": "Bopp Branco Brilho" }
      ],
      "tamanho": [],
      "cores": [
        { "id": "4x0", "name": "4x0" }
      ],
      "acabamento": [
        { "id": "meio_corte_padrão_entregue_em", "name": "Meio Corte Padrão Entregue em Bobinas de 33cm" }
      ]
    }
  },
  {
    "id": "prod_021",
    "nome": "Sacolas",
    "descricao": "",
    "imageUrl": "/images/catalogo/sacola.png",
    "pricingType": "unidade",
    "options": {
      "papel": [
        { "id": "triplex_215g", "name": "Triplex 215g" }
      ],
      "tamanho": [
        { "id": "657x467cm_aberto_225x323_fec", "name": "65.7x46.7cm aberto (22.5X32.3 fechado) Tam G" }
      ],
      "cores": [
        { "id": "4x0", "name": "4x0" }
      ],
      "acabamento": [
        { "id": "corte_e_vinco_colagem", "name": "Corte e Vinco + Colagem" },
        { "id": "laminação_corte_e_vinco_colag", "name": "Laminação + Corte e Vinco + Colagem" }
      ]
    }
  },
  {
    "id": "prod_new_07",
    "nome": "Sacos para Delivery",
    "descricao": "",
    "imageUrl": "/images/catalogo/saco.png",
    "pricingType": "unidade",
    "options": {
      "papel": [
        { "id": "offset_90g", "name": "Offset 90g" }
      ],
      "tamanho": [
        { "id": "651x465cm_aberto_175x367cm_fe", "name": "65.1x46.5cm aberto (17.5X36.7cm fechado)" }
      ],
      "cores": [
        { "id": "4x0", "name": "4x0" }
      ],
      "acabamento": [
        { "id": "corte_e_vinco_colagem", "name": "Corte e Vinco + Colagem" }
      ]
    }
  },
  {
    "id": "prod_new_08",
    "nome": "Solapa",
    "descricao": "",
    "imageUrl": "/images/catalogo/solapa.png",
    "pricingType": "unidade",
    "options": {
      "papel": [
        { "id": "couché_250g", "name": "Couché 250g" }
      ],
      "tamanho": [
        { "id": "91x99cm_arte_88x975cm_final", "name": "9.1x9.9cm Arte (8.8X9.75cm Final)" },
        { "id": "91x15cm_arte_88x147cm_final", "name": "9.1x15cm Arte (8.8X14.7cm Final)" }
      ],
      "cores": [
        { "id": "4x0", "name": "4x0" }
      ],
      "acabamento": [
        { "id": "verniz_total_frente", "name": "Verniz Total Frente" }
      ]
    }
  },
  {
    "id": "prod_009",
    "nome": "Tags",
    "descricao": "",
    "imageUrl": "/images/catalogo/tags.png",
    "pricingType": "unidade",
    "options": {
      "papel": [
        { "id": "couché_300g", "name": "Couché 300g" },
        { "id": "couché_250g", "name": "Couché 250g" }
      ],
      "tamanho": [
        { "id": "51x91cm_arte_48x88cm_final", "name": "5.1x9.1cm Arte (4.8X8.8cm Final)" },
        { "id": "47x51cm_arte_44x48cm_final", "name": "4.7x5.1cm Arte (4.4X4.8cm Final)" },
        { "id": "51x91cm_arte_48x88cm_final_co", "name": "5.1x9.1cm Arte (4.8X8.8cm Final) Colar Brinco" }
      ],
      "cores": [
        { "id": "4x4", "name": "4x4" }
      ],
      "acabamento": [
        { "id": "verniz_uv_total_furo", "name": "Verniz UV Total + Furo" },
        { "id": "laminação_fosca_fv_furo", "name": "Laminação Fosca FV + Furo" },
        { "id": "laminação_fosca_fv_verniz_loc", "name": "Laminação Fosca FV + Verniz Loc. + Furo" },
        { "id": "verniz_total_frente_cantos_ar", "name": "Verniz Total Frente + Cantos Arred + Furo" },
        { "id": "lam_fosca_fv_cantos_arred_fur", "name": "Lam Fosca FV + Cantos Arred + Furo" },
        { "id": "lam_f_fv_verniz_loc_cantos_ar", "name": "Lam F FV + Verniz Loc.+ Cantos Arred + Furo" },
        { "id": "verniz_total_frente", "name": "Verniz Total Frente" }
      ]
    }
  },
  {
    "id": "prod_022",
    "nome": "Tapete Lava Jato",
    "descricao": "",
    "imageUrl": "/images/catalogo/lava-jato.png",
    "pricingType": "unidade",
    "options": {
      "papel": [
        { "id": "offset_56g", "name": "Offset 56g" }
      ],
      "tamanho": [
        { "id": "326x454cm_arte_32x448cm_fina", "name": "32.6x45.4cm Arte (32X44.8cm Final)" }
      ],
      "cores": [
        { "id": "4x0", "name": "4x0" }
      ],
      "acabamento": [
        { "id": "refile", "name": "Refile" }
      ]
    }
  },
  {
    "id": "prod_023",
    "nome": "Timbrado",
    "descricao": "",
    "imageUrl": "/images/catalogo/timbrado.png",
    "pricingType": "unidade",
    "options": {
      "papel": [
        { "id": "offset_75g", "name": "Offset 75g" },
        { "id": "offset_90g", "name": "Offset 90g" }
      ],
      "tamanho": [
        { "id": "216x303cm_arte_21x297cm_fina", "name": "21.6x30.3cm Arte (21X29.7cm Final)" }
      ],
      "cores": [
        { "id": "4x0", "name": "4x0" }
      ],
      "acabamento": [
        { "id": "refile", "name": "Refile" }
      ]
    }
  },
  {
    "id": "prod_004",
    "nome": "Totem Eliptico Dobrável",
    "descricao": "",
    "imageUrl": "/images/catalogo/totem.png",
    "pricingType": "unidade",
    "options": {
      "papel": [
        { "id": "duplex_alta_rigidez_350g", "name": "Duplex Alta Rigidez 350g" }
      ],
      "tamanho": [
        { "id": "100x147cm_arte_50x147cm_fecha", "name": "100x147cm Arte (50X147cm fechado)" },
        { "id": "120x170cm_arte_60x170cm_fecha", "name": "120x170cm Arte (60X170cm fechado)" },
        { "id": "144x180cm_arte_72x180cm_fecha", "name": "144x180cm Arte (72X180cm fechado)" }
      ],
      "cores": [
        { "id": "4x0", "name": "4x0" }
      ],
      "acabamento": [
        { "id": "corte_e_vinco_colagem", "name": "Corte e Vinco + Colagem" }
      ]
    }
  },
  {
    "id": "prod_024",
    "nome": "Ventarola / Abanador",
    "descricao": "",
    "imageUrl": "/images/catalogo/abanador.png",
    "pricingType": "unidade",
    "options": {
      "papel": [
        { "id": "triplex_300g", "name": "Triplex 300g" },
        { "id": "triplex_250g", "name": "Triplex 250g" }
      ],
      "tamanho": [
        { "id": "215x215cm_arte_21x21cm_final", "name": "21.5x21.5cm Arte (21X21cm Final)" }
      ],
      "cores": [
        { "id": "4x0", "name": "4x0" },
        { "id": "4x4", "name": "4x4" }
      ],
      "acabamento": [
        { "id": "corte_e_vinco", "name": "Corte e Vinco" }
      ]
    }
  },
  {
    "id": "prod_029",
    "nome": "Big  Flag",
    "descricao": "· HASTE COMPLETA, POREM É EM ALUMINIO E FIBRA DE VIDRO\n· TECIDO OXFORD  ( QUALIDADE E TAMANHO INFERIOR PROPORCIONAL AO WINDBANNER )",
    "imageUrl": "/images/catalogo/bigflag.png",
    "pricingType": "unidade",
    "options": {
      "papel": [
        { "id": "completo", "name": "Completo" },
        { "id": "só_tecido", "name": "Só Tecido" }
      ],
      "tamanho": [
        { "id": "180m_150x36", "name": "1.80m (150x36)" },
        { "id": "250m_145x50", "name": "2.50m (145x50)" },
        { "id": "310m_200x60", "name": "3.10m (200x60)" },
        { "id": "350m_250x71", "name": "3.50m (250x71)" }
      ],
      "cores": [
        { "id": "4x4", "name": "4x4" }
      ],
      "acabamento": [
        { "id": "faca", "name": "Faca" },
        { "id": "vela", "name": "Vela" },
        { "id": "pena", "name": "Pena" }
      ]
    }
  },
  {
    "id": "prod_030",
    "nome": "Wind Banner",
    "descricao": "· HASTE MONTAVEL EM ALUMINIO\n· TECIDO TECNHSPORT ( QUALIDADE E TAMANHO MAIOR PROPORCIONAL AO BIGFLAG )",
    "imageUrl": "/images/catalogo/windbanner.png",
    "pricingType": "unidade",
    "options": {
      "papel": [
        { "id": "completo", "name": "Completo" },
        { "id": "só_tecido", "name": "Só Tecido" }
      ],
      "tamanho": [
        { "id": "20m_155x60", "name": "2.0m (155x60)" },
        { "id": "250m_200x60", "name": "2.50m (200x60)" },
        { "id": "30m_250x60", "name": "3.0m (250x60)" },
        { "id": "35m_290x60", "name": "3.5m (290x60)" }
      ],
      "cores": [
        { "id": "4x4", "name": "4x4" }
      ],
      "acabamento": [
        { "id": "faca", "name": "Faca" },
        { "id": "vela", "name": "Vela" },
        { "id": "pena", "name": "Pena" }
      ]
    }
  },
  {
    "id": "prod_031",
    "nome": "Pulseira de Evento",
    "descricao": "",
    "imageUrl": "/images/catalogo/pulseira-de-cetim.png",
    "pricingType": "unidade",
    "options": {
      "papel": [
        { "id": "cetim", "name": "Cetim" }
      ],
      "tamanho": [
        { "id": "300x20_320x20", "name": "300x20 (320x20)" },
        { "id": "300x15_320x15", "name": "300x15 (320x15)" }
      ],
      "cores": [
        { "id": "4x0", "name": "4x0" }
      ],
      "acabamento": [
        { "id": "padrão", "name": "Padrão" }
      ]
    }
  },
  {
    "id": "prod_032",
    "nome": "Tapete de Carpacho Impresso",
    "descricao": "",
    "imageUrl": "/images/catalogo/tapete-impresso.png",
    "pricingType": "metro",
    "options": {
      "papel": [
        { "id": "borracha", "name": "Borracha" }
      ],
      "tamanho": [],
      "cores": [
        { "id": "4x0", "name": "4x0" }
      ],
      "acabamento": [
        { "id": "sem_borda", "name": "Sem Borda" },
        { "id": "borda_rebaixada", "name": "Borda Rebaixada" }
      ]
    }
  },
  {
    "id": "prod_033",
    "nome": "Mochila Pirulito",
    "descricao": "- 01 Mochila:\n Regulável para tamanhos P, M ou G.\n- 01 Haste: \nHaste em Alumínio. \n- 01 Mídia em PS Adesivadas F/V (Dupla-Face)",
    "imageUrl": "/images/catalogo/mochila-pirulito.png",
    "pricingType": "unidade",
    "options": {
      "papel": [
        { "id": "padrão", "name": "Padrão" }
      ],
      "tamanho": [
        { "id": "38x38cm", "name": "38x38cm" }
      ],
      "cores": [
        { "id": "4x4", "name": "4x4" }
      ],
      "acabamento": [
        { "id": "padrão", "name": "Padrão" }
      ]
    }
  },
  {
    "id": "prod_034",
    "nome": "Painel de Festa Redondo",
    "descricao": "",
    "imageUrl": "/images/catalogo/painel-redondo.png",
    "pricingType": "unidade",
    "options": {
      "papel": [
        { "id": "malha_helanca_com_elástico", "name": "Malha Helanca com elástico" }
      ],
      "tamanho": [
        { "id": "50cm", "name": "50cm" },
        { "id": "100cm", "name": "100cm" },
        { "id": "150cm", "name": "150cm" }
      ],
      "cores": [
        { "id": "4x0", "name": "4x0" }
      ],
      "acabamento": [
        { "id": "padrão", "name": "Padrão" }
      ]
    }
  },
  {
    "id": "prod_035",
    "nome": "Capa de Cadeira",
    "descricao": "",
    "imageUrl": "/images/catalogo/capa-de-cadeira.png",
    "pricingType": "unidade",
    "options": {
      "papel": [
        { "id": "padrão", "name": "Padrão" }
      ],
      "tamanho": [
        { "id": "encosto", "name": "Encosto" },
        { "id": "assento_e_encosto", "name": "Assento e Encosto" }
      ],
      "cores": [
        { "id": "4x0", "name": "4x0" }
      ],
      "acabamento": [
        { "id": "padrão", "name": "Padrão" }
      ]
    }
  },
  {
    "id": "prod_036",
    "nome": "Capa de Garrafão",
    "descricao": "",
    "imageUrl": "/images/catalogo/capa-de-garrafao.png",
    "pricingType": "unidade",
    "options": {
      "papel": [
        { "id": "tecido", "name": "Tecido" },
        { "id": "pvc", "name": "PVC" }
      ],
      "tamanho": [
        { "id": "padrão", "name": "Padrão" }
      ],
      "cores": [
        { "id": "4x0", "name": "4x0" }
      ],
      "acabamento": [
        { "id": "padrão", "name": "Padrão" }
      ]
    }
  },
  {
    "id": "prod_037",
    "nome": "Adesivo Perfurado",
    "descricao": "A largura máxima tem tamanho máximo de 1,37m.",
    "imageUrl": "/images/catalogo/capa-de-garrafao.png",
    "pricingType": "metro",
    "options": {
      "papel": [
        { "id": "padrão", "name": "Padrão" }
      ],
      "tamanho": [],
      "cores": [
        { "id": "4x0", "name": "4x0" }
      ],
      "acabamento": [
        { "id": "padrão", "name": "Padrão" }
      ]
    }
  },
  {
    "id": "prod_038",
    "nome": "Adesivo Leitoso",
    "descricao": "A largura máxima tem tamanho máximo de 1,37m.",
    "imageUrl": "/images/catalogo/capa-de-garrafao.png",
    "pricingType": "metro",
    "options": {
      "papel": [
        { "id": "normal", "name": "Normal" },
        { "id": "uv", "name": "UV" }
      ],
      "tamanho": [],
      "cores": [
        { "id": "4x0", "name": "4x0" }
      ],
      "acabamento": [
        { "id": "padrão", "name": "Padrão" }
      ]
    }
  }
];


// --- FUNÇÃO PARA BUSCAR O PRODUTO ---
export const getProductById = (id: string): Product | undefined => {
  return produtosDoCatalogo.find(produto => produto.id === id);
};

// --- FUNÇÃO PARA DELETAR O PRODUTO ---
export const deleteProduct = (id: string): boolean => {
  const index = produtosDoCatalogo.findIndex(p => p.id === id);
  if (index !== -1) {
    produtosDoCatalogo.splice(index, 1);
    return true;
  }
  return false;
};

// --- FUNÇÃO PARA REORDENAR OS PRODUTOS ---
export const reorderProducts = (productIds: string[]): void => {
  const productMap = new Map(produtosDoCatalogo.map(p => [p.id, p]));
  produtosDoCatalogo = productIds.map(id => productMap.get(id)).filter(Boolean) as Product[];
};