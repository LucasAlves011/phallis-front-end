'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
   getProductById,
   optionGroupsConfig,
   type Product,
   type ProductOptions
} from '@/lib/productData';
import { type Cliente } from '@/lib/clientData';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from 'next/link';
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';
import { ClientCombobox } from '@/components/clientes/ClientCombobox';
import { MoneyInput } from '@/components/ui/money-input';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import { SuffixInput } from '@/components/ui/suffix-input';


// ==========================================================
// TIPO: Estado das 4 Colunas
// ==========================================================
type Selections = Record<typeof optionGroupsConfig[number]['id'], string | null>;

// ==========================================================
// 1. FORMULÁRIO "UNIDADE" (COM CÁLCULO CORRIGIDO)
// ==========================================================
interface FormularioUnidadeProps {
   produto: Product & { options: ProductOptions };
   cliente: Cliente | null;
   onSelectCliente: (cliente: Cliente | null) => void;
}

const FormularioUnidade: React.FC<FormularioUnidadeProps> = ({ produto, cliente, onSelectCliente }) => {
   const router = useRouter();
   const [isLoading, setIsLoading] = useState(false);
   const { user } = useAuth();

   const [selections, setSelections] = useState<Selections>({
      papel: null, tamanho: null, cores: null, acabamento: null,
   });

   const [isPersonalizado, setIsPersonalizado] = useState(false);
   const [larguraCm, setLarguraCm] = useState('');
   const [alturaCm, setAlturaCm] = useState('');
   const [observacao, setObservacao] = useState('');
   const [quantidade, setQuantidade] = useState('');
   const [precoCusto, setPrecoCusto] = useState('');
   const [precoVenda, setPrecoVenda] = useState('');
   const [precoArte, setPrecoArte] = useState('');
   const [pagamento, setPagamento] = useState<string | null>(null);

   useEffect(() => {
      // @ts-expect-error
      const autoPersonalizado = produto.options.tamanho.length === 0;
      setIsPersonalizado(autoPersonalizado);
      setLarguraCm('');
      setAlturaCm('');
      setSelections({
         papel: null,
         tamanho: autoPersonalizado ? 'personalizado' : null,
         cores: null,
         acabamento: null,
      });
   }, [produto]);

   const handleSelectOption = (clickedGroupId: keyof Selections, optionId: string) => {
      if (selections[clickedGroupId] === optionId) return;
      if (clickedGroupId === 'tamanho') {
         setIsPersonalizado(false);
      }
      const newSelections: Selections = { ...selections };
      const clickedIndex = optionGroupsConfig.findIndex(group => group.id === clickedGroupId);
      newSelections[clickedGroupId] = optionId;
      for (let i = clickedIndex + 1; i < optionGroupsConfig.length; i++) {
         newSelections[optionGroupsConfig[i].id] = null;
      }
      setSelections(newSelections);
   };

   const handlePersonalizadoClick = () => {
      if (selections.tamanho === 'personalizado') return;
      setIsPersonalizado(true);
      setSelections(prev => ({
         ...prev,
         tamanho: 'personalizado',
         cores: null,
         acabamento: null,
      }));
   };

   const fichaDoPedido = useMemo(() => {
      return optionGroupsConfig.map((groupConfig, index) => {
         // @ts-expect-error
         const options = produto.options[groupConfig.id];
         let selectedValue = '...';
         const selectedOptionId = selections[groupConfig.id];

         if (groupConfig.id === 'tamanho' && isPersonalizado) {
            selectedValue = `Personalizado (${larguraCm || 'L'}cm x ${alturaCm || 'A'}cm)`;
         } else if (selectedOptionId) {
            const selectedOption = options.find((opt: any) => opt.id === selectedOptionId);
            if (selectedOption) selectedValue = selectedOption.name;
         }

         return {
            label: String(index + 1).padStart(2, '0'),
            value: selectedValue
         };
      });
   }, [produto, selections, isPersonalizado, larguraCm, alturaCm]);

   // ==========================================================
   // MUDANÇA AQUI: Cálculos não multiplicam mais pela quantidade
   // ==========================================================
   const custoTotal = useMemo(() => (Number(precoCusto) || 0), [precoCusto]);
   const vendaTotal = useMemo(() => (Number(precoVenda) || 0), [precoVenda]);
   const total = useMemo(() => vendaTotal + (Number(precoArte) || 0), [vendaTotal, precoArte]);

   const isBuilderCompleto = useMemo(() => {
      // @ts-expect-error
      const othersComplete = !!(selections.papel && selections.cores && selections.acabamento);
      if (!othersComplete) return false;
      if (!selections.tamanho) return false;
      if (selections.tamanho === 'personalizado') {
         return !!(larguraCm && alturaCm);
      }
      return true;
   }, [selections, larguraCm, alturaCm]);

   const isPrecoCompleto = useMemo(() => (Number(quantidade) || 0) > 0 && precoCusto && precoVenda && pagamento, [quantidade, precoCusto, precoVenda, pagamento]);

   const handleConcluir = async () => {
      if (!isBuilderCompleto || !isPrecoCompleto || !cliente) return;
      setIsLoading(true);
      const payload = {
         user: user,
         cliente: cliente,
         produto: produto,
         opcoes: selections,
         observacao: observacao,
         dimensoesPersonalizadas: isPersonalizado ? { larguraCm, alturaCm } : null,
         preco: {
            quantidade: (Number(quantidade) || 0),
            precoCusto: (Number(precoCusto) || 0),
            precoVenda: (Number(precoVenda) || 0),
            precoArte: (Number(precoArte) || 0),
            pagamento, total, custoTotal, vendaTotal
         }
      };
      try {
         const response = await fetch('/api/pedidos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
         });
         if (!response.ok) throw new Error('Falha ao salvar o pedido');
         const salvo = await response.json();
         router.push(`/historico-pedidos?highlight=${salvo.id}`);
      } catch (error) {
         console.error(error);
         alert('Erro ao salvar o pedido. Tente novamente.');
      } finally {
         setIsLoading(false);
      }
   };

   return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

         {/* COLUNA DA ESQUERDA (Ficha) */}
         <div className="lg:col-span-1 space-y-4">
            {/* ... (ClientCombobox, Imagem, Descrição, Ficha - Sem mudanças) ... */}
            <ClientCombobox
               selectedClientId={cliente?.id || null}
               onSelectClient={onSelectCliente}
            />
            <div className="bg-phalis-black rounded-lg p-4">
               <h2 className="text-xl font-bold text-white mb-2">{produto.nome}</h2>
               <div className="h-48 w-full bg-phalis-black rounded-md relative overflow-hidden">
                  <Image src={produto.imageUrl} alt={produto.nome} fill className="object-cover" priority />
               </div>
            </div>
            {produto.descricao && (
               <Textarea
                  readOnly
                  value={produto.descricao}
                  className="min-h-[100px] bg-phalis-gray border-0 text-gray-300 text-sm"
               />
            )}
            <div className="bg-phalis-black p-4 rounded-lg space-y-2">
               <h3 className="text-lg font-medium text-white">Ficha do Pedido:</h3>
               {fichaDoPedido.map((item) => (
                  <div key={item.label} className="text-sm">
                     <span className="text-gray-400">{item.label}. </span>
                     <span className="text-white">{item.value}</span>
                  </div>
               ))}
            </div>
         </div>

         {/* COLUNA DA DIREITA (Layout com lógica interna) */}
         <div className="lg:col-span-2 space-y-6 flex flex-col">

            {/* Etapa 1: Construtor de 4 Colunas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

               {/* Coluna 01: Papel */}
               <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-white">{optionGroupsConfig[0].name}</h3>
                  {/* @ts-expect-error */}
                  {produto.options.papel.map((option) => {
                     const isSelected = selections.papel === option.id;
                     return (
                        <Button key={option.id} onClick={() => handleSelectOption('papel', option.id)}
                           className={`w-full h-auto text-wrap py-3 justify-center text-center ${isSelected ? 'bg-phalis-danger text-white hover:bg-red-700' : 'bg-phalis-gray text-white hover:bg-gray-700'}`}>
                           {option.name}
                        </Button>
                     );
                  })}
               </div>

               {/* Coluna 02: Tamanho (COM LÓGICA PERSONALIZADA) */}
               <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-white">{optionGroupsConfig[1].name}</h3>
                  {/* @ts-expect-error */}
                  {produto.options.tamanho.length > 0 && (
                     // @ts-expect-error
                     produto.options.tamanho.map((option) => {
                        const isSelected = selections.tamanho === option.id;
                        return (
                           <Button
                              key={option.id}
                              onClick={() => handleSelectOption('tamanho', option.id)}
                              disabled={!selections.papel} // <-- CORREÇÃO DO BUG
                              className={`w-full h-auto text-wrap py-3 justify-center text-center ${isSelected ? 'bg-phalis-danger text-white hover:bg-red-700' : 'bg-phalis-gray text-white hover:bg-gray-700'} disabled:opacity-30`}
                           >
                              {option.name}
                           </Button>
                        );
                     })
                  )}
                  {/* @ts-expect-error */}
                  {produto.options.tamanho.length > 0 && (
                     <Button
                        onClick={handlePersonalizadoClick}
                        disabled={!selections.papel} // <-- CORREÇÃO DO BUG
                        className={`w-full h-auto text-wrap py-3 justify-center text-center ${selections.tamanho === 'personalizado' ? 'bg-phalis-danger text-white hover:bg-red-700' : 'bg-phalis-gray text-white hover:bg-gray-700'} disabled:opacity-30`}
                     >
                        Personalizada
                     </Button>
                  )}
                  {isPersonalizado && (
                     <div className="pt-2 animate-in fade-in duration-300">
                        <div className="bg-phalis-gray rounded-md p-3 space-y-3">
                           <SuffixInput
                              suffix="cm"
                              type="number"
                              placeholder="Largura (cm) *"
                              value={larguraCm}
                              onChange={e => setLarguraCm(e.target.value)}
                              className="bg-phalis-dark border-0"
                              disabled={!selections.papel}
                           />
                           <SuffixInput
                              suffix="cm"
                              type="number"
                              placeholder="Altura (cm) *"
                              value={alturaCm}
                              onChange={e => setAlturaCm(e.target.value)}
                              className="bg-phalis-dark border-0"
                              disabled={!selections.papel}
                           />
                        </div>
                     </div>
                  )}
               </div>

               {/* Coluna 03: Cores */}
               <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-white">{optionGroupsConfig[2].name}</h3>
                  {/* @ts-expect-error */}
                  {produto.options.cores.map((option) => {
                     const isSelected = selections.cores === option.id;
                     const isEnabled = !!selections.tamanho; // (Lógica original correta)
                     return (
                        <Button key={option.id} onClick={() => handleSelectOption('cores', option.id)} disabled={!isEnabled}
                           className={`w-full h-auto text-wrap py-3 justify-center text-center ${isSelected ? 'bg-phalis-danger text-white hover:bg-red-700' : 'bg-phalis-gray text-white hover:bg-gray-700'} disabled:opacity-30`}>
                           {option.name}
                        </Button>
                     );
                  })}
               </div>

               {/* Coluna 04: Acabamento */}
               <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-white">{optionGroupsConfig[3].name}</h3>
                  {/* @ts-expect-error */}
                  {produto.options.acabamento.map((option) => {
                     const isSelected = selections.acabamento === option.id;
                     const isEnabled = !!selections.cores; // (Lógica original correta)
                     return (
                        <Button key={option.id} onClick={() => handleSelectOption('acabamento', option.id)} disabled={!isEnabled}
                           className={`w-full h-auto text-wrap py-3 justify-center text-center ${isSelected ? 'bg-phalis-danger text-white hover:bg-red-700' : 'bg-phalis-gray text-white hover:bg-gray-700'} disabled:opacity-30`}>
                           {option.name}
                        </Button>
                     );
                  })}
               </div>
            </div>

            {/* Etapa 2: Grid de Observação e Preço (Layout do Esboço) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-grow">
               {/* ... (Resto do FormularioUnidade - Sem mudanças) ... */}
               <div className="lg:col-span-2">
                  <Textarea
                     placeholder="Observações (Opcional)..."
                     className="min-h-[150px] h-full bg-phalis-gray border-0 text-base"
                     value={observacao}
                     onChange={(e) => setObservacao(e.target.value)}
                  />
               </div>
               <div className="lg:col-span-1 space-y-3">
                  <h3 className="text-base font-medium text-white">Fluxo de Custo</h3>
                  <Input type="number" placeholder="Quantidade *" value={quantidade} onChange={e => setQuantidade(e.target.value)} className="bg-phalis-gray border-0" min={1} />
                  <MoneyInput placeholder="Preço Custo Total *" value={precoCusto} onChange={e => setPrecoCusto(e.target.value)} />
                  <div className="bg-phalis-gray rounded-md p-3 text-white">Custo Total: <span className="font-bold">R$ {custoTotal.toFixed(2)}</span></div>
                  <h3 className="text-base font-medium text-white pt-4">Fluxo de Venda</h3>
                  <MoneyInput placeholder="Preço Venda Total *" value={precoVenda} onChange={e => setPrecoVenda(e.target.value)} />
                  <div className="bg-phalis-gray rounded-md p-3 text-white">Venda Total: <span className="font-bold">R$ {vendaTotal.toFixed(2)}</span></div>
                  <h3 className="text-base font-medium text-white pt-4">Finalização</h3>
                  <MoneyInput placeholder="Preço Arte (Opcional)" value={precoArte} onChange={e => setPrecoArte(e.target.value)} />
                  <Select onValueChange={setPagamento}>
                     <SelectTrigger className="bg-phalis-gray border-0"><SelectValue placeholder="Pagamento *" /></SelectTrigger>
                     <SelectContent className="bg-phalis-gray border-0">
                        <SelectItem value="nao_pago">Não Pago</SelectItem>
                        <SelectItem value="pago_50">Pago 50%</SelectItem>
                        <SelectItem value="pago">Pago</SelectItem>
                     </SelectContent>
                  </Select>
               </div>
            </div>
            <div className="bg-phalis-black p-4 rounded-lg flex justify-between items-center">
               <div className="text-right text-white">
                  <span className="text-sm text-gray-400 block">TOTAL (Venda + Arte)</span>
                  <span className="text-3xl font-bold">R$ {total.toFixed(2)}</span>
               </div>
               <Button
                  disabled={!isBuilderCompleto || !isPrecoCompleto || !cliente || isLoading}
                  onClick={handleConcluir}
                  className="w-auto bg-phalis-action text-phalis-black font-bold text-lg py-6 px-8 hover:bg-phalis-action-hover disabled:opacity-50"
               >
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : 'CONCLUIR PRODUTO'}
               </Button>
            </div>
         </div>
      </div>
   );
};


// ==========================================================
// 2. FORMULÁRIO "METRO" (M²)
// (Sem mudanças)
// ==========================================================
interface FormularioMetroProps {
   produto: Product & { options: ProductOptions };
   cliente: Cliente | null;
   onSelectCliente: (cliente: Cliente | null) => void;
}
const FormularioMetro: React.FC<FormularioMetroProps> = ({ produto, cliente, onSelectCliente }) => {
   // ... (código do FormularioMetro - sem mudanças)
   const router = useRouter();
   const [isLoading, setIsLoading] = useState(false);
   const { user } = useAuth();
   const [selections, setSelections] = useState<Selections>({
      papel: null, tamanho: null, cores: null, acabamento: null,
   });
   const [observacoes, setObservacoes] = useState('');
   const [largura, setLargura] = useState('');
   const [altura, setAltura] = useState('');
   const [valorArte, setValorArte] = useState('');
   const [pagamento, setPagamento] = useState<string | null>(null);
   const [m2Custo, setM2Custo] = useState('');
   const [m2Venda, setM2Venda] = useState('');
   // @ts-expect-error
   const autoPersonalizado = useMemo(() => produto.options.tamanho.length === 0, [produto]);
   useEffect(() => {
      setSelections({
         papel: null,
         tamanho: autoPersonalizado ? 'personalizado' : null,
         cores: null,
         acabamento: null,
      });
      setLargura('');
      setAltura('');
   }, [produto, autoPersonalizado]);
   const handleSelectOption = (clickedGroupId: keyof Selections, optionId: string) => {
      if (selections[clickedGroupId] === optionId) return;
      const newSelections: Selections = { ...selections };
      const clickedIndex = optionGroupsConfig.findIndex(group => group.id === clickedGroupId);
      newSelections[clickedGroupId] = optionId;
      for (let i = clickedIndex + 1; i < optionGroupsConfig.length; i++) {
         const groupIdToReset = optionGroupsConfig[i].id;
         if (autoPersonalizado && groupIdToReset === 'tamanho') {
            continue;
         }
         newSelections[groupIdToReset] = null;
      }
      setSelections(newSelections);
   };
   const metrosQuadrados = useMemo(() => ((parseFloat(largura) || 0) * (parseFloat(altura) || 0)), [largura, altura]);
   const fichaDoPedido = useMemo(() => {
      return optionGroupsConfig.map((groupConfig, index) => {
         // @ts-expect-error
         const options = produto.options[groupConfig.id];
         let selectedValue = '...';
         const selectedOptionId = selections[groupConfig.id];
         if (groupConfig.id === 'tamanho' && selections.tamanho === 'personalizado') {
            const m2 = metrosQuadrados.toFixed(2);
            selectedValue = `Personalizado (${largura || 'L'}m x ${altura || 'A'}m = ${m2}m²)`;
         } else if (selectedOptionId) {
            const selectedOption = options.find((opt: any) => opt.id === selectedOptionId);
            if (selectedOption) selectedValue = selectedOption.name;
         }
         return {
            label: String(index + 1).padStart(2, '0'),
            value: selectedValue
         };
      });
   }, [produto, selections, largura, altura, metrosQuadrados]);
   const valorTotalCusto = useMemo(() => metrosQuadrados * (parseFloat(m2Custo) || 0), [metrosQuadrados, m2Custo]);
   const valorTotalVenda = useMemo(() => metrosQuadrados * (parseFloat(m2Venda) || 0), [metrosQuadrados, m2Venda]);
   const total = useMemo(() => valorTotalVenda + (Number(valorArte) || 0), [valorTotalVenda, valorArte]);
   const isBuilderCompleto = useMemo(() => {
      // @ts-expect-error
      const othersComplete = !!(selections.papel && selections.cores && selections.acabamento);
      if (!othersComplete) return false;
      if (selections.tamanho === 'personalizado') {
         return !!(largura && altura);
      }
      return false;
   }, [selections, largura, altura]);
   const isPrecoCompleto = useMemo(() => m2Custo && m2Venda && pagamento, [m2Custo, m2Venda, pagamento]);
   const handleConcluir = async () => {
      if (!isBuilderCompleto || !isPrecoCompleto || !cliente) return;
      setIsLoading(true);
      const payload = {
         user: user,
         cliente: cliente,
         produto: produto,
         opcoes: selections,
         observacao: observacoes,
         preco: {
            largura: (Number(largura) || 0),
            altura: (Number(altura) || 0),
            valorArte: (Number(valorArte) || 0),
            pagamento,
            m2Custo: (Number(m2Custo) || 0),
            m2Venda: (Number(m2Venda) || 0),
            total, valorTotalCusto, valorTotalVenda
         }
      };
      try {
         const response = await fetch('/api/pedidos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
         });
         if (!response.ok) throw new Error('Falha ao salvar o pedido');
         const salvo = await response.json();
         router.push(`/historico-pedidos?highlight=${salvo.id}`);
      } catch (error) {
         console.error(error);
         alert('Erro ao salvar o pedido. Tente novamente.');
      } finally {
         setIsLoading(false);
      }
   };

   return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="lg:col-span-1 space-y-4">
            <ClientCombobox
               selectedClientId={cliente?.id || null}
               onSelectClient={onSelectCliente}
            />
            <div className="bg-phalis-black rounded-lg p-4">
               <h2 className="text-xl font-bold text-white mb-2">{produto.nome}</h2>
               <div className="h-48 w-full bg-phalis-black rounded-md relative overflow-hidden">
                  <Image src={produto.imageUrl} alt={produto.nome} fill className="object-cover" priority />
               </div>
            </div>
            {produto.descricao && (
               <Textarea
                  readOnly
                  value={produto.descricao}
                  className="min-h-[100px] bg-phalis-gray border-0 text-gray-300 text-sm"
               />
            )}
            <div className="bg-phalis-black p-4 rounded-lg space-y-2">
               <h3 className="text-lg font-medium text-white">Ficha do Pedido:</h3>
               {fichaDoPedido.map((item) => (
                  <div key={item.label} className="text-sm">
                     <span className="text-gray-400">{item.label}. </span>
                     <span className="text-white">{item.value}</span>
                  </div>
               ))}
            </div>
         </div>
         <div className="lg:col-span-2 space-y-6 flex flex-col">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
               <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-white">{optionGroupsConfig[0].name}</h3>
                  {/* @ts-expect-error */}
                  {produto.options.papel.map((option) => {
                     const isSelected = selections.papel === option.id;
                     return (
                        <Button key={option.id} onClick={() => handleSelectOption('papel', option.id)}
                           className={`w-full h-auto text-wrap py-3 justify-center text-center ${isSelected ? 'bg-phalis-danger text-white hover:bg-red-700' : 'bg-phalis-gray text-white hover:bg-gray-700'}`}>
                           {option.name}
                        </Button>
                     );
                  })}
               </div>
               <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-white">{optionGroupsConfig[1].name}</h3>
                  <SuffixInput
                     suffix="m"
                     type="number"
                     step="0.01"
                     placeholder="Largura (m) *"
                     value={largura}
                     onChange={e => setLargura(e.target.value)}
                     disabled={!selections.papel}
                     className={!selections.papel ? 'disabled:opacity-30' : ''}
                  />
                  <SuffixInput
                     suffix="m"
                     type="number"
                     step="0.01"
                     placeholder="Altura (m) *"
                     value={altura}
                     onChange={e => setAltura(e.target.value)}
                     disabled={!selections.papel}
                     className={!selections.papel ? 'disabled:opacity-30' : ''}
                  />
                  <div className="bg-phalis-black rounded-md p-3 text-white">
                     Total m²: <span className="font-bold">{metrosQuadrados.toFixed(2)} m²</span>
                  </div>
               </div>
               <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-white">{optionGroupsConfig[2].name}</h3>
                  {/* @ts-expect-error */}
                  {produto.options.cores.map((option) => {
                     const isSelected = selections.cores === option.id;
                     const isEnabled = !!(largura && altura);
                     return (
                        <Button key={option.id} onClick={() => handleSelectOption('cores', option.id)} disabled={!isEnabled}
                           className={`w-full h-auto text-wrap py-3 justify-center text-center ${isSelected ? 'bg-phalis-danger text-white hover:bg-red-700' : 'bg-phalis-gray text-white hover:bg-gray-700'} disabled:opacity-30`}>
                           {option.name}
                        </Button>
                     );
                  })}
               </div>
               <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-white">{optionGroupsConfig[3].name}</h3>
                  {/* @ts-expect-error */}
                  {produto.options.acabamento.map((option) => {
                     const isSelected = selections.acabamento === option.id;
                     const isEnabled = !!selections.cores;
                     return (
                        <Button key={option.id} onClick={() => handleSelectOption('acabamento', option.id)} disabled={!isEnabled}
                           className={`w-full h-auto text-wrap py-3 justify-center text-center ${isSelected ? 'bg-phalis-danger text-white hover:bg-red-700' : 'bg-phalis-gray text-white hover:bg-gray-700'} disabled:opacity-30`}>
                           {option.name}
                        </Button>
                     );
                  })}
               </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-grow">
               <div className="lg:col-span-2">
                  <Textarea
                     placeholder="Observações (Opcional)..."
                     className="min-h-[150px] h-full bg-phalis-gray border-0 text-base"
                     value={observacoes}
                     onChange={(e) => setObservacoes(e.target.value)}
                  />
               </div>
               <div className="lg:col-span-1 space-y-3">
                  <h3 className="text-base font-medium text-white">Fluxo de Custo</h3>
                  <MoneyInput placeholder="Valor Custo (por m²) *" value={m2Custo} onChange={e => setM2Custo(e.target.value)} />
                  <div className="bg-phalis-gray rounded-md p-3 text-white">Custo Total: <span className="font-bold">R$ {valorTotalCusto.toFixed(2)}</span></div>
                  <h3 className="text-base font-medium text-white pt-4">Fluxo de Venda</h3>
                  <MoneyInput placeholder="Valor Venda (por m²) *" value={m2Venda} onChange={e => setM2Venda(e.target.value)} />
                  <div className="bg-phalis-gray rounded-md p-3 text-white">Venda Total: <span className="font-bold">R$ {valorTotalVenda.toFixed(2)}</span></div>
                  <h3 className="text-base font-medium text-white pt-4">Finalização</h3>
                  <MoneyInput placeholder="Valor Arte (Opcional)" value={valorArte} onChange={e => setValorArte(e.target.value)} />
                  <Select onValueChange={setPagamento}>
                     <SelectTrigger className="bg-phalis-gray border-0"><SelectValue placeholder="Pagamento *" /></SelectTrigger>
                     <SelectContent className="bg-phalis-gray border-0">
                        <SelectItem value="nao_pago">Não Pago</SelectItem>
                        <SelectItem value="pago_50">Pago 50%</SelectItem>
                        <SelectItem value="pago">Pago</SelectItem>
                     </SelectContent>
                  </Select>
               </div>
            </div>
            <div className="bg-phalis-black p-4 rounded-lg flex justify-between items-center">
               <div className="text-right text-white">
                  <span className="text-sm text-gray-400 block">TOTAL (Venda + Arte)</span>
                  <span className="text-3xl font-bold">R$ {total.toFixed(2)}</span>
               </div>
               <Button
                  disabled={!isBuilderCompleto || !isPrecoCompleto || !cliente || isLoading}
                  onClick={handleConcluir}
                  className="w-auto bg-phalis-action text-phalis-black font-bold text-lg py-6 px-8 hover:bg-phalis-action-hover disabled:opacity-50"
               >
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : 'CONCLUIR PRODUTO'}
               </Button>
            </div>
         </div>
      </div>
   );
};


// ==========================================================
// 3. FORMULÁRIO "ARTE"
// (Sem mudanças)
// ==========================================================
interface FormularioArteProps {
   produto: Product;
   cliente: Cliente | null;
   onSelectCliente: (cliente: Cliente | null) => void;
}
const FormularioArte: React.FC<FormularioArteProps> = ({ produto, cliente, onSelectCliente }) => {
   // ... (código do FormularioArte - sem mudanças)
   const router = useRouter();
   const [isLoading, setIsLoading] = useState(false);
   const { user } = useAuth();
   const [observacao, setObservacao] = useState('');
   const [valorVenda, setValorVenda] = useState('');
   const [pagamento, setPagamento] = useState<string | null>(null);
   const isFormCompleto = useMemo(() => observacao && valorVenda && pagamento && cliente, [observacao, valorVenda, pagamento, cliente]);
   const total = useMemo(() => Number(valorVenda) || 0, [valorVenda]);
   const handleConcluir = async () => {
      if (!isFormCompleto || !cliente) return;
      setIsLoading(true);
      const payload = {
         user: user,
         cliente: cliente,
         produto: produto,
         preco: {
            observacao: observacao,
            descricao: observacao,
            valorVenda: total,
            pagamento: pagamento
         }
      };
      try {
         const response = await fetch('/api/pedidos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
         });
         if (!response.ok) throw new Error('Falha ao salvar o pedido');
         const salvo = await response.json();
         router.push(`/historico-pedidos?highlight=${salvo.id}`);
      } catch (error) {
         console.error(error);
         alert('Erro ao salvar o pedido. Tente novamente.');
      } finally {
         setIsLoading(false);
      }
   };

   return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="lg:col-span-1 space-y-4">
            <ClientCombobox
               selectedClientId={cliente?.id || null}
               onSelectClient={onSelectCliente}
            />
            <div className="bg-phalis-black rounded-lg p-4">
               <h2 className="text-xl font-bold text-white mb-2">{produto.nome}</h2>
               <div className="h-48 w-full bg-phalis-black rounded-md relative overflow-hidden">
                  <Image src={produto.imageUrl} alt={produto.nome} fill className="object-cover" priority />
               </div>
            </div>
            {produto.descricao && (
               <Textarea
                  readOnly
                  value={produto.descricao}
                  className="min-h-[100px] bg-phalis-gray border-0 text-gray-300 text-sm"
               />
            )}
            <div className="bg-phalis-black p-4 rounded-lg space-y-2 min-h-[100px]">
               <h3 className="text-lg font-medium text-white">Ficha do Pedido:</h3>
               <p className="text-sm text-gray-500">Este produto não possui opções.</p>
            </div>
         </div>
         <div className="lg:col-span-2 space-y-6 flex flex-col">
            <div className="h-0 md:h-[76px]"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-grow">
               <div className="lg:col-span-2">
                  <Textarea
                     placeholder="Descrição / Observações da Arte *"
                     className="min-h-[200px] h-full bg-phalis-gray border-0 text-base"
                     value={observacao}
                     onChange={(e) => setObservacao(e.target.value)}
                  />
               </div>
               <div className="lg:col-span-1 space-y-3">
                  <h3 className="text-base font-medium text-white">Finalização</h3>
                  <MoneyInput
                     placeholder="Valor Total da Venda *"
                     value={valorVenda}
                     onChange={(e) => setValorVenda(e.target.value)}
                  />
                  <Select onValueChange={setPagamento}>
                     <SelectTrigger className="bg-phalis-gray border-0"><SelectValue placeholder="Pagamento *" /></SelectTrigger>
                     <SelectContent className="bg-phalis-gray border-0">
                        <SelectItem value="nao_pago">Não Pago</SelectItem>
                        <SelectItem value="pago_50">Pago 50%</SelectItem>
                        <SelectItem value="pago">Pago</SelectItem>
                     </SelectContent>
                  </Select>
                  <div className="bg-phalis-black rounded-lg p-4 text-center">
                     <span className="text-sm text-gray-400 block">TOTAL</span>
                     <span className="text-3xl font-bold text-white">R$ {total.toFixed(2)}</span>
                  </div>
               </div>
            </div>
            <div className="flex justify-end">
               <Button
                  disabled={!isFormCompleto || isLoading}
                  onClick={handleConcluir}
                  className="w-full md:w-auto bg-phalis-action text-phalis-black font-bold text-lg py-6 px-8 hover:bg-phalis-action-hover disabled:opacity-50"
               >
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : 'CONCLUIR PRODUTO'}
               </Button>
            </div>
         </div>
      </div>
   );
};


// ==========================================================
// PÁGINA PRINCIPAL (ROTEADOR)
// ==========================================================
export default function PedidosPage() {

   const [produto, setProduto] = useState<Product | null>(null);
   const [loading, setLoading] = useState(true);
   const searchParams = useSearchParams();
   const [selectedClient, setSelectedClient] = useState<Cliente | null>(null);
   const { user } = useAuth();

   useEffect(() => {
      const produtoId = searchParams.get('id');
      setLoading(true);
      if (produtoId) {
         const produtoEncontrado = getProductById(produtoId);
         if (produtoEncontrado) {
            setProduto(produtoEncontrado);
         } else {
            setProduto(null);
         }
      } else {
         setProduto(null);
      }
      setLoading(false);
   }, [searchParams]);

   if (loading || !user) {
      return <div className="text-center text-gray-400">Carregando...</div>;
   }

   if (!produto) {
      return (
         <div className="text-center text-gray-400">
            <p>Nenhum produto selecionado ou ID inválido.</p>
            <Button asChild className="mt-4 bg-phalis-nav hover:bg-phalis-nav-hover">
               <Link href="/catalogo">Ir para o Catálogo</Link>
            </Button>
         </div>
      );
   }

   // O ROTEADOR
   switch (produto.pricingType) {
      case 'unidade':
         return <FormularioUnidade
            produto={produto as Product & { options: ProductOptions }}
            cliente={selectedClient}
            onSelectCliente={setSelectedClient}
         />;
      case 'metro':
         return <FormularioMetro
            produto={produto as Product & { options: ProductOptions }}
            cliente={selectedClient}
            onSelectCliente={setSelectedClient}
         />;
      case 'arte':
         return <FormularioArte
            produto={produto}
            cliente={selectedClient}
            onSelectCliente={setSelectedClient}
         />;
      default:
         return <div>Tipo de produto desconhecido.</div>;
   }
}