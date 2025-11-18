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
import { type Pedido } from '@/lib/orderData';
import { type Cliente, MOCK_CLIENTS } from '@/lib/clientData'; // 1. MUDANÇA: Importar MOCK_CLIENTS
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

// ... (Tipos Selections, PrecoItem, PrecoData - Sem mudanças)
type Selections = Record<typeof optionGroupsConfig[number]['id'], string | null>;
type PrecoItem = { qtd: number; preco: number; };
type PrecoData = {
   nomeProduto: string;
   qtdMinima: number;
   precoMinimo: number;
   precos: PrecoItem[];
};

// ==========================================================
// 1. FORMULÁRIO "UNIDADE"
// ==========================================================
interface FormularioUnidadeProps {
   produto: Product & { options: ProductOptions };
   cliente: Cliente | null;
   onSelectCliente: (cliente: Cliente | null) => void;
   pedidoParaEditar: Pedido | null; // 2. MUDANÇA: Recebe o pedido para editar
}

const FormularioUnidade: React.FC<FormularioUnidadeProps> = ({ produto, cliente, onSelectCliente, pedidoParaEditar }) => {
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

   const [isPrecoLoading, setIsPrecoLoading] = useState(false);
   const [precoData, setPrecoData] = useState<PrecoData | null>(null);
   const [selectedQtd, setSelectedQtd] = useState<number | null>(null);

   const autoPersonalizado = useMemo(() => produto.options.tamanho.length === 0, [produto]);

   // 3. MUDANÇA: useEffect agora preenche o formulário se 'pedidoParaEditar' existir
   useEffect(() => {
      if (pedidoParaEditar && pedidoParaEditar.detalhes.type === 'unidade') {
         const { detalhes } = pedidoParaEditar;
         setSelections(detalhes.opcoes);
         setObservacao(detalhes.preco.observacao || ''); // (Precisamos adicionar 'observacao' ao tipo)
         setQuantidade(detalhes.preco.quantidade.toString());
         setPrecoCusto(detalhes.preco.precoCusto.toString());
         setPrecoVenda(detalhes.preco.precoVenda.toString());
         setPrecoArte(detalhes.preco.precoArte.toString());
         setPagamento(pedidoParaEditar.statusFinanceiro);

         if (detalhes.dimensoesPersonalizadas) {
            setIsPersonalizado(true);
            setLarguraCm(detalhes.dimensoesPersonalizadas.larguraCm);
            setAlturaCm(detalhes.dimensoesPersonalizadas.alturaCm);
         } else {
            setIsPersonalizado(autoPersonalizado);
         }
      } else {
         // Lógica de reset (quando não está editando)
         setIsPersonalizado(autoPersonalizado);
         setLarguraCm('');
         setAlturaCm('');
         setSelections({
            papel: null,
            tamanho: autoPersonalizado ? 'personalizado' : null,
            cores: null,
            acabamento: null,
         });
         setPrecoData(null);
         setSelectedQtd(null);
      }
   }, [produto, autoPersonalizado, pedidoParaEditar]); // <--- Dependências atualizadas

   // ... (handleSelectOption, handlePersonalizadoClick - Sem mudanças)
   const handleSelectOption = (clickedGroupId: keyof Selections, optionId: string) => {
      // Se o usuário clicar no botão que já está selecionado, não faz nada.
      if (selections[clickedGroupId] === optionId) return;

      // Se o usuário clicar em um botão de tamanho padrão,
      // desativa o modo "Personalizado".
      if (clickedGroupId === 'tamanho') {
         setIsPersonalizado(false);
      }

      // Cria uma cópia do estado de seleção atual
      const newSelections: Selections = { ...selections };

      // Encontra o índice da coluna que foi clicada (ex: "papel" é 0, "tamanho" é 1)
      const clickedIndex = optionGroupsConfig.findIndex(group => group.id === clickedGroupId);

      // Define a nova seleção
      newSelections[clickedGroupId] = optionId;

      // "Lógica de Cascata": Reseta todas as colunas *seguintes*
      for (let i = clickedIndex + 1; i < optionGroupsConfig.length; i++) {
         const groupIdToReset = optionGroupsConfig[i].id;

         // (O BUG QUE CORRIGIMOS): Se o produto for "autoPersonalizado"
         // e a coluna a ser resetada for "tamanho", ele pula o reset.
         if (autoPersonalizado && groupIdToReset === 'tamanho') {
            continue;
         }

         // Reseta a seleção da coluna seguinte para 'null'
         newSelections[groupIdToReset] = null;
      }

      // Atualiza o estado com as novas seleções
      setSelections(newSelections);
   };

   const handlePersonalizadoClick = () => {
      // Se o modo "Personalizado" já estiver ativo, não faz nada.
      if (selections.tamanho === 'personalizado') return;

      // Ativa o modo "Personalizado", mostrando os inputs de Largura/Altura
      setIsPersonalizado(true);

      // Atualiza o estado de seleção para:
      // 1. Marcar "tamanho" como "personalizado" (para o botão ficar vermelho)
      // 2. Resetar as colunas seguintes ("cores" e "acabamento")
      setSelections(prev => ({
         ...prev,
         tamanho: 'personalizado',
         cores: null,
         acabamento: null,
      }));
   };

   const fichaDoPedido = useMemo(() => {
      // ... (lógica da ficha - sem mudança)
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
         return {
            label: String(index + 1).padStart(2, '0'),
            value: selectedValue
         };
      });
   }, [produto, selections, isPersonalizado, larguraCm, alturaCm]);

   // ... (Cálculos de Preço - sem mudança)
   const custoTotal = useMemo(() => (Number(precoCusto) || 0), [precoCusto]);
   const vendaTotal = useMemo(() => (Number(precoVenda) || 0), [precoVenda]);
   const total = useMemo(() => vendaTotal + (Number(precoArte) || 0), [vendaTotal, precoArte]);

   // ... (Validação - sem mudança)
   const isTamanhoCompleto = useMemo(() => {
      // Se nenhuma seleção de tamanho foi feita (nem padrão, nem personalizado)
      if (!selections.tamanho) {
         return false;
      }
      // Se for personalizado (seja por clique ou automático)
      if (selections.tamanho === 'personalizado') {
         // Exige que largura E altura estejam preenchidos
         return !!(larguraCm && alturaCm);
      }
      // Se for um tamanho padrão (ex: "9.1x5.1cm"), é válido
      return true;
   }, [selections.tamanho, larguraCm, alturaCm]);

   const isBuilderCompleto = useMemo(() => {
      const othersComplete = !!(selections.papel && selections.cores && selections.acabamento);

      // Retorna true apenas se as colunas 1, 3, 4 E a lógica de tamanho (2)
      // estiverem completas.
      return othersComplete && isTamanhoCompleto;
   }, [selections, isTamanhoCompleto]);
   const isPrecoCompleto = useMemo(() => (Number(quantidade) || 0) > 0 && precoCusto && precoVenda && pagamento, [quantidade, precoCusto, precoVenda, pagamento]);

   // ... (Consulta de Preço - sem mudança)
   const handleConsultarPreco = async () => {
      if (!isBuilderCompleto) return;
      setIsPrecoLoading(true);
      setPrecoData(null);
      setSelectedQtd(null);

      // Encontra os Nomes (labels) das seleções para enviar
      const papelName = produto.options.papel.find(o => o.id === selections.papel)?.name;
      const tamanhoName = isPersonalizado
         ? `Personalizado ${larguraCm}x${alturaCm}cm`
         : produto.options.tamanho.find(o => o.id === selections.tamanho)?.name;

      const coresName = produto.options.cores.find(o => o.id === selections.cores)?.name;
      const acabamentoName = produto.options.acabamento.find(o => o.id === selections.acabamento)?.name;

      const payload = {
         papel: papelName,
         tamanho: tamanhoName,
         cores: coresName,
         acabamento: acabamentoName
      };

      try {
         const response = await fetch(`http://localhost:8030/consultar-preco/${produto.nome}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
         });

         if (!response.ok) throw new Error('API de preço falhou');

         const data: PrecoData = await response.json();
         setPrecoData(data);

         // Preenche os campos de Custo e Quantidade com o valor mínimo
         setPrecoCusto(data.precoMinimo.toFixed(2));
         setQuantidade(data.qtdMinima.toString());
         setSelectedQtd(data.qtdMinima); // Destaca a linha na tabela

      } catch (error) {
         console.error("Erro ao consultar preço:", error);
         // (Idealmente, mostrar um toast/alerta de erro aqui)
      } finally {
         setIsPrecoLoading(false);
      }
   };


   // ==========================================================
   // 4. handlePrecoClick
   // (Preenche o formulário ao clicar na linha da tabela)
   // ==========================================================
   const handlePrecoClick = (item: PrecoItem) => {
      setQuantidade(item.qtd.toString());
      setPrecoCusto(item.preco.toFixed(2)); // Preenche o Custo
      setPrecoVenda(''); // Limpa a Venda (para o usuário digitar)
      setSelectedQtd(item.qtd); // Destaca a nova linha
   };

   // 4. MUDANÇA: handleConcluir agora faz PUT
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
         const url = pedidoParaEditar ? `/api/pedidos/${pedidoParaEditar.id}` : '/api/pedidos';
         const method = pedidoParaEditar ? 'PUT' : 'POST';

         const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
         });
         if (!response.ok) throw new Error('Falha ao salvar o pedido');

         const salvo = await response.json();

         // Se estava editando, volta para o histórico. Se criou, destaca.
         if (pedidoParaEditar) {
            router.push('/historico-pedidos');
         } else {
            router.push(`/historico-pedidos?highlight=${salvo.id}`);
         }
      } catch (error) {
         console.error(error);
         alert('Erro ao salvar o pedido. Tente novamente.');
      } finally {
         setIsLoading(false);
      }
   };

   return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* ... (JSX da Coluna Esquerda - sem mudança) ... */}
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
            {produto.consultaPreco && !pedidoParaEditar && ( // <-- Não mostra em modo de edição
               <>
                  <Button
                     type="button"
                     onClick={handleConsultarPreco}
                     disabled={!isBuilderCompleto || isPrecoLoading}
                     className="w-full bg-phalis-nav hover:bg-phalis-nav-hover disabled:opacity-50"
                  >
                     {isPrecoLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                     ) : (
                        <Search className="mr-2 h-4 w-4" />
                     )}
                     Consultar Preço
                  </Button>
                  {isPrecoLoading && (
                     <div className="flex justify-center items-center p-4">
                        <Loader2 className="h-6 w-6 animate-spin text-phalis-action" />
                     </div>
                  )}
                  {precoData && (
                     <div className="bg-phalis-black rounded-md p-3 max-h-96 overflow-y-auto animate-in fade-in duration-300">
                        <h4 className="text-sm font-medium text-white mb-2">Preços - {precoData.nomeProduto}</h4>
                        <Table className="text-white">
                           <TableHeader>
                              <TableRow>
                                 <TableHead className="text-white">Qtd</TableHead>
                                 <TableHead className="text-white text-right">Preço</TableHead>
                              </TableRow>
                           </TableHeader>
                           <TableBody>
                              {precoData.precos.map((item) => (
                                 <TableRow
                                    key={item.qtd}
                                    className={cn(
                                       "cursor-pointer hover:bg-phalis-gray/50",
                                       selectedQtd === item.qtd && "bg-phalis-action/30"
                                    )}
                                    onClick={() => handlePrecoClick(item)}
                                 >
                                    <TableCell>{item.qtd}</TableCell>
                                    <TableCell className="text-right">R$ {item.preco.toFixed(2)}</TableCell>
                                 </TableRow>
                              ))}
                           </TableBody>
                        </Table>
                     </div>
                  )}
               </>
            )}
         </div>

         {/* ... (JSX da Coluna Direita - sem mudança) ... */}
         <div className="lg:col-span-2 space-y-6 flex flex-col">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
               {/* Coluna 01: Papel */}
               <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-white">{optionGroupsConfig[0].name}</h3>

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
               {/* Coluna 02: Tamanho */}
               <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-white">{optionGroupsConfig[1].name}</h3>

                  {produto.options.tamanho.length > 0 && (
                     produto.options.tamanho.map((option) => {
                        const isSelected = selections.tamanho === option.id;
                        return (
                           <Button
                              key={option.id}
                              onClick={() => handleSelectOption('tamanho', option.id)}
                              disabled={!selections.papel}
                              className={`w-full h-auto text-wrap py-3 justify-center text-center ${isSelected ? 'bg-phalis-danger text-white hover:bg-red-700' : 'bg-phalis-gray text-white hover:bg-gray-700'} disabled:opacity-30`}
                           >
                              {option.name}
                           </Button>
                        );
                     })
                  )}

                  {produto.options.tamanho.length > 0 && (
                     <Button
                        onClick={handlePersonalizadoClick}
                        disabled={!selections.papel}
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

                  {produto.options.cores.map((option) => {
                     const isSelected = selections.cores === option.id;
                     const isEnabled = isTamanhoCompleto;
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
                     value={observacao}
                     onChange={(e) => setObservacao(e.target.value)}
                  />
               </div>
               <div className="lg:col-span-1 space-y-3">
                  <h3 className="text-base font-medium text-white pt-2">Fluxo de Custo</h3>
                  <Input type="number" placeholder="Quantidade *" value={quantidade} onChange={e => setQuantidade(e.target.value)} className="bg-phalis-gray border-0" min={1} />
                  <MoneyInput placeholder="Preço Custo Total *" value={precoCusto} onChange={e => setPrecoCusto(e.target.value)} />
                  <div className="bg-phalis-gray rounded-md p-3 text-white">Custo Total: <span className="font-bold">R$ {custoTotal.toFixed(2)}</span></div>
                  <h3 className="text-base font-medium text-white pt-4">Fluxo de Venda</h3>
                  <MoneyInput placeholder="Preço Venda Total *" value={precoVenda} onChange={e => setPrecoVenda(e.target.value)} />
                  <div className="bg-phalis-gray rounded-md p-3 text-white">Venda Total: <span className="font-bold">R$ {vendaTotal.toFixed(2)}</span></div>
                  <h3 className="text-base font-medium text-white pt-4">Finalização</h3>
                  <MoneyInput placeholder="Preço Arte (Opcional)" value={precoArte} onChange={e => setPrecoArte(e.target.value)} />
                  <Select value={pagamento || ""} onValueChange={setPagamento}>
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
// 2. FORMULÁRIO "METRO" (M²) (COM MUDANÇA)
// ==========================================================
interface FormularioMetroProps {
   produto: Product & { options: ProductOptions };
   cliente: Cliente | null;
   onSelectCliente: (cliente: Cliente | null) => void;
   pedidoParaEditar: Pedido | null; // 2. MUDANÇA: Recebe o pedido para editar
}

const FormularioMetro: React.FC<FormularioMetroProps> = ({ produto, cliente, onSelectCliente, pedidoParaEditar }) => {
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

   const autoPersonalizado = useMemo(() => produto.options.tamanho.length === 0, [produto]);

   // 3. MUDANÇA: useEffect agora preenche o formulário
   useEffect(() => {
      if (pedidoParaEditar && pedidoParaEditar.detalhes.type === 'metro') {
         const { detalhes } = pedidoParaEditar;
         setSelections(detalhes.opcoes);
         setObservacoes(detalhes.preco.observacao || '');
         setLargura(detalhes.preco.largura.toString());
         setAltura(detalhes.preco.altura.toString());
         setM2Custo(detalhes.preco.m2Custo.toString());
         setM2Venda(detalhes.preco.m2Venda.toString());
         setValorArte(detalhes.preco.valorArte.toString());
         setPagamento(pedidoParaEditar.statusFinanceiro);
      } else {
         setSelections({
            papel: null,
            tamanho: autoPersonalizado ? 'personalizado' : null,
            cores: null,
            acabamento: null,
         });
         setLargura('');
         setAltura('');
         // Seta os valores padrão
         setM2Custo(produto.defaultM2Custo?.toString() || '');
         setM2Venda(produto.defaultM2Venda?.toString() || '');
      }
   }, [produto, autoPersonalizado, pedidoParaEditar]);

   const handleSelectOption = (clickedGroupId: keyof Selections, optionId: string) => {
      // ... (lógica de cascata - sem mudança)
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
      // ... (lógica da ficha - sem mudança)
      return optionGroupsConfig.map((groupConfig, index) => {
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
      const othersComplete = !!(selections.papel && selections.cores && selections.acabamento);
      if (!othersComplete) return false;
      if (selections.tamanho === 'personalizado') {
         return !!(largura && altura);
      }
      return false;
   }, [selections, largura, altura]);

   const isPrecoCompleto = useMemo(() => m2Custo && m2Venda && pagamento, [m2Custo, m2Venda, pagamento]);

   // 4. MUDANÇA: handleConcluir agora faz PUT
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
         const url = pedidoParaEditar ? `/api/pedidos/${pedidoParaEditar.id}` : '/api/pedidos';
         const method = pedidoParaEditar ? 'PUT' : 'POST';

         const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
         });
         if (!response.ok) throw new Error('Falha ao salvar o pedido');

         const salvo = await response.json();

         if (pedidoParaEditar) {
            router.push('/historico-pedidos');
         } else {
            router.push(`/historico-pedidos?highlight=${salvo.id}`);
         }
      } catch (error) {
         console.error(error);
         alert('Erro ao salvar o pedido. Tente novamente.');
      } finally {
         setIsLoading(false);
      }
   };

   return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* ... (Coluna Esquerda - sem mudança) ... */}
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

         {/* ... (Coluna Direita - sem mudança de layout) ... */}
         <div className="lg:col-span-2 space-y-6 flex flex-col">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
               <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-white">{optionGroupsConfig[0].name}</h3>

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
                  <Select value={pagamento || ""} onValueChange={setPagamento}>
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
// 3. FORMULÁRIO "ARTE" (COM MUDANÇA)
// ==========================================================
interface FormularioArteProps {
   produto: Product;
   cliente: Cliente | null;
   onSelectCliente: (cliente: Cliente | null) => void;
   pedidoParaEditar: Pedido | null; // 2. MUDANÇA: Recebe o pedido para editar
}
const FormularioArte: React.FC<FormularioArteProps> = ({ produto, cliente, onSelectCliente, pedidoParaEditar }) => {
   const router = useRouter();
   const [isLoading, setIsLoading] = useState(false);
   const { user } = useAuth();

   const [observacao, setObservacao] = useState('');
   const [valorVenda, setValorVenda] = useState('');
   const [pagamento, setPagamento] = useState<string | null>(null);

   // 3. MUDANÇA: useEffect agora preenche o formulário
   useEffect(() => {
      if (pedidoParaEditar && pedidoParaEditar.detalhes.type === 'arte') {
         const { detalhes } = pedidoParaEditar;
         setObservacao(detalhes.preco.observacao || '');
         setValorVenda(detalhes.preco.valorVenda.toString());
         setPagamento(pedidoParaEditar.statusFinanceiro);
      }
   }, [pedidoParaEditar]);

   const isFormCompleto = useMemo(() => observacao && valorVenda && pagamento && cliente, [observacao, valorVenda, pagamento, cliente]);
   const total = useMemo(() => Number(valorVenda) || 0, [valorVenda]);

   // 4. MUDANÇA: handleConcluir agora faz PUT
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
         const url = pedidoParaEditar ? `/api/pedidos/${pedidoParaEditar.id}` : '/api/pedidos';
         const method = pedidoParaEditar ? 'PUT' : 'POST';

         const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
         });
         if (!response.ok) throw new Error('Falha ao salvar o pedido');

         const salvo = await response.json();

         if (pedidoParaEditar) {
            router.push('/historico-pedidos');
         } else {
            router.push(`/historico-pedidos?highlight=${salvo.id}`);
         }
      } catch (error) {
         console.error(error);
         alert('Erro ao salvar o pedido. Tente novamente.');
      } finally {
         setIsLoading(false);
      }
   };

   return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* ... (Coluna Esquerda - sem mudança) ... */}
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
         {/* ... (Coluna Direita - sem mudança) ... */}
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
                  <Select value={pagamento || ""} onValueChange={setPagamento}>
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
// PÁGINA PRINCIPAL (ROTEADOR) (COM MUDANÇA)
// ==========================================================
export default function PedidosPage() {

   const [produto, setProduto] = useState<Product | null>(null);
   const [loading, setLoading] = useState(true);
   const searchParams = useSearchParams();
   const [selectedClient, setSelectedClient] = useState<Cliente | null>(null);
   const { user } = useAuth();

   // 5. MUDANÇA: Estado para guardar o pedido a ser editado
   const [pedidoParaEditar, setPedidoParaEditar] = useState<Pedido | null>(null);

   const produtoId = searchParams.get('id');
   const editPedidoId = searchParams.get('edit');

   useEffect(() => {
      setLoading(true);
      setProduto(null);
      setPedidoParaEditar(null);
      setSelectedClient(null);

      if (!produtoId) {
         setLoading(false);
         return;
      }

      // 1. Busca o Produto (ex: "Lona")
      const produtoEncontrado = getProductById(produtoId);
      if (!produtoEncontrado) {
         setLoading(false);
         return;
      }
      setProduto(produtoEncontrado);

      // 2. Se for modo de EDIÇÃO, busca o Pedido
      if (editPedidoId) {
         fetch(`/api/pedidos/${editPedidoId}`)
            .then(res => res.json())
            .then((pedidoData: Pedido) => {
               setPedidoParaEditar(pedidoData);
               // Pré-seleciona o cliente do pedido
               setSelectedClient(pedidoData.cliente);
               setLoading(false);
            })
            .catch(err => {
               console.error("Erro ao buscar pedido para edição:", err);
               setLoading(false);
            });
      } else {
         // 3. Se for modo de CRIAÇÃO, apenas carrega o produto
         // (e busca um cliente padrão, se necessário - lógica futura)
         setLoading(false);
      }
   }, [produtoId, editPedidoId]); // Roda quando 'id' ou 'edit' mudam

   if (loading || !user) {
      return (
         <div className="flex justify-center items-center p-12">
            <Loader2 className="h-12 w-12 animate-spin text-phalis-action" />
         </div>
      );
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
         {
            console.log('Renderizando FormularioUnidade com pedidoParaEditar:', pedidoParaEditar);
            console.log('Produto:', produto);

         }
         return <FormularioUnidade
            produto={produto as Product & { options: ProductOptions }}
            cliente={selectedClient}
            onSelectCliente={setSelectedClient}
            pedidoParaEditar={pedidoParaEditar}
         />;
      case 'metro':
         {
            console.log('Renderizando FormularioMetro com pedidoParaEditar:', pedidoParaEditar);
            console.log('Produto:', produto);
         }
         return <FormularioMetro
            produto={produto as Product & { options: ProductOptions }}
            cliente={selectedClient}
            onSelectCliente={setSelectedClient}
            pedidoParaEditar={pedidoParaEditar}
         />;
      case 'arte':
         {
            console.log('Renderizando FormularioArte com pedidoParaEditar:', pedidoParaEditar);
            console.log('Produto:', produto);
         }
         return <FormularioArte
            produto={produto}
            cliente={selectedClient}
            onSelectCliente={setSelectedClient}
            pedidoParaEditar={pedidoParaEditar}
         />;
      default:
         return <div>Tipo de produto desconhecido.</div>;
   }
}