// Arquivo: lib/orderData.ts
import { type Product, type ProductOptions } from "./productData";
import { type Cliente, MOCK_CLIENTS } from "./clientData";

// --- TIPOS DE DADOS PARA OS PEDIDOS ---
export type StatusFinanceiro = 'nao_pago' | 'pago_50' | 'pago';
export type StatusProducao = 'pre_prod' | 'em_producao' | 'pronto_retirada' | 'concluido' | 'cancelado';

export type HistoricoItem = {
   status: StatusFinanceiro | StatusProducao;
   data: string;
   user: string;
   motivo?: string;
};

type DetalhesPedidoUnidade = {
   type: 'unidade';
   opcoes: Record<string, string | null>;
   dimensoesPersonalizadas?: { larguraCm: string, alturaCm: string } | null;
   preco: {
      quantidade: number;
      precoCusto: number;
      precoVenda: number;
      precoArte: number;
      total: number;
      custoTotal: number;
      vendaTotal: number;
   };
};

type DetalhesPedidoMetro = {
   type: 'metro';
   opcoes: Record<string, string | null>;
   preco: {
      largura: number;
      altura: number;
      m2Custo: number;
      m2Venda: number;
      valorArte: number;
      total: number;
      valorTotalCusto: number;
      valorTotalVenda: number;
   };
};

type DetalhesPedidoArte = {
   type: 'arte';
   preco: { observacao: string; valorVenda: number, pagamento: string };
};

export type Pedido = {
   id: string;
   dataCriacao: string;
   criadoPor: string;
   cliente: Cliente;
   itemNome: string;
   itemImageUrl: string;
   productId: string;
   valor: number;
   statusFinanceiro: StatusFinanceiro;
   statusProducao: StatusProducao;
   historicoFinanceiro: HistoricoItem[];
   historicoProducao: HistoricoItem[];
   detalhes: DetalhesPedidoUnidade | DetalhesPedidoMetro | DetalhesPedidoArte;
};

export const statusFinanceiroOptions: { value: StatusFinanceiro, label: string }[] = [
   { value: 'nao_pago', label: 'Não Pago' },
   { value: 'pago_50', label: 'Pago 50%' },
   { value: 'pago', label: 'Pago' },
];

export const statusProducaoOptions: { value: StatusProducao, label: string }[] = [
   { value: 'pre_prod', label: 'Pré-Produção' },
   { value: 'em_producao', label: 'Em Produção' },
   { value: 'pronto_retirada', label: 'Pronto p/ Retirada' },
   { value: 'concluido', label: 'Concluído' },
];

// ==========================================================
// MUDANÇA AQUI: MOCK_ORDERS agora é um JSON bruto
// ==========================================================
export let MOCK_ORDERS: Pedido[] = [
   {
      "cliente": {
         "cpfCnpj": "111.222.333-44",
         "email": "cliente1@email.com",
         "id": "cli_001",
         "nome": "Cliente Metro 1 (Original)",
         "telefone1": "(81) 99999-0001",
         "telefone2": ""
      },
      "criadoPor": "Lucas Alves",
      "dataCriacao": "2025-11-18T04:50:00.000Z",
      "detalhes": {
         "opcoes": {
            "acabamento": "ilhos",
            "cores": "4x0",
            "papel": "lona_uv",
            "tamanho": "personalizado"
         },
         "preco": {
            "altura": 1.5,
            "largura": 2,
            "m2Custo": 30,
            "m2Venda": 60,
            "total": 180,
            "valorArte": 0,
            "valorTotalCusto": 90,
            "valorTotalVenda": 180
         },
         "type": "metro"
      },
      "historicoFinanceiro": [
         {
            "data": "2025-11-18T04:50:00.000Z",
            "status": "nao_pago",
            "user": "Lucas Alves"
         }
      ],
      "historicoProducao": [
         {
            "data": "2025-11-18T04:50:00.000Z",
            "status": "pre_prod",
            "user": "Lucas Alves"
         }
      ],
      "id": "PED-1070",
      "itemImageUrl": "/images/catalogo/banner.png",
      "itemNome": "Lona",
      "productId": "prod_001",
      "statusFinanceiro": "nao_pago",
      "statusProducao": "pre_prod",
      "valor": 180
   },
   {
      "cliente": {
         "cpfCnpj": "22.333.444/0001-55",
         "email": "cliente2@email.com",
         "id": "cli_002",
         "nome": "Cliente Unidade 2 (Original)",
         "telefone1": "(81) 98888-0002",
         "telefone2": ""
      },
      "criadoPor": "Phallis Admin",
      "dataCriacao": "2025-11-17T14:30:00.000Z",
      "detalhes": {
         "dimensoesPersonalizadas": null,
         "opcoes": {
            "acabamento": "laminação_fosca_fv_verniz_loc",
            "cores": "4x4",
            "papel": "couché_300g",
            "tamanho": "91x51cm_arte_88x48cm_final"
         },
         "preco": {
            "custoTotal": 100,
            "precoArte": 50,
            "precoCusto": 100,
            "precoVenda": 300,
            "quantidade": 1000,
            "total": 350,
            "vendaTotal": 300
         },
         "type": "unidade"
      },
      "historicoFinanceiro": [
         {
            "data": "2025-11-17T14:30:00.000Z",
            "status": "nao_pago",
            "user": "Phallis Admin"
         },
         {
            "data": "2025-11-17T14:35:00.000Z",
            "status": "pago_50",
            "user": "Phallis Admin"
         }
      ],
      "historicoProducao": [
         {
            "data": "2025-11-17T14:30:00.000Z",
            "status": "pre_prod",
            "user": "Phallis Admin"
         },
         {
            "data": "2025-11-18T09:15:00.000Z",
            "status": "em_producao",
            "user": "Bob Silva"
         }
      ],
      "id": "PED-1069",
      "itemImageUrl": "/images/catalogo/cartao-de-visita.png",
      "itemNome": "Cartão de Visita",
      "productId": "prod_008",
      "statusFinanceiro": "pago_50",
      "statusProducao": "em_producao",
      "valor": 350
   },
   {
      "cliente": {
         "cpfCnpj": "",
         "email": "cliente3@email.com",
         "id": "cli_003",
         "nome": "Cliente Arte 3 (Original)",
         "telefone1": "(81) 97777-0003",
         "telefone2": "(81) 3444-5555"
      },
      "criadoPor": "Bob Silva",
      "dataCriacao": "2025-11-17T11:00:00.000Z",
      "detalhes": {
         "preco": {
            "observacao": "Logo para Instagram e Facebook",
            "pagamento": "pago",
            "valorVenda": 150
         },
         "type": "arte"
      },
      "historicoFinanceiro": [
         {
            "data": "2025-11-17T11:00:00.000Z",
            "status": "pago",
            "user": "Bob Silva"
         }
      ],
      "historicoProducao": [
         {
            "data": "2025-11-17T11:00:00.000Z",
            "status": "pre_prod",
            "user": "Bob Silva"
         },
         {
            "data": "2025-11-17T18:00:00.000Z",
            "status": "concluido",
            "user": "Bob Silva"
         }
      ],
      "id": "PED-1068",
      "itemImageUrl": "/images/catalogo/phalis-kekw.png",
      "itemNome": "Criação de Arte",
      "productId": "prod_099",
      "statusFinanceiro": "pago",
      "statusProducao": "concluido",
      "valor": 150
   },
   {
      "cliente": {
         "cpfCnpj": "",
         "email": "ana.silva@email.com",
         "id": "cli_004",
         "nome": "Ana Silva",
         "telefone1": "(81) 99901-9901",
         "telefone2": ""
      },
      "criadoPor": "Lucas Alves",
      "dataCriacao": "2025-11-16T09:12:00.000Z",
      "detalhes": {
         "dimensoesPersonalizadas": {
            "alturaCm": "10",
            "larguraCm": "5"
         },
         "opcoes": {
            "acabamento": "meio_corte_padrão_entregue_em",
            "cores": "4x0",
            "papel": "bopp_branco_brilho",
            "tamanho": "personalizado"
         },
         "preco": {
            "custoTotal": 80,
            "precoArte": 0,
            "precoCusto": 80,
            "precoVenda": 200,
            "quantidade": 500,
            "total": 200,
            "vendaTotal": 200
         },
         "type": "unidade"
      },
      "historicoFinanceiro": [
         {
            "data": "2025-11-16T09:12:00.000Z",
            "status": "nao_pago",
            "user": "Lucas Alves"
         }
      ],
      "historicoProducao": [
         {
            "data": "2025-11-16T09:12:00.000Z",
            "status": "pre_prod",
            "user": "Lucas Alves"
         }
      ],
      "id": "PED-1067",
      "itemImageUrl": "/images/catalogo/rotulos-e-adesivos.png",
      "itemNome": "Rótulos e Adesivos",
      "productId": "prod_new_06",
      "statusFinanceiro": "nao_pago",
      "statusProducao": "pre_prod",
      "valor": 200
   },
   {
      "cliente": {
         "cpfCnpj": "",
         "email": "bruno.costa@email.com",
         "id": "cli_005",
         "nome": "Bruno Costa",
         "telefone1": "(81) 99902-9902",
         "telefone2": ""
      },
      "criadoPor": "Phallis Admin",
      "dataCriacao": "2025-11-15T17:45:00.000Z",
      "detalhes": {
         "dimensoesPersonalizadas": null,
         "opcoes": {
            "acabamento": "faca",
            "cores": "4x4",
            "papel": "completo",
            "tamanho": "20m_155x60"
         },
         "preco": {
            "custoTotal": 90,
            "precoArte": 0,
            "precoCusto": 90,
            "precoVenda": 180,
            "quantidade": 1,
            "total": 180,
            "vendaTotal": 180
         },
         "type": "unidade"
      },
      "historicoFinanceiro": [
         {
            "data": "2025-11-15T17:45:00.000Z",
            "status": "pago",
            "user": "Phallis Admin"
         }
      ],
      "historicoProducao": [
         {
            "data": "2025-11-15T17:45:00.000Z",
            "status": "pre_prod",
            "user": "Phallis Admin"
         },
         {
            "data": "2025-11-16T10:00:00.000Z",
            "status": "em_producao",
            "user": "Bob Silva"
         },
         {
            "data": "2025-11-17T15:00:00.000Z",
            "status": "pronto_retirada",
            "user": "Bob Silva"
         }
      ],
      "id": "PED-1066",
      "itemImageUrl": "/images/catalogo/windbanner.png",
      "itemNome": "Wind Banner",
      "productId": "prod_030",
      "statusFinanceiro": "pago",
      "statusProducao": "pronto_retirada",
      "valor": 180
   },
   {
      "cliente": {
         "cpfCnpj": "",
         "email": "carla.dias@email.com",
         "id": "cli_006",
         "nome": "Carla Dias",
         "telefone1": "(81) 99903-9903",
         "telefone2": ""
      },
      "criadoPor": "Bob Silva",
      "dataCriacao": "2025-11-15T16:00:00.000Z",
      "detalhes": {
         "opcoes": {
            "acabamento": "padrão",
            "cores": "4x0",
            "papel": "padrão",
            "tamanho": "personalizado"
         },
         "preco": {
            "altura": 0.8,
            "largura": 1,
            "m2Custo": 40,
            "m2Venda": 100,
            "total": 80,
            "valorArte": 0,
            "valorTotalCusto": 32,
            "valorTotalVenda": 80
         },
         "type": "metro"
      },
      "historicoFinanceiro": [
         {
            "data": "2025-11-15T16:00:00.000Z",
            "status": "nao_pago",
            "user": "Bob Silva"
         }
      ],
      "historicoProducao": [
         {
            "data": "2025-11-15T16:00:00.000Z",
            "status": "pre_prod",
            "user": "Bob Silva"
         }
      ],
      "id": "PED-1065",
      "itemImageUrl": "/images/catalogo/capa-de-garrafao.png",
      "itemNome": "Adesivo Perfurado",
      "productId": "prod_037",
      "statusFinanceiro": "nao_pago",
      "statusProducao": "pre_prod",
      "valor": 80
   },
   {
      "cliente": {
         "cpfCnpj": "",
         "email": "d.moreira@email.com",
         "id": "cli_007",
         "nome": "Daniel Moreira",
         "telefone1": "(81) 99904-9904",
         "telefone2": ""
      },
      "criadoPor": "Lucas Alves",
      "dataCriacao": "2025-11-14T11:20:00.000Z",
      "detalhes": {
         "dimensoesPersonalizadas": null,
         "opcoes": {
            "acabamento": "refile",
            "cores": "4x4",
            "papel": "couché_brilho_90g",
            "tamanho": "104x144cm_arte_10x14cm_final"
         },
         "preco": {
            "custoTotal": 120,
            "precoArte": 0,
            "precoCusto": 120,
            "precoVenda": 250,
            "quantidade": 1000,
            "total": 250,
            "vendaTotal": 250
         },
         "type": "unidade"
      },
      "historicoFinanceiro": [
         {
            "data": "2025-11-14T11:20:00.000Z",
            "status": "nao_pago",
            "user": "Lucas Alves"
         },
         {
            "data": "2025-11-14T11:21:00.000Z",
            "status": "pago_50",
            "user": "Lucas Alves"
         }
      ],
      "historicoProducao": [
         {
            "data": "2025-11-14T11:20:00.000Z",
            "status": "pre_prod",
            "user": "Lucas Alves"
         },
         {
            "data": "2025-11-15T09:00:00.000Z",
            "status": "em_producao",
            "user": "Bob Silva"
         }
      ],
      "id": "PED-1064",
      "itemImageUrl": "/images/catalogo/panfleto.png",
      "itemNome": "Panfletos",
      "productId": "prod_010",
      "statusFinanceiro": "pago_50",
      "statusProducao": "em_producao",
      "valor": 250
   },
   {
      "cliente": {
         "cpfCnpj": "",
         "email": "elisa.f@email.com",
         "id": "cli_008",
         "nome": "Elisa Fernandes",
         "telefone1": "(81) 99905-9905",
         "telefone2": ""
      },
      "criadoPor": "Phallis Admin",
      "dataCriacao": "2025-11-13T10:00:00.000Z",
      "detalhes": {
         "dimensoesPersonalizadas": null,
         "opcoes": {
            "acabamento": "laminação_fosca_fv_furo",
            "cores": "4x4",
            "papel": "couché_300g",
            "tamanho": "51x91cm_arte_48x88cm_final"
         },
         "preco": {
            "custoTotal": 70,
            "precoArte": 0,
            "precoCusto": 70,
            "precoVenda": 150,
            "quantidade": 500,
            "total": 150,
            "vendaTotal": 150
         },
         "type": "unidade"
      },
      "historicoFinanceiro": [
         {
            "data": "2025-11-13T10:00:00.000Z",
            "status": "pago",
            "user": "Phallis Admin"
         }
      ],
      "historicoProducao": [
         {
            "data": "2025-11-13T10:00:00.000Z",
            "status": "pre_prod",
            "user": "Phallis Admin"
         },
         {
            "data": "2025-11-14T10:00:00.000Z",
            "status": "em_producao",
            "user": "Bob Silva"
         },
         {
            "data": "2025-11-15T10:00:00.000Z",
            "status": "concluido",
            "user": "Bob Silva"
         }
      ],
      "id": "PED-1063",
      "itemImageUrl": "/images/catalogo/tags.png",
      "itemNome": "Tags",
      "productId": "prod_009",
      "statusFinanceiro": "pago",
      "statusProducao": "concluido",
      "valor": 150
   },
   {
      "cliente": {
         "cpfCnpj": "",
         "email": "fabio_guedes@email.com",
         "id": "cli_009",
         "nome": "Fábio Guedes",
         "telefone1": "(81) 99906-9906",
         "telefone2": ""
      },
      "criadoPor": "Lucas Alves",
      "dataCriacao": "2025-11-12T16:30:00.000Z",
      "detalhes": {
         "dimensoesPersonalizadas": null,
         "opcoes": {
            "acabamento": "corte_e_vinco",
            "cores": "1x0",
            "papel": "kraft_240g",
            "tamanho": "466x304cm_aberto_12x9cm_fecha"
         },
         "preco": {
            "custoTotal": 200,
            "precoArte": 0,
            "precoCusto": 200,
            "precoVenda": 400,
            "quantidade": 1000,
            "total": 400,
            "vendaTotal": 400
         },
         "type": "unidade"
      },
      "historicoFinanceiro": [
         {
            "data": "2025-11-12T16:30:00.000Z",
            "status": "nao_pago",
            "user": "Lucas Alves"
         }
      ],
      "historicoProducao": [
         {
            "data": "2025-11-12T16:30:00.000Z",
            "status": "pre_prod",
            "user": "Lucas Alves"
         }
      ],
      "id": "PED-1062",
      "itemImageUrl": "/images/catalogo/caixa-de-hamburguer.png",
      "itemNome": "Caixa de Hambúrguer",
      "productId": "prod_025",
      "statusFinanceiro": "nao_pago",
      "statusProducao": "pre_prod",
      "valor": 400
   },
   {
      "cliente": {
         "cpfCnpj": "",
         "email": "gabriela.lima@email.com",
         "id": "cli_010",
         "nome": "Gabriela Lima",
         "telefone1": "(81) 99907-9907",
         "telefone2": ""
      },
      "criadoPor": "Bob Silva",
      "dataCriacao": "2025-11-12T15:00:00.000Z",
      "detalhes": {
         "opcoes": {
            "acabamento": "sem_acabamento",
            "cores": "4x0",
            "papel": "lona_normal",
            "tamanho": "personalizado"
         },
         "preco": {
            "altura": 1,
            "largura": 1,
            "m2Custo": 29,
            "m2Venda": 60,
            "total": 60,
            "valorArte": 0,
            "valorTotalCusto": 29,
            "valorTotalVenda": 60
         },
         "type": "metro"
      },
      "historicoFinanceiro": [
         {
            "data": "2025-11-12T15:00:00.000Z",
            "status": "pago",
            "user": "Bob Silva"
         }
      ],
      "historicoProducao": [
         {
            "data": "2025-11-12T15:00:00.000Z",
            "status": "pre_prod",
            "user": "Bob Silva"
         },
         {
            "data": "2025-11-13T10:00:00.000Z",
            "status": "em_producao",
            "user": "Bob Silva"
         },
         {
            "data": "2025-11-14T10:00:00.000Z",
            "status": "pronto_retirada",
            "user": "Bob Silva"
         },
         {
            "data": "2025-11-15T10:00:00.000Z",
            "status": "concluido",
            "user": "Bob Silva"
         }
      ],
      "id": "PED-1061",
      "itemImageUrl": "/images/catalogo/banner.png",
      "itemNome": "Lona",
      "productId": "prod_001",
      "statusFinanceiro": "pago",
      "statusProducao": "concluido",
      "valor": 60
   },
   {
      "cliente": {
         "cpfCnpj": "",
         "email": "hugo.santos@email.com",
         "id": "cli_011",
         "nome": "Hugo Santos",
         "telefone1": "(81) 99908-9908",
         "telefone2": ""
      },
      "criadoPor": "Lucas Alves",
      "dataCriacao": "2025-11-11T10:00:00.000Z",
      "detalhes": {
         "preco": {
            "observacao": "Pacote de 5 artes para feed",
            "pagamento": "pago",
            "valorVenda": 250
         },
         "type": "arte"
      },
      "historicoFinanceiro": [
         {
            "data": "2025-11-11T10:00:00.000Z",
            "status": "pago",
            "user": "Lucas Alves"
         }
      ],
      "historicoProducao": [
         {
            "data": "2025-11-11T10:00:00.000Z",
            "status": "pre_prod",
            "user": "Lucas Alves"
         },
         {
            "data": "2025-11-12T10:00:00.000Z",
            "status": "concluido",
            "user": "Lucas Alves"
         }
      ],
      "id": "PED-1060",
      "itemImageUrl": "/images/catalogo/phalis-kekw.png",
      "itemNome": "Criação de Arte",
      "productId": "prod_099",
      "statusFinanceiro": "pago",
      "statusProducao": "concluido",
      "valor": 250
   },
   {
      "cliente": {
         "cpfCnpj": "",
         "email": "isabela.p@email.com",
         "id": "cli_013",
         "nome": "Isabela Pereira",
         "telefone1": "(81) 99909-9909",
         "telefone2": ""
      },
      "criadoPor": "Phallis Admin",
      "dataCriacao": "2025-11-10T09:00:00.000Z",
      "detalhes": {
         "dimensoesPersonalizadas": null,
         "opcoes": {
            "acabamento": "padrão",
            "cores": "4x0",
            "papel": "cetim",
            "tamanho": "300x15_320x15"
         },
         "preco": {
            "custoTotal": 250,
            "precoArte": 0,
            "precoCusto": 250,
            "precoVenda": 500,
            "quantidade": 1000,
            "total": 500,
            "vendaTotal": 500
         },
         "type": "unidade"
      },
      "historicoFinanceiro": [
         {
            "data": "2025-11-10T09:00:00.000Z",
            "status": "nao_pago",
            "user": "Phallis Admin"
         },
         {
            "data": "2025-11-10T09:05:00.000Z",
            "status": "pago_50",
            "user": "Phallis Admin"
         }
      ],
      "historicoProducao": [
         {
            "data": "2025-11-10T09:00:00.000Z",
            "status": "pre_prod",
            "user": "Phallis Admin"
         },
         {
            "data": "2025-11-11T09:00:00.000Z",
            "status": "em_producao",
            "user": "Bob Silva"
         }
      ],
      "id": "PED-1059",
      "itemImageUrl": "/images/catalogo/pulseira-de-cetim.png",
      "itemNome": "Pulseira de Evento",
      "productId": "prod_031",
      "statusFinanceiro": "pago_50",
      "statusProducao": "em_producao",
      "valor": 500
   },
   {
      "cliente": {
         "cpfCnpj": "",
         "email": "joao.medeiros@email.com",
         "id": "cli_014",
         "nome": "João Medeiros",
         "telefone1": "(81) 99910-9910",
         "telefone2": ""
      },
      "criadoPor": "Bob Silva",
      "dataCriacao": "2025-11-09T15:00:00.000Z",
      "detalhes": {
         "opcoes": {
            "acabamento": "borda_rebaixada",
            "cores": "4x0",
            "papel": "borracha",
            "tamanho": "personalizado"
         },
         "preco": {
            "altura": 2,
            "largura": 1.2,
            "m2Custo": 50,
            "m2Venda": 100,
            "total": 240,
            "valorArte": 0,
            "valorTotalCusto": 120,
            "valorTotalVenda": 240
         },
         "type": "metro"
      },
      "historicoFinanceiro": [
         {
            "data": "2025-11-09T15:00:00.000Z",
            "status": "nao_pago",
            "user": "Bob Silva"
         }
      ],
      "historicoProducao": [
         {
            "data": "2025-11-09T15:00:00.000Z",
            "status": "pre_prod",
            "user": "Bob Silva"
         }
      ],
      "id": "PED-1058",
      "itemImageUrl": "/images/catalogo/tapete-impresso.png",
      "itemNome": "Tapete de Carpacho Impresso",
      "productId": "prod_032",
      "statusFinanceiro": "nao_pago",
      "statusProducao": "pre_prod",
      "valor": 240
   },
   {
      "cliente": {
         "cpfCnpj": "",
         "email": "karina.oliveira@email.com",
         "id": "cli_015",
         "nome": "Karina Oliveira",
         "telefone1": "(81) 99911-9911",
         "telefone2": ""
      },
      "criadoPor": "Lucas Alves",
      "dataCriacao": "2025-11-08T14:00:00.000Z",
      "detalhes": {
         "dimensoesPersonalizadas": null,
         "opcoes": {
            "acabamento": "dobra_e_refile",
            "cores": "4x4",
            "papel": "couché_brilho_115g",
            "tamanho": "304x214cm_arte_15x21cm_fecha"
         },
         "preco": {
            "custoTotal": 200,
            "precoArte": 0,
            "precoCusto": 200,
            "precoVenda": 450,
            "quantidade": 1000,
            "total": 450,
            "vendaTotal": 450
         },
         "type": "unidade"
      },
      "historicoFinanceiro": [
         {
            "data": "2025-11-08T14:00:00.000Z",
            "status": "nao_pago",
            "user": "Lucas Alves"
         }
      ],
      "historicoProducao": [
         {
            "data": "2025-11-08T14:00:00.000Z",
            "status": "pre_prod",
            "user": "Lucas Alves"
         }
      ],
      "id": "PED-1057",
      "itemImageUrl": "/images/catalogo/folder.png",
      "itemNome": "Folder",
      "productId": "prod_015",
      "statusFinanceiro": "nao_pago",
      "statusProducao": "pre_prod",
      "valor": 450
   },
   {
      "cliente": {
         "cpfCnpj": "",
         "email": "leo.barros@email.com",
         "id": "cli_012",
         "nome": "Leonardo Barros",
         "telefone1": "(81) 99912-9912",
         "telefone2": ""
      },
      "criadoPor": "Phallis Admin",
      "dataCriacao": "2025-11-07T13:00:00.000Z",
      "detalhes": {
         "dimensoesPersonalizadas": null,
         "opcoes": {
            "acabamento": "cordao",
            "cores": "4x0",
            "papel": "offset_180g",
            "tamanho": "p"
         },
         "preco": {
            "custoTotal": 600,
            "precoArte": 0,
            "precoCusto": 600,
            "precoVenda": 1200,
            "quantidade": 500,
            "total": 1200,
            "vendaTotal": 1200
         },
         "type": "unidade"
      },
      "historicoFinanceiro": [
         {
            "data": "2025-11-07T13:00:00.000Z",
            "status": "nao_pago",
            "user": "Phallis Admin"
         },
         {
            "data": "2025-11-07T13:05:00.000Z",
            "status": "pago_50",
            "user": "Phallis Admin"
         }
      ],
      "historicoProducao": [
         {
            "data": "2025-11-07T13:00:00.000Z",
            "status": "pre_prod",
            "user": "Phallis Admin"
         },
         {
            "data": "2025-11-08T10:00:00.000Z",
            "status": "em_producao",
            "user": "Bob Silva"
         }
      ],
      "id": "PED-1056",
      "itemImageUrl": "/images/catalogo/sacola.png",
      "itemNome": "Sacolas",
      "productId": "prod_021",
      "statusFinanceiro": "pago_50",
      "statusProducao": "em_producao",
      "valor": 1200
   },
   {
      "cliente": {
         "cpfCnpj": "",
         "email": "mariana.farias@email.com",
         "id": "cli_016",
         "nome": "Mariana Farias",
         "telefone1": "(81) 99913-9913",
         "telefone2": ""
      },
      "criadoPor": "Bob Silva",
      "dataCriacao": "2025-11-06T12:00:00.000Z",
      "detalhes": {
         "opcoes": {
            "acabamento": "madeirinhas_e_ponteiras",
            "cores": "4x0",
            "papel": "lona_normal",
            "tamanho": "personalizado"
         },
         "preco": {
            "altura": 2.5,
            "largura": 2,
            "m2Custo": 29,
            "m2Venda": 60,
            "total": 300,
            "valorArte": 0,
            "valorTotalCusto": 145,
            "valorTotalVenda": 300
         },
         "type": "metro"
      },
      "historicoFinanceiro": [
         {
            "data": "2025-11-06T12:00:00.000Z",
            "status": "nao_pago",
            "user": "Bob Silva"
         }
      ],
      "historicoProducao": [
         {
            "data": "2025-11-06T12:00:00.000Z",
            "status": "pre_prod",
            "user": "Bob Silva"
         }
      ],
      "id": "PED-1055",
      "itemImageUrl": "/images/catalogo/banner.png",
      "itemNome": "Lona",
      "productId": "prod_001",
      "statusFinanceiro": "nao_pago",
      "statusProducao": "pre_prod",
      "valor": 300
   },
   {
      "cliente": {
         "cpfCnpj": "",
         "email": "nicolas.azevedo@email.com",
         "id": "cli_017",
         "nome": "Nícolas Azevedo",
         "telefone1": "(81) 99914-9914",
         "telefone2": ""
      },
      "criadoPor": "Lucas Alves",
      "dataCriacao": "2025-11-05T18:00:00.000Z",
      "detalhes": {
         "dimensoesPersonalizadas": null,
         "opcoes": {
            "acabamento": "vela",
            "cores": "4x4",
            "papel": "completo",
            "tamanho": "250m_145x50"
         },
         "preco": {
            "custoTotal": 110,
            "precoArte": 0,
            "precoCusto": 110,
            "precoVenda": 220,
            "quantidade": 1,
            "total": 220,
            "vendaTotal": 220
         },
         "type": "unidade"
      },
      "historicoFinanceiro": [
         {
            "data": "2025-11-05T18:00:00.000Z",
            "status": "pago",
            "user": "Lucas Alves"
         }
      ],
      "historicoProducao": [
         {
            "data": "2025-11-05T18:00:00.000Z",
            "status": "pre_prod",
            "user": "Lucas Alves"
         },
         {
            "data": "2025-11-06T10:00:00.000Z",
            "status": "em_producao",
            "user": "Bob Silva"
         },
         {
            "data": "2025-11-07T10:00:00.000Z",
            "status": "concluido",
            "user": "Bob Silva"
         }
      ],
      "id": "PED-1054",
      "itemImageUrl": "/images/catalogo/bigflag.png",
      "itemNome": "Big  Flag",
      "productId": "prod_029",
      "statusFinanceiro": "pago",
      "statusProducao": "concluido",
      "valor": 220
   },
   {
      "cliente": {
         "cpfCnpj": "",
         "email": "olivia.ribeiro@email.com",
         "id": "cli_018",
         "nome": "Olívia Ribeiro",
         "telefone1": "(81) 99915-9915",
         "telefone2": ""
      },
      "criadoPor": "Phallis Admin",
      "dataCriacao": "2025-11-05T17:00:00.000Z",
      "detalhes": {
         "opcoes": {
            "acabamento": "padrão",
            "cores": "4x0",
            "papel": "normal",
            "tamanho": "personalizado"
         },
         "preco": {
            "altura": 1,
            "largura": 1,
            "m2Custo": 40,
            "m2Venda": 90,
            "total": 90,
            "valorArte": 0,
            "valorTotalCusto": 40,
            "valorTotalVenda": 90
         },
         "type": "metro"
      },
      "historicoFinanceiro": [
         {
            "data": "2025-11-05T17:00:00.000Z",
            "status": "nao_pago",
            "user": "Phallis Admin"
         }
      ],
      "historicoProducao": [
         {
            "data": "2025-11-05T17:00:00.000Z",
            "status": "pre_prod",
            "user": "Phallis Admin"
         }
      ],
      "id": "PED-1053",
      "itemImageUrl": "/images/catalogo/capa-de-garrafao.png",
      "itemNome": "Adesivo Leitoso",
      "productId": "prod_038",
      "statusFinanceiro": "nao_pago",
      "statusProducao": "pre_prod",
      "valor": 90
   },
   {
      "cliente": {
         "cpfCnpj": "",
         "email": "paulo.cavalcanti@email.com",
         "id": "cli_019",
         "nome": "Paulo Cavalcanti",
         "telefone1": "(81) 99916-9916",
         "telefone2": ""
      },
      "criadoPor": "Bob Silva",
      "dataCriacao": "2025-11-04T16:00:00.000Z",
      "detalhes": {
         "preco": {
            "observacao": "Ajuste de arte para banner",
            "pagamento": "pago_50",
            "valorVenda": 80
         },
         "type": "arte"
      },
      "historicoFinanceiro": [
         {
            "data": "2025-11-04T16:00:00.000Z",
            "status": "nao_pago",
            "user": "Bob Silva"
         },
         {
            "data": "2025-11-04T16:05:00.000Z",
            "status": "pago_50",
            "user": "Bob Silva"
         }
      ],
      "historicoProducao": [
         {
            "data": "2025-11-04T16:00:00.000Z",
            "status": "pre_prod",
            "user": "Bob Silva"
         },
         {
            "data": "2025-11-05T10:00:00.000Z",
            "status": "em_producao",
            "user": "Bob Silva"
         }
      ],
      "id": "PED-1052",
      "itemImageUrl": "/images/catalogo/phalis-kekw.png",
      "itemNome": "Criação de Arte",
      "productId": "prod_099",
      "statusFinanceiro": "pago_50",
      "statusProducao": "em_producao",
      "valor": 80
   },
   {
      "cliente": {
         "cpfCnpj": "",
         "email": "rafaela.albuq@email.com",
         "id": "cli_020",
         "nome": "Rafaela Albuquerque",
         "telefone1": "(81) 99917-9917",
         "telefone2": ""
      },
      "criadoPor": "Lucas Alves",
      "dataCriacao": "2025-11-03T14:00:00.000Z",
      "detalhes": {
         "dimensoesPersonalizadas": null,
         "opcoes": {
            "acabamento": "verniz_total_frente",
            "cores": "4x0",
            "papel": "couché_250g",
            "tamanho": "91x51cm_arte_88x48cm_final"
         },
         "preco": {
            "custoTotal": 80,
            "precoArte": 0,
            "precoCusto": 80,
            "precoVenda": 180,
            "quantidade": 500,
            "total": 180,
            "vendaTotal": 180
         },
         "type": "unidade"
      },
      "historicoFinanceiro": [
         {
            "data": "2025-11-03T14:00:00.000Z",
            "status": "pago",
            "user": "Lucas Alves"
         }
      ],
      "historicoProducao": [
         {
            "data": "2025-11-03T14:00:00.000Z",
            "status": "pre_prod",
            "user": "Lucas Alves"
         },
         {
            "data": "2025-11-04T10:00:00.000Z",
            "status": "em_producao",
            "user": "Bob Silva"
         },
         {
            "data": "2025-11-05T10:00:00.000Z",
            "status": "concluido",
            "user": "Bob Silva"
         }
      ],
      "id": "PED-1051",
      "itemImageUrl": "/images/catalogo/cartao-de-visita.png",
      "itemNome": "Cartão de Visita",
      "productId": "prod_008",
      "statusFinanceiro": "pago",
      "statusProducao": "concluido",
      "valor": 180
   },
   {
      "cliente": {
         "cpfCnpj": "111.222.333-44",
         "email": "cliente1@email.com",
         "id": "cli_001",
         "nome": "Cliente Metro 1 (Original)",
         "telefone1": "(81) 99999-0001",
         "telefone2": ""
      },
      "criadoPor": "Lucas Alves",
      "dataCriacao": "2025-11-18T04:50:00.000Z",
      "detalhes": {
         "opcoes": {
            "acabamento": "sem_acabamento",
            "cores": "4x0",
            "papel": "lona_uv",
            "tamanho": "personalizado"
         },
         "preco": {
            "altura": 1.5,
            "largura": 2,
            "m2Custo": 30,
            "m2Venda": 60,
            "total": 180,
            "valorArte": 0,
            "valorTotalCusto": 90,
            "valorTotalVenda": 180
         },
         "type": "metro"
      },
      "historicoFinanceiro": [
         {
            "data": "2025-11-18T04:50:00.000Z",
            "status": "nao_pago",
            "user": "Lucas Alves"
         }
      ],
      "historicoProducao": [
         {
            "data": "2025-11-18T04:50:00.000Z",
            "status": "pre_prod",
            "user": "Lucas Alves"
         }
      ],
      "id": "PED-1050",
      "itemImageUrl": "/images/catalogo/banner.png",
      "itemNome": "Lona",
      "productId": "prod_001",
      "statusFinanceiro": "nao_pago",
      "statusProducao": "pre_prod",
      "valor": 180
   },
   {
      "cliente": {
         "cpfCnpj": "22.333.444/0001-55",
         "email": "cliente2@email.com",
         "id": "cli_002",
         "nome": "Cliente Unidade 2 (Original)",
         "telefone1": "(81) 98888-0002",
         "telefone2": ""
      },
      "criadoPor": "Phallis Admin",
      "dataCriacao": "2025-11-17T14:30:00.000Z",
      "detalhes": {
         "dimensoesPersonalizadas": null,
         "opcoes": {
            "acabamento": "laminação_fosca_fv_verniz_loc",
            "cores": "4x4",
            "papel": "couché_300g",
            "tamanho": "91x51cm_arte_88x48cm_final"
         },
         "preco": {
            "custoTotal": 100,
            "precoArte": 50,
            "precoCusto": 100,
            "precoVenda": 300,
            "quantidade": 1000,
            "total": 350,
            "vendaTotal": 300
         },
         "type": "unidade"
      },
      "historicoFinanceiro": [
         {
            "data": "2025-11-17T14:30:00.000Z",
            "status": "nao_pago",
            "user": "Phallis Admin"
         },
         {
            "data": "2025-11-17T14:35:00.000Z",
            "status": "pago_50",
            "user": "Phallis Admin"
         }
      ],
      "historicoProducao": [
         {
            "data": "2025-11-17T14:30:00.000Z",
            "status": "pre_prod",
            "user": "Phallis Admin"
         },
         {
            "data": "2025-11-18T09:15:00.000Z",
            "status": "em_producao",
            "user": "Bob Silva"
         }
      ],
      "id": "PED-1049",
      "itemImageUrl": "/images/catalogo/cartao-de-visita.png",
      "itemNome": "Cartão de Visita",
      "productId": "prod_008",
      "statusFinanceiro": "pago_50",
      "statusProducao": "em_producao",
      "valor": 350
   },
   {
      "cliente": {
         "cpfCnpj": "",
         "email": "cliente3@email.com",
         "id": "cli_003",
         "nome": "Cliente Arte 3 (Original)",
         "telefone1": "(81) 97777-0003",
         "telefone2": "(81) 3444-5555"
      },
      "criadoPor": "Bob Silva",
      "dataCriacao": "2025-11-17T11:00:00.000Z",
      "detalhes": {
         "preco": {
            "observacao": "Logo para Instagram e Facebook",
            "pagamento": "pago",
            "valorVenda": 150
         },
         "type": "arte"
      },
      "historicoFinanceiro": [
         {
            "data": "2025-11-17T11:00:00.000Z",
            "status": "pago",
            "user": "Bob Silva"
         }
      ],
      "historicoProducao": [
         {
            "data": "2025-11-17T11:00:00.000Z",
            "status": "pre_prod",
            "user": "Bob Silva"
         },
         {
            "data": "2025-11-17T18:00:00.000Z",
            "status": "concluido",
            "user": "Bob Silva"
         }
      ],
      "id": "PED-1048",
      "itemImageUrl": "/images/catalogo/phalis-kekw.png",
      "itemNome": "Criação de Arte",
      "productId": "prod_099",
      "statusFinanceiro": "pago",
      "statusProducao": "concluido",
      "valor": 150
   },
   {
      "cliente": {
         "cpfCnpj": "",
         "email": "ana.silva@email.com",
         "id": "cli_004",
         "nome": "Ana Silva",
         "telefone1": "(81) 99901-9901",
         "telefone2": ""
      },
      "criadoPor": "Lucas Alves",
      "dataCriacao": "2025-11-16T09:12:00.000Z",
      "detalhes": {
         "dimensoesPersonalizadas": {
            "alturaCm": "10",
            "larguraCm": "5"
         },
         "opcoes": {
            "acabamento": "meio_corte_padrão_entregue_em",
            "cores": "4x0",
            "papel": "bopp_branco_brilho",
            "tamanho": "personalizado"
         },
         "preco": {
            "custoTotal": 80,
            "precoArte": 0,
            "precoCusto": 80,
            "precoVenda": 200,
            "quantidade": 500,
            "total": 200,
            "vendaTotal": 200
         },
         "type": "unidade"
      },
      "historicoFinanceiro": [
         {
            "data": "2025-11-16T09:12:00.000Z",
            "status": "nao_pago",
            "user": "Lucas Alves"
         }
      ],
      "historicoProducao": [
         {
            "data": "2025-11-16T09:12:00.000Z",
            "status": "pre_prod",
            "user": "Lucas Alves"
         }
      ],
      "id": "PED-1047",
      "itemImageUrl": "/images/catalogo/rotulos-e-adesivos.png",
      "itemNome": "Rótulos e Adesivos",
      "productId": "prod_new_06",
      "statusFinanceiro": "nao_pago",
      "statusProducao": "pre_prod",
      "valor": 200
   },
   {
      "cliente": {
         "cpfCnpj": "",
         "email": "bruno.costa@email.com",
         "id": "cli_005",
         "nome": "Bruno Costa",
         "telefone1": "(81) 99902-9902",
         "telefone2": ""
      },
      "criadoPor": "Phallis Admin",
      "dataCriacao": "2025-11-15T17:45:00.000Z",
      "detalhes": {
         "dimensoesPersonalizadas": null,
         "opcoes": {
            "acabamento": "faca",
            "cores": "4x4",
            "papel": "completo",
            "tamanho": "20m_155x60"
         },
         "preco": {
            "custoTotal": 90,
            "precoArte": 0,
            "precoCusto": 90,
            "precoVenda": 180,
            "quantidade": 1,
            "total": 180,
            "vendaTotal": 180
         },
         "type": "unidade"
      },
      "historicoFinanceiro": [
         {
            "data": "2025-11-15T17:45:00.000Z",
            "status": "pago",
            "user": "Phallis Admin"
         }
      ],
      "historicoProducao": [
         {
            "data": "2025-11-15T17:45:00.000Z",
            "status": "pre_prod",
            "user": "Phallis Admin"
         },
         {
            "data": "2025-11-16T10:00:00.000Z",
            "status": "em_producao",
            "user": "Bob Silva"
         },
         {
            "data": "2025-11-17T15:00:00.000Z",
            "status": "pronto_retirada",
            "user": "Bob Silva"
         }
      ],
      "id": "PED-1046",
      "itemImageUrl": "/images/catalogo/windbanner.png",
      "itemNome": "Wind Banner",
      "productId": "prod_030",
      "statusFinanceiro": "pago",
      "statusProducao": "pronto_retirada",
      "valor": 180
   },
   {
      "cliente": {
         "cpfCnpj": "",
         "email": "carla.dias@email.com",
         "id": "cli_006",
         "nome": "Carla Dias",
         "telefone1": "(81) 99903-9903",
         "telefone2": ""
      },
      "criadoPor": "Bob Silva",
      "dataCriacao": "2025-11-15T16:00:00.000Z",
      "detalhes": {
         "opcoes": {
            "acabamento": "padrão",
            "cores": "4x0",
            "papel": "padrão",
            "tamanho": "personalizado"
         },
         "preco": {
            "altura": 0.8,
            "largura": 1,
            "m2Custo": 40,
            "m2Venda": 100,
            "total": 80,
            "valorArte": 0,
            "valorTotalCusto": 32,
            "valorTotalVenda": 80
         },
         "type": "metro"
      },
      "historicoFinanceiro": [
         {
            "data": "2025-11-15T16:00:00.000Z",
            "status": "nao_pago",
            "user": "Bob Silva"
         }
      ],
      "historicoProducao": [
         {
            "data": "2025-11-15T16:00:00.000Z",
            "status": "pre_prod",
            "user": "Bob Silva"
         }
      ],
      "id": "PED-1045",
      "itemImageUrl": "/images/catalogo/capa-de-garrafao.png",
      "itemNome": "Adesivo Perfurado",
      "productId": "prod_037",
      "statusFinanceiro": "nao_pago",
      "statusProducao": "pre_prod",
      "valor": 80
   },
   {
      "cliente": {
         "cpfCnpj": "",
         "email": "d.moreira@email.com",
         "id": "cli_007",
         "nome": "Daniel Moreira",
         "telefone1": "(81) 99904-9904",
         "telefone2": ""
      },
      "criadoPor": "Lucas Alves",
      "dataCriacao": "2025-11-14T11:20:00.000Z",
      "detalhes": {
         "dimensoesPersonalizadas": null,
         "opcoes": {
            "acabamento": "refile",
            "cores": "4x4",
            "papel": "couché_brilho_90g",
            "tamanho": "104x144cm_arte_10x14cm_final"
         },
         "preco": {
            "custoTotal": 120,
            "precoArte": 0,
            "precoCusto": 120,
            "precoVenda": 250,
            "quantidade": 1000,
            "total": 250,
            "vendaTotal": 250
         },
         "type": "unidade"
      },
      "historicoFinanceiro": [
         {
            "data": "2025-11-14T11:20:00.000Z",
            "status": "nao_pago",
            "user": "Lucas Alves"
         },
         {
            "data": "2025-11-14T11:21:00.000Z",
            "status": "pago_50",
            "user": "Lucas Alves"
         }
      ],
      "historicoProducao": [
         {
            "data": "2025-11-14T11:20:00.000Z",
            "status": "pre_prod",
            "user": "Lucas Alves"
         },
         {
            "data": "2025-11-15T09:00:00.000Z",
            "status": "em_producao",
            "user": "Bob Silva"
         }
      ],
      "id": "PED-1044",
      "itemImageUrl": "/images/catalogo/panfleto.png",
      "itemNome": "Panfletos",
      "productId": "prod_010",
      "statusFinanceiro": "pago_50",
      "statusProducao": "em_producao",
      "valor": 250
   },
   {
      "cliente": {
         "cpfCnpj": "",
         "email": "elisa.f@email.com",
         "id": "cli_008",
         "nome": "Elisa Fernandes",
         "telefone1": "(81) 99905-9905",
         "telefone2": ""
      },
      "criadoPor": "Phallis Admin",
      "dataCriacao": "2025-11-13T10:00:00.000Z",
      "detalhes": {
         "dimensoesPersonalizadas": null,
         "opcoes": {
            "acabamento": "laminação_fosca_fv_furo",
            "cores": "4x4",
            "papel": "couché_300g",
            "tamanho": "51x91cm_arte_48x88cm_final"
         },
         "preco": {
            "custoTotal": 70,
            "precoArte": 0,
            "precoCusto": 70,
            "precoVenda": 150,
            "quantidade": 500,
            "total": 150,
            "vendaTotal": 150
         },
         "type": "unidade"
      },
      "historicoFinanceiro": [
         {
            "data": "2025-11-13T10:00:00.000Z",
            "status": "pago",
            "user": "Phallis Admin"
         }
      ],
      "historicoProducao": [
         {
            "data": "2025-11-13T10:00:00.000Z",
            "status": "pre_prod",
            "user": "Phallis Admin"
         },
         {
            "data": "2025-11-14T10:00:00.000Z",
            "status": "em_producao",
            "user": "Bob Silva"
         },
         {
            "data": "2025-11-15T10:00:00.000Z",
            "status": "concluido",
            "user": "Bob Silva"
         }
      ],
      "id": "PED-1043",
      "itemImageUrl": "/images/catalogo/tags.png",
      "itemNome": "Tags",
      "productId": "prod_009",
      "statusFinanceiro": "pago",
      "statusProducao": "concluido",
      "valor": 150
   },
   {
      "cliente": {
         "cpfCnpj": "",
         "email": "fabio_guedes@email.com",
         "id": "cli_009",
         "nome": "Fábio Guedes",
         "telefone1": "(81) 99906-9906",
         "telefone2": ""
      },
      "criadoPor": "Lucas Alves",
      "dataCriacao": "2025-11-12T16:30:00.000Z",
      "detalhes": {
         "dimensoesPersonalizadas": null,
         "opcoes": {
            "acabamento": "corte_e_vinco",
            "cores": "1x0",
            "papel": "kraft_240g",
            "tamanho": "466x304cm_aberto_12x9cm_fecha"
         },
         "preco": {
            "custoTotal": 200,
            "precoArte": 0,
            "precoCusto": 200,
            "precoVenda": 400,
            "quantidade": 1000,
            "total": 400,
            "vendaTotal": 400
         },
         "type": "unidade"
      },
      "historicoFinanceiro": [
         {
            "data": "2025-11-12T16:30:00.000Z",
            "status": "nao_pago",
            "user": "Lucas Alves"
         }
      ],
      "historicoProducao": [
         {
            "data": "2025-11-12T16:30:00.000Z",
            "status": "pre_prod",
            "user": "Lucas Alves"
         }
      ],
      "id": "PED-1042",
      "itemImageUrl": "/images/catalogo/caixa-de-hamburguer.png",
      "itemNome": "Caixa de Hambúrguer",
      "productId": "prod_025",
      "statusFinanceiro": "nao_pago",
      "statusProducao": "pre_prod",
      "valor": 400
   },
   {
      "cliente": {
         "cpfCnpj": "",
         "email": "gabriela.lima@email.com",
         "id": "cli_010",
         "nome": "Gabriela Lima",
         "telefone1": "(81) 99907-9907",
         "telefone2": ""
      },
      "criadoPor": "Bob Silva",
      "dataCriacao": "2025-11-12T15:00:00.000Z",
      "detalhes": {
         "opcoes": {
            "acabamento": "sem_acabamento",
            "cores": "4x0",
            "papel": "lona_normal",
            "tamanho": "personalizado"
         },
         "preco": {
            "altura": 1,
            "largura": 1,
            "m2Custo": 29,
            "m2Venda": 60,
            "total": 60,
            "valorArte": 0,
            "valorTotalCusto": 29,
            "valorTotalVenda": 60
         },
         "type": "metro"
      },
      "historicoFinanceiro": [
         {
            "data": "2025-11-12T15:00:00.000Z",
            "status": "pago",
            "user": "Bob Silva"
         }
      ],
      "historicoProducao": [
         {
            "data": "2025-11-12T15:00:00.000Z",
            "status": "pre_prod",
            "user": "Bob Silva"
         },
         {
            "data": "2025-11-13T10:00:00.000Z",
            "status": "em_producao",
            "user": "Bob Silva"
         },
         {
            "data": "2025-11-14T10:00:00.000Z",
            "status": "pronto_retirada",
            "user": "Bob Silva"
         },
         {
            "data": "2025-11-15T10:00:00.000Z",
            "status": "concluido",
            "user": "Bob Silva"
         }
      ],
      "id": "PED-1041",
      "itemImageUrl": "/images/catalogo/banner.png",
      "itemNome": "Lona",
      "productId": "prod_001",
      "statusFinanceiro": "pago",
      "statusProducao": "concluido",
      "valor": 60
   },
   {
      "cliente": {
         "cpfCnpj": "",
         "email": "hugo.santos@email.com",
         "id": "cli_011",
         "nome": "Hugo Santos",
         "telefone1": "(81) 99908-9908",
         "telefone2": ""
      },
      "criadoPor": "Lucas Alves",
      "dataCriacao": "2025-11-11T10:00:00.000Z",
      "detalhes": {
         "preco": {
            "observacao": "Pacote de 5 artes para feed",
            "pagamento": "pago",
            "valorVenda": 250
         },
         "type": "arte"
      },
      "historicoFinanceiro": [
         {
            "data": "2025-11-11T10:00:00.000Z",
            "status": "pago",
            "user": "Lucas Alves"
         }
      ],
      "historicoProducao": [
         {
            "data": "2025-11-11T10:00:00.000Z",
            "status": "pre_prod",
            "user": "Lucas Alves"
         },
         {
            "data": "2025-11-12T10:00:00.000Z",
            "status": "concluido",
            "user": "Lucas Alves"
         }
      ],
      "id": "PED-1040",
      "itemImageUrl": "/images/catalogo/phalis-kekw.png",
      "itemNome": "Criação de Arte",
      "productId": "prod_099",
      "statusFinanceiro": "pago",
      "statusProducao": "concluido",
      "valor": 250
   },
   {
      "cliente": {
         "cpfCnpj": "",
         "email": "isabela.p@email.com",
         "id": "cli_013",
         "nome": "Isabela Pereira",
         "telefone1": "(81) 99909-9909",
         "telefone2": ""
      },
      "criadoPor": "Phallis Admin",
      "dataCriacao": "2025-11-10T09:00:00.000Z",
      "detalhes": {
         "dimensoesPersonalizadas": null,
         "opcoes": {
            "acabamento": "padrão",
            "cores": "4x0",
            "papel": "cetim",
            "tamanho": "300x15_320x15"
         },
         "preco": {
            "custoTotal": 250,
            "precoArte": 0,
            "precoCusto": 250,
            "precoVenda": 500,
            "quantidade": 1000,
            "total": 500,
            "vendaTotal": 500
         },
         "type": "unidade"
      },
      "historicoFinanceiro": [
         {
            "data": "2025-11-10T09:00:00.000Z",
            "status": "nao_pago",
            "user": "Phallis Admin"
         },
         {
            "data": "2025-11-10T09:05:00.000Z",
            "status": "pago_50",
            "user": "Phallis Admin"
         }
      ],
      "historicoProducao": [
         {
            "data": "2025-11-10T09:00:00.000Z",
            "status": "pre_prod",
            "user": "Phallis Admin"
         },
         {
            "data": "2025-11-11T09:00:00.000Z",
            "status": "em_producao",
            "user": "Bob Silva"
         }
      ],
      "id": "PED-1039",
      "itemImageUrl": "/images/catalogo/pulseira-de-cetim.png",
      "itemNome": "Pulseira de Evento",
      "productId": "prod_031",
      "statusFinanceiro": "pago_50",
      "statusProducao": "em_producao",
      "valor": 500
   },
   {
      "cliente": {
         "cpfCnpj": "",
         "email": "joao.medeiros@email.com",
         "id": "cli_014",
         "nome": "João Medeiros",
         "telefone1": "(81) 99910-9910",
         "telefone2": ""
      },
      "criadoPor": "Bob Silva",
      "dataCriacao": "2025-11-09T15:00:00.000Z",
      "detalhes": {
         "opcoes": {
            "acabamento": "borda_rebaixada",
            "cores": "4x0",
            "papel": "borracha",
            "tamanho": "personalizado"
         },
         "preco": {
            "altura": 2,
            "largura": 1.2,
            "m2Custo": 50,
            "m2Venda": 100,
            "total": 240,
            "valorArte": 0,
            "valorTotalCusto": 120,
            "valorTotalVenda": 240
         },
         "type": "metro"
      },
      "historicoFinanceiro": [
         {
            "data": "2025-11-09T15:00:00.000Z",
            "status": "nao_pago",
            "user": "Bob Silva"
         }
      ],
      "historicoProducao": [
         {
            "data": "2025-11-09T15:00:00.000Z",
            "status": "pre_prod",
            "user": "Bob Silva"
         }
      ],
      "id": "PED-1038",
      "itemImageUrl": "/images/catalogo/tapete-impresso.png",
      "itemNome": "Tapete de Carpacho Impresso",
      "productId": "prod_032",
      "statusFinanceiro": "nao_pago",
      "statusProducao": "pre_prod",
      "valor": 240
   },
   {
      "cliente": {
         "cpfCnpj": "",
         "email": "karina.oliveira@email.com",
         "id": "cli_015",
         "nome": "Karina Oliveira",
         "telefone1": "(81) 99911-9911",
         "telefone2": ""
      },
      "criadoPor": "Lucas Alves",
      "dataCriacao": "2025-11-08T14:00:00.000Z",
      "detalhes": {
         "dimensoesPersonalizadas": null,
         "opcoes": {
            "acabamento": "dobra_e_refile",
            "cores": "4x4",
            "papel": "couché_brilho_115g",
            "tamanho": "304x214cm_arte_15x21cm_fecha"
         },
         "preco": {
            "custoTotal": 200,
            "precoArte": 0,
            "precoCusto": 200,
            "precoVenda": 450,
            "quantidade": 1000,
            "total": 450,
            "vendaTotal": 450
         },
         "type": "unidade"
      },
      "historicoFinanceiro": [
         {
            "data": "2025-11-08T14:00:00.000Z",
            "status": "nao_pago",
            "user": "Lucas Alves"
         }
      ],
      "historicoProducao": [
         {
            "data": "2025-11-08T14:00:00.000Z",
            "status": "pre_prod",
            "user": "Lucas Alves"
         }
      ],
      "id": "PED-1037",
      "itemImageUrl": "/images/catalogo/folder.png",
      "itemNome": "Folder",
      "productId": "prod_015",
      "statusFinanceiro": "nao_pago",
      "statusProducao": "pre_prod",
      "valor": 450
   },
   {
      "cliente": {
         "cpfCnpj": "",
         "email": "leo.barros@email.com",
         "id": "cli_012",
         "nome": "Leonardo Barros",
         "telefone1": "(81) 99912-9912",
         "telefone2": ""
      },
      "criadoPor": "Phallis Admin",
      "dataCriacao": "2025-11-07T13:00:00.000Z",
      "detalhes": {
         "dimensoesPersonalizadas": null,
         "opcoes": {
            "acabamento": "cordao",
            "cores": "4x0",
            "papel": "offset_180g",
            "tamanho": "p"
         },
         "preco": {
            "custoTotal": 600,
            "precoArte": 0,
            "precoCusto": 600,
            "precoVenda": 1200,
            "quantidade": 500,
            "total": 1200,
            "vendaTotal": 1200
         },
         "type": "unidade"
      },
      "historicoFinanceiro": [
         {
            "data": "2025-11-07T13:00:00.000Z",
            "status": "nao_pago",
            "user": "Phallis Admin"
         },
         {
            "data": "2025-11-07T13:05:00.000Z",
            "status": "pago_50",
            "user": "Phallis Admin"
         }
      ],
      "historicoProducao": [
         {
            "data": "2025-11-07T13:00:00.000Z",
            "status": "pre_prod",
            "user": "Phallis Admin"
         },
         {
            "data": "2025-11-08T10:00:00.000Z",
            "status": "em_producao",
            "user": "Bob Silva"
         }
      ],
      "id": "PED-1036",
      "itemImageUrl": "/images/catalogo/sacola.png",
      "itemNome": "Sacolas",
      "productId": "prod_021",
      "statusFinanceiro": "pago_50",
      "statusProducao": "em_producao",
      "valor": 1200
   },
   {
      "cliente": {
         "cpfCnpj": "",
         "email": "mariana.farias@email.com",
         "id": "cli_016",
         "nome": "Mariana Farias",
         "telefone1": "(81) 99913-9913",
         "telefone2": ""
      },
      "criadoPor": "Bob Silva",
      "dataCriacao": "2025-11-06T12:00:00.000Z",
      "detalhes": {
         "opcoes": {
            "acabamento": "madeirinhas_e_ponteiras",
            "cores": "4x0",
            "papel": "lona_normal",
            "tamanho": "personalizado"
         },
         "preco": {
            "altura": 2.5,
            "largura": 2,
            "m2Custo": 29,
            "m2Venda": 60,
            "total": 300,
            "valorArte": 0,
            "valorTotalCusto": 145,
            "valorTotalVenda": 300
         },
         "type": "metro"
      },
      "historicoFinanceiro": [
         {
            "data": "2025-11-06T12:00:00.000Z",
            "status": "nao_pago",
            "user": "Bob Silva"
         }
      ],
      "historicoProducao": [
         {
            "data": "2025-11-06T12:00:00.000Z",
            "status": "pre_prod",
            "user": "Bob Silva"
         }
      ],
      "id": "PED-1035",
      "itemImageUrl": "/images/catalogo/banner.png",
      "itemNome": "Lona",
      "productId": "prod_001",
      "statusFinanceiro": "nao_pago",
      "statusProducao": "pre_prod",
      "valor": 300
   },
   {
      "cliente": {
         "cpfCnpj": "",
         "email": "nicolas.azevedo@email.com",
         "id": "cli_017",
         "nome": "Nícolas Azevedo",
         "telefone1": "(81) 99914-9914",
         "telefone2": ""
      },
      "criadoPor": "Lucas Alves",
      "dataCriacao": "2025-11-05T18:00:00.000Z",
      "detalhes": {
         "dimensoesPersonalizadas": null,
         "opcoes": {
            "acabamento": "vela",
            "cores": "4x4",
            "papel": "completo",
            "tamanho": "250m_145x50"
         },
         "preco": {
            "custoTotal": 110,
            "precoArte": 0,
            "precoCusto": 110,
            "precoVenda": 220,
            "quantidade": 1,
            "total": 220,
            "vendaTotal": 220
         },
         "type": "unidade"
      },
      "historicoFinanceiro": [
         {
            "data": "2025-11-05T18:00:00.000Z",
            "status": "pago",
            "user": "Lucas Alves"
         }
      ],
      "historicoProducao": [
         {
            "data": "2025-11-05T18:00:00.000Z",
            "status": "pre_prod",
            "user": "Lucas Alves"
         },
         {
            "data": "2025-11-06T10:00:00.000Z",
            "status": "em_producao",
            "user": "Bob Silva"
         },
         {
            "data": "2025-11-07T10:00:00.000Z",
            "status": "concluido",
            "user": "Bob Silva"
         }
      ],
      "id": "PED-1034",
      "itemImageUrl": "/images/catalogo/bigflag.png",
      "itemNome": "Big  Flag",
      "productId": "prod_029",
      "statusFinanceiro": "pago",
      "statusProducao": "concluido",
      "valor": 220
   },
   {
      "cliente": {
         "cpfCnpj": "",
         "email": "olivia.ribeiro@email.com",
         "id": "cli_018",
         "nome": "Olívia Ribeiro",
         "telefone1": "(81) 99915-9915",
         "telefone2": ""
      },
      "criadoPor": "Phallis Admin",
      "dataCriacao": "2025-11-05T17:00:00.000Z",
      "detalhes": {
         "opcoes": {
            "acabamento": "padrão",
            "cores": "4x0",
            "papel": "normal",
            "tamanho": "personalizado"
         },
         "preco": {
            "altura": 1,
            "largura": 1,
            "m2Custo": 40,
            "m2Venda": 90,
            "total": 90,
            "valorArte": 0,
            "valorTotalCusto": 40,
            "valorTotalVenda": 90
         },
         "type": "metro"
      },
      "historicoFinanceiro": [
         {
            "data": "2025-11-05T17:00:00.000Z",
            "status": "nao_pago",
            "user": "Phallis Admin"
         }
      ],
      "historicoProducao": [
         {
            "data": "2025-11-05T17:00:00.000Z",
            "status": "pre_prod",
            "user": "Phallis Admin"
         }
      ],
      "id": "PED-1033",
      "itemImageUrl": "/images/catalogo/capa-de-garrafao.png",
      "itemNome": "Adesivo Leitoso",
      "productId": "prod_038",
      "statusFinanceiro": "nao_pago",
      "statusProducao": "pre_prod",
      "valor": 90
   },
   {
      "cliente": {
         "cpfCnpj": "",
         "email": "paulo.cavalcanti@email.com",
         "id": "cli_019",
         "nome": "Paulo Cavalcanti",
         "telefone1": "(81) 99916-9916",
         "telefone2": ""
      },
      "criadoPor": "Bob Silva",
      "dataCriacao": "2025-11-04T16:00:00.000Z",
      "detalhes": {
         "preco": {
            "observacao": "Ajuste de arte para banner",
            "pagamento": "pago_50",
            "valorVenda": 80
         },
         "type": "arte"
      },
      "historicoFinanceiro": [
         {
            "data": "2025-11-04T16:00:00.000Z",
            "status": "nao_pago",
            "user": "Bob Silva"
         },
         {
            "data": "2025-11-04T16:05:00.000Z",
            "status": "pago_50",
            "user": "Bob Silva"
         }
      ],
      "historicoProducao": [
         {
            "data": "2025-11-04T16:00:00.000Z",
            "status": "pre_prod",
            "user": "Bob Silva"
         },
         {
            "data": "2025-11-05T10:00:00.000Z",
            "status": "em_producao",
            "user": "Bob Silva"
         }
      ],
      "id": "PED-1032",
      "itemImageUrl": "/images/catalogo/phalis-kekw.png",
      "itemNome": "Criação de Arte",
      "productId": "prod_099",
      "statusFinanceiro": "pago_50",
      "statusProducao": "em_producao",
      "valor": 80
   },
   {
      "cliente": {
         "cpfCnpj": "",
         "email": "rafaela.albuq@email.com",
         "id": "cli_020",
         "nome": "Rafaela Albuquerque",
         "telefone1": "(81) 99917-9917",
         "telefone2": ""
      },
      "criadoPor": "Lucas Alves",
      "dataCriacao": "2025-11-03T14:00:00.000Z",
      "detalhes": {
         "dimensoesPersonalizadas": null,
         "opcoes": {
            "acabamento": "verniz_total_frente",
            "cores": "4x0",
            "papel": "couché_250g",
            "tamanho": "91x51cm_arte_88x48cm_final"
         },
         "preco": {
            "custoTotal": 80,
            "precoArte": 0,
            "precoCusto": 80,
            "precoVenda": 180,
            "quantidade": 500,
            "total": 180,
            "vendaTotal": 180
         },
         "type": "unidade"
      },
      "historicoFinanceiro": [
         {
            "data": "2025-11-03T14:00:00.000Z",
            "status": "pago",
            "user": "Lucas Alves"
         }
      ],
      "historicoProducao": [
         {
            "data": "2025-11-03T14:00:00.000Z",
            "status": "pre_prod",
            "user": "Lucas Alves"
         },
         {
            "data": "2025-11-04T10:00:00.000Z",
            "status": "em_producao",
            "user": "Bob Silva"
         },
         {
            "data": "2025-11-05T10:00:00.000Z",
            "status": "concluido",
            "user": "Bob Silva"
         }
      ],
      "id": "PED-1031",
      "itemImageUrl": "/images/catalogo/cartao-de-visita.png",
      "itemNome": "Cartão de Visita",
      "productId": "prod_008",
      "statusFinanceiro": "pago",
      "statusProducao": "concluido",
      "valor": 180
   },
   {
      "cliente": {
         "cpfCnpj": "",
         "email": "samuel.rocha@email.com",
         "id": "cli_021",
         "nome": "Samuel Rocha",
         "telefone1": "(81) 99918-9918",
         "telefone2": ""
      },
      "criadoPor": "Phallis Admin",
      "dataCriacao": "2025-11-02T10:00:00.000Z",
      "detalhes": {
         "opcoes": {
            "acabamento": "ilhos",
            "cores": "4x0",
            "papel": "lona_normal",
            "tamanho": "personalizado"
         },
         "preco": {
            "altura": 2,
            "largura": 5,
            "m2Custo": 29,
            "m2Venda": 60,
            "total": 600,
            "valorArte": 0,
            "valorTotalCusto": 290,
            "valorTotalVenda": 600
         },
         "type": "metro"
      },
      "historicoFinanceiro": [
         {
            "data": "2025-11-02T10:00:00.000Z",
            "status": "pago",
            "user": "Phallis Admin"
         }
      ],
      "historicoProducao": [
         {
            "data": "2025-11-02T10:00:00.000Z",
            "status": "pre_prod",
            "user": "Phallis Admin"
         },
         {
            "data": "2025-11-03T10:00:00.000Z",
            "status": "em_producao",
            "user": "Bob Silva"
         },
         {
            "data": "2025-11-04T10:00:00.000Z",
            "status": "pronto_retirada",
            "user": "Bob Silva"
         },
         {
            "data": "2025-11-05T10:00:00.000Z",
            "status": "concluido",
            "user": "Bob Silva"
         }
      ],
      "id": "PED-1030",
      "itemImageUrl": "/images/catalogo/banner.png",
      "itemNome": "Lona",
      "productId": "prod_001",
      "statusFinanceiro": "pago",
      "statusProducao": "concluido",
      "valor": 600
   },
   {
      "cliente": {
         "cpfCnpj": "",
         "email": "tati.correia@email.com",
         "id": "cli_022",
         "nome": "Tatiana Correia",
         "telefone1": "(81) 99919-9919",
         "telefone2": ""
      },
      "criadoPor": "Bob Silva",
      "dataCriacao": "2025-11-01T11:00:00.000Z",
      "detalhes": {
         "dimensoesPersonalizadas": null,
         "opcoes": {
            "acabamento": "refile",
            "cores": "4x0",
            "papel": "offset_90g",
            "tamanho": "216x303cm_arte_21x297cm_fina"
         },
         "preco": {
            "custoTotal": 60,
            "precoArte": 0,
            "precoCusto": 60,
            "precoVenda": 130,
            "quantidade": 500,
            "total": 130,
            "vendaTotal": 130
         },
         "type": "unidade"
      },
      "historicoFinanceiro": [
         {
            "data": "2025-11-01T11:00:00.000Z",
            "status": "nao_pago",
            "user": "Bob Silva"
         }
      ],
      "historicoProducao": [
         {
            "data": "2025-11-01T11:00:00.000Z",
            "status": "pre_prod",
            "user": "Bob Silva"
         }
      ],
      "id": "PED-1029",
      "itemImageUrl": "/images/catalogo/timbrado.png",
      "itemNome": "Timbrado",
      "productId": "prod_023",
      "statusFinanceiro": "nao_pago",
      "statusProducao": "pre_prod",
      "valor": 130
   },
   {
      "cliente": {
         "cpfCnpj": "",
         "email": "ulisses.b@email.com",
         "id": "cli_023",
         "nome": "Ulisses Bezerra",
         "telefone1": "(81) 99920-9920",
         "telefone2": ""
      },
      "criadoPor": "Lucas Alves",
      "dataCriacao": "2025-10-30T14:30:00.000Z",
      "detalhes": {
         "dimensoesPersonalizadas": null,
         "opcoes": {
            "acabamento": "padrão",
            "cores": "4x0",
            "papel": "padrão",
            "tamanho": "encosto"
         },
         "preco": {
            "custoTotal": 150,
            "precoArte": 0,
            "precoCusto": 150,
            "precoVenda": 300,
            "quantidade": 10,
            "total": 300,
            "vendaTotal": 300
         },
         "type": "unidade"
      },
      "historicoFinanceiro": [
         {
            "data": "2025-10-30T14:30:00.000Z",
            "status": "pago",
            "user": "Lucas Alves"
         }
      ],
      "historicoProducao": [
         {
            "data": "2025-10-30T14:30:00.000Z",
            "status": "pre_prod",
            "user": "Lucas Alves"
         },
         {
            "data": "2025-10-31T10:00:00.000Z",
            "status": "em_producao",
            "user": "Bob Silva"
         }
      ],
      "id": "PED-1028",
      "itemImageUrl": "/images/catalogo/capa-de-cadeira.png",
      "itemNome": "Capa de Cadeira",
      "productId": "prod_031",
      "statusFinanceiro": "pago",
      "statusProducao": "em_producao",
      "valor": 300
   },
   {
      "cliente": {
         "cpfCnpj": "",
         "email": "vanessa.andrade@email.com",
         "id": "cli_024",
         "nome": "Vanessa Andrade",
         "telefone1": "(81) 99921-9921",
         "telefone2": ""
      },
      "criadoPor": "Phallis Admin",
      "dataCriacao": "2025-10-29T10:00:00.000Z",
      "detalhes": {
         "opcoes": {
            "acabamento": "sem_acabamento",
            "cores": "4x0",
            "papel": "lona_normal",
            "tamanho": "personalizado"
         },
         "preco": {
            "altura": 1.5,
            "largura": 0.5,
            "m2Custo": 29,
            "m2Venda": 60,
            "total": 45,
            "valorArte": 0,
            "valorTotalCusto": 21.75,
            "valorTotalVenda": 45
         },
         "type": "metro"
      },
      "historicoFinanceiro": [
         {
            "data": "2025-10-29T10:00:00.000Z",
            "status": "pago_50",
            "user": "Phallis Admin"
         }
      ],
      "historicoProducao": [
         {
            "data": "2025-10-29T10:00:00.000Z",
            "status": "pre_prod",
            "user": "Phallis Admin"
         }
      ],
      "id": "PED-1027",
      "itemImageUrl": "/images/catalogo/banner.png",
      "itemNome": "Lona",
      "productId": "prod_001",
      "statusFinanceiro": "pago_50",
      "statusProducao": "pre_prod",
      "valor": 45
   },
   {
      "cliente": {
         "cpfCnpj": "",
         "email": "william.arruda@email.com",
         "id": "cli_025",
         "nome": "William Arruda",
         "telefone1": "(81) 99922-9922",
         "telefone2": ""
      },
      "criadoPor": "Bob Silva",
      "dataCriacao": "2025-10-28T16:00:00.000Z",
      "detalhes": {
         "dimensoesPersonalizadas": {
            "alturaCm": "5",
            "larguraCm": "5"
         },
         "opcoes": {
            "acabamento": "meio_corte_padrão_entregue_em",
            "cores": "4x0",
            "papel": "couché_adesivo",
            "tamanho": "personalizado"
         },
         "preco": {
            "custoTotal": 40,
            "precoArte": 0,
            "precoCusto": 40,
            "precoVenda": 100,
            "quantidade": 100,
            "total": 100,
            "vendaTotal": 100
         },
         "type": "unidade"
      },
      "historicoFinanceiro": [
         {
            "data": "2025-10-28T16:00:00.000Z",
            "status": "nao_pago",
            "user": "Bob Silva"
         }
      ],
      "historicoProducao": [
         {
            "data": "2025-10-28T16:00:00.000Z",
            "status": "pre_prod",
            "user": "Bob Silva"
         }
      ],
      "id": "PED-1026",
      "itemImageUrl": "/images/catalogo/rotulos-e-adesivos.png",
      "itemNome": "Rótulos e Adesivos",
      "productId": "prod_new_06",
      "statusFinanceiro": "nao_pago",
      "statusProducao": "pre_prod",
      "valor": 100
   },
   {
      "cliente": {
         "cpfCnpj": "",
         "email": "xavier.pinto@email.com",
         "id": "cli_026",
         "nome": "Xavier Pinto",
         "telefone1": "(81) 99923-9923",
         "telefone2": ""
      },
      "criadoPor": "Lucas Alves",
      "dataCriacao": "2025-10-27T12:00:00.000Z",
      "detalhes": {
         "preco": {
            "observacao": "Ajuste simples de cor",
            "pagamento": "pago",
            "valorVenda": 50
         },
         "type": "arte"
      },
      "historicoFinanceiro": [
         {
            "data": "2025-10-27T12:00:00.000Z",
            "status": "pago",
            "user": "Lucas Alves"
         }
      ],
      "historicoProducao": [
         {
            "data": "2025-10-27T12:00:00.000Z",
            "status": "pre_prod",
            "user": "Lucas Alves"
         },
         {
            "data": "2025-10-27T18:00:00.000Z",
            "status": "concluido",
            "user": "Lucas Alves"
         }
      ],
      "id": "PED-1025",
      "itemImageUrl": "/images/catalogo/phalis-kekw.png",
      "itemNome": "Criação de Arte",
      "productId": "prod_099",
      "statusFinanceiro": "pago",
      "statusProducao": "concluido",
      "valor": 50
   },
   {
      "cliente": {
         "cpfCnpj": "",
         "email": "yara.monteiro@email.com",
         "id": "cli_027",
         "nome": "Yara Monteiro",
         "telefone1": "(81) 99924-9924",
         "telefone2": ""
      },
      "criadoPor": "Phallis Admin",
      "dataCriacao": "2025-10-26T10:00:00.000Z",
      "detalhes": {
         "dimensoesPersonalizadas": null,
         "opcoes": {
            "acabamento": "verniz_total_frente",
            "cores": "4x1",
            "papel": "couché_250g",
            "tamanho": "91x51cm_arte_88x48cm_final"
         },
         "preco": {
            "custoTotal": 90,
            "precoArte": 0,
            "precoCusto": 90,
            "precoVenda": 200,
            "quantidade": 1000,
            "total": 200,
            "vendaTotal": 200
         },
         "type": "unidade"
      },
      "historicoFinanceiro": [
         {
            "data": "2025-10-26T10:00:00.000Z",
            "status": "nao_pago",
            "user": "Phallis Admin"
         }
      ],
      "historicoProducao": [
         {
            "data": "2025-10-26T10:00:00.000Z",
            "status": "pre_prod",
            "user": "Phallis Admin"
         }
      ],
      "id": "PED-1024",
      "itemImageUrl": "/images/catalogo/cartao-de-visita.png",
      "itemNome": "Cartão de Visita",
      "productId": "prod_008",
      "statusFinanceiro": "nao_pago",
      "statusProducao": "pre_prod",
      "valor": 200
   },
   {
      "cliente": {
         "cpfCnpj": "",
         "email": "zeca.tavares@email.com",
         "id": "cli_028",
         "nome": "Zeca Tavares",
         "telefone1": "(81) 99925-9925",
         "telefone2": ""
      },
      "criadoPor": "Bob Silva",
      "dataCriacao": "2025-10-25T11:00:00.000Z",
      "detalhes": {
         "dimensoesPersonalizadas": null,
         "opcoes": {
            "acabamento": "refile",
            "cores": "1x0",
            "papel": "papel_jornal",
            "tamanho": "326x454cm_arte_32x448cm_fina"
         },
         "preco": {
            "custoTotal": 150,
            "precoArte": 0,
            "precoCusto": 150,
            "precoVenda": 300,
            "quantidade": 2500,
            "total": 300,
            "vendaTotal": 300
         },
         "type": "unidade"
      },
      "historicoFinanceiro": [
         {
            "data": "2025-10-25T11:00:00.000Z",
            "status": "pago_50",
            "user": "Bob Silva"
         }
      ],
      "historicoProducao": [
         {
            "data": "2025-10-25T11:00:00.000Z",
            "status": "pre_prod",
            "user": "Bob Silva"
         },
         {
            "data": "2025-10-26T10:00:00.000Z",
            "status": "em_producao",
            "user": "Bob Silva"
         }
      ],
      "id": "PED-1023",
      "itemImageUrl": "/images/catalogo/lava-jato.png",
      "itemNome": "Tapete Lava Jato",
      "productId": "prod_022",
      "statusFinanceiro": "pago_50",
      "statusProducao": "em_producao",
      "valor": 300
   },
   {
      "cliente": {
         "cpfCnpj": "",
         "email": "amanda.borges@email.com",
         "id": "cli_029",
         "nome": "Amanda Borges",
         "telefone1": "(81) 99926-9926",
         "telefone2": ""
      },
      "criadoPor": "Lucas Alves",
      "dataCriacao": "2025-10-24T09:00:00.000Z",
      "detalhes": {
         "opcoes": {
            "acabamento": "sem_acabamento",
            "cores": "4x0",
            "papel": "lona_normal",
            "tamanho": "personalizado"
         },
         "preco": {
            "altura": 1,
            "largura": 0.5,
            "m2Custo": 29,
            "m2Venda": 60,
            "total": 30,
            "valorArte": 0,
            "valorTotalCusto": 14.5,
            "valorTotalVenda": 30
         },
         "type": "metro"
      },
      "historicoFinanceiro": [
         {
            "data": "2025-10-24T09:00:00.000Z",
            "status": "nao_pago",
            "user": "Lucas Alves"
         }
      ],
      "historicoProducao": [
         {
            "data": "2025-10-24T09:00:00.000Z",
            "status": "pre_prod",
            "user": "Lucas Alves"
         }
      ],
      "id": "PED-1022",
      "itemImageUrl": "/images/catalogo/banner.png",
      "itemNome": "Lona",
      "productId": "prod_001",
      "statusFinanceiro": "nao_pago",
      "statusProducao": "pre_prod",
      "valor": 30
   },
   {
      "cliente": {
         "cpfCnpj": "111.222.333-44",
         "email": "cliente1@email.com",
         "id": "cli_001",
         "nome": "Cliente Metro 1 (Original)",
         "telefone1": "(81) 99999-0001",
         "telefone2": ""
      },
      "criadoPor": "Phallis Admin",
      "dataCriacao": "2025-10-23T15:00:00.000Z",
      "detalhes": {
         "dimensoesPersonalizadas": null,
         "opcoes": {
            "acabamento": "corte_e_vinco_verniz_total",
            "cores": "4x0",
            "papel": "couché_300g",
            "tamanho": "102x273cm_arte_98x259cm_fina"
         },
         "preco": {
            "custoTotal": 250,
            "precoArte": 0,
            "precoCusto": 250,
            "precoVenda": 500,
            "quantidade": 200,
            "total": 500,
            "vendaTotal": 500
         },
         "type": "unidade"
      },
      "historicoFinanceiro": [
         {
            "data": "2025-10-23T15:00:00.000Z",
            "status": "nao_pago",
            "user": "Phallis Admin"
         },
         {
            "data": "2025-10-24T10:00:00.000Z",
            "status": "pago",
            "user": "Phallis Admin"
         }
      ],
      "historicoProducao": [
         {
            "data": "2025-10-23T15:00:00.000Z",
            "status": "pre_prod",
            "user": "Phallis Admin"
         },
         {
            "data": "2025-10-25T10:00:00.000Z",
            "status": "em_producao",
            "user": "Bob Silva"
         },
         {
            "data": "2025-10-27T10:00:00.000Z",
            "status": "pronto_retirada",
            "user": "Bob Silva"
         }
      ],
      "id": "PED-1021",
      "itemImageUrl": "/images/catalogo/calendario-mesa.png",
      "itemNome": "Calendário de Mesa",
      "productId": "prod_005",
      "statusFinanceiro": "pago",
      "statusProducao": "pronto_retirada",
      "valor": 500
   },
   {
      "cliente": {
         "cpfCnpj": "22.333.444/0001-55",
         "email": "cliente2@email.com",
         "id": "cli_002",
         "nome": "Cliente Unidade 2 (Original)",
         "telefone1": "(81) 98888-0002",
         "telefone2": ""
      },
      "criadoPor": "Lucas Alves",
      "dataCriacao": "2025-10-22T10:00:00.000Z",
      "detalhes": {
         "opcoes": {
            "acabamento": "padrão",
            "cores": "4x0",
            "papel": "padrão",
            "tamanho": "personalizado"
         },
         "preco": {
            "altura": 1,
            "largura": 5,
            "m2Custo": 40,
            "m2Venda": 90,
            "total": 450,
            "valorArte": 0,
            "valorTotalCusto": 200,
            "valorTotalVenda": 450
         },
         "type": "metro"
      },
      "historicoFinanceiro": [
         {
            "data": "2025-10-22T10:00:00.000Z",
            "status": "pago",
            "user": "Lucas Alves"
         }
      ],
      "historicoProducao": [
         {
            "data": "2025-10-22T10:00:00.000Z",
            "status": "pre_prod",
            "user": "Lucas Alves"
         },
         {
            "data": "2025-10-23T10:00:00.000Z",
            "status": "concluido",
            "user": "Bob Silva"
         }
      ],
      "id": "PED-1020",
      "itemImageUrl": "/images/catalogo/capa-de-garrafao.png",
      "itemNome": "Adesivo Perfurado",
      "productId": "prod_037",
      "statusFinanceiro": "pago",
      "statusProducao": "concluido",
      "valor": 450
   },
   {
      "cliente": {
         "cpfCnpj": "",
         "email": "cliente3@email.com",
         "id": "cli_003",
         "nome": "Cliente Arte 3 (Original)",
         "telefone1": "(81) 97777-0003",
         "telefone2": "(81) 3444-5555"
      },
      "criadoPor": "Bob Silva",
      "dataCriacao": "2025-10-21T13:00:00.000Z",
      "detalhes": {
         "dimensoesPersonalizadas": null,
         "opcoes": {
            "acabamento": "laminação_fosca_frente_corte_",
            "cores": "4x0",
            "papel": "triplex_300g",
            "tamanho": "45x32cm_arte_22x31cm_fechado"
         },
         "preco": {
            "custoTotal": 350,
            "precoArte": 0,
            "precoCusto": 350,
            "precoVenda": 700,
            "quantidade": 100,
            "total": 700,
            "vendaTotal": 700
         },
         "type": "unidade"
      },
      "historicoFinanceiro": [
         {
            "data": "2025-10-21T13:00:00.000Z",
            "status": "nao_pago",
            "user": "Bob Silva"
         }
      ],
      "historicoProducao": [
         {
            "data": "2025-10-21T13:00:00.000Z",
            "status": "pre_prod",
            "user": "Bob Silva"
         }
      ],
      "id": "PED-1019",
      "itemImageUrl": "/images/catalogo/pasta-orelha.png",
      "itemNome": "Pasta Orelha",
      "productId": "prod_018",
      "statusFinanceiro": "nao_pago",
      "statusProducao": "pre_prod",
      "valor": 700
   },
   {
      "cliente": {
         "cpfCnpj": "",
         "email": "ana.silva@email.com",
         "id": "cli_004",
         "nome": "Ana Silva",
         "telefone1": "(81) 99901-9901",
         "telefone2": ""
      },
      "criadoPor": "Phallis Admin",
      "dataCriacao": "2025-10-20T11:00:00.000Z",
      "detalhes": {
         "dimensoesPersonalizadas": null,
         "opcoes": {
            "acabamento": "laminação_fosca_frente_e_vers",
            "cores": "4x4",
            "papel": "couché_300g",
            "tamanho": "91x51cm_arte_88x48cm_final"
         },
         "preco": {
            "custoTotal": 120,
            "precoArte": 0,
            "precoCusto": 120,
            "precoVenda": 250,
            "quantidade": 1000,
            "total": 250,
            "vendaTotal": 250
         },
         "type": "unidade"
      },
      "historicoFinanceiro": [
         {
            "data": "2025-10-20T11:00:00.000Z",
            "status": "pago",
            "user": "Phallis Admin"
         }
      ],
      "historicoProducao": [
         {
            "data": "2025-10-20T11:00:00.000Z",
            "status": "pre_prod",
            "user": "Phallis Admin"
         },
         {
            "data": "2025-10-21T10:00:00.000Z",
            "status": "em_producao",
            "user": "Bob Silva"
         }
      ],
      "id": "PED-1018",
      "itemImageUrl": "/images/catalogo/cartao-de-visita.png",
      "itemNome": "Cartão de Visita",
      "productId": "prod_008",
      "statusFinanceiro": "pago",
      "statusProducao": "em_producao",
      "valor": 250
   },
   {
      "cliente": {
         "cpfCnpj": "",
         "email": "bruno.costa@email.com",
         "id": "cli_005",
         "nome": "Bruno Costa",
         "telefone1": "(81) 99902-9902",
         "telefone2": ""
      },
      "criadoPor": "Lucas Alves",
      "dataCriacao": "2025-10-19T10:00:00.000Z",
      "detalhes": {
         "opcoes": {
            "acabamento": "sem_acabamento",
            "cores": "4x0",
            "papel": "lona_normal",
            "tamanho": "personalizado"
         },
         "preco": {
            "altura": 1,
            "largura": 2,
            "m2Custo": 29,
            "m2Venda": 60,
            "total": 120,
            "valorArte": 0,
            "valorTotalCusto": 58,
            "valorTotalVenda": 120
         },
         "type": "metro"
      },
      "historicoFinanceiro": [
         {
            "data": "2025-10-19T10:00:00.000Z",
            "status": "nao_pago",
            "user": "Lucas Alves"
         }
      ],
      "historicoProducao": [
         {
            "data": "2025-10-19T10:00:00.000Z",
            "status": "pre_prod",
            "user": "Lucas Alves"
         }
      ],
      "id": "PED-1017",
      "itemImageUrl": "/images/catalogo/banner.png",
      "itemNome": "Lona",
      "productId": "prod_001",
      "statusFinanceiro": "nao_pago",
      "statusProducao": "pre_prod",
      "valor": 120
   },
   {
      "cliente": {
         "cpfCnpj": "",
         "email": "carla.dias@email.com",
         "id": "cli_006",
         "nome": "Carla Dias",
         "telefone1": "(81) 99903-9903",
         "telefone2": ""
      },
      "criadoPor": "Bob Silva",
      "dataCriacao": "2025-10-18T09:00:00.000Z",
      "detalhes": {
         "preco": {
            "observacao": "Arte para rede social",
            "pagamento": "pago",
            "valorVenda": 100
         },
         "type": "arte"
      },
      "historicoFinanceiro": [
         {
            "data": "2025-10-18T09:00:00.000Z",
            "status": "pago",
            "user": "Bob Silva"
         }
      ],
      "historicoProducao": [
         {
            "data": "2025-10-18T09:00:00.000Z",
            "status": "pre_prod",
            "user": "Bob Silva"
         },
         {
            "data": "2025-10-19T10:00:00.000Z",
            "status": "concluido",
            "user": "Bob Silva"
         }
      ],
      "id": "PED-1016",
      "itemImageUrl": "/images/catalogo/phalis-kekw.png",
      "itemNome": "Criação de Arte",
      "productId": "prod_099",
      "statusFinanceiro": "pago",
      "statusProducao": "concluido",
      "valor": 100
   },
   {
      "cliente": {
         "cpfCnpj": "",
         "email": "d.moreira@email.com",
         "id": "cli_007",
         "nome": "Daniel Moreira",
         "telefone1": "(81) 99904-9904",
         "telefone2": ""
      },
      "criadoPor": "Phallis Admin",
      "dataCriacao": "2025-10-17T15:30:00.000Z",
      "detalhes": {
         "dimensoesPersonalizadas": null,
         "opcoes": {
            "acabamento": "corte_e_vinco",
            "cores": "1x0",
            "papel": "kraft_240g",
            "tamanho": "327x228cm_aberto_10x12cm_fe"
         },
         "preco": {
            "custoTotal": 150,
            "precoArte": 0,
            "precoCusto": 150,
            "precoVenda": 300,
            "quantidade": 500,
            "total": 300,
            "vendaTotal": 300
         },
         "type": "unidade"
      },
      "historicoFinanceiro": [
         {
            "data": "2025-10-17T15:30:00.000Z",
            "status": "nao_pago",
            "user": "Phallis Admin"
         },
         {
            "data": "2025-10-17T15:35:00.000Z",
            "status": "pago_50",
            "user": "Phallis Admin"
         }
      ],
      "historicoProducao": [
         {
            "data": "2025-10-17T15:30:00.000Z",
            "status": "pre_prod",
            "user": "Phallis Admin"
         },
         {
            "data": "2025-10-18T10:00:00.000Z",
            "status": "em_producao",
            "user": "Bob Silva"
         }
      ],
      "id": "PED-1015",
      "itemImageUrl": "/images/catalogo/caixa-de-batata.png",
      "itemNome": "Caixas de Batata",
      "productId": "prod_new_01",
      "statusFinanceiro": "pago_50",
      "statusProducao": "em_producao",
      "valor": 300
   },
   {
      "cliente": {
         "cpfCnpj": "",
         "email": "elisa.f@email.com",
         "id": "cli_008",
         "nome": "Elisa Fernandes",
         "telefone1": "(81) 99905-9905",
         "telefone2": ""
      },
      "criadoPor": "Lucas Alves",
      "dataCriacao": "2025-10-16T14:00:00.000Z",
      "detalhes": {
         "opcoes": {
            "acabamento": "ilhos",
            "cores": "4x0",
            "papel": "lona_uv",
            "tamanho": "personalizado"
         },
         "preco": {
            "altura": 1,
            "largura": 3.5,
            "m2Custo": 30,
            "m2Venda": 60,
            "total": 210,
            "valorArte": 0,
            "valorTotalCusto": 105,
            "valorTotalVenda": 210
         },
         "type": "metro"
      },
      "historicoFinanceiro": [
         {
            "data": "2025-10-16T14:00:00.000Z",
            "status": "nao_pago",
            "user": "Lucas Alves"
         }
      ],
      "historicoProducao": [
         {
            "data": "2025-10-16T14:00:00.000Z",
            "status": "pre_prod",
            "user": "Lucas Alves"
         }
      ],
      "id": "PED-1014",
      "itemImageUrl": "/images/catalogo/banner.png",
      "itemNome": "Lona",
      "productId": "prod_001",
      "statusFinanceiro": "nao_pago",
      "statusProducao": "pre_prod",
      "valor": 210
   },
   {
      "cliente": {
         "cpfCnpj": "",
         "email": "fabio_guedes@email.com",
         "id": "cli_009",
         "nome": "Fábio Guedes",
         "telefone1": "(81) 99906-9906",
         "telefone2": ""
      },
      "criadoPor": "Bob Silva",
      "dataCriacao": "2025-10-15T11:00:00.000Z",
      "detalhes": {
         "dimensoesPersonalizadas": null,
         "opcoes": {
            "acabamento": "verniz_uv_total_furo",
            "cores": "4x0",
            "papel": "triplex_300g",
            "tamanho": "324x474cm_arte_32x47cm_final"
         },
         "preco": {
            "custoTotal": 300,
            "precoArte": 0,
            "precoCusto": 300,
            "precoVenda": 600,
            "quantidade": 100,
            "total": 600,
            "vendaTotal": 600
         },
         "type": "unidade"
      },
      "historicoFinanceiro": [
         {
            "data": "2025-10-15T11:00:00.000Z",
            "status": "pago",
            "user": "Bob Silva"
         }
      ],
      "historicoProducao": [
         {
            "data": "2025-10-15T11:00:00.000Z",
            "status": "pre_prod",
            "user": "Bob Silva"
         },
         {
            "data": "2025-10-16T10:00:00.000Z",
            "status": "em_producao",
            "user": "Bob Silva"
         },
         {
            "data": "2025-10-17T10:00:00.000Z",
            "status": "concluido",
            "user": "Bob Silva"
         }
      ],
      "id": "PED-1013",
      "itemImageUrl": "/images/catalogo/calendario-parede.png",
      "itemNome": "Calendário de Parede",
      "productId": "prod_006",
      "statusFinanceiro": "pago",
      "statusProducao": "concluido",
      "valor": 600
   },
   {
      "cliente": {
         "cpfCnpj": "",
         "email": "gabriela.lima@email.com",
         "id": "cli_010",
         "nome": "Gabriela Lima",
         "telefone1": "(81) 99907-9907",
         "telefone2": ""
      },
      "criadoPor": "Phallis Admin",
      "dataCriacao": "2025-10-14T10:00:00.000Z",
      "detalhes": {
         "dimensoesPersonalizadas": null,
         "opcoes": {
            "acabamento": "laminação_fosca_fv_verniz_loc",
            "cores": "4x4",
            "papel": "couché_300g",
            "tamanho": "91x51cm_arte_88x48cm_final"
         },
         "preco": {
            "custoTotal": 150,
            "precoArte": 50,
            "precoCusto": 150,
            "precoVenda": 300,
            "quantidade": 1000,
            "total": 350,
            "vendaTotal": 300
         },
         "type": "unidade"
      },
      "historicoFinanceiro": [
         {
            "data": "2025-10-14T10:00:00.000Z",
            "status": "nao_pago",
            "user": "Phallis Admin"
         }
      ],
      "historicoProducao": [
         {
            "data": "2025-10-14T10:00:00.000Z",
            "status": "pre_prod",
            "user": "Phallis Admin"
         },
         {
            "data": "2025-10-15T10:00:00.000Z",
            "status": "em_producao",
            "user": "Bob Silva"
         },
         {
            "data": "2025-10-16T10:00:00.000Z",
            "status": "pronto_retirada",
            "user": "Bob Silva"
         }
      ],
      "id": "PED-1012",
      "itemImageUrl": "/images/catalogo/cartao-de-visita.png",
      "itemNome": "Cartão de Visita",
      "productId": "prod_008",
      "statusFinanceiro": "nao_pago",
      "statusProducao": "pronto_retirada",
      "valor": 350
   },
   {
      "cliente": {
         "cpfCnpj": "",
         "email": "hugo.santos@email.com",
         "id": "cli_011",
         "nome": "Hugo Santos",
         "telefone1": "(81) 99908-9908",
         "telefone2": ""
      },
      "criadoPor": "Lucas Alves",
      "dataCriacao": "2025-10-13T09:00:00.000Z",
      "detalhes": {
         "opcoes": {
            "acabamento": "padrão",
            "cores": "4x0",
            "papel": "padrão",
            "tamanho": "personalizado"
         },
         "preco": {
            "altura": 1,
            "largura": 1.5,
            "m2Custo": 40,
            "m2Venda": 90,
            "total": 135,
            "valorArte": 0,
            "valorTotalCusto": 60,
            "valorTotalVenda": 135
         },
         "type": "metro"
      },
      "historicoFinanceiro": [
         {
            "data": "2025-10-13T09:00:00.000Z",
            "status": "pago",
            "user": "Lucas Alves"
         }
      ],
      "historicoProducao": [
         {
            "data": "2025-10-13T09:00:00.000Z",
            "status": "pre_prod",
            "user": "Lucas Alves"
         },
         {
            "data": "2025-10-14T10:00:00.000Z",
            "status": "concluido",
            "user": "Bob Silva"
         }
      ],
      "id": "PED-1011",
      "itemImageUrl": "/images/catalogo/capa-de-garrafao.png",
      "itemNome": "Adesivo Perfurado",
      "productId": "prod_037",
      "statusFinanceiro": "pago",
      "statusProducao": "concluido",
      "valor": 135
   }
];

// --- FUNÇÕES DE API FICTÍCIAS ---
export const fetchPedidos = async (page: number, limit: number = 20): Promise<Pedido[]> => {
   console.log(`Buscando pedidos: Página ${page}, Limite ${limit}`);
   const start = (page - 1) * limit;
   const end = start + limit;
   await new Promise(resolve => setTimeout(resolve, 500));
   return MOCK_ORDERS.slice(start, end);
};

export const updateStatusFinanceiro = async (id: string, newStatus: StatusFinanceiro, userName: string): Promise<Pedido | null> => {
   await new Promise(resolve => setTimeout(resolve, 300));
   const pedido = MOCK_ORDERS.find(p => p.id === id);
   if (!pedido) return null;
   pedido.statusFinanceiro = newStatus;
   pedido.historicoFinanceiro.push({ status: newStatus, data: new Date().toISOString(), user: userName });
   return pedido;
};

export const updateStatusProducao = async (id: string, newStatus: StatusProducao, userName: string): Promise<Pedido | null> => {
   await new Promise(resolve => setTimeout(resolve, 300));
   const pedido = MOCK_ORDERS.find(p => p.id === id);
   if (!pedido) return null;
   pedido.statusProducao = newStatus;
   pedido.historicoProducao.push({ status: newStatus, data: new Date().toISOString(), user: userName });
   return pedido;
};

export const cancelarPedido = async (id: string, userName: string, motivo: string): Promise<Pedido | null> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const pedido = MOCK_ORDERS.find(p => p.id === id);
  if (!pedido) return null;

  pedido.statusProducao = 'cancelado';
  // Adiciona o evento de cancelamento ao histórico
  pedido.historicoProducao.push({
    status: 'cancelado',
    data: new Date().toISOString(),
    user: userName,
    motivo: motivo
  });

  return pedido;
};