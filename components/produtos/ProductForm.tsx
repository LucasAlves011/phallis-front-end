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
import { Plus, X, Loader2, ImageOff, FileUp, Info } from 'lucide-react';
import { type Product, type ProductOptions, type ProductOption } from '@/lib/productData';
import { MoneyInput } from '@/components/ui/money-input';
import { authenticatedFetch } from '@/lib/api';

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

   // Estados do Formulário
   const [nome, setNome] = useState(initialData?.nome || '');
   const [descricao, setDescricao] = useState(initialData?.descricao || '');
   const [pricingType, setPricingType] = useState<'UNIDADE' | 'METRO' | 'SERVICO'>(initialData?.pricingType || 'UNIDADE');

   const [imagePreview, setImagePreview] = useState<string | null>(initialData?.imageUrl || null);
   const [imageFile, setImageFile] = useState<File | null>(null);

   // Estados para preços padrão (Metro)
   const [defaultM2Custo, setDefaultM2Custo] = useState(initialData?.defaultM2Custo?.toString() || '');
   const [defaultM2Venda, setDefaultM2Venda] = useState(initialData?.defaultM2Venda?.toString() || '');

   // Estados das Opções
   const [papelOptions, setPapelOptions] = useState<string[]>(unformatOpcoes(initialData?.options?.papel));
   const [tamanhoOptions, setTamanhoOptions] = useState<string[]>(unformatOpcoes(initialData?.options?.tamanho));
   const [coresOptions, setCoresOptions] = useState<string[]>(unformatOpcoes(initialData?.options?.cores));
   const [acabamentoOptions, setAcabamentoOptions] = useState<string[]>(unformatOpcoes(initialData?.options?.acabamento));

   const isOptionsDisabled = pricingType === 'SERVICO';

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
      // Capturamos os retornos pois o setState é assíncrono
      const pendingPapel = papelRef.current?.flush();
      const pendingTamanho = tamanhoRef.current?.flush();
      const pendingCores = coresRef.current?.flush();
      const pendingAcabamento = acabamentoRef.current?.flush();

      // Funções auxiliares para mesclar o estado atual com o valor pendente
      const getFinalOptions = (current: string[], pending: string | null | undefined) => {
         return pending ? [...current, pending] : current;
      };

      try {
         let finalImageUrl = imagePreview || "/images/catalogo/phalis-kekw.png";

         // ... (upload de imagem igual)
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
         <h1 className="text-3xl font-bold text-white">{title}</h1>

         <form onSubmit={handleSubmit} className="space-y-8">

            {/* Bloco 1: Informações Básicas */}
            <div className="bg-phalis-black p-6 rounded-lg space-y-4">
               <h2 className="text-xl font-semibold text-white">Informações Básicas</h2>

               <div className="flex flex-col-reverse md:flex-row gap-6">

                  {/* Coluna da Direita (Inputs) */}
                  <div className="flex-1 space-y-5">

                     {/* Campo Nome */}
                     <div className="space-y-1">
                        <Label htmlFor="nome" className="text-gray-300 text-sm ml-1">Nome do Produto *</Label>
                        <Input
                           id="nome"
                           placeholder="Ex: Cartão de Visita"
                           value={nome}
                           onChange={(e) => setNome(e.target.value)}
                           required
                           className="bg-phalis-gray border-0"
                        />
                     </div>

                     {/* Campo Descrição */}
                     <div className="space-y-1">
                        <Label htmlFor="desc" className="text-gray-300 text-sm ml-1">Descrição (Opcional)</Label>
                        <Textarea
                           id="desc"
                           placeholder="Detalhes sobre o produto..."
                           value={descricao}
                           onChange={(e) => setDescricao(e.target.value)}
                           className="bg-phalis-gray border-0"
                        />
                     </div>

                     {/* Campo Tipo Precificação */}
                     <div className="space-y-2">
                        <Label className="text-gray-300 text-sm ml-1">Tipo de Precificação *</Label>
                        <RadioGroup
                           value={pricingType}
                           onValueChange={(value) => setPricingType(value as any)}
                           className="flex gap-4"
                        >
                           <div className="flex items-center space-x-2">
                              <RadioGroupItem value="UNIDADE" id="r-unidade" className="border-gray-500" />
                              <Label htmlFor="r-unidade" className="text-white cursor-pointer">Unidade</Label>
                           </div>
                           <div className="flex items-center space-x-2">
                              <RadioGroupItem value="METRO" id="r-metro" className="border-gray-500" />
                              <Label htmlFor="r-metro" className="text-white cursor-pointer">Metro (m²)</Label>
                           </div>
                           <div className="flex items-center space-x-2">
                              <RadioGroupItem value="SERVICO" id="r-servico" className="border-gray-500" />
                              <Label htmlFor="r-servico" className="text-white cursor-pointer">Serviço</Label>
                           </div>
                        </RadioGroup>
                     </div>

                     {/* Campos Condicionais */}
                     {pricingType === 'METRO' && (
                        <div className="pt-4 space-y-4 animate-in fade-in duration-300">
                           <h3 className="text-sm font-medium text-white">Preços Padrão (Opcional)</h3>
                           <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                 <Label htmlFor="m2custo" className="text-gray-300 text-sm ml-1">Preço Custo (p/ m²)</Label>
                                 <MoneyInput
                                    id="m2custo"
                                    placeholder="0,00"
                                    value={defaultM2Custo}
                                    onChange={(e) => setDefaultM2Custo(e.target.value)}
                                    className="text-white"
                                 />
                              </div>
                              <div className="space-y-1">
                                 <Label htmlFor="m2venda" className="text-gray-300 text-sm ml-1">Preço Venda (p/ m²)</Label>
                                 <MoneyInput
                                    id="m2venda"
                                    placeholder="0,00"
                                    value={defaultM2Venda}
                                    onChange={(e) => setDefaultM2Venda(e.target.value)}
                                    className="text-white"
                                 />
                              </div>
                           </div>
                        </div>
                     )}

                  </div>

                  {/* Coluna da Esquerda (Upload da Imagem) */}
                  <div className="flex flex-col items-center gap-2 pt-6 md:pt-0">
                     <Label className="text-xs text-gray-400">Imagem (125x125) ou Ctrl+V</Label>
                     <div className="flex items-center justify-center w-[125px] h-[125px] rounded-md bg-phalis-dark overflow-hidden border border-phalis-gray">
                        {imagePreview ? (
                           <Image
                              src={imagePreview}
                              alt="Preview"
                              width={125}
                              height={125}
                              className="object-cover h-full w-full"
                           />
                        ) : (
                           <ImageOff className="h-12 w-12 text-gray-500" />
                        )}
                     </div>
                     <Label
                        htmlFor="file-upload"
                        className="cursor-pointer text-xs text-phalis-action hover:text-phalis-action-hover mt-1"
                     >
                        <div className="flex items-center">
                           <FileUp className="h-3 w-3 inline mr-1" />
                           {imageFile ? 'Trocar imagem' : 'Anexar imagem'}
                        </div>
                     </Label>
                     <Input
                        id="file-upload"
                        type="file"
                        accept="image/png, image/jpeg"
                        onChange={handleImageChange}
                        className="hidden"
                     />
                  </div>
               </div>
            </div>

            {/* Bloco 2: Configurador de Opções */}
            <div className={`bg-phalis-black p-6 rounded-lg space-y-6 ${isOptionsDisabled ? 'pointer-events-none opacity-40' : ''}`}>
               <h2 className="text-xl font-semibold text-white">Configurador de Opções</h2>
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

            {/* Botão Salvar */}
            <div className="flex justify-end">
               <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-phalis-action text-phalis-black font-semibold h-11 px-8 hover:bg-phalis-action-hover disabled:opacity-50"
               >
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                  {isLoading ? 'Salvando...' : 'Salvar Produto'}
               </Button>
            </div>
         </form>
      </div>
   );
};