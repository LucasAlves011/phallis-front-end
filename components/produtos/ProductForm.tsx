// Arquivo: components/produtos/ProductForm.tsx
'use client';

import React, { useState, useRef, useImperativeHandle, forwardRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
   Plus,
   X,
   Loader2,
   ImageOff,
   FileUp,
   Info,
   Eye,
   Layers
} from 'lucide-react';
import {
   type Product,
   type ProductOptions,
   type ProductOption,
   type ProductCatalogoConfig
} from '@/lib/productData';
import { MoneyInput } from '@/components/ui/money-input';
import { authenticatedFetch } from '@/lib/api';
import { Switch } from '@/components/ui/switch';
import { ProductCatalogPreview } from './ProductCatalogPreview';

// ==========================================================
// 1. Sub-Componente: O Grupo de Input de Opções
// ==========================================================
interface OptionInputGroupProps {
   title: string;
   options: string[];
   setOptions: React.Dispatch<React.SetStateAction<string[]>>;
   disabled: boolean;
   helpText?: string;
}

export interface OptionInputGroupRef {
   flush: () => string | null;
}

const OptionInputGroup = forwardRef<OptionInputGroupRef, OptionInputGroupProps>(
   ({ title, options, setOptions, disabled, helpText }, ref) => {
      const [inputValue, setInputValue] = useState('');

      const handleAddOption = () => {
         if (inputValue.trim() && !options.includes(inputValue.trim())) {
            setOptions(prev => [...prev, inputValue.trim()]);
            setInputValue('');
         }
      };

      // Expõe o método flush para o componente pai
      useImperativeHandle(ref, () => ({
         flush: () => {
            const val = inputValue.trim();
            if (val && !options.includes(val)) {
               setOptions(prev => [...prev, val]);
               setInputValue('');
               return val; // Retorna o valor para ser usado imediatamente
            }
            return null;
         }
      }));

      const handleRemoveOption = (optionToRemove: string) => {
         setOptions(options.filter(op => op !== optionToRemove));
      };

      const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
         if (e.key === 'Enter') {
            e.preventDefault();
            handleAddOption();
         }
      };

      return (
         <div className={`space-y-3 ${disabled ? 'opacity-50' : ''}`}>
            <h3 className="text-sm font-semibold text-white">{title}</h3>
            <div className="flex gap-2 items-center">
               <Input
                  placeholder="Digite a opção..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={disabled}
                  className="bg-phalis-gray border-0 h-10"
               />
               <Button
                  type="button"
                  size="icon"
                  onClick={handleAddOption}
                  disabled={disabled}
                  className="bg-phalis-action text-phalis-black hover:bg-phalis-action-hover h-10 w-10 shrink-0"
               >
                  <Plus className="h-4 w-4" />
               </Button>
            </div>

            {helpText && (
               <p className="text-[11px] text-phalis-action/80 flex items-start gap-1 leading-tight">
                  <Info className="h-3 w-3 mt-0.5 shrink-0" />
                  {helpText}
               </p>
            )}

            <div className="flex flex-col gap-2 min-h-[40px]">
               {options.map((option) => (
                  <div
                     key={option}
                     className="flex items-center justify-between h-auto text-wrap py-2 px-3 rounded-md bg-phalis-gray text-white text-sm"
                  >
                     <span className="text-left mr-2">{option}</span>
                     <button
                        type="button"
                        onClick={() => handleRemoveOption(option)}
                        disabled={disabled}
                        className="ml-2 rounded-full p-0.5 outline-none hover:bg-phalis-danger flex-shrink-0"
                     >
                        <X className="h-3 w-3" />
                     </button>
                  </div>
               ))}
            </div>
         </div>
      );
   }
);

OptionInputGroup.displayName = 'OptionInputGroup';

// ==========================================================
// 2. O Formulário Principal
// ==========================================================
interface ProductFormProps {
   initialData?: Product;
}

const unformatOpcoes = (options: ProductOption[] | undefined): string[] => {
   if (!options) return [];
   return options.map(op => op.name);
};

const formatarOpcoes = (opcoes: string[]): ProductOption[] => {
   if (opcoes.length === 0) return [];
   return opcoes.map(op => ({
      id: op.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 30),
      name: op
   }));
};

export const ProductForm: React.FC<ProductFormProps> = ({ initialData }) => {
   const router = useRouter();
   const [isLoading, setIsLoading] = useState(false);

   const isEditMode = !!initialData;
   const title = isEditMode ? "Editar Produto" : "Cadastrar Novo Produto";

   // Refs para os grupos de opções para forçar o "flush" do que foi digitado
   const papelRef = useRef<OptionInputGroupRef>(null);
   const tamanhoRef = useRef<OptionInputGroupRef>(null);
   const coresRef = useRef<OptionInputGroupRef>(null);
   const acabamentoRef = useRef<OptionInputGroupRef>(null);

   // Estados Básicos do Formulário
   const [nome, setNome] = useState(initialData?.nome || '');
   const [descricao, setDescricao] = useState(initialData?.descricao || '');
   const [pricingType, setPricingType] = useState<'UNIDADE' | 'METRO' | 'SERVICO'>(initialData?.pricingType || 'UNIDADE');
   const [ativo, setAtivo] = useState(initialData?.ativo !== false);

   const [imagePreview, setImagePreview] = useState<string | null>(initialData?.imageUrl || null);
   const [imageFile, setImageFile] = useState<File | null>(null);

   // Estados de Preço Padrão (Metro)
   const [defaultM2Custo, setDefaultM2Custo] = useState(initialData?.defaultM2Custo?.toString() || '');
   const [defaultM2Venda, setDefaultM2Venda] = useState(initialData?.defaultM2Venda?.toString() || '');

   // Estados de Personalização para o Catálogo Público
   const [visivelCatalogoPublico, setVisivelCatalogoPublico] = useState(initialData?.visivelCatalogoPublico !== false);
   const [catalogoNomeExibicao, setCatalogoNomeExibicao] = useState(initialData?.catalogoConfig?.nomeExibicao || '');
   const [catalogoResumo, setCatalogoResumo] = useState(initialData?.catalogoConfig?.resumo || '');
   const [catalogoDescricaoDetalhada, setCatalogoDescricaoDetalhada] = useState(initialData?.catalogoConfig?.descricaoDetalhada || '');
   const [catalogoCategoria, setCatalogoCategoria] = useState<'METRO' | 'UNIDADE' | 'SERVICO'>(
      initialData?.catalogoConfig?.categoria || initialData?.pricingType || 'UNIDADE'
   );
   const [catalogoDestaque, setCatalogoDestaque] = useState(initialData?.catalogoConfig?.destaque || false);

   // Estados das Opções
   const [papelOptions, setPapelOptions] = useState<string[]>(unformatOpcoes(initialData?.options?.papel));
   const [tamanhoOptions, setTamanhoOptions] = useState<string[]>(unformatOpcoes(initialData?.options?.tamanho));
   const [coresOptions, setCoresOptions] = useState<string[]>(unformatOpcoes(initialData?.options?.cores));
   const [acabamentoOptions, setAcabamentoOptions] = useState<string[]>(unformatOpcoes(initialData?.options?.acabamento));

   const isOptionsDisabled = pricingType === 'SERVICO';

   // Sincroniza categoria do catálogo com o tipo de precificação caso não tenha sido alterado manualmente
   const handlePricingTypeChange = (newType: 'UNIDADE' | 'METRO' | 'SERVICO') => {
      setPricingType(newType);
      if (!initialData?.catalogoConfig?.categoria) {
         setCatalogoCategoria(newType);
      }
   };

   const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
         setImageFile(file);
         setImagePreview(URL.createObjectURL(file));
      }
   };

   const handlePaste = (e: React.ClipboardEvent) => {
      const items = e.clipboardData.items;
      for (let i = 0; i < items.length; i++) {
         if (items[i].type.indexOf('image') !== -1) {
            const blob = items[i].getAsFile();
            if (blob) {
               setImageFile(blob);
               setImagePreview(URL.createObjectURL(blob));
            }
         }
      }
   };

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);

      // FORÇAR ADIÇÃO DE OPÇÕES DIGITADAS MAS NÃO CONFIRMADAS NO "+"
      const pendingPapel = papelRef.current?.flush();
      const pendingTamanho = tamanhoRef.current?.flush();
      const pendingCores = coresRef.current?.flush();
      const pendingAcabamento = acabamentoRef.current?.flush();

      const getFinalOptions = (current: string[], pending: string | null | undefined) => {
         return pending ? [...current, pending] : current;
      };

      try {
         let finalImageUrl = imagePreview || "/images/catalogo/phalis-kekw.png";

         if (imageFile) {
            const formData = new FormData();
            formData.append('file', imageFile);

            const token = localStorage.getItem('phallis_auth_token');
            const uploadHeaders: HeadersInit = {};
            if (token) {
               uploadHeaders['Authorization'] = `Bearer ${token}`;
            }

            const uploadResponse = await fetch('/api/upload', {
               method: 'POST',
               headers: uploadHeaders,
               body: formData
            });

            if (!uploadResponse.ok) {
               throw new Error('Falha no upload da imagem');
            }

            const uploadData = await uploadResponse.json();
            if (uploadData.fileDownloadUri) {
               finalImageUrl = uploadData.fileDownloadUri;
            }
         }

         const options: ProductOptions = {
            papel: formatarOpcoes(getFinalOptions(papelOptions, pendingPapel)),
            tamanho: formatarOpcoes(getFinalOptions(tamanhoOptions, pendingTamanho)),
            cores: formatarOpcoes(getFinalOptions(coresOptions, pendingCores)),
            acabamento: formatarOpcoes(getFinalOptions(acabamentoOptions, pendingAcabamento)),
         };

         const produtoData: Product = {
            id: initialData?.id || `prod_${Math.random().toString(36).substr(2, 9)}`,
            nome,
            imageUrl: finalImageUrl,
            descricao: descricao || "",
            pricingType,
            options: isOptionsDisabled ? undefined : options,
            defaultM2Custo: pricingType === 'METRO' ? (Number(defaultM2Custo) || undefined) : undefined,
            defaultM2Venda: pricingType === 'METRO' ? (Number(defaultM2Venda) || undefined) : undefined,
            ativo,
            visivelCatalogoPublico,
            catalogoConfig: {
               nomeExibicao: catalogoNomeExibicao.trim() || undefined,
               resumo: catalogoResumo.trim() || undefined,
               descricaoDetalhada: catalogoDescricaoDetalhada.trim() || undefined,
               categoria: catalogoCategoria,
               destaque: catalogoDestaque,
            }
         };

         const url = isEditMode ? `/api/produtos/${initialData.id}` : '/api/produtos';
         const method = isEditMode ? 'PUT' : 'POST';

         const response = await authenticatedFetch(url, {
            method: method,
            body: JSON.stringify(produtoData),
         });

         if (!response.ok) throw new Error('Falha ao salvar o produto');

         router.push('/catalogo');

      } catch (error) {
         console.error(error);
         alert("Erro ao salvar o produto.");
      } finally {
         setIsLoading(false);
      }
   };

   return (
      <div className="w-full 2xl:w-4/5 2xl:mx-auto space-y-6" onPaste={handlePaste}>
         <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-white">{title}</h1>
            <Badge className="bg-phalis-gray text-gray-300 border border-gray-700 px-3 py-1 text-xs">
               {isEditMode ? 'Modo de Edição' : 'Novo Cadastro'}
            </Badge>
         </div>

         <form onSubmit={handleSubmit} className="space-y-8">

            {/* ─── BLOCO 1: INFORMAÇÕES BÁSICAS DO PRODUTO ─── */}
            <div className="bg-phalis-black p-6 rounded-xl space-y-4 border border-phalis-gray/50 shadow-md">
               <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                     <span className="w-2 h-4 rounded-full bg-phalis-action" />
                     Informações Básicas do Sistema
                  </h2>
               </div>

               <div className="flex flex-col-reverse md:flex-row gap-6">

                  {/* Coluna da Esquerda (Inputs) */}
                  <div className="flex-1 space-y-5">

                     {/* Campo Nome */}
                     <div className="space-y-1">
                        <Label htmlFor="nome" className="text-gray-300 text-sm ml-1">Nome do Produto no Sistema *</Label>
                        <Input
                           id="nome"
                           placeholder="Ex: Cartão de Visita Couchê 300g"
                           value={nome}
                           onChange={(e) => setNome(e.target.value)}
                           required
                           className="bg-phalis-gray border-0 h-11 text-white"
                        />
                     </div>

                     {/* Campo Descrição Interna */}
                     <div className="space-y-1">
                        <Label htmlFor="desc" className="text-gray-300 text-sm ml-1">Descrição Interna (Opcional)</Label>
                        <Textarea
                           id="desc"
                           placeholder="Observações de produção, orientações para os vendedores..."
                           value={descricao}
                           onChange={(e) => setDescricao(e.target.value)}
                           className="bg-phalis-gray border-0 text-white min-h-[70px]"
                        />
                     </div>

                     {/* Campo Tipo Precificação */}
                     <div className="space-y-2">
                        <Label className="text-gray-300 text-sm ml-1">Tipo de Precificação *</Label>
                        <RadioGroup
                           value={pricingType}
                           onValueChange={(value) => handlePricingTypeChange(value as any)}
                           className="flex flex-wrap gap-4"
                        >
                           <div className="flex items-center space-x-2 bg-phalis-gray/70 px-3 py-2 rounded-lg border border-gray-800">
                              <RadioGroupItem value="UNIDADE" id="r-unidade" className="border-gray-500 text-phalis-action" />
                              <Label htmlFor="r-unidade" className="text-white cursor-pointer text-xs font-semibold">Unidade</Label>
                           </div>
                           <div className="flex items-center space-x-2 bg-phalis-gray/70 px-3 py-2 rounded-lg border border-gray-800">
                              <RadioGroupItem value="METRO" id="r-metro" className="border-gray-500 text-phalis-action" />
                              <Label htmlFor="r-metro" className="text-white cursor-pointer text-xs font-semibold">Metro (m²)</Label>
                           </div>
                           <div className="flex items-center space-x-2 bg-phalis-gray/70 px-3 py-2 rounded-lg border border-gray-800">
                              <RadioGroupItem value="SERVICO" id="r-servico" className="border-gray-500 text-phalis-action" />
                              <Label htmlFor="r-servico" className="text-white cursor-pointer text-xs font-semibold">Serviço</Label>
                           </div>
                        </RadioGroup>
                     </div>

                     {/* Campos Condicionais de Metro */}
                     {pricingType === 'METRO' && (
                        <div className="pt-2 space-y-3 animate-in fade-in duration-300">
                           <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Preços Base por m² (Opcional)</h3>
                           <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                 <Label htmlFor="m2custo" className="text-gray-300 text-xs ml-1">Preço Custo (p/ m²)</Label>
                                 <MoneyInput
                                    id="m2custo"
                                    placeholder="0,00"
                                    value={defaultM2Custo}
                                    onChange={(e) => setDefaultM2Custo(e.target.value)}
                                    className="text-white bg-phalis-gray border-0"
                                 />
                              </div>
                              <div className="space-y-1">
                                 <Label htmlFor="m2venda" className="text-gray-300 text-xs ml-1">Preço Venda (p/ m²)</Label>
                                 <MoneyInput
                                    id="m2venda"
                                    placeholder="0,00"
                                    value={defaultM2Venda}
                                    onChange={(e) => setDefaultM2Venda(e.target.value)}
                                    className="text-white bg-phalis-gray border-0"
                                 />
                              </div>
                           </div>
                        </div>
                     )}

                     {/* Switch de Ativação no Sistema Interno */}
                     <div className="pt-3 border-t border-gray-800/80">
                        <div className="flex items-center justify-between p-3 rounded-xl bg-phalis-gray/50 border border-gray-800 max-w-sm">
                           <div className="space-y-0.5 pr-2">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                                 <Eye className="h-4 w-4 text-emerald-400" />
                                 Status no Sistema Interno
                              </div>
                              <p className="text-[11px] text-gray-400">
                                 {ativo ? 'Produto ativo e disponível para pedidos' : 'Produto inativo no sistema'}
                              </p>
                           </div>
                           <Switch
                              checked={ativo}
                              onCheckedChange={setAtivo}
                           />
                        </div>
                     </div>

                  </div>

                  {/* Coluna da Direita (Upload da Imagem) */}
                  <div className="flex flex-col items-center gap-2 pt-6 md:pt-0 shrink-0">
                     <Label className="text-xs text-gray-400 font-semibold">Imagem do Produto (ou Ctrl+V)</Label>
                     <div className="flex items-center justify-center w-[140px] h-[140px] rounded-xl bg-phalis-dark overflow-hidden border border-gray-700 shadow-inner">
                        {imagePreview ? (
                           <Image
                              src={imagePreview}
                              alt="Preview"
                              width={140}
                              height={140}
                              className="object-contain h-full w-full p-2"
                           />
                        ) : (
                           <ImageOff className="h-12 w-12 text-gray-600" />
                        )}
                     </div>
                     <Label
                        htmlFor="file-upload"
                        className="cursor-pointer text-xs text-phalis-action hover:text-phalis-action-hover font-semibold mt-1 flex items-center gap-1 bg-phalis-gray px-3 py-1.5 rounded-lg border border-gray-700 hover:bg-gray-700 transition-colors"
                     >
                        <FileUp className="h-3.5 w-3.5" />
                        {imageFile ? 'Trocar Imagem' : 'Anexar Imagem'}
                     </Label>
                     <Input
                        id="file-upload"
                        type="file"
                        accept="image/png, image/jpeg, image/webp"
                        onChange={handleImageChange}
                        className="hidden"
                     />
                  </div>
               </div>
            </div>

            {/* ─── BLOCO 2: CONFIGURADOR DE OPÇÕES TÉCNICAS ─── */}
            <div className={`bg-phalis-black p-6 rounded-xl space-y-6 border border-phalis-gray/50 shadow-md ${isOptionsDisabled ? 'pointer-events-none opacity-40' : ''}`}>
               <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                     <Layers className="h-5 w-5 text-phalis-action" />
                     Configurador de Opções do Produto
                  </h2>
                  <span className="text-xs text-gray-400">Variações disponíveis no formulário e catálogo</span>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <OptionInputGroup
                     ref={papelRef}
                     title="01. Papel / Material"
                     options={papelOptions}
                     setOptions={setPapelOptions}
                     disabled={isOptionsDisabled}
                  />
                  <OptionInputGroup
                     ref={tamanhoRef}
                     title="02. Tamanho"
                     options={tamanhoOptions}
                     setOptions={setTamanhoOptions}
                     disabled={isOptionsDisabled}
                     helpText={
                        pricingType === 'METRO' 
                           ? "Deixe vazio p/ entrada manual de m² no carrinho." 
                           : pricingType === 'UNIDADE'
                              ? "Deixe vazio p/ entrada manual de dimensões (cm) no carrinho."
                              : undefined
                     }
                  />
                  <OptionInputGroup
                     ref={coresRef}
                     title="03. Cores"
                     options={coresOptions}
                     setOptions={setCoresOptions}
                     disabled={isOptionsDisabled}
                  />
                  <OptionInputGroup
                     ref={acabamentoRef}
                     title="04. Acabamento"
                     options={acabamentoOptions}
                     setOptions={setAcabamentoOptions}
                     disabled={isOptionsDisabled}
                  />
               </div>
            </div>

            {/* ─── BLOCO 3: PERSONALIZAÇÃO & PREVIEW DO CATÁLOGO ONLINE ─── */}
            <div className="bg-phalis-black p-6 rounded-xl space-y-6 border border-gray-800 shadow-md">
               <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                  <div className="flex items-center gap-2.5">
                     <span className="w-2 h-4 rounded-full bg-phalis-ciano" />
                     <h2 className="text-lg font-bold text-white">
                        Personalização para o Catálogo Online Público
                     </h2>
                  </div>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                  {/* Coluna Esquerda: Campos de Personalização do Catálogo (7 Colunas) */}
                  <div className="lg:col-span-7 space-y-5">

                     {/* Switch Principal: Exibir no Catálogo Público */}
                     <div className="flex items-center justify-between p-3.5 rounded-xl bg-phalis-gray/50 border border-gray-800">
                        <div className="space-y-0.5 pr-2">
                           <div className="text-xs font-bold text-white">
                              Exibir no Catálogo Online Público
                           </div>
                           <p className="text-[11px] text-gray-400">
                              {visivelCatalogoPublico
                                 ? 'Este produto aparecerá listado no catálogo público para os clientes.'
                                 : 'Este produto ficará oculto para clientes no catálogo online.'}
                           </p>
                        </div>
                        <Switch
                           checked={visivelCatalogoPublico}
                           onCheckedChange={setVisivelCatalogoPublico}
                        />
                     </div>

                     {/* Sub-bloco com campos do catálogo (com opacidade caso desativado) */}
                     <div className={`space-y-4 transition-opacity ${!visivelCatalogoPublico ? 'opacity-40 pointer-events-none' : ''}`}>

                        {/* Nome Comercial de Exibição */}
                        <div className="space-y-1">
                           <div className="flex items-center justify-between">
                              <Label htmlFor="cat-nome" className="text-gray-300 text-xs font-semibold ml-1">
                                 Nome de Exibição no Catálogo
                              </Label>
                              <span className="text-[10px] text-gray-400">(Opcional • Se vazio, usará o nome do produto)</span>
                           </div>
                           <Input
                              id="cat-nome"
                              placeholder={nome || "Ex: Cartão de Visita Premium"}
                              value={catalogoNomeExibicao}
                              onChange={(e) => setCatalogoNomeExibicao(e.target.value)}
                              className="bg-phalis-gray border-0 h-10 text-white placeholder:text-gray-500"
                           />
                        </div>

                        {/* Categoria no Catálogo Público & Destaque Mais Pedido */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           {/* Categoria */}
                           <div className="space-y-1.5">
                              <Label className="text-gray-300 text-xs font-semibold ml-1">
                                 Categoria no Catálogo
                              </Label>
                              <RadioGroup
                                 value={catalogoCategoria}
                                 onValueChange={(val) => setCatalogoCategoria(val as any)}
                                 className="flex flex-col gap-1.5"
                              >
                                 <div className="flex items-center space-x-2 bg-phalis-gray px-3 py-1.5 rounded-lg border border-gray-800">
                                    <RadioGroupItem value="METRO" id="cat-metro" className="border-gray-500 text-phalis-ciano" />
                                    <Label htmlFor="cat-metro" className="text-xs text-white cursor-pointer font-medium">Sob Medida (m²)</Label>
                                 </div>
                                 <div className="flex items-center space-x-2 bg-phalis-gray px-3 py-1.5 rounded-lg border border-gray-800">
                                    <RadioGroupItem value="UNIDADE" id="cat-unidade" className="border-gray-500 text-phalis-rosa" />
                                    <Label htmlFor="cat-unidade" className="text-xs text-white cursor-pointer font-medium">Por Unidade</Label>
                                 </div>
                                 <div className="flex items-center space-x-2 bg-phalis-gray px-3 py-1.5 rounded-lg border border-gray-800">
                                    <RadioGroupItem value="SERVICO" id="cat-servico" className="border-gray-500 text-phalis-yellow" />
                                    <Label htmlFor="cat-servico" className="text-xs text-white cursor-pointer font-medium">Serviço Gráfico</Label>
                                 </div>
                              </RadioGroup>
                           </div>

                           {/* Switch Destaque "Mais Pedido" */}
                           <div className="space-y-2 flex flex-col justify-between">
                              <Label className="text-gray-300 text-xs font-semibold ml-1">
                                 Selo Promocional
                              </Label>
                              <div className="flex items-center justify-between p-3 rounded-xl bg-phalis-gray border border-gray-800 h-full">
                                 <div className="space-y-0.5 pr-2">
                                    <div className="text-xs font-bold text-orange-400">
                                       Selo "Mais Pedido"
                                    </div>
                                    <p className="text-[10px] text-gray-400">
                                       Exibe a tag laranja de destaque no card.
                                    </p>
                                 </div>
                                 <Switch
                                    checked={catalogoDestaque}
                                    onCheckedChange={setCatalogoDestaque}
                                    className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                                 />
                              </div>
                           </div>
                        </div>

                        {/* Resumo Comercial / Chamada Curta do Card */}
                        <div className="space-y-1">
                           <div className="flex items-center justify-between">
                              <Label htmlFor="cat-resumo" className="text-gray-300 text-xs font-semibold ml-1">
                                 Resumo Curto do Card (Chamada Comercial)
                              </Label>
                              <span className="text-[10px] text-gray-400">Exibido diretamente no card</span>
                           </div>
                           <Textarea
                              id="cat-resumo"
                              placeholder="Ex: Papel Couchê 300g com laminação fosca e verniz localizado UV."
                              value={catalogoResumo}
                              onChange={(e) => setCatalogoResumo(e.target.value)}
                              className="bg-phalis-gray border-0 text-white min-h-[60px] text-xs leading-relaxed"
                           />
                        </div>

                        {/* Descrição Completa para o Modal do Catálogo */}
                        <div className="space-y-1">
                           <div className="flex items-center justify-between">
                              <Label htmlFor="cat-desc" className="text-gray-300 text-xs font-semibold ml-1">
                                 Descrição Técnica e Comercial (Modal de Detalhes)
                              </Label>
                              <span className="text-[10px] text-gray-400">Exibida ao clicar no produto</span>
                           </div>
                           <Textarea
                              id="cat-desc"
                              placeholder="Ex: Impressão offset de altíssima definição com opções nobres de acabamento tátil e visual para valorizar a marca do cliente..."
                              value={catalogoDescricaoDetalhada}
                              onChange={(e) => setCatalogoDescricaoDetalhada(e.target.value)}
                              className="bg-phalis-gray border-0 text-white min-h-[75px] text-xs leading-relaxed"
                           />
                        </div>

                     </div>

                  </div>

                  {/* Coluna Direita: Live Preview Interativo (5 Colunas) */}
                  <div className="lg:col-span-5 bg-phalis-dark/90 p-5 rounded-2xl border border-gray-800 sticky top-24 shadow-xl space-y-4">
                     <ProductCatalogPreview
                        nome={nome}
                        nomeExibicao={catalogoNomeExibicao}
                        resumo={catalogoResumo}
                        descricaoDetalhada={catalogoDescricaoDetalhada}
                        imageUrl={imagePreview}
                        categoria={catalogoCategoria}
                        destaque={catalogoDestaque}
                        visivelPublico={visivelCatalogoPublico}
                        opcoes={{
                           papel: papelOptions,
                           tamanho: tamanhoOptions,
                           cores: coresOptions,
                           acabamento: acabamentoOptions,
                        }}
                     />
                  </div>

               </div>
            </div>

            {/* ─── BOTÃO SALVAR ─── */}
            <div className="flex items-center justify-end gap-3 pt-2">
               <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/catalogo')}
                  className="border-gray-700 bg-phalis-gray hover:bg-gray-700 text-white font-semibold h-11 px-6 rounded-xl"
               >
                  Cancelar
               </Button>

               <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-phalis-action text-phalis-black font-extrabold h-11 px-8 rounded-xl hover:bg-phalis-action-hover disabled:opacity-50 shadow-lg shadow-phalis-action/20"
               >
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                  {isLoading ? 'Salvando...' : 'Salvar Produto'}
               </Button>
            </div>
         </form>
      </div>
   );
};