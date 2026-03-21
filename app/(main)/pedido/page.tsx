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
import { authenticatedFetch } from '@/lib/api';
import { type Pedido } from '@/lib/orderData';
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
import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from "@/components/ui/table";
import { Textarea } from '@/components/ui/textarea';
import { ClientCombobox } from '@/components/clientes/ClientCombobox';
import { MoneyInput } from '@/components/ui/money-input';
import { Loader2, Search } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import { SuffixInput } from '@/components/ui/suffix-input';
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

// --- TIPOS COMPARTILHADOS ---
type Selections = Record<typeof optionGroupsConfig[number]['id'], string | null>;
type PrecoItem = { qtd: number; preco: number; };
type PrecoData = {
   nomeProduto: string;
   qtdMinima: number;
   precoMinimo: number;
   precos: PrecoItem[];
};

// ==========================================================
// COMPONENTES VISUAIS REUTILIZÁVEIS (UI PURE)
// ==========================================================

const ProductInfoCard = ({ produto }: { produto: Product }) => (
   <>
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
   </>
);

const OrderSummaryCard = ({ ficha }: { ficha: { label: string; value: string }[] }) => (
   <div className="bg-phalis-black p-4 rounded-lg space-y-2">
      <h3 className="text-lg font-medium text-white">Ficha do Pedido:</h3>
      {ficha.map((item) => (
         <div key={item.label} className="text-sm">
            <span className="text-gray-400">{item.label}. </span>
            <span className="text-white">{item.value}</span>
         </div>
      ))}
   </div>
);

const OrderFooter = ({
   total,
   isValid,
   isLoading,
   onConfirm,
   labelTotal = "TOTAL"
}: {
   total: number,
   isValid: boolean,
   isLoading: boolean,
   onConfirm: () => void,
   labelTotal?: string
}) => (
   <div className="bg-phalis-black p-4 rounded-lg flex justify-between items-center">
      <div className="text-right text-white">
         <span className="text-sm text-gray-400 block">{labelTotal}</span>
         <span className="text-3xl font-bold">R$ {total.toFixed(2)}</span>
      </div>
      <Button
         disabled={!isValid || isLoading}
         onClick={onConfirm}
         className="w-auto bg-phalis-action text-phalis-black font-bold text-lg py-6 px-8 hover:bg-phalis-action-hover disabled:opacity-50"
      >
         {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : 'CONCLUIR PRODUTO'}
      </Button>
   </div>
);

// ==========================================================
// 1. FORMULÁRIO "UNIDADE" (Visual Mantido)
// ==========================================================
interface FormularioUnidadeProps {
   produto: Product & { options: ProductOptions };
   cliente: Cliente | null;
   onSelectCliente: (cliente: Cliente | null) => void;
   pedidoParaEditar: Pedido | null;
}

const FormularioUnidade: React.FC<FormularioUnidadeProps> = ({ produto, cliente, onSelectCliente, pedidoParaEditar }) => {
   const router = useRouter();
   const [isLoading, setIsLoading] = useState(false);
   const { user } = useAuth();

   const [selections, setSelections] = useState<Selections>({ papel: null, tamanho: null, cores: null, acabamento: null });
   const [isPersonalizado, setIsPersonalizado] = useState(false);
   const [larguraCm, setLarguraCm] = useState('');
   const [alturaCm, setAlturaCm] = useState('');
   const [observacao, setObservacao] = useState('');
   const [quantidade, setQuantidade] = useState('');
   const [precoCusto, setPrecoCusto] = useState('');
   const [precoVenda, setPrecoVenda] = useState('');
   const [precoArte, setPrecoArte] = useState('');
   const [pagamento, setPagamento] = useState<string | null>(null);
   const [desconto, setDesconto] = useState('');

   const [isPrecoLoading, setIsPrecoLoading] = useState(false);
   const [precoData, setPrecoData] = useState<PrecoData | null>(null);
   const [selectedQtd, setSelectedQtd] = useState<number | null>(null);

   const autoPersonalizado = useMemo(() => produto.options.tamanho.length === 0, [produto]);

   useEffect(() => {
      if (pedidoParaEditar && pedidoParaEditar.detalhes.type === 'unidade') {
         const { detalhes } = pedidoParaEditar;
         setSelections(detalhes.opcoes as Selections);
         setObservacao(detalhes.observacao || '');
         setQuantidade(detalhes.preco.quantidade.toString());
         setPrecoCusto(detalhes.preco.precoCusto.toString());
         setPrecoVenda(detalhes.preco.precoVenda.toString());
         setPrecoArte(detalhes.preco.precoArte.toString());
         setDesconto(detalhes.preco.desconto?.toString() || '');
         setPagamento(pedidoParaEditar.statusFinanceiro);

         if (detalhes.dimensoesPersonalizadas) {
            setIsPersonalizado(true);
            setLarguraCm(detalhes.dimensoesPersonalizadas.larguraCm);
            setAlturaCm(detalhes.dimensoesPersonalizadas.alturaCm);
         } else {
            setIsPersonalizado(autoPersonalizado);
         }
      } else {
         setIsPersonalizado(autoPersonalizado);
         setLarguraCm(''); setAlturaCm('');
         setSelections({ papel: null, tamanho: autoPersonalizado ? 'personalizado' : null, cores: null, acabamento: null });
         setPrecoData(null); setSelectedQtd(null);
      }
   }, [produto, autoPersonalizado, pedidoParaEditar]);

   const handleSelectOption = (clickedGroupId: keyof Selections, optionId: string) => {
      if (selections[clickedGroupId] === optionId) return;
      if (clickedGroupId === 'tamanho') setIsPersonalizado(false);

      const newSelections: Selections = { ...selections };
      const clickedIndex = optionGroupsConfig.findIndex(group => group.id === clickedGroupId);
      newSelections[clickedGroupId] = optionId;

      for (let i = clickedIndex + 1; i < optionGroupsConfig.length; i++) {
         const groupIdToReset = optionGroupsConfig[i].id;
         if (autoPersonalizado && groupIdToReset === 'tamanho') continue;
         newSelections[groupIdToReset] = null;
      }
      setSelections(newSelections);
   };

   const handlePersonalizadoClick = () => {
      if (selections.tamanho === 'personalizado') return;
      setIsPersonalizado(true);
      setSelections(prev => ({ ...prev, tamanho: 'personalizado', cores: null, acabamento: null }));
   };

   const custoTotal = useMemo(() => (Number(precoCusto) || 0), [precoCusto]);
   const vendaTotal = useMemo(() => (Number(precoVenda) || 0), [precoVenda]);
   const total = useMemo(() => {
      const subTotal = vendaTotal + (Number(precoArte) || 0);
      const valorDesconto = Number(desconto) || 0;
      return Math.max(0, subTotal - valorDesconto);
   }, [vendaTotal, precoArte, desconto]);

   const isTamanhoCompleto = useMemo(() => {
      if (!selections.tamanho) return false;
      if (selections.tamanho === 'personalizado') return !!(larguraCm && alturaCm);
      return true;
   }, [selections.tamanho, larguraCm, alturaCm]);

   const isBuilderCompleto = useMemo(() => {
      const othersComplete = !!(selections.papel && selections.cores && selections.acabamento);
      return othersComplete && isTamanhoCompleto;
   }, [selections, isTamanhoCompleto]);

   const isPrecoCompleto = useMemo(() => (Number(quantidade) || 0) > 0 && precoCusto && precoVenda && pagamento, [quantidade, precoCusto, precoVenda, pagamento]);

   const fichaDoPedido = useMemo(() => {
      return optionGroupsConfig.map((groupConfig, index) => {
         const options = produto.options[groupConfig.id];
         let selectedValue = '...';
         const selectedOptionId = selections[groupConfig.id];

         if (groupConfig.id === 'tamanho' && isPersonalizado) {
            selectedValue = `Personalizado (${larguraCm || 'L'}cm x ${alturaCm || 'A'}cm)`;
         } else if (selectedOptionId) {
            const selectedOption = options.find((opt: any) => opt.id === selectedOptionId);
            if (selectedOption) selectedValue = selectedOption.name;
         }
         return { label: String(index + 1).padStart(2, '0'), value: selectedValue };
      });
   }, [produto, selections, isPersonalizado, larguraCm, alturaCm]);

   const handleConsultarPreco = async () => {
      if (!isBuilderCompleto) return;
      setIsPrecoLoading(true); setPrecoData(null); setSelectedQtd(null);

      const papelName = produto.options.papel.find(o => o.id === selections.papel)?.name;
      const tamanhoName = isPersonalizado ? `Personalizado ${larguraCm}x${alturaCm}cm` : produto.options.tamanho.find(o => o.id === selections.tamanho)?.name;
      const coresName = produto.options.cores.find(o => o.id === selections.cores)?.name;
      const acabamentoName = produto.options.acabamento.find(o => o.id === selections.acabamento)?.name;

      try {
         const response = await authenticatedFetch(`/api/consultar-preco/${encodeURIComponent(produto.nome)}`, {
            method: 'POST',
            body: JSON.stringify({ papel: papelName, tamanho: tamanhoName, cores: coresName, acabamento: acabamentoName }),
         });
         if (!response.ok) throw new Error('API de preço falhou');
         const data: PrecoData = await response.json();
         setPrecoData(data);
         setPrecoCusto(data.precoMinimo.toFixed(2));
         setQuantidade(data.qtdMinima.toString());
         setSelectedQtd(data.qtdMinima);
      } catch (error) {
         console.error("Erro ao consultar preço:", error);
      } finally {
         setIsPrecoLoading(false);
      }
   };

   const handleConcluir = async () => {
      if (!isBuilderCompleto || !isPrecoCompleto || !cliente) return;
      setIsLoading(true);

      const payload = {
         clientId: cliente.id,
         itemNome: produto.nome,
         itemImageUrl: produto.imageUrl,
         productId: produto.id,
         valor: total,
         statusFinanceiro: pagamento,
         detalhes: {
            type: 'unidade',
            opcoes: selections,
            observacao,
            dimensoesPersonalizadas: isPersonalizado ? { larguraCm, alturaCm } : null,
            preco: {
               quantidade: (Number(quantidade) || 0),
               precoCusto: (Number(precoCusto) || 0),
               precoVenda: (Number(precoVenda) || 0),
               precoArte: (Number(precoArte) || 0),
               desconto: (Number(desconto) || 0),
               pagamento, total, custoTotal, vendaTotal
            }
         }
      };

      try {
         const url = pedidoParaEditar ? `/api/pedidos/${pedidoParaEditar.id}` : '/api/pedidos';
         const method = pedidoParaEditar ? 'PUT' : 'POST';

         // MUDANÇA: Usando authenticatedFetch para enviar o token
         const response = await authenticatedFetch(url, {
            method,
            body: JSON.stringify(payload)
         });

         if (!response.ok) throw new Error('Falha ao salvar');
         const salvo = await response.json();
         router.push(pedidoParaEditar ? '/historico-pedidos' : `/historico-pedidos?highlight=${salvo.id}`);
      } catch (error) {
         console.error(error);
         alert('Erro ao salvar o pedido.');
      } finally {
         setIsLoading(false);
      }
   };

   return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="lg:col-span-1 space-y-4">
            <ClientCombobox selectedClientId={cliente?.id || null} onSelectClient={onSelectCliente} />
            <ProductInfoCard produto={produto} />
            <OrderSummaryCard ficha={fichaDoPedido} />

            {produto.consultaPreco && !pedidoParaEditar && (
               <>
                  <Button type="button" onClick={handleConsultarPreco} disabled={!isBuilderCompleto || isPrecoLoading} className="w-full bg-phalis-nav hover:bg-phalis-nav-hover disabled:opacity-50">
                     {isPrecoLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />} Consultar Preço
                  </Button>
                  {isPrecoLoading && <div className="flex justify-center items-center p-4"><Loader2 className="h-6 w-6 animate-spin text-phalis-action" /></div>}
                  {precoData && (
                     <div className="bg-phalis-black rounded-md p-3 max-h-96 overflow-y-auto animate-in fade-in duration-300">
                        <h4 className="text-sm font-medium text-white mb-2">Preços - {precoData.nomeProduto}</h4>
                        <Table className="text-white">
                           <TableHeader><TableRow><TableHead className="text-white">Qtd</TableHead><TableHead className="text-white text-right">Preço</TableHead></TableRow></TableHeader>
                           <TableBody>
                              {precoData.precos.map((item) => (
                                 <TableRow key={item.qtd} className={cn("cursor-pointer hover:bg-phalis-gray/50", selectedQtd === item.qtd && "bg-phalis-action/30")} onClick={() => { setQuantidade(item.qtd.toString()); setPrecoCusto(item.preco.toFixed(2)); setPrecoVenda(''); setSelectedQtd(item.qtd); }}>
                                    <TableCell>{item.qtd}</TableCell><TableCell className="text-right">R$ {item.preco.toFixed(2)}</TableCell>
                                 </TableRow>
                              ))}
                           </TableBody>
                        </Table>
                     </div>
                  )}
               </>
            )}
         </div>

         <div className="lg:col-span-2 space-y-6 flex flex-col">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
               <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-white">{optionGroupsConfig[0].name}</h3>
                  {produto.options.papel.map((option) => (
                     <Button key={option.id} onClick={() => handleSelectOption('papel', option.id)} className={`w-full h-auto text-wrap py-3 justify-center text-center ${selections.papel === option.id ? 'bg-phalis-danger text-white hover:bg-red-700' : 'bg-phalis-gray text-white hover:bg-gray-700'}`}>{option.name}</Button>
                  ))}
               </div>
               <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-white">{optionGroupsConfig[1].name}</h3>
                  {produto.options.tamanho.length > 0 && produto.options.tamanho.map((option) => (
                     <Button key={option.id} onClick={() => handleSelectOption('tamanho', option.id)} disabled={!selections.papel} className={`w-full h-auto text-wrap py-3 justify-center text-center ${selections.tamanho === option.id ? 'bg-phalis-danger text-white hover:bg-red-700' : 'bg-phalis-gray text-white hover:bg-gray-700'} disabled:opacity-30`}>{option.name}</Button>
                  ))}
                  {produto.options.tamanho.length > 0 && (
                     <Button onClick={handlePersonalizadoClick} disabled={!selections.papel} className={`w-full h-auto text-wrap py-3 justify-center text-center ${selections.tamanho === 'personalizado' ? 'bg-phalis-danger text-white hover:bg-red-700' : 'bg-phalis-gray text-white hover:bg-gray-700'} disabled:opacity-30`}>Personalizada</Button>
                  )}
                  {isPersonalizado && (
                     <div className="pt-2 animate-in fade-in duration-300"><div className="bg-phalis-gray rounded-md p-3 space-y-3"><SuffixInput suffix="cm" type="number" placeholder="Largura (cm) *" value={larguraCm} onChange={e => setLarguraCm(e.target.value)} className="bg-phalis-dark border-0" disabled={!selections.papel} /><SuffixInput suffix="cm" type="number" placeholder="Altura (cm) *" value={alturaCm} onChange={e => setAlturaCm(e.target.value)} className="bg-phalis-dark border-0" disabled={!selections.papel} /></div></div>
                  )}
               </div>
               <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-white">{optionGroupsConfig[2].name}</h3>
                  {produto.options.cores.map((option) => (
                     <Button key={option.id} onClick={() => handleSelectOption('cores', option.id)} disabled={!isTamanhoCompleto} className={`w-full h-auto text-wrap py-3 justify-center text-center ${selections.cores === option.id ? 'bg-phalis-danger text-white hover:bg-red-700' : 'bg-phalis-gray text-white hover:bg-gray-700'} disabled:opacity-30`}>{option.name}</Button>
                  ))}
               </div>
               <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-white">{optionGroupsConfig[3].name}</h3>
                  {produto.options.acabamento.map((option) => (
                     <Button key={option.id} onClick={() => handleSelectOption('acabamento', option.id)} disabled={!selections.cores} className={`w-full h-auto text-wrap py-3 justify-center text-center ${selections.acabamento === option.id ? 'bg-phalis-danger text-white hover:bg-red-700' : 'bg-phalis-gray text-white hover:bg-gray-700'} disabled:opacity-30`}>{option.name}</Button>
                  ))}
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-grow">
               <div className="lg:col-span-2">
                  <Textarea placeholder="Observações (Opcional)..." className="min-h-[150px] h-full bg-phalis-gray border-0 text-base" value={observacao} onChange={(e) => setObservacao(e.target.value)} />
               </div>
               <div className="lg:col-span-1 space-y-4">
                  <div className="space-y-3 pt-2">
                     <h3 className="text-base font-medium text-white">Custo</h3>
                     <div className="space-y-1"><Label htmlFor="qtd" className="text-gray-300 text-sm ml-1">Quantidade *</Label><Input id="qtd" type="number" value={quantidade} onChange={e => setQuantidade(e.target.value)} className="bg-phalis-gray border-0 h-10 max-h-10" min={1} /></div>
                     <div className="space-y-1"><Label htmlFor="custo" className="text-gray-300 text-sm ml-1">Preço Custo (Total) *</Label><MoneyInput id="custo" value={precoCusto} onChange={e => setPrecoCusto(e.target.value)} /></div>
                     <div className="bg-phalis-black rounded-md p-3 text-white text-sm">Custo Total: <span className="font-bold">R$ {custoTotal.toFixed(2)}</span></div>
                  </div>
                  <div className="space-y-3 pt-2">
                     <h3 className="text-base font-medium text-white">Fluxo de Venda</h3>
                     <div className="space-y-1"><Label htmlFor="venda" className="text-gray-300 text-sm ml-1">Preço Venda (Total) *</Label><MoneyInput id="venda" value={precoVenda} onChange={e => setPrecoVenda(e.target.value)} className="bg-phalis-gray border-0" /></div>
                     <div className="bg-phalis-black rounded-md p-3 text-white text-sm">Venda Total: <span className="font-bold">R$ {vendaTotal.toFixed(2)}</span></div>
                  </div>
                  <div className="space-y-3 pt-2">
                     <h3 className="text-base font-medium text-white">Finalização</h3>
                     <div className="space-y-1"><Label htmlFor="arte" className="text-gray-300 text-sm ml-1">Preço Arte (Opcional)</Label><MoneyInput id="arte" value={precoArte} onChange={e => setPrecoArte(e.target.value)} className="bg-phalis-gray border-0" placeholder="0,00" /></div>
                     <div className="space-y-1"><Label htmlFor="desconto" className="text-gray-300 text-sm ml-1">Desconto (Opcional)</Label><MoneyInput id="desconto" value={desconto} onChange={e => setDesconto(e.target.value)} className="bg-phalis-gray border-0" placeholder="0,00" /></div>
                     <div className="space-y-1">
                        <Label className="text-gray-300 text-sm ml-1">Forma de Pagamento *</Label>
                        <Select value={pagamento || ""} onValueChange={setPagamento}>
                           <SelectTrigger className="bg-phalis-gray border-0"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                           <SelectContent className="bg-phalis-gray border-0">
                              <SelectItem value="nao_pago">Não Pago</SelectItem><SelectItem value="pago_50">Pago 50%</SelectItem><SelectItem value="pago">Pago</SelectItem>
                           </SelectContent>
                        </Select>
                     </div>
                  </div>
               </div>
            </div>

            <OrderFooter total={total} isValid={isBuilderCompleto && !!isPrecoCompleto && !!cliente} isLoading={isLoading} onConfirm={handleConcluir} labelTotal="TOTAL (Venda + Arte - Desc)" />
         </div>
      </div>
   );
};

// ==========================================================
// 2. FORMULÁRIO "METRO" (M²) - (Atualizado com Labels)
// ==========================================================
interface FormularioMetroProps {
   produto: Product & { options: ProductOptions };
   cliente: Cliente | null;
   onSelectCliente: (cliente: Cliente | null) => void;
   pedidoParaEditar: Pedido | null;
}

const FormularioMetro: React.FC<FormularioMetroProps> = ({ produto, cliente, onSelectCliente, pedidoParaEditar }) => {
   const router = useRouter();
   const [isLoading, setIsLoading] = useState(false);
   const { user } = useAuth();

   const [selections, setSelections] = useState<Selections>({ papel: null, tamanho: null, cores: null, acabamento: null });
   const [observacoes, setObservacoes] = useState('');
   const [largura, setLargura] = useState('');
   const [altura, setAltura] = useState('');
   const [valorArte, setValorArte] = useState('');
   const [pagamento, setPagamento] = useState<string | null>(null);
   const [m2Custo, setM2Custo] = useState('');
   const [m2Venda, setM2Venda] = useState('');
   const [desconto, setDesconto] = useState('');

   const autoPersonalizado = useMemo(() => produto.options.tamanho.length === 0, [produto]);

   useEffect(() => {
      if (pedidoParaEditar && pedidoParaEditar.detalhes.type === 'metro') {
         const { detalhes } = pedidoParaEditar;
         setSelections(detalhes.opcoes as Selections);
         setObservacoes(detalhes.observacao || '');
         setLargura(detalhes.preco.largura.toString());
         setAltura(detalhes.preco.altura.toString());
         setM2Custo(detalhes.preco.m2Custo.toString());
         setM2Venda(detalhes.preco.m2Venda.toString());
         setValorArte(detalhes.preco.valorArte.toString());
         setDesconto(detalhes.preco.desconto?.toString() || '');
         setPagamento(pedidoParaEditar.statusFinanceiro);
      } else {
         setSelections({ papel: null, tamanho: autoPersonalizado ? 'personalizado' : null, cores: null, acabamento: null });
         setLargura(''); setAltura('');
         setM2Custo(produto.defaultM2Custo?.toString() || '');
         setM2Venda(produto.defaultM2Venda?.toString() || '');
      }
   }, [produto, autoPersonalizado, pedidoParaEditar]);

   const handleSelectOption = (clickedGroupId: keyof Selections, optionId: string) => {
      if (selections[clickedGroupId] === optionId) return;
      const newSelections: Selections = { ...selections };
      const clickedIndex = optionGroupsConfig.findIndex(group => group.id === clickedGroupId);
      newSelections[clickedGroupId] = optionId;
      for (let i = clickedIndex + 1; i < optionGroupsConfig.length; i++) {
         const groupIdToReset = optionGroupsConfig[i].id;
         if (autoPersonalizado && groupIdToReset === 'tamanho') continue;
         newSelections[groupIdToReset] = null;
      }
      setSelections(newSelections);
   };

   const metrosQuadrados = useMemo(() => ((parseFloat(largura) || 0) * (parseFloat(altura) || 0)), [largura, altura]);
   const valorTotalCusto = useMemo(() => metrosQuadrados * (parseFloat(m2Custo) || 0), [metrosQuadrados, m2Custo]);
   const valorTotalVenda = useMemo(() => metrosQuadrados * (parseFloat(m2Venda) || 0), [metrosQuadrados, m2Venda]);
   const total = useMemo(() => Math.max(0, (valorTotalVenda + (Number(valorArte) || 0)) - (Number(desconto) || 0)), [valorTotalVenda, valorArte, desconto]);

   const isBuilderCompleto = useMemo(() => {
      const othersComplete = !!(selections.papel && selections.cores && selections.acabamento);
      if (!othersComplete) return false;
      if (selections.tamanho === 'personalizado') return !!(largura && altura);
      return false;
   }, [selections, largura, altura]);

   const isPrecoCompleto = useMemo(() => m2Custo && m2Venda && pagamento, [m2Custo, m2Venda, pagamento]);

   const fichaDoPedido = useMemo(() => {
      return optionGroupsConfig.map((groupConfig, index) => {
         const options = produto.options[groupConfig.id];
         let selectedValue = '...';
         const selectedOptionId = selections[groupConfig.id];
         if (groupConfig.id === 'tamanho' && selections.tamanho === 'personalizado') {
            selectedValue = `Personalizado (${largura || 'L'}m x ${altura || 'A'}m = ${metrosQuadrados.toFixed(2)}m²)`;
         } else if (selectedOptionId) {
            const selectedOption = options.find((opt: any) => opt.id === selectedOptionId);
            if (selectedOption) selectedValue = selectedOption.name;
         }
         return { label: String(index + 1).padStart(2, '0'), value: selectedValue };
      });
   }, [produto, selections, largura, altura, metrosQuadrados]);

   const handleConcluir = async () => {
      if (!isBuilderCompleto || !isPrecoCompleto || !cliente) return;
      setIsLoading(true);
      const payload = {
         clientId: cliente.id,
         itemNome: produto.nome,
         itemImageUrl: produto.imageUrl,
         productId: produto.id,
         valor: total,
         statusFinanceiro: pagamento,
         detalhes: {
            type: 'metro',
            opcoes: selections,
            observacao: observacoes,
            preco: {
               largura: (Number(largura) || 0), altura: (Number(altura) || 0), valorArte: (Number(valorArte) || 0),
               pagamento, m2Custo: (Number(m2Custo) || 0), m2Venda: (Number(m2Venda) || 0),
               desconto: (Number(desconto) || 0), total, valorTotalCusto, valorTotalVenda
            }
         }
      };
      try {
         const url = pedidoParaEditar ? `/api/pedidos/${pedidoParaEditar.id}` : '/api/pedidos';
         const method = pedidoParaEditar ? 'PUT' : 'POST';
         const response = await authenticatedFetch(url, {
            method,
            body: JSON.stringify(payload)
         });
         if (!response.ok) throw new Error('Falha ao salvar');
         const salvo = await response.json();
         router.push(pedidoParaEditar ? '/historico-pedidos' : `/historico-pedidos?highlight=${salvo.id}`);
      } catch (error) {
         console.error(error); alert('Erro ao salvar o pedido.');
      } finally {
         setIsLoading(false);
      }
   };

   return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="lg:col-span-1 space-y-4">
            <ClientCombobox selectedClientId={cliente?.id || null} onSelectClient={onSelectCliente} />
            <ProductInfoCard produto={produto} />
            <OrderSummaryCard ficha={fichaDoPedido} />
         </div>

         <div className="lg:col-span-2 space-y-6 flex flex-col">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
               <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-white">{optionGroupsConfig[0].name}</h3>
                  {produto.options.papel.map((option) => (<Button key={option.id} onClick={() => handleSelectOption('papel', option.id)} className={`w-full h-auto text-wrap py-3 justify-center text-center ${selections.papel === option.id ? 'bg-phalis-danger text-white hover:bg-red-700' : 'bg-phalis-gray text-white hover:bg-gray-700'}`}>{option.name}</Button>))}
               </div>
               <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-white">{optionGroupsConfig[1].name}</h3>
                  <div className="flex gap-2">
                     <SuffixInput id="largura" suffix="m" type="number" step="0.01" placeholder="Largura (m) *" value={largura} onChange={e => setLargura(e.target.value)} disabled={!selections.papel} className={`bg-phalis-gray border-0 flex-1 ${!selections.papel ? 'disabled:opacity-30' : ''}`} />
                     <SuffixInput id="altura" suffix="m" type="number" step="0.01" placeholder="Altura (m) *" value={altura} onChange={e => setAltura(e.target.value)} disabled={!selections.papel} className={`bg-phalis-gray border-0 flex-1 ${!selections.papel ? 'disabled:opacity-30' : ''}`} />
                  </div>
                  <div className="bg-phalis-black rounded-md p-3 text-white">Total m²: <span className="font-bold">{metrosQuadrados.toFixed(2)} m²</span></div>
               </div>
               <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-white">{optionGroupsConfig[2].name}</h3>
                  {produto.options.cores.map((option) => (<Button key={option.id} onClick={() => handleSelectOption('cores', option.id)} disabled={!selections.tamanho && !(largura && altura)} className={`w-full h-auto text-wrap py-3 justify-center text-center ${selections.cores === option.id ? 'bg-phalis-danger text-white hover:bg-red-700' : 'bg-phalis-gray text-white hover:bg-gray-700'} disabled:opacity-30`}>{option.name}</Button>))}
               </div>
               <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-white">{optionGroupsConfig[3].name}</h3>
                  {produto.options.acabamento.map((option) => (<Button key={option.id} onClick={() => handleSelectOption('acabamento', option.id)} disabled={!selections.cores} className={`w-full h-auto text-wrap py-3 justify-center text-center ${selections.acabamento === option.id ? 'bg-phalis-danger text-white hover:bg-red-700' : 'bg-phalis-gray text-white hover:bg-gray-700'} disabled:opacity-30`}>{option.name}</Button>))}
               </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-grow">
               <div className="lg:col-span-2">
                  <Textarea placeholder="Observações (Opcional)..." className="min-h-[150px] h-full bg-phalis-gray border-0 text-base" value={observacoes} onChange={(e) => setObservacoes(e.target.value)} />
               </div>

               {/* MUDANÇA AQUI: Inputs Financeiros com LABEL */}
               <div className="lg:col-span-1 space-y-4">
                  <div className="space-y-3 pt-2">
                     <h3 className="text-base font-medium text-white">Fluxo de Custo</h3>
                     <div className="space-y-1">
                        <Label className="text-gray-300 text-sm ml-1">Valor do m² de custo *</Label>
                        <MoneyInput value={m2Custo} onChange={e => setM2Custo(e.target.value)} />
                     </div>
                     <div className="bg-phalis-gray rounded-md p-3 text-white">Custo Total: <span className="font-bold">R$ {valorTotalCusto.toFixed(2)}</span></div>
                  </div>

                  <div className="space-y-3 pt-2">
                     <h3 className="text-base font-medium text-white">Venda</h3>
                     <div className="space-y-1">
                        <Label className="text-gray-300 text-sm ml-1">Valor do m² de venda *</Label>
                        <MoneyInput value={m2Venda} onChange={e => setM2Venda(e.target.value)} />
                     </div>
                     <div className="bg-phalis-gray rounded-md p-3 text-white">Venda Total: <span className="font-bold">R$ {valorTotalVenda.toFixed(2)}</span></div>
                  </div>

                  <div className="space-y-3 pt-2">
                     <h3 className="text-base font-medium text-white">Finalização</h3>
                     <div className="space-y-1">
                        <Label className="text-gray-300 text-sm ml-1">Valor Arte (Opcional)</Label>
                        <MoneyInput value={valorArte} onChange={e => setValorArte(e.target.value)} placeholder="0,00" />
                     </div>
                     <div className="space-y-1">
                        <Label className="text-gray-300 text-sm ml-1">Desconto (Opcional)</Label>
                        <MoneyInput value={desconto} onChange={e => setDesconto(e.target.value)} placeholder="0,00" />
                     </div>
                     <div className="space-y-1">
                        <Label className="text-gray-300 text-sm ml-1">Forma de Pagamento *</Label>
                        <Select value={pagamento || ""} onValueChange={setPagamento}>
                           <SelectTrigger className="bg-phalis-gray border-0"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                           <SelectContent className="bg-phalis-gray border-0">
                              <SelectItem value="nao_pago">Não Pago</SelectItem><SelectItem value="pago_50">Pago 50%</SelectItem><SelectItem value="pago">Pago</SelectItem>
                           </SelectContent>
                        </Select>
                     </div>
                  </div>
               </div>
            </div>
            <OrderFooter total={total} isValid={isBuilderCompleto && !!isPrecoCompleto && !!cliente} isLoading={isLoading} onConfirm={handleConcluir} labelTotal="TOTAL (Venda + Arte)" />
         </div>
      </div>
   );
};

// ==========================================================
// 3. FORMULÁRIO "SERVIÇO" (Atualizado com Labels)
// ==========================================================
interface FormularioServicoProps {
   produto: Product;
   cliente: Cliente | null;
   onSelectCliente: (cliente: Cliente | null) => void;
   pedidoParaEditar: Pedido | null;
}
const FormularioServico: React.FC<FormularioServicoProps> = ({ produto, cliente, onSelectCliente, pedidoParaEditar }) => {
   const router = useRouter();
   const [isLoading, setIsLoading] = useState(false);
   const { user } = useAuth();

   const [observacao, setObservacao] = useState('');
   const [valorVenda, setValorVenda] = useState('');
   const [desconto, setDesconto] = useState('');
   const [pagamento, setPagamento] = useState<string | null>(null);

   useEffect(() => {

      if (pedidoParaEditar && pedidoParaEditar.detalhes.type === 'servico') {
         const { detalhes } = pedidoParaEditar;
         setObservacao(detalhes.observacao || '');
         setValorVenda(detalhes.preco.valorVenda.toString());
         setDesconto(detalhes.preco.desconto?.toString() || '');
         setPagamento(pedidoParaEditar.statusFinanceiro);
      }
   }, [pedidoParaEditar]);

   const isFormCompleto = useMemo(() => observacao && valorVenda && pagamento && cliente, [observacao, valorVenda, pagamento, cliente]);
   const total = useMemo(() => Math.max(0, (Number(valorVenda) || 0) - (Number(desconto) || 0)), [valorVenda, desconto]);

   const handleConcluir = async () => {
      if (!isFormCompleto || !cliente) return;
      setIsLoading(true);
      const payload = {
         clientId: cliente.id,
         itemNome: produto.nome,
         itemImageUrl: produto.imageUrl,
         productId: produto.id,
         valor: total,
         statusFinanceiro: pagamento,
         detalhes: {
            type: 'servico',
            observacao: observacao,
            preco: { descricao: observacao, valorVenda: Number(valorVenda), desconto: Number(desconto), pagamento }
         }
      };
      try {
         const url = pedidoParaEditar ? `/api/pedidos/${pedidoParaEditar.id}` : '/api/pedidos';
         const method = pedidoParaEditar ? 'PUT' : 'POST';
         const response = await authenticatedFetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
         if (!response.ok) throw new Error('Falha ao salvar');
         const salvo = await response.json();
         router.push(pedidoParaEditar ? '/historico-pedidos' : `/historico-pedidos?highlight=${salvo.id}`);
      } catch (error) {
         console.error(error); alert('Erro ao salvar o pedido.');
      } finally {
         setIsLoading(false);
      }
   };

   return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="lg:col-span-1 space-y-4">
            <ClientCombobox selectedClientId={cliente?.id || null} onSelectClient={onSelectCliente} />
            <ProductInfoCard produto={produto} />
            <div className="bg-phalis-black p-4 rounded-lg space-y-2 min-h-[100px]">
               <h3 className="text-lg font-medium text-white">Ficha do Pedido:</h3>
               <p className="text-sm text-gray-500">Este produto não possui opções.</p>
            </div>
         </div>
         <div className="lg:col-span-2 space-y-6 flex flex-col">
            <div className="h-0 md:h-[76px]"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-grow">
               <div className="lg:col-span-2">
                  {/* MUDANÇA AQUI: Descrição com LABEL */}
                  <div className="space-y-1 h-full">
                     <Label className="text-gray-300 text-sm ml-1">Descrição / Observações da Arte *</Label>
                     <Textarea className="min-h-[200px] h-[calc(100%-24px)] bg-phalis-gray border-0 text-base" value={observacao} onChange={(e) => setObservacao(e.target.value)} />
                  </div>
               </div>

               {/* MUDANÇA AQUI: Finalização com LABEL */}
               <div className="lg:col-span-1 space-y-4">
                  <h3 className="text-base font-medium text-white">Finalização</h3>

                  <div className="space-y-1">
                     <Label className="text-gray-300 text-sm ml-1">Valor Total da Venda *</Label>
                     <MoneyInput value={valorVenda} onChange={(e) => setValorVenda(e.target.value)} />
                  </div>

                  <div className="space-y-1">
                     <Label className="text-gray-300 text-sm ml-1">Desconto (Opcional)</Label>
                     <MoneyInput value={desconto} onChange={e => setDesconto(e.target.value)} placeholder="0,00" />
                  </div>

                  <div className="space-y-1">
                     <Label className="text-gray-300 text-sm ml-1">Forma de Pagamento *</Label>
                     <Select value={pagamento || ""} onValueChange={setPagamento}>
                        <SelectTrigger className="bg-phalis-gray border-0"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                        <SelectContent className="bg-phalis-gray border-0">
                           <SelectItem value="nao_pago">Não Pago</SelectItem><SelectItem value="pago_50">Pago 50%</SelectItem><SelectItem value="pago">Pago</SelectItem>
                        </SelectContent>
                     </Select>
                  </div>

                  <div className="bg-phalis-black rounded-lg p-4 text-center"><span className="text-sm text-gray-400 block">TOTAL</span><span className="text-3xl font-bold text-white">R$ {total.toFixed(2)}</span></div>
               </div>
            </div>
            <div className="flex justify-end">
               <Button disabled={!isFormCompleto || isLoading} onClick={handleConcluir} className="w-full md:w-auto bg-phalis-action text-phalis-black font-bold text-lg py-6 px-8 hover:bg-phalis-action-hover disabled:opacity-50">
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
   const [pedidoParaEditar, setPedidoParaEditar] = useState<Pedido | null>(null);

   const produtoId = searchParams.get('id');
   const editPedidoId = searchParams.get('edit');

   useEffect(() => {
      setLoading(true); setProduto(null); setPedidoParaEditar(null); setSelectedClient(null);
      if (!produtoId) { setLoading(false); return; }

      // MUDANÇA: Buscar produto do BACKEND, não do arquivo local
      authenticatedFetch(`/api/produtos/${produtoId}`)
         .then(res => {
            if (!res.ok) throw new Error('Produto não encontrado');
            return res.json();
         })
         .then((produtoBackend: Product) => {
            setProduto(produtoBackend);

            // Se tiver editando pedido, busca os dados dele também
            if (editPedidoId) {
               // MUDANÇA: Usando authenticatedFetch
               authenticatedFetch(`/api/pedidos/${editPedidoId}`)
                  .then(res => res.json())
                  .then((pedidoData: Pedido) => {
                     setPedidoParaEditar(pedidoData);
                     setSelectedClient(pedidoData.cliente);
                  })
                  .catch(err => console.error("Erro ao buscar pedido:", err))
                  .finally(() => setLoading(false));
            } else {
               setLoading(false);
            }
         })
         .catch(err => {
            console.error("Erro ao buscar produto:", err);
            setLoading(false);
         });

   }, [produtoId, editPedidoId]);

   if (loading || !user) return <div className="flex justify-center items-center p-12"><Loader2 className="h-12 w-12 animate-spin text-phalis-action" /></div>;

   if (!produto) return (
      <div className="text-center text-gray-400">
         <p>Nenhum produto selecionado ou ID inválido.</p>
         <Button asChild className="mt-4 bg-phalis-nav hover:bg-phalis-nav-hover"><Link href="/catalogo">Ir para o Catálogo</Link></Button>
      </div>
   );

   switch (produto.pricingType) {
      case 'unidade':
         return <FormularioUnidade produto={produto as Product & { options: ProductOptions }} cliente={selectedClient} onSelectCliente={setSelectedClient} pedidoParaEditar={pedidoParaEditar} />;
      case 'metro':
         return <FormularioMetro produto={produto as Product & { options: ProductOptions }} cliente={selectedClient} onSelectCliente={setSelectedClient} pedidoParaEditar={pedidoParaEditar} />;
      case 'servico':
         return <FormularioServico produto={produto} cliente={selectedClient} onSelectCliente={setSelectedClient} pedidoParaEditar={pedidoParaEditar} />;
      default:
         return <div>Tipo de produto desconhecido.</div>;
   }
}