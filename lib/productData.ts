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

// ==========================================================
// MUDANÇA: Função para converter o seu JSON no nosso formato
// ==========================================================
const formatarOpcoes = (opcoes: string[]): ProductOption[] => {
  // Se a opção for nula ou o array estiver vazio, retorna um padrão
  // if (!opcoes || opcoes.length === 0) {
  //   return [{ id: 'padrao', name: 'Padrão' }];
  // }
  // Converte a string (ex: "4x0") em um objeto { id: '4x0', name: '4x0' }
  return opcoes.map(op => ({
    id: op.toLowerCase().replace(/ /g, '_').substr(0, 20), // Cria um ID simples
    name: op
  }));
};

// ==========================================================
// MUDANÇA: Seu novo JSON de produtos, já processado
// ==========================================================

// (Estes são os produtos do seu JSON, mapeados para o nosso tipo 'Product')
const NOVOS_PRODUTOS: Product[] = [
  // Produto de Arte (do mock antigo)
  {
    "id": "prod_099",
    "nome": "Criação de Arte",
    "descricao": "",
    "imageUrl": "/images/catalogo/phalis-kekw.png",
    "pricingType": "arte"
    // Sem 'options'
  },
  {
    "id": "prod_001", // Pego do mock antigo
    "nome": "Lona",
    "descricao": "",
    "imageUrl": "/images/catalogo/banner.png", // Pego do mock antigo
    "pricingType": "metro", // Tipo 'metro'
    "options": {
      "papel": formatarOpcoes(["Lona Front 380g"]),
      "tamanho": formatarOpcoes([]),
      "cores": formatarOpcoes(["4x0"]),
      "acabamento": formatarOpcoes(["Madeirinhas e ponteiras"])
    }
  },
  {
    "id": "prod_011", // Pego do mock antigo
    "nome": "Adesivos Lacre para Delivery",
    "descricao": "",
    "imageUrl": "/images/catalogo/adesivo-lacre.png", // Pego do mock antigo
    "pricingType": "unidade", // Padrão
    "options": {
      "papel": formatarOpcoes(["Couché Adesivo"]),
      "tamanho": formatarOpcoes(["3.8x10cm Arte (3.5X9.7cm Final)", "2.2x7.4cm Arte (2.0X7.2cm Final)"]),
      "cores": formatarOpcoes(["4x0"]),
      "acabamento": formatarOpcoes(["Meio Corte Padrão Entregue em Bobinas de 33cm"])
    }
  },
  {
    "id": "prod_025", // Pego do mock antigo
    "nome": "Caixa de Hambúrguer",
    "descricao": "",
    "imageUrl": "/images/catalogo/caixa-de-hamburguer.png",
    "pricingType": "unidade",
    "options": {
      "papel": formatarOpcoes(["Kraft 240g", "Triplex 250g"]),
      "tamanho": formatarOpcoes(["46.6x30.4cm aberto (12X9cm fechado)"]),
      "cores": formatarOpcoes(["1x0", "4x0"]),
      "acabamento": formatarOpcoes(["Corte e Vinco"])
    }
  },
  {
    "id": "prod_027", // Pego do mock antigo
    "nome": "Caixa de Sushi",
    "descricao": "",
    "imageUrl": "/images/catalogo/caixa-de-sushi-grande.png",
    "pricingType": "unidade",
    "options": {
      "papel": formatarOpcoes(["Triplex 300g"]),
      "tamanho": formatarOpcoes(["45.5x32cm aberto (15X21.5cm fechado) grande"]),
      "cores": formatarOpcoes(["4x0"]),
      "acabamento": formatarOpcoes(["Corte e Vinco + Plast.Brilho Frente e Verso"])
    }
  },
  {
    "id": "prod_026", // Pego do mock antigo
    "nome": "Caixa para Panetone",
    "descricao": "",
    "imageUrl": "/images/catalogo/caixa-de-panetone.png",
    "pricingType": "unidade",
    "options": {
      "papel": formatarOpcoes(["Triplex 300g"]),
      "tamanho": formatarOpcoes(["50.6x35cm aberto (12LX12.8AX12P fechado)", "61x43.5cm aberto (15LX16AX15P fechado)"]),
      "cores": formatarOpcoes(["4x0"]),
      "acabamento": formatarOpcoes(["Lam Fsc F+Verniz Loc+Corte e vinco + colagem", "Lam Fsc F+Corte e vinco + colagem"])
    }
  },
  {
    "id": "prod_new_01", // ID Novo (não estava no mock antigo)
    "nome": "Caixas de Batata",
    "descricao": "",
    "imageUrl": "/images/catalogo/caixa-de-batata.png", // Imagem placeholder
    "pricingType": "unidade",
    "options": {
      "papel": formatarOpcoes(["Kraft 240g", "Triplex 250g"]),
      "tamanho": formatarOpcoes(["40x20.6cm aberto (10X9cm fechado) Pequena", "32.7x22.8cm aberto (10X12cm fechado) Médio"]),
      "cores": formatarOpcoes(["1x0", "4x0"]),
      "acabamento": formatarOpcoes(["Corte e Vinco"])
    }
  },
  {
    "id": "prod_005", // Pego do mock antigo
    "nome": "Calendário de Mesa",
    "descricao": "",
    "imageUrl": "/images/catalogo/calendario-mesa.png",
    "pricingType": "unidade",
    "options": {
      "papel": formatarOpcoes(["Couché 300g"]),
      "tamanho": formatarOpcoes(["10.2x27.3cm Arte (9.8X25.9cm Final)", "15.3x36.4cm Arte (15X24.9cm Final)"]),
      "cores": formatarOpcoes(["4x0"]),
      "acabamento": formatarOpcoes(["Corte e Vinco + Verniz Total"])
    }
  },
  {
    "id": "prod_006", // Pego do mock antigo
    "nome": "Calendário de Parede",
    "descricao": "",
    "imageUrl": "/images/catalogo/calendario-parede.png",
    "pricingType": "unidade",
    "options": {
      "papel": formatarOpcoes(["Triplex 250g", "Triplex 300g"]),
      "tamanho": formatarOpcoes(["21.4x30.4cm Arte (21X30cm Final)", "30.4x42.4cm Arte (30X42cm Final)", "23.8x32.2cm Arte (23X32cm Final)", "32.4x47.4cm Arte (32X47cm Final)"]),
      "cores": formatarOpcoes(["4x0"]),
      "acabamento": formatarOpcoes(["Verniz UV Total + Furo"])
    }
  },
  {
    "id": "prod_012", // Pego do mock antigo
    "nome": "Capa de Carnê",
    "descricao": "",
    "imageUrl": "/images/catalogo/capa-de-carne-4x4.png",
    "pricingType": "unidade",
    "options": {
      "papel": formatarOpcoes(["Couché Brilho 90g"]),
      "tamanho": formatarOpcoes(["43.2x10.4cm Arte (42.8X10cm Fechado)"]),
      "cores": formatarOpcoes(["4x0", "4x4"]),
      "acabamento": formatarOpcoes(["Refile"])
    }
  },
  {
    "id": "prod_008", // Pego do mock antigo
    "nome": "Cartão de Visita",
    "descricao": "",
    "imageUrl": "/images/catalogo/cartao-de-visita.png",
    "pricingType": "unidade",
    "options": {
      "papel": formatarOpcoes(["Couché 300g", "Couché 250g"]),
      "tamanho": formatarOpcoes(["9.1x5.1cm Arte (8.8X4.8cm Final)"]),
      "cores": formatarOpcoes(["4x0", "4x4", "4x1"]),
      "acabamento": formatarOpcoes(["Verniz Total Frente", "Laminação Fosca Frente e Verso", "Laminação Fosca FV + Verniz Local.", "Laminação Fosca FV + Cantos Arred.", "Lam Fsc FV+Verniz Loc+Cantos Arred.", "Verniz Total Frente + Cantos Arred"])
    }
  },
  {
    "id": "prod_013", // Pego do mock antigo
    "nome": "Cartaz",
    "descricao": "",
    "imageUrl": "/images/catalogo/cartaz.png",
    "pricingType": "unidade",
    "options": {
      "papel": formatarOpcoes(["Couché Brilho 115g", "Couché Brilho 90g", "Couché Brilho 150g"]),
      "tamanho": formatarOpcoes(["31.6x44.1cm Arte (31X43.5cm Final)", "42.6x62.6cm Arte (42X62cm Final)"]),
      "cores": formatarOpcoes(["4x0"]),
      "acabamento": formatarOpcoes(["Refile"])
    }
  },
  {
    "id": "prod_014", // Pego do mock antigo
    "nome": "Envelope Saco para A4 Aberto",
    "descricao": "",
    "imageUrl": "/images/catalogo/envelope-saco.png",
    "pricingType": "unidade",
    "options": {
      "papel": formatarOpcoes(["Offset 90g"]),
      "tamanho": formatarOpcoes(["47.8x37.5cm aberto (23X31.7cm fechado)"]),
      "cores": formatarOpcoes(["4x0"]),
      "acabamento": formatarOpcoes(["Corte e Vinco + Colagem"])
    }
  },
  {
    "id": "prod_new_02", // ID Novo
    "nome": "Envelopes para A4 Dobrado",
    "descricao": "",
    "imageUrl": "/images/catalogo/envelope-carta.png", // Imagem placeholder
    "pricingType": "unidade",
    "options": {
      "papel": formatarOpcoes(["Offset 90g"]),
      "tamanho": formatarOpcoes(["26.1x28.6cm aberto (11.5X23cm fechado) Carta", "24.1x28.1cm aberto(11.3X23cm fchd)Aba Lateral"]),
      "cores": formatarOpcoes(["4x0"]),
      "acabamento": formatarOpcoes(["Corte e Vinco + Colagem"])
    }
  },
  {
    "id": "prod_015", // Pego do mock antigo
    "nome": "Folder",
    "descricao": "",
    "imageUrl": "/images/catalogo/folder.png",
    "pricingType": "unidade",
    "options": {
      "papel": formatarOpcoes(["Couché Brilho 150g", "Couché Brilho 90g", "Couché Brilho 115g"]),
      "tamanho": formatarOpcoes(["30.4x21.4cm Arte (10X21cm Fechado) 2 Dobras", "30.4x21.4cm Arte (15X21cm Fechado)", "20.4x14.4cm Arte (10X14cm fechado)", "28.4x20.4cm Arte (14X20cm Fechado)"]),
      "cores": formatarOpcoes(["4x4"]),
      "acabamento": formatarOpcoes(["2 Dobras", "Dobra e refile"])
    }
  },
  {
    "id": "prod_007", // Pego do mock antigo
    "nome": "Imã de Geladeira",
    "descricao": "",
    "imageUrl": "/images/catalogo/ima-de-geladeira-com-calendario.png",
    "pricingType": "unidade",
    "options": {
      "papel": formatarOpcoes(["Couché 250g + Manta Magnética", "Couché 250g + Manta Magnética + Calendário"]),
      "tamanho": formatarOpcoes(["5.3x4.3cm Arte (5X4cm Final)"]),
      "cores": formatarOpcoes(["4x0"]),
      "acabamento": formatarOpcoes(["Verniz Total UV + Refile"])
    }
  },
  {
    "id": "prod_016", // Pego do mock antigo
    "nome": "Marcador de Página 4.8x17.75cm",
    "descricao": "",
    "imageUrl": "/images/catalogo/marcador-de-pagina.png",
    "pricingType": "unidade",
    "options": {
      "papel": formatarOpcoes(["Couché 300g"]),
      "tamanho": formatarOpcoes(["5.1x18.0cm Arte (4.8X17.75cm Final)"]),
      "cores": formatarOpcoes(["4x0", "4x4"]),
      "acabamento": formatarOpcoes(["Verniz Total Frente", "Laminação Fosca Frente e Verso", "Laminação Fosca FV + Verniz Local."])
    }
  },
  {
    "id": "prod_new_03", // ID Novo
    "nome": "Não Perturbe",
    "descricao": "",
    "imageUrl": "/images/catalogo/nao-perturbe.png", // Imagem placeholder
    "pricingType": "unidade",
    "options": {
      "papel": formatarOpcoes(["Couché 300g"]),
      "tamanho": formatarOpcoes(["9.1x19.95cm Arte (8.8X19.65cm Final)"]),
      "cores": formatarOpcoes(["4x0", "4x1", "4x4"]),
      "acabamento": formatarOpcoes(["Verniz Total Frente"])
    }
  },
  {
    "id": "prod_010", // Pego do mock antigo
    "nome": "Panfletos", // Nome simplificado (era Panfletos 1.000 und)
    "descricao": "",
    "imageUrl": "/images/catalogo/panfleto.png",
    "pricingType": "unidade",
    "options": {
      "papel": formatarOpcoes(["Couché Brilho 90g"]),
      "tamanho": formatarOpcoes(["10.4x14.4cm Arte (10X14cm Final)", "14.4x20.4cm Arte (14X20cm Final)", "21.4x30.4cm Arte (21X30cm Final)", "20.4x28.4cm Aberto (20X28cm Final) ECONÔMICO", "7.4x10.4cm Arte (7X10cm Final)"]),
      "cores": formatarOpcoes(["4x0", "4x4"]),
      "acabamento": formatarOpcoes(["Refile"])
    }
  },
  // O "Panfletos 1.000 und" do seu JSON é idêntico ao "Panfletos", então pulei para manter IDs únicos.
  {
    "id": "prod_017", // Pego do mock antigo
    "nome": "Papel de Bandeja",
    "descricao": "",
    "imageUrl": "/images/catalogo/papel-bandeja.png",
    "pricingType": "unidade",
    "options": {
      "papel": formatarOpcoes(["Offset 56g"]),
      "tamanho": formatarOpcoes(["35x24.5cm Arte (34.4X23.9cm Final)"]),
      "cores": formatarOpcoes(["4x0"]),
      "acabamento": formatarOpcoes(["Refile"])
    }
  },
  {
    "id": "prod_new_04", // ID Novo
    "nome": "Pasta Bolso",
    "descricao": "",
    "imageUrl": "/images/catalogo/pasta-bolso.png", // Imagem placeholder
    "pricingType": "unidade",
    "options": {
      "papel": formatarOpcoes(["Triplex 250g", "Triplex 300g"]),
      "tamanho": formatarOpcoes(["46.9x40.6cm Aberto (22.5X31cm Fechado)"]),
      "cores": formatarOpcoes(["4x0", "4x4"]),
      "acabamento": formatarOpcoes(["Verniz Total UV FR + Corte e Vinco + Colagem", "Laminação Fosca FR + Corte e Vinco + Colagem"])
    }
  },
  {
    "id": "prod_018", // Pego do mock antigo
    "nome": "Pasta Orelha",
    "descricao": "",
    "imageUrl": "/images/catalogo/pasta-orelha.png",
    "pricingType": "unidade",
    "options": {
      "papel": formatarOpcoes(["Triplex 250g", "Triplex 300g"]),
      "tamanho": formatarOpcoes(["45x32cm Arte (22X31cm fechado)"]),
      "cores": formatarOpcoes(["4x0", "4x4"]),
      "acabamento": formatarOpcoes(["Verniz Total UV Frente + Corte e Vinco", "Laminação Fosca Frente + Corte e Vinco"])
    }
  },
  {
    "id": "prod_new_05", // ID Novo
    "nome": "Pasta Orelha com Janela",
    "descricao": "",
    "imageUrl": "/images/catalogo/pasta-orelha-com-janela.png", // Imagem placeholder
    "pricingType": "unidade",
    "options": {
      "papel": formatarOpcoes(["Triplex 250g"]),
      "tamanho": formatarOpcoes(["45x32cm Arte (22X31cm fechado)"]),
      "cores": formatarOpcoes(["4x0"]),
      "acabamento": formatarOpcoes(["Verniz Total UV Frente + Corte e Vinco"])
    }
  },
  {
    "id": "prod_003", // Pego do mock antigo
    "nome": "Porta Banner Roll-Up + Banner",
    "descricao": "",
    "imageUrl": "/images/catalogo/roll-up.png",
    "pricingType": "metro",
    "options": {
      "papel": formatarOpcoes(["Lona Front 380g"]),
      "tamanho": formatarOpcoes(["80x200cm Arte (79X199cm Final)"]),
      "cores": formatarOpcoes(["4x0"]),
      "acabamento": formatarOpcoes(["Estrutura Roll-Up"]) // Adicionei um acabamento
    }
  },
  {
    "id": "prod_019", // Pego do mock antigo
    "nome": "Postal",
    "descricao": "",
    "imageUrl": "/images/catalogo/postal.png",
    "pricingType": "unidade",
    "options": {
      "papel": formatarOpcoes(["Couché 300g", "Couché 250g"]),
      "tamanho": formatarOpcoes(["9.1x9.9cm Arte (8.8X9.75cm Final)", "9.1x15cm Arte (8.8X14.7cm Final)"]),
      "cores": formatarOpcoes(["4x4", "4x1", "4x0"]),
      "acabamento": formatarOpcoes(["Laminação Fosca FV + Verniz Local.", "Verniz Total Frente"])
    }
  },
  {
    "id": "prod_020", // Pego do mock antigo
    "nome": "Receituário - Quant em folhas",
    "descricao": "",
    "imageUrl": "/images/catalogo/receituario.png",
    "pricingType": "unidade",
    "options": {
      "papel": formatarOpcoes(["Offset 75g", "Offset 90g"]),
      "tamanho": formatarOpcoes(["15.6x21.6cm Arte (15X21cm Final)"]),
      "cores": formatarOpcoes(["4x0"]),
      "acabamento": formatarOpcoes(["Refile", "Refile + Blocagem a cada 50 folhas"])
    }
  },
  {
    "id": "prod_new_06", // ID Novo
    "nome": "Rótulos e Adesivos",
    "descricao": "",
    "imageUrl": "/images/catalogo/rotulos-e-adesivos.png", // Imagem placeholder
    "pricingType": "unidade",
    "options": {
      "papel": formatarOpcoes(["Couché Adesivo", "Bopp Branco Brilho"]),
      "tamanho": formatarOpcoes([]),
      "cores": formatarOpcoes(["4x0"]),
      "acabamento": formatarOpcoes(["Meio Corte Padrão Entregue em Bobinas de 33cm"])
    }
  },
  {
    "id": "prod_021", // Pego do mock antigo
    "nome": "Sacolas",
    "descricao": "",
    "imageUrl": "/images/catalogo/sacola.png",
    "pricingType": "unidade",
    "options": {
      "papel": formatarOpcoes(["Triplex 215g"]),
      "tamanho": formatarOpcoes(["65.7x46.7cm aberto (22.5X32.3 fechado) Tam G"]),
      "cores": formatarOpcoes(["4x0"]),
      "acabamento": formatarOpcoes(["Corte e Vinco + Colagem", "Laminação + Corte e Vinco + Colagem"])
    }
  },
  {
    "id": "prod_new_07", // ID Novo
    "nome": "Sacos para Delivery",
    "descricao": "",
    "imageUrl": "/images/catalogo/saco.png", // Imagem placeholder
    "pricingType": "unidade",
    "options": {
      "papel": formatarOpcoes(["Offset 90g"]),
      "tamanho": formatarOpcoes(["65.1x46.5cm aberto (17.5X36.7cm fechado)"]),
      "cores": formatarOpcoes(["4x0"]),
      "acabamento": formatarOpcoes(["Corte e Vinco + Colagem"])
    }
  },
  {
    "id": "prod_new_08", // ID Novo
    "nome": "Solapa",
    "descricao": "",
    "imageUrl": "/images/catalogo/solapa.png", // Imagem placeholder
    "pricingType": "unidade",
    "options": {
      "papel": formatarOpcoes(["Couché 250g"]),
      "tamanho": formatarOpcoes(["9.1x9.9cm Arte (8.8X9.75cm Final)", "9.1x15cm Arte (8.8X14.7cm Final)"]),
      "cores": formatarOpcoes(["4x0"]),
      "acabamento": formatarOpcoes(["Verniz Total Frente"])
    }
  },
  {
    "id": "prod_009", // Pego do mock antigo
    "nome": "Tags",
    "descricao": "",
    "imageUrl": "/images/catalogo/tags.png",
    "pricingType": "unidade",
    "options": {
      "papel": formatarOpcoes(["Couché 300g", "Couché 250g"]),
      "tamanho": formatarOpcoes(["5.1x9.1cm Arte (4.8X8.8cm Final)", "4.7x5.1cm Arte (4.4X4.8cm Final)", "5.1x9.1cm Arte (4.8X8.8cm Final) Colar Brinco"]),
      "cores": formatarOpcoes(["4x4"]),
      "acabamento": formatarOpcoes(["Verniz UV Total + Furo", "Laminação Fosca FV + Furo", "Laminação Fosca FV + Verniz Loc. + Furo", "Verniz Total Frente + Cantos Arred + Furo", "Lam Fosca FV + Cantos Arred + Furo", "Lam F FV + Verniz Loc.+ Cantos Arred + Furo", "Verniz Total Frente"])
    }
  },
  {
    "id": "prod_022", // Pego do mock antigo
    "nome": "Tapete Lava Jato",
    "descricao": "",
    "imageUrl": "/images/catalogo/lava-jato.png",
    "pricingType": "unidade",
    "options": {
      "papel": formatarOpcoes(["Offset 56g"]),
      "tamanho": formatarOpcoes(["32.6x45.4cm Arte (32X44.8cm Final)"]),
      "cores": formatarOpcoes(["4x0"]),
      "acabamento": formatarOpcoes(["Refile"])
    }
  },
  {
    "id": "prod_023", // Pego do mock antigo
    "nome": "Timbrado",
    "descricao": "",
    "imageUrl": "/images/catalogo/timbrado.png",
    "pricingType": "unidade",
    "options": {
      "papel": formatarOpcoes(["Offset 75g", "Offset 90g"]),
      "tamanho": formatarOpcoes(["21.6x30.3cm Arte (21X29.7cm Final)"]),
      "cores": formatarOpcoes(["4x0"]),
      "acabamento": formatarOpcoes(["Refile"])
    }
  },
  {
    "id": "prod_004", // Pego do mock antigo
    "nome": "Totem Eliptico Dobrável",
    "descricao": "",
    "imageUrl": "/images/catalogo/totem.png",
    "pricingType": "unidade",
    "options": {
      "papel": formatarOpcoes(["Duplex Alta Rigidez 350g"]),
      "tamanho": formatarOpcoes(["100x147cm Arte (50X147cm fechado)", "120x170cm Arte (60X170cm fechado)", "144x180cm Arte (72X180cm fechado)"]),
      "cores": formatarOpcoes(["4x0"]),
      "acabamento": formatarOpcoes(["Corte e Vinco + Colagem"])
    }
  },
  {
    "id": "prod_024", // Pego do mock antigo
    "nome": "Ventarola / Abanador",
    "descricao": "",
    "imageUrl": "/images/catalogo/abanador.png",
    "pricingType": "unidade",
    "options": {
      "papel": formatarOpcoes(["Triplex 300g", "Triplex 250g"]),
      "tamanho": formatarOpcoes(["21.5x21.5cm Arte (21X21cm Final)"]),
      "cores": formatarOpcoes(["4x0", "4x4"]),
      "acabamento": formatarOpcoes(["Corte e Vinco"])
    }
  },
  {
    "id": "prod_025",
    "nome": "Big  Flag",
    "descricao": "· HASTE COMPLETA, POREM É EM ALUMINIO E FIBRA DE VIDRO\n· TECIDO OXFORD  ( QUALIDADE E TAMANHO INFERIOR PROPORCIONAL AO WINDBANNER )",
    "imageUrl": "/images/catalogo/bigflag.png",
    "pricingType": "unidade",
    "options": {
      "papel": formatarOpcoes(["Completo", "Só Tecido"]),
      "tamanho": formatarOpcoes(["1,80m (150x36)", "2,50m (145x50)", "3,10m (200x60)", "3,50m (250x71)"]),
      "cores": formatarOpcoes(["4x4"]),
      "acabamento": formatarOpcoes(["Faca", "Vela", "Pena"])
    }
  },
  {
    "id": "prod_026",
    "nome": "Wind Banner",
    "descricao": "· HASTE MONTAVEL EM ALUMINIO\n· TECIDO TECNHSPORT ( QUALIDADE E TAMANHO MAIOR PROPORCIONAL AO BIGFLAG )",
    "imageUrl": "/images/catalogo/windbanner.png",
    "pricingType": "unidade",
    "options": {
      "papel": formatarOpcoes(["Completo", "Só Tecido"]),
      "tamanho": formatarOpcoes(["2,0m (155x60)", "2,50m (200x60)", "3,0m (250x60)", "3,5m (290x60)"]),
      "cores": formatarOpcoes(["4x4"]),
      "acabamento": formatarOpcoes(["Faca", "Vela", "Pena"])
    }
  },
  {
    "id": "prod_027",
    "nome": "Pulseira de Evento",
    "descricao": "",
    "imageUrl": "/images/catalogo/pulseira-de-cetim.png",
    "pricingType": "unidade",
    "options": {
      "papel": formatarOpcoes(["Cetim"]),
      "tamanho": formatarOpcoes(["300x20 (320x20)", "300x15 (320x15)"]),
      "cores": formatarOpcoes(["4x0"]),
      "acabamento": formatarOpcoes(["Padrão"])
    }
  },
  {
    "id": "prod_028",
    "nome": "Tapete Impresso",
    "descricao": "",
    "imageUrl": "/images/catalogo/tapete-impresso.png",
    "pricingType": "unidade",
    "options": {
      "papel": formatarOpcoes(["Borracha"]),
      "tamanho": formatarOpcoes([]),
      "cores": formatarOpcoes(["4x0"]),
      "acabamento": formatarOpcoes(["Sem Borda", "Borda Rebaixada"])
    }
  }
];

// --- Combina e exporta a lista final ---
// (Isso garante que não haja IDs duplicados, o último vence)
const productMap = new Map<string, Product>();
NOVOS_PRODUTOS.forEach(p => productMap.set(p.id, p));

export const produtosDoCatalogo: Product[] = Array.from(productMap.values());

// --- FUNÇÃO PARA BUSCAR O PRODUTO ---
export const getProductById = (id: string): Product | undefined => {
  return produtosDoCatalogo.find(produto => produto.id === id);
};