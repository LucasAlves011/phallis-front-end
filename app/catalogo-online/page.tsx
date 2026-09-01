// Arquivo: app/catalogo-online/page.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
   Search,
   Sparkles,
   CheckCircle2,
   Share2,
   Eye,
   Layers,
   X,
   Check,
   MapPin,
   Phone,
   Clock,
   Linkedin,
   Code2,
   ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
   DialogDescription,
} from "@/components/ui/dialog";
import { cn } from '@/lib/utils';

// ============================================================
// COMPONENTE ÍCONE OFICIAL WHATSAPP
// ============================================================
const WhatsAppIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
   <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 448 512"
      aria-hidden="true"
   >
      <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
   </svg>
);

// ============================================================
// DADOS DO CATÁLOGO PÚBLICO
// ============================================================
export interface PublicProduct {
   id: string;
   nome: string;
   categoria: 'TODOS' | 'METRO' | 'UNIDADE' | 'SERVICO';
   categoriaNome: string;
   imageUrl: string;
   descricao: string;
   resumo: string;
   pricingType: 'METRO' | 'UNIDADE' | 'SERVICO';
   destaque?: boolean;
   opcoes: {
      papeis?: string[];
      tamanhos?: string[];
      cores?: string[];
      acabamentos?: string[];
   };
}

const MOCK_PUBLIC_PRODUCTS: PublicProduct[] = [
   {
      id: '1',
      nome: 'Banner em Lona com Acabamento',
      categoria: 'METRO',
      categoriaNome: 'Sob Medida (m²)',
      imageUrl: '/images/catalogo/banner.png',
      descricao: 'Impressão digital em lona fosca ou brilhante de alta gramatura (440g). Alta durabilidade externa e cores vivas com proteção UV.',
      resumo: 'Lona 440g resistente a sol e chuva. Acompanha madeira, ponteiras e cordão ou ilhós.',
      pricingType: 'METRO',
      destaque: true,
      opcoes: {
         papeis: ['Lona Frontlight 440g Brilho', 'Lona 440g Fosca Anti-Reflexo', 'Lona Blackout 510g'],
         tamanhos: ['Sob Medida (Largura x Altura)', 'Padrão 60x90cm', 'Padrão 80x120cm', 'Padrão 100x150cm'],
         cores: ['4x0 (Colorido Frente)'],
         acabamentos: ['Bastão de Madeira + Cordão', 'Ilhós nas 4 pontas', 'Ilhós a cada 30cm', 'Reforço de Bainha']
      }
   },
   {
      id: '2',
      nome: 'Adesivos e Rótulos Personalizados',
      categoria: 'METRO',
      categoriaNome: 'Sob Medida (m²)',
      imageUrl: '/images/catalogo/rotulos-e-adesivos.png',
      descricao: 'Adesivos vinílicos à prova d’água com corte especial eletrônico. Ideais para embalagens, potes, vitrines, veículos e etiquetas de identificação.',
      resumo: 'Vinil adesivo impermeável com meio-corte eletrônico em qualquer formato.',
      pricingType: 'METRO',
      destaque: true,
      opcoes: {
         papeis: ['Vinil Branco Brilho', 'Vinil Fosco', 'Vinil Transparente', 'Vinil Holográfico', 'Eletrostático'],
         tamanhos: ['Cartela Personalizada', 'Corte Redondo / Quadrado', 'Corte Especial no Contorno'],
         cores: ['4x0 (Alta Definição)'],
         acabamentos: ['Meio-Corte Eletrônico', 'Laminação Protetora Fosca', 'Laminação Brilho']
      }
   },
   {
      id: '3',
      nome: 'Windbanner / Flag Banner',
      categoria: 'UNIDADE',
      categoriaNome: 'Impressos por Unidade',
      imageUrl: '/images/catalogo/windbanner.png',
      descricao: 'Excelente ferramenta de marketing para fachadas e eventos. Tecido microfibra impresso em sublimação dupla face com haste articulada e base pesada.',
      resumo: 'Visual imponente com movimento ao vento. Acompanha tecido, haste de fibra e base.',
      pricingType: 'UNIDADE',
      destaque: true,
      opcoes: {
         papeis: ['Tecido Microfibra Premium 100% Poliéster'],
         tamanhos: ['Pena 2,5 metros', 'Gota 2,5 metros', 'Vela 3,0 metros', 'Pena 3,5 metros'],
         cores: ['4x4 (Frente e Verso Dupla Face)'],
         acabamentos: ['Base Plástica para Água/Areia', 'Base de Ferro Fixa', 'Haste em Fibra de Vidro Articulada']
      }
   },
   {
      id: '4',
      nome: 'Cartão de Visita Premium',
      categoria: 'UNIDADE',
      categoriaNome: 'Impressos por Unidade',
      imageUrl: '/images/catalogo/cartao-de-visita.png',
      descricao: 'Apresentação profissional impecável. Impressão offset de altíssima definição com opções nobres de acabamento tátil e visual.',
      resumo: 'Papel Couchê 300g com laminação fosca e verniz localizado UV.',
      pricingType: 'UNIDADE',
      destaque: true,
      opcoes: {
         papeis: ['Couchê 300g Premium', 'Supremo 300g', 'Kraft 300g Rústico', 'Reciclato 240g'],
         tamanhos: ['Padrão Brasil 9x5 cm', 'Padrão Europeu 8,5x5,5 cm', 'Cantos Arredondados'],
         cores: ['4x0 (Frente Colorida)', '4x4 (Frente e Verso Coloridos)'],
         acabamentos: ['Laminação Fosca Soft Touch', 'Verniz Localizado UV', 'Hot Stamping Dourado/Prata', 'Corte Especial']
      }
   },
   {
      id: '5',
      nome: 'Panfletos e Folhetos Promocionais',
      categoria: 'UNIDADE',
      categoriaNome: 'Impressos por Unidade',
      imageUrl: '/images/catalogo/panfleto.png',
      descricao: 'Divulgue promoções, inaugurações e serviços em larga escala com excelente custo-benefício e qualidade de impressão gráfica.',
      resumo: 'Papel Couchê 90g, 115g ou 150g com cores vivas e dobra opcional.',
      pricingType: 'UNIDADE',
      opcoes: {
         papeis: ['Couchê 90g Econômico', 'Couchê 115g Brilho', 'Couchê 150g Encorpado'],
         tamanhos: ['10x14 cm (1/4 de sulfite)', '15x21 cm (Meia folha A5)', '21x29,7 cm (Folha A4 inteira)'],
         cores: ['4x0 (Frente)', '4x4 (Frente e Verso)'],
         acabamentos: ['Refile Reto', '1 Dobra Central (Folder 4 Páginas)', '2 Dobras Sanfona / Carteira']
      }
   },
   {
      id: '6',
      nome: 'Roll-Up Portátil Retrátil',
      categoria: 'METRO',
      categoriaNome: 'Sob Medida (m²)',
      imageUrl: '/images/catalogo/roll-up.png',
      descricao: 'Banner retrátil autoportante em estrutura de alumínio com lona anti-curvatura. Super fácil de montar em feiras, reuniões e eventos corporativos.',
      resumo: 'Estrutura de alumínio retrátil que se fecha em bolsa de transporte.',
      pricingType: 'METRO',
      opcoes: {
         papeis: ['Lona Anti-Curvatura 440g Fosca', 'Tecido Canvas'],
         tamanhos: ['80 x 200 cm', '100 x 200 cm', '120 x 200 cm'],
         cores: ['4x0 (Alta Resolução)'],
         acabamentos: ['Estrutura Alumínio + Bolsa de Transporte']
      }
   },
   {
      id: '7',
      nome: 'Pastas Corporativas com Bolso / Orelha',
      categoria: 'UNIDADE',
      categoriaNome: 'Impressos por Unidade',
      imageUrl: '/images/catalogo/pasta-bolso.png',
      descricao: 'Organização e elegância para apresentar propostas comerciais, contratos e laudos aos seus clientes.',
      resumo: 'Papel Couchê 300g com bolso interno colado e encaixe para cartão de visitas.',
      pricingType: 'UNIDADE',
      opcoes: {
         papeis: ['Couchê 300g', 'Supremo 300g (Mais Rígido)', 'Reciclato 240g'],
         tamanhos: ['Fechada 22x31 cm (Para folhas A4)'],
         cores: ['4x0 (Frente)', '4x4 (Frente e Verso)'],
         acabamentos: ['Bolso Interno com Encaixe de Cartão', 'Laminação Fosca Externa', 'Verniz Localizado']
      }
   },
   {
      id: '8',
      nome: 'Sacolas de Papel Personalizadas',
      categoria: 'UNIDADE',
      categoriaNome: 'Impressos por Unidade',
      imageUrl: '/images/catalogo/sacola.png',
      descricao: 'Valorize suas vendas e entregas com sacolas de luxo personalizadas com a identidade visual da sua marca.',
      resumo: 'Papel Offset ou Kraft com alça de cordão e reforço no fundo.',
      pricingType: 'UNIDADE',
      opcoes: {
         papeis: ['Kraft Natural 120g (Eco)', 'Offset 150g Branco', 'Couchê 180g com Laminação'],
         tamanhos: ['Pequena (18x22x8 cm)', 'Média (24x32x10 cm)', 'Grande (32x40x12 cm)'],
         cores: ['1x0 (Uma cor)', '4x0 (Colorido Total)'],
         acabamentos: ['Alça de Cordão de Algodão', 'Alça de Fita de Cetim', 'Fundo Reforçado com Cartão']
      }
   },
   {
      id: '9',
      nome: 'Totem Promocional em MDF / PS',
      categoria: 'METRO',
      categoriaNome: 'Sob Medida (m²)',
      imageUrl: '/images/catalogo/totem.png',
      descricao: 'Displays de chão e totens recortados em tamanho real para pontos de venda, lançamentos e ações de marketing.',
      resumo: 'Placa rígida adesivada em alta definição com pé de sustentação.',
      pricingType: 'METRO',
      opcoes: {
         papeis: ['PS Rígido 3mm', 'PS Rígido 5mm', 'MDF 6mm com Acabamento'],
         tamanhos: ['Sob Medida (Até 2 metros de altura)'],
         cores: ['4x0 (Adesivo Vinil Alta Definição)'],
         acabamentos: ['Corte no Formato (Silhueta)', 'Pé Traseiro de Sustentação Articulado']
      }
   },
   {
      id: '10',
      nome: 'Tags e Etiquetas para Roupas e Produtos',
      categoria: 'UNIDADE',
      categoriaNome: 'Impressos por Unidade',
      imageUrl: '/images/catalogo/tags.png',
      descricao: 'Tags personalizadas para confecções, artesanato, presentes e produtos gourmet com furo para cordão.',
      resumo: 'Papel encorpado 300g com furo padrão ou formatos especiais.',
      pricingType: 'UNIDADE',
      opcoes: {
         papeis: ['Couchê 300g', 'Kraft 300g Rústico', 'Papel Supremo 300g'],
         tamanhos: ['4x8 cm', '5x9 cm', 'Redondo 5x5 cm', 'Formato Especial'],
         cores: ['4x0 (Frente)', '4x4 (Frente e Verso)'],
         acabamentos: ['Furo de 3mm / 4mm', 'Laminação Fosca', 'Verniz Localizado', 'Hot Stamping']
      }
   },
   {
      id: '11',
      nome: 'Painel Redondo para Decoração e Festas',
      categoria: 'METRO',
      categoriaNome: 'Sob Medida (m²)',
      imageUrl: '/images/catalogo/painel-redondo.png',
      descricao: 'Tecido sublimado com elástico para estrutura circular ou lona circular de fácil instalação e sem reflexo de luz.',
      resumo: 'Tecido com elastano que veste a estrutura redonda sem amassar.',
      pricingType: 'METRO',
      opcoes: {
         papeis: ['Tecido Helanca Premium com Elastano', 'Lona Fosca 440g'],
         tamanhos: ['1,00m de diâmetro', '1,50m de diâmetro', '1,80m de diâmetro', '2,00m de diâmetro'],
         cores: ['4x0 (Sublimação Total)'],
         acabamentos: ['Costura com Elástico (Veste Fácil)', 'Refile Circular']
      }
   },
   {
      id: '12',
      nome: 'Envelopes Comerciais e Personalizados',
      categoria: 'UNIDADE',
      categoriaNome: 'Impressos por Unidade',
      imageUrl: '/images/catalogo/envelope-carta.png',
      descricao: 'Envelopes timbrados para correspondências corporativas, convites, envio de faturas e documentações oficiais.',
      resumo: 'Papel Offset 90g ou 120g com aba adesivada.',
      pricingType: 'UNIDADE',
      opcoes: {
         papeis: ['Offset 90g', 'Offset 120g'],
         tamanhos: ['Envelope Carta (11,4 x 16,2 cm)', 'Envelope Ofício (11,4 x 22,9 cm)', 'Envelope Saco A4 (24 x 34 cm)'],
         cores: ['4x0 (Colorido Frente e Aba)'],
         acabamentos: ['Fita Adesiva Silicone na Aba (Autocolante)']
      }
   }
];

const CATEGORIA_NOMES_MAP: Record<string, string> = {
   METRO: 'Sob Medida (m²)',
   UNIDADE: 'Por Unidade',
   SERVICO: 'Serviço Gráfico',
};

const WHATSAPP_NUMERO = '5581985890254';

export default function CatalogoPublicoPage() {
   const [produtos, setProdutos] = useState<PublicProduct[]>(MOCK_PUBLIC_PRODUCTS);
   const [busca, setBusca] = useState('');
   const [filtroCategoria, setFiltroCategoria] = useState<'TODOS' | 'METRO' | 'UNIDADE' | 'SERVICO'>('TODOS');
   const [produtoSelecionado, setProdutoSelecionado] = useState<PublicProduct | null>(null);
   const [linkCopiado, setLinkCopiado] = useState(false);

   useEffect(() => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      fetch(`${apiUrl}/api/public/catalogo`)
         .then(res => {
            if (!res.ok) throw new Error('Status ' + res.status);
            return res.json();
         })
         .then((data: any[]) => {
            if (Array.isArray(data)) {
               const convertidos: PublicProduct[] = data.map((item: any) => ({
                  id: String(item.id),
                  nome: item.nome,
                  descricao: item.descricaoDetalhada || item.resumo || '',
                  resumo: item.resumo || item.descricaoDetalhada || '',
                  categoria: (item.categoria as any) || 'UNIDADE',
                  categoriaNome: CATEGORIA_NOMES_MAP[item.categoria] || 'Produto',
                  destaque: item.destaque === true,
                  imageUrl: item.imageUrl || '/images/catalogo/phalis-kekw.png',
                  pricingType: item.categoria || 'UNIDADE',
                  opcoes: {
                     papeis: Array.isArray(item.opcoes?.papel) ? item.opcoes.papel.map((p: any) => typeof p === 'string' ? p : p.name) : undefined,
                     tamanhos: Array.isArray(item.opcoes?.tamanho) ? item.opcoes.tamanho.map((t: any) => typeof t === 'string' ? t : t.name) : undefined,
                     cores: Array.isArray(item.opcoes?.cores) ? item.opcoes.cores.map((c: any) => typeof c === 'string' ? c : c.name) : undefined,
                     acabamentos: Array.isArray(item.opcoes?.acabamento) ? item.opcoes.acabamento.map((a: any) => typeof a === 'string' ? a : a.name) : undefined,
                  }
               }));
               setProdutos(convertidos);
            }
         })
         .catch(err => {
            // Em caso de falha na conexão ou offline, mantém o catálogo local como fallback
            console.warn('Catálogo online utilizando fallback local:', err.message);
         });
   }, []);

   const produtosFiltrados = useMemo(() => {
      return produtos.filter(p => {
         const matchCategoria = filtroCategoria === 'TODOS' || p.categoria === filtroCategoria;
         const termo = busca.toLowerCase().trim();
         const matchBusca = !termo ||
            p.nome.toLowerCase().includes(termo) ||
            p.descricao.toLowerCase().includes(termo) ||
            p.categoriaNome.toLowerCase().includes(termo);
         return matchCategoria && matchBusca;
      });
   }, [produtos, busca, filtroCategoria]);

   const copiarLinkCatalogo = () => {
      if (typeof window !== 'undefined') {
         navigator.clipboard.writeText(window.location.href);
         setLinkCopiado(true);
         setTimeout(() => setLinkCopiado(false), 2500);
      }
   };

   const abrirWhatsappProduto = (prod: PublicProduct) => {
      const msg = `Olá PHALIS! Estava visualizando o catálogo e gostaria de solicitar um orçamento para o produto: *${prod.nome}*.\n\nPoderiam me passar mais informações?`;
      const url = `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(msg)}`;
      window.open(url, '_blank');
   };

   const abrirWhatsappGeral = () => {
      const msg = `Olá PHALIS! Gostaria de tirar dúvidas sobre os produtos e serviços de comunicação visual.`;
      const url = `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(msg)}`;
      window.open(url, '_blank');
   };

   return (
      <div className="min-h-screen bg-phalis-dark text-white flex flex-col selection:bg-phalis-action/30 selection:text-white">

         {/* ─── CABEÇALHO PÚBLICO DA MARCA ─── */}
         <header className="sticky top-0 z-40 bg-[#181818]/95 backdrop-blur-md border-b border-phalis-gray/80 transition-all shadow-lg">
            {/* Barra Gradiente CMYK Superior */}
            <div className="w-full h-1 bg-gradient-to-r from-phalis-ciano via-phalis-rosa via-phalis-yellow to-phalis-action" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-4">

               {/* Logo Phalis com Alto Destaque */}
               <div className="flex items-center gap-3">
                  <div className="relative w-36 sm:w-44 md:w-52 h-11 sm:h-13 md:h-14 transition-transform hover:scale-105 duration-200">
                     <Image
                        src="/phalis-logo.svg"
                        alt="PHALIS Logo"
                        fill
                        priority
                        className="object-contain drop-shadow-[0_2px_10px_rgba(0,188,212,0.15)]"
                     />
                  </div>
               </div>

               {/* Ações Rápidas do Header */}
               <div className="flex items-center gap-2.5">
                  <Button
                     size="sm"
                     variant="outline"
                     onClick={copiarLinkCatalogo}
                     className="h-9 rounded-xl border-gray-700 bg-phalis-gray hover:bg-[#333333] text-xs font-semibold text-gray-200 hover:text-white flex items-center gap-1.5 transition-colors"
                  >
                     {linkCopiado ? <Check size={14} className="text-phalis-action" /> : <Share2 size={14} />}
                     <span className="hidden md:inline">{linkCopiado ? 'Link Copiado!' : 'Compartilhar'}</span>
                  </Button>

                  <Button
                     size="sm"
                     onClick={abrirWhatsappGeral}
                     className="h-9 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-black font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-[#25D366]/20 transition-all"
                  >
                     <WhatsAppIcon className="w-4 h-4 text-black" />
                     <span>WhatsApp</span>
                  </Button>
               </div>

            </div>
         </header>

         {/* ─── HERO BANNER COM IDENTIDADE VISUAL PHALIS ─── */}
         <section className="relative overflow-hidden border-b border-phalis-gray/80 bg-gradient-to-b from-[#222222] via-[#1c1c1c] to-[#161616] py-10 sm:py-14 px-4 sm:px-6">
            <div className="max-w-4xl mx-auto text-center space-y-4 relative z-10">
               <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
                  Tudo o que sua marca precisa para{' '}
                  <span className="bg-gradient-to-r from-phalis-ciano via-phalis-rosa to-phalis-action bg-clip-text text-transparent">
                     se destacar
                  </span>
               </h1>

               <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto font-normal leading-relaxed">
                  Conheça nossa linha de banners, adesivos, impressos nobres e materiais personalizados. Escolha o seu produto e orce direto no WhatsApp.
               </p>

               {/* Selos de Benefício com as Cores Phalis */}
               <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 pt-3 text-xs text-gray-200">
                  <span className="flex items-center gap-1.5 bg-black/40 px-3.5 py-1.5 rounded-full border border-gray-800">
                     <CheckCircle2 size={15} className="text-phalis-ciano" /> Alta Definição de Impressão
                  </span>
                  <span className="flex items-center gap-1.5 bg-black/40 px-3.5 py-1.5 rounded-full border border-gray-800">
                     <CheckCircle2 size={15} className="text-phalis-yellow" /> Atendimento Consultivo
                  </span>
                  <span className="flex items-center gap-1.5 bg-black/40 px-3.5 py-1.5 rounded-full border border-gray-800">
                     <CheckCircle2 size={15} className="text-phalis-action" /> Materiais Nobres
                  </span>
               </div>
            </div>
         </section>

         {/* ─── FILTROS & BARRA DE BUSCA EM TEMPO REAL ─── */}
         <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-8 pb-4 space-y-5">
            {/* Título da Seção Catálogo de Produtos */}
            <div className="flex items-center gap-2.5">
               <span className="w-2.5 h-6 rounded-full bg-phalis-action" />
               <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase">
                  Catálogo de Produtos
               </h2>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-4">

               {/* Campo de Busca */}
               <div className="relative w-full md:max-w-md">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
                  <Input
                     placeholder="Buscar banner, adesivo, cartão, pasta..."
                     value={busca}
                     onChange={(e) => setBusca(e.target.value)}
                     className="bg-[#242424] border-gray-700 text-white pl-10 pr-9 h-11 rounded-xl text-sm focus-visible:ring-phalis-action/50 placeholder:text-gray-400 shadow-inner"
                  />
                  {busca && (
                     <button
                        onClick={() => setBusca('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                     >
                        <X size={15} />
                     </button>
                  )}
               </div>

               {/* Pílulas de Categoria com Cores da Paleta */}
               <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto scrollbar-none">
                  <Button
                     size="sm"
                     onClick={() => setFiltroCategoria('TODOS')}
                     className={cn(
                        "rounded-xl text-xs h-9 px-4 font-bold transition-all shrink-0",
                        filtroCategoria === 'TODOS'
                           ? "bg-phalis-action text-phalis-black shadow-md shadow-phalis-action/20"
                           : "bg-[#242424] text-gray-300 hover:text-white hover:bg-[#2d2d2d] border border-gray-700/60"
                     )}
                  >
                     Todos ({produtos.length})
                  </Button>

                  <Button
                     size="sm"
                     onClick={() => setFiltroCategoria('METRO')}
                     className={cn(
                        "rounded-xl text-xs h-9 px-4 font-bold transition-all shrink-0",
                        filtroCategoria === 'METRO'
                           ? "bg-phalis-ciano text-phalis-black shadow-md shadow-phalis-ciano/20"
                           : "bg-[#242424] text-gray-300 hover:text-white hover:bg-[#2d2d2d] border border-gray-700/60"
                     )}
                  >
                     Sob Medida (m²)
                  </Button>

                  <Button
                     size="sm"
                     onClick={() => setFiltroCategoria('UNIDADE')}
                     className={cn(
                        "rounded-xl text-xs h-9 px-4 font-bold transition-all shrink-0",
                        filtroCategoria === 'UNIDADE'
                           ? "bg-phalis-rosa text-white shadow-md shadow-phalis-rosa/20"
                           : "bg-[#242424] text-gray-300 hover:text-white hover:bg-[#2d2d2d] border border-gray-700/60"
                     )}
                  >
                     Por Unidade
                  </Button>
               </div>

            </div>

            {/* Contador de Resultados */}
            <div className="flex items-center justify-between text-xs text-gray-400 border-t border-phalis-gray/80 pt-3">
               <span>Exibindo <strong className="text-white">{produtosFiltrados.length}</strong> {produtosFiltrados.length === 1 ? 'produto' : 'produtos'}</span>
               {busca && (
                  <button onClick={() => setBusca('')} className="text-phalis-action hover:underline font-bold">
                     Limpar busca
                  </button>
               )}
            </div>
         </section>

         {/* ─── GRID DE PRODUTOS RESPONSIVO ─── */}
         <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-16 flex-1">
            {produtosFiltrados.length > 0 ? (
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
                  {produtosFiltrados.map((prod, index) => (
                     <motion.div
                        key={prod.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, delay: index * 0.04 }}
                        whileHover={{ y: -5 }}
                        className="bg-[#242424] border border-gray-700/60 hover:border-phalis-action/50 rounded-2xl overflow-hidden flex flex-col justify-between shadow-xl transition-all group"
                     >
                        {/* Imagem do Produto com Badges */}
                        <div
                           onClick={() => setProdutoSelecionado(prod)}
                           className="relative h-48 sm:h-52 w-full bg-[#181818] flex items-center justify-center p-4 cursor-pointer overflow-hidden border-b border-gray-800"
                        >
                           <Image
                              src={prod.imageUrl}
                              alt={prod.nome}
                              width={160}
                              height={160}
                              className="object-contain max-h-40 w-auto group-hover:scale-110 transition-transform duration-300 drop-shadow-md"
                           />

                           {/* Badge de Destaque / Tipo */}
                           <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
                              {prod.destaque && (
                                 <Badge className="bg-orange-500/20 text-orange-400 border border-orange-500/40 text-[10px] font-extrabold py-0.5 px-2 backdrop-blur-md shadow-sm">
                                    Mais Pedido
                                 </Badge>
                              )}
                              <Badge className="bg-black/75 text-phalis-ciano border border-phalis-ciano/30 text-[10px] font-semibold py-0.5 px-2 backdrop-blur-md">
                                 {prod.categoriaNome}
                              </Badge>
                           </div>

                           {/* Botão Hover de Ver Detalhes */}
                           <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                              <span className="bg-phalis-dark/95 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl border border-gray-600 flex items-center gap-1.5 shadow-lg">
                                 <Eye size={14} className="text-phalis-action" /> Ver Opções
                              </span>
                           </div>
                        </div>

                        {/* Informações do Produto */}
                        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
                           <div className="space-y-1.5">
                              <h3
                                 onClick={() => setProdutoSelecionado(prod)}
                                 className="text-base font-bold text-white group-hover:text-phalis-action transition-colors line-clamp-1 cursor-pointer"
                              >
                                 {prod.nome}
                              </h3>
                              <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed font-normal">
                                 {prod.resumo}
                              </p>
                           </div>

                           {/* Rodapé do Card com Ações */}
                           <div className="pt-2 border-t border-gray-700/50">
                              <div className="grid grid-cols-2 gap-2">
                                 <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setProdutoSelecionado(prod)}
                                    className="h-9 rounded-xl border-gray-700 bg-phalis-gray hover:bg-gray-700 text-xs font-semibold text-gray-200 hover:text-white transition-colors"
                                 >
                                    Detalhes
                                 </Button>

                                 <Button
                                    size="sm"
                                    onClick={() => abrirWhatsappProduto(prod)}
                                    className="h-9 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-black font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-[#25D366]/20 transition-all"
                                 >
                                    <WhatsAppIcon className="w-3.5 h-3.5 text-black" />
                                    Orçar
                                 </Button>
                              </div>
                           </div>
                        </div>
                     </motion.div>
                  ))}
               </div>
            ) : (
               <div className="py-20 text-center space-y-3 bg-[#242424] rounded-3xl border border-gray-700/60 p-8 max-w-md mx-auto shadow-xl">
                  <Search size={36} className="text-gray-500 mx-auto" />
                  <h3 className="text-base font-bold text-white">Nenhum produto encontrado</h3>
                  <p className="text-xs text-gray-400">
                     Não encontramos nenhum item correspondente a "{busca}". Tente outros termos ou limpe o filtro.
                  </p>
                  <Button
                     size="sm"
                     onClick={() => { setBusca(''); setFiltroCategoria('TODOS'); }}
                     className="bg-phalis-action hover:bg-phalis-action-hover text-phalis-black font-extrabold text-xs rounded-xl"
                  >
                     Ver Todos os Produtos
                  </Button>
               </div>
            )}
         </main>

         {/* ─── MODAL DE DETALHES DO PRODUTO ─── */}
         <Dialog open={!!produtoSelecionado} onOpenChange={(open) => !open && setProdutoSelecionado(null)}>
            <DialogContent className="max-w-2xl bg-[#202020] border border-gray-700 text-white rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
               {produtoSelecionado && (
                  <div className="space-y-6">
                     <DialogHeader className="space-y-2">
                        <div className="flex items-center gap-2">
                           <Badge className="bg-phalis-ciano/15 text-phalis-ciano border border-phalis-ciano/30 text-xs font-bold">
                              {produtoSelecionado.categoriaNome}
                           </Badge>
                           {produtoSelecionado.destaque && (
                              <Badge className="bg-orange-500/20 text-orange-400 border border-orange-500/40 text-xs font-bold">
                                 Mais Pedido
                              </Badge>
                           )}
                        </div>
                        <DialogTitle className="text-2xl font-extrabold text-white tracking-tight">
                           {produtoSelecionado.nome}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-gray-300">
                           Confira as especificações técnicas, materiais e acabamentos disponíveis para este produto.
                        </DialogDescription>
                     </DialogHeader>

                     {/* Imagem + Resumo */}
                     <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center bg-[#181818] p-4 rounded-2xl border border-gray-700/60">
                        <div className="sm:col-span-4 h-36 flex items-center justify-center bg-[#242424] rounded-xl p-3 border border-gray-800">
                           <Image
                              src={produtoSelecionado.imageUrl}
                              alt={produtoSelecionado.nome}
                              width={140}
                              height={140}
                              className="object-contain max-h-32 w-auto drop-shadow-md"
                           />
                        </div>
                        <div className="sm:col-span-8 space-y-2">
                           <p className="text-xs text-gray-300 leading-relaxed">
                              {produtoSelecionado.descricao}
                           </p>
                        </div>
                     </div>

                     {/* Opções Disponíveis Cadastradas */}
                     <div className="space-y-4 text-xs">
                        <h4 className="font-bold text-gray-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                           <Layers size={14} className="text-phalis-action" />
                           Opções e Variações Disponíveis:
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                           {produtoSelecionado.opcoes.papeis && (
                              <div className="bg-[#262626] p-3 rounded-xl border border-gray-700/60 space-y-1.5">
                                 <span className="text-[10px] font-bold text-phalis-ciano uppercase">Materiais / Papéis</span>
                                 <div className="flex flex-wrap gap-1">
                                    {produtoSelecionado.opcoes.papeis.map(p => (
                                       <Badge key={p} variant="secondary" className="bg-phalis-gray text-gray-200 text-[10px] py-0.5 border border-gray-700">
                                          {p}
                                       </Badge>
                                    ))}
                                 </div>
                              </div>
                           )}

                           {produtoSelecionado.opcoes.tamanhos && (
                              <div className="bg-[#262626] p-3 rounded-xl border border-gray-700/60 space-y-1.5">
                                 <span className="text-[10px] font-bold text-phalis-rosa uppercase">Formatos / Tamanhos</span>
                                 <div className="flex flex-wrap gap-1">
                                    {produtoSelecionado.opcoes.tamanhos.map(t => (
                                       <Badge key={t} variant="secondary" className="bg-phalis-gray text-gray-200 text-[10px] py-0.5 border border-gray-700">
                                          {t}
                                       </Badge>
                                    ))}
                                 </div>
                              </div>
                           )}

                           {produtoSelecionado.opcoes.cores && (
                              <div className="bg-[#262626] p-3 rounded-xl border border-gray-700/60 space-y-1.5">
                                 <span className="text-[10px] font-bold text-phalis-yellow uppercase">Padrão de Cores</span>
                                 <div className="flex flex-wrap gap-1">
                                    {produtoSelecionado.opcoes.cores.map(c => (
                                       <Badge key={c} variant="secondary" className="bg-phalis-gray text-gray-200 text-[10px] py-0.5 border border-gray-700">
                                          {c}
                                       </Badge>
                                    ))}
                                 </div>
                              </div>
                           )}

                           {produtoSelecionado.opcoes.acabamentos && (
                              <div className="bg-[#262626] p-3 rounded-xl border border-gray-700/60 space-y-1.5">
                                 <span className="text-[10px] font-bold text-phalis-action uppercase">Acabamentos & Reforços</span>
                                 <div className="flex flex-wrap gap-1">
                                    {produtoSelecionado.opcoes.acabamentos.map(a => (
                                       <Badge key={a} variant="secondary" className="bg-phalis-gray text-gray-200 text-[10px] py-0.5 border border-gray-700">
                                          {a}
                                       </Badge>
                                    ))}
                                 </div>
                              </div>
                           )}
                        </div>
                     </div>

                     {/* Botão de Solicitação de Orçamento Direto no WhatsApp */}
                     <div className="pt-2">
                        <Button
                           onClick={() => {
                              abrirWhatsappProduto(produtoSelecionado);
                              setProdutoSelecionado(null);
                           }}
                           className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-black font-extrabold h-12 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-[#25D366]/20 text-sm transition-all"
                        >
                           <WhatsAppIcon className="w-5 h-5 text-black" />
                           Pedir Orçamento deste Produto no WhatsApp
                        </Button>
                     </div>
                  </div>
               )}
            </DialogContent>
         </Dialog>

         {/* ─── BOTÃO FLUTUANTE DE WHATSAPP NO CANTO ─── */}
         <button
            onClick={abrirWhatsappGeral}
            className="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#20bd5a] text-black p-3.5 sm:px-4 sm:py-3 rounded-full shadow-2xl shadow-[#25D366]/40 flex items-center gap-2 font-extrabold text-xs hover:scale-105 active:scale-95 transition-all"
            title="Tire dúvidas no WhatsApp"
         >
            <WhatsAppIcon className="w-5 h-5 text-black" />
            <span className="hidden sm:inline">Tire suas Dúvidas</span>
         </button>

         {/* ─── RODAPÉ INSTITUCIONAL COM CONTATO DO DESENVOLVEDOR ─── */}
         <footer className="border-t border-phalis-gray bg-[#151515] pt-12 pb-8 text-xs text-gray-400">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

               {/* Grade Superior do Rodapé */}
               <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">

                  {/* Coluna 1: Marca & Identidade Phalis */}
                  <div className="md:col-span-5 space-y-3">
                     <div className="relative w-40 sm:w-48 h-11 sm:h-13">
                        <Image
                           src="/phalis-logo.svg"
                           alt="PHALIS Logo"
                           fill
                           className="object-contain drop-shadow-sm"
                        />
                     </div>
                     <p className="text-gray-300 text-xs leading-relaxed max-w-sm">
                        Soluções completas em comunicação visual, impressão digital e artes gráficas. Tecnologia, precisão e acabamentos de alto padrão para a sua marca.
                     </p>
                  </div>

                  {/* Coluna 2: Atendimento e Localização */}
                  <div className="md:col-span-3 space-y-2.5">
                     <h4 className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                        <MapPin size={14} className="text-phalis-rosa" />
                        Loja & Atendimento
                     </h4>
                     <a
                        href="https://www.google.com/maps/search/?api=1&query=Grafica+Phalis+Rua+Vinte+e+Um+de+Abril+2210+San+Martin+Recife+PE"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group block text-gray-300 hover:text-white transition-colors"
                        title="Ver no Google Maps"
                     >
                        <p className="text-xs leading-relaxed group-hover:underline">
                           Rua Vinte e Um de Abril, 2210<br />
                           San Martin, Recife - PE
                        </p>
                        <span className="inline-flex items-center gap-1 text-[11px] text-phalis-action group-hover:text-phalis-action-hover font-semibold mt-1">
                           <ExternalLink size={11} />
                           Google Maps
                        </span>
                     </a>
                     <div className="space-y-1 pt-1 text-[11px]">
                        <p className="flex items-center gap-1.5 text-gray-400">
                           <Phone size={13} className="text-phalis-action" />
                           (81) 98589-0254
                        </p>
                        <p className="flex items-center gap-1.5 text-gray-400">
                           <Clock size={13} className="text-phalis-yellow" />
                           Seg a Sex: 08h às 18h
                        </p>
                     </div>
                  </div>

                  {/* Coluna 3: Contato do Desenvolvedor (Lucas Alves) */}
                  <div className="md:col-span-4 bg-[#1f1f1f] border border-gray-700/70 rounded-2xl p-4 sm:p-5 space-y-3 shadow-lg">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <div className="w-7 h-7 rounded-lg bg-phalis-action/10 border border-phalis-action/30 flex items-center justify-center text-phalis-action">
                              <Code2 size={16} />
                           </div>
                           <div>
                              <span className="text-[10px] text-gray-400 font-mono uppercase tracking-wider block">Desenvolvido por</span>
                              <strong className="text-white text-sm font-bold">Lucas Alves</strong>
                           </div>
                        </div>
                        <Badge className="bg-phalis-action/10 text-phalis-action border border-phalis-action/30 text-[10px] py-0 px-2">
                           Dev
                        </Badge>
                     </div>

                     {/* Links de Contato do Dev */}
                     <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-gray-800">
                        <a
                           href="https://www.linkedin.com/in/lucas-matheus-dev/"
                           target="_blank"
                           rel="noopener noreferrer"
                           className="inline-flex items-center gap-1.5 bg-[#2a2a2a] hover:bg-[#0077b5] text-gray-200 hover:text-white px-3.5 py-1.5 rounded-xl border border-gray-700 hover:border-transparent text-xs font-semibold transition-all shadow-sm"
                        >
                           <Linkedin size={14} />
                           LinkedIn
                        </a>

                        <a
                           href="https://wa.me/5581996780937?text=Ol%C3%A1%20Lucas!%20Vi%20seu%20contato%20no%20sistema%20da%20Phalis."
                           target="_blank"
                           rel="noopener noreferrer"
                           className="inline-flex items-center gap-1.5 bg-[#2a2a2a] hover:bg-[#25D366] hover:text-black text-gray-200 px-3.5 py-1.5 rounded-xl border border-gray-700 hover:border-transparent text-xs font-semibold transition-all shadow-sm"
                        >
                           <WhatsAppIcon className="w-3.5 h-3.5" />
                           Contato
                        </a>
                     </div>
                  </div>

               </div>

               {/* Linha Final de Copyright */}
               <div className="border-t border-gray-800 pt-6 text-center text-[11px] text-gray-500">
                  <p>
                     © {new Date().getFullYear()} <strong className="text-gray-400">PHALIS — Soluções em Artes e Impressos</strong>. Todos os direitos reservados.
                  </p>
               </div>

            </div>
         </footer>

      </div>
   );
}
