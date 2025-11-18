// Arquivo: components/produtos/ProductForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Plus, X, Loader2, ImageOff, FileUp } from 'lucide-react';
import { type Product, type ProductOptions, type ProductOption } from '@/lib/productData';
// 1. MUDANÇA: Importar o MoneyInput
import { MoneyInput } from '@/components/ui/money-input';

// ==========================================================
// 1. Sub-Componente: O Grupo de Input de Opções
// (Sem mudanças)
// ==========================================================
interface OptionInputGroupProps {
   title: string;
   options: string[];
   setOptions: React.Dispatch<React.SetStateAction<string[]>>;
   disabled: boolean;
}
const OptionInputGroup: React.FC<OptionInputGroupProps> = ({ title, options, setOptions, disabled }) => {
   const [inputValue, setInputValue] = useState('');
   const handleAddOption = () => {
      if (inputValue && !options.includes(inputValue)) {
         setOptions([...options, inputValue]);
         setInputValue('');
      }
   };
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
         <div className="flex gap-2">
            <Input
               placeholder="Digite a opção..."
               value={inputValue}
               onChange={(e) => setInputValue(e.target.value)}
               onKeyDown={handleKeyDown}
               disabled={disabled}
               className="bg-phalis-gray border-0"
            />
            <Button
               type="button"
               size="icon"
               onClick={handleAddOption}
               disabled={disabled}
               className="bg-phalis-action text-phalis-black hover:bg-phalis-action-hover"
            >
               <Plus className="h-4 w-4" />
            </Button>
         </div>
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
};

// ==========================================================
// 2. O Formulário Principal (COM MUDANÇAS)
// ==========================================================
interface ProductFormProps {
   initialData?: Product;
}
// ... (funções 'unformatOpcoes' e 'formatarOpcoes' - sem mudança)
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

   // Estados do Formulário
   const [nome, setNome] = useState(initialData?.nome || '');
   const [descricao, setDescricao] = useState(initialData?.descricao || '');
   const [pricingType, setPricingType] = useState<'unidade' | 'metro' | 'arte'>(initialData?.pricingType || 'unidade');

   const [imagePreview, setImagePreview] = useState<string | null>(initialData?.imageUrl || null);
   const [imageFile, setImageFile] = useState<File | null>(null);

   // 2. MUDANÇA: Novos estados para preços padrão (Metro)
   const [defaultM2Custo, setDefaultM2Custo] = useState(initialData?.defaultM2Custo?.toString() || '');
   const [defaultM2Venda, setDefaultM2Venda] = useState(initialData?.defaultM2Venda?.toString() || '');

   // Estados das Opções
   const [papelOptions, setPapelOptions] = useState<string[]>(unformatOpcoes(initialData?.options?.papel));
   const [tamanhoOptions, setTamanhoOptions] = useState<string[]>(unformatOpcoes(initialData?.options?.tamanho));
   const [coresOptions, setCoresOptions] = useState<string[]>(unformatOpcoes(initialData?.options?.cores));
   const [acabamentoOptions, setAcabamentoOptions] = useState<string[]>(unformatOpcoes(initialData?.options?.acabamento));

   const isOptionsDisabled = pricingType === 'arte';

   const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
         setImageFile(file);
         setImagePreview(URL.createObjectURL(file));
      }
   };

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);

      const options: ProductOptions = {
         papel: formatarOpcoes(papelOptions),
         tamanho: formatarOpcoes(tamanhoOptions),
         cores: formatarOpcoes(coresOptions),
         acabamento: formatarOpcoes(acabamentoOptions),
      };

      // 3. MUDANÇA: Adiciona os novos campos ao payload
      const produtoData: Product = {
         id: initialData?.id || `prod_${Math.random().toString(36).substr(2, 9)}`,
         nome,
         imageUrl: imagePreview || "/images/catalogo/phalis-kekw.png",
         descricao: descricao || "",
         pricingType,
         options: isOptionsDisabled ? undefined : options,
         // Adiciona os preços padrão (converte para número ou undefined)
         defaultM2Custo: pricingType === 'metro' ? (Number(defaultM2Custo) || undefined) : undefined,
         defaultM2Venda: pricingType === 'metro' ? (Number(defaultM2Venda) || undefined) : undefined,
      };

      try {
         const url = isEditMode ? `/api/produtos/${initialData.id}` : '/api/produtos';
         const method = isEditMode ? 'PUT' : 'POST';

         const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(produtoData),
         });

         if (!response.ok) throw new Error('Falha ao salvar o produto');

         alert(`Produto "${produtoData.nome}" salvo com sucesso!`);
         router.push('/catalogo');

      } catch (error) {
         console.error(error);
         alert("Erro ao salvar o produto.");
      } finally {
         setIsLoading(false);
      }
   };

   return (
      <div className="w-full 2xl:w-4/5 2xl:mx-auto space-y-6">
         <h1 className="text-3xl font-bold text-white">{title}</h1>

         <form onSubmit={handleSubmit} className="space-y-8">

            {/* Bloco 1: Informações Básicas */}
            <div className="bg-phalis-black p-6 rounded-lg space-y-4">
               <h2 className="text-xl font-semibold text-white">Informações Básicas</h2>

               <div className="flex flex-col-reverse md:flex-row gap-6">

                  {/* Coluna da Direita (Inputs) */}
                  <div className="flex-1 space-y-4">
                     <Input
                        placeholder="Nome do Produto *"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        required
                        className="bg-phalis-gray border-0"
                     />
                     <Textarea
                        placeholder="Descrição (Opcional)"
                        value={descricao}
                        onChange={(e) => setDescricao(e.target.value)}
                        className="bg-phalis-gray border-0"
                     />

                     <div>
                        <h3 className="text-sm font-medium text-white mb-2">Tipo de Precificação *</h3>
                        <RadioGroup
                           value={pricingType}
                           onValueChange={(value) => setPricingType(value as any)}
                           className="flex gap-4"
                        >
                           <div className="flex items-center space-x-2">
                              <RadioGroupItem value="unidade" id="r-unidade" className="border-gray-500" />
                              <Label htmlFor="r-unidade" className="text-white">Unidade</Label>
                           </div>
                           <div className="flex items-center space-x-2">
                              <RadioGroupItem value="metro" id="r-metro" className="border-gray-500" />
                              <Label htmlFor="r-metro" className="text-white">Metro (m²)</Label>
                           </div>
                           <div className="flex items-center space-x-2">
                              <RadioGroupItem value="arte" id="r-arte" className="border-gray-500" />
                              <Label htmlFor="r-arte" className="text-white">Arte (Serviço)</Label>
                           </div>
                        </RadioGroup>
                     </div>

                     {/* ========================================================== */}
                     {/* 4. MUDANÇA: Campos condicionais para 'metro' */}
                     {/* ========================================================== */}
                     {pricingType === 'metro' && (
                        <div className="pt-4 space-y-4 animate-in fade-in duration-300">
                           <h3 className="text-sm font-medium text-white">Preços Padrão (Opcional)</h3>
                           <div className="grid grid-cols-2 gap-4">
                              <MoneyInput
                                 placeholder="Preço Custo (p/ m²)"
                                 value={defaultM2Custo}
                                 onChange={(e) => setDefaultM2Custo(e.target.value)}
                              />
                              <MoneyInput
                                 placeholder="Preço Venda (p/ m²)"
                                 value={defaultM2Venda}
                                 onChange={(e) => setDefaultM2Venda(e.target.value)}
                              />
                           </div>
                        </div>
                     )}

                  </div>

                  {/* Coluna da Esquerda (Upload da Imagem) */}
                  <div className="flex flex-col items-center gap-2">
                     <p className="text-sm text-gray-400">Imagem (125x125)</p>
                     <div className="flex items-center justify-center w-[125px] h-[125px] rounded-md bg-phalis-dark overflow-hidden">
                        {imagePreview ? (
                           <Image
                              src={imagePreview}
                              alt="Preview"
                              width={125}
                              height={125}
                              className="object-cover"
                           />
                        ) : (
                           <ImageOff className="h-12 w-12 text-gray-500" />
                        )}
                     </div>
                     <Label
                        htmlFor="file-upload"
                        className="cursor-pointer text-sm text-phalis-action hover:text-phalis-action-hover"
                     >
                        <FileUp className="h-4 w-4 inline mr-1" />
                        {imageFile ? 'Trocar imagem' : 'Anexar imagem'}
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

            {/* Bloco 2: Configurador de Opções (Sem mudança) */}
            <div className={`bg-phalis-black p-6 rounded-lg space-y-6 ${isOptionsDisabled ? 'pointer-events-none opacity-40' : ''}`}>
               <h2 className="text-xl font-semibold text-white">Configurador de Opções</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <OptionInputGroup
                     title="01. Papel / Material"
                     options={papelOptions}
                     setOptions={setPapelOptions}
                     disabled={isOptionsDisabled}
                  />
                  <OptionInputGroup
                     title="02. Tamanho"
                     options={tamanhoOptions}
                     setOptions={setTamanhoOptions}
                     disabled={isOptionsDisabled}
                  />
                  <OptionInputGroup
                     title="03. Cores"
                     options={coresOptions}
                     setOptions={setCoresOptions}
                     disabled={isOptionsDisabled}
                  />
                  <OptionInputGroup
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
                  className="bg-phalis-action text-phalis-black font-bold text-lg py-6 px-8 hover:bg-phalis-action-hover disabled:opacity-50"
               >
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : 'Salvar Produto'}
               </Button>
            </div>
         </form>
      </div>
   );
};