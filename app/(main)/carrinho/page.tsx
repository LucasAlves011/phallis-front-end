'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useCart, type CartItem } from '@/lib/cartStore';
import { type Cliente } from '@/types/client';
import { ClientCombobox } from '@/components/clientes/ClientCombobox';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from "@/components/ui/select";
import { authenticatedFetch } from '@/lib/api';
import { useAuth } from '@/lib/auth/AuthContext';
import { Loader2, Trash2, ShoppingCart, Plus, Pencil, AlertTriangle, Wallet, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
   AlertDialog,
   AlertDialogCancel,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogHeader,
   AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// ==============================
// Componente de cada item do carrinho
// ==============================
const CartItemCard = ({ item, onRemove, onEdit }: { item: CartItem; onRemove: (id: string) => void; onEdit: (item: CartItem) => void }) => {
   const detalhes = item.detalhes as any;
   const type = (detalhes?.type as string)?.toUpperCase() || '';
   const preco = (detalhes?.preco as any) || {};
   const opcoes = detalhes?.opcoes as Record<string, string>;

   const renderOpcoes = () => {
      const opcaoNomes = detalhes?.opcaoNomes as Record<string, string>;
      if (opcaoNomes) {
         const texts = Object.values(opcaoNomes).filter(Boolean);
         if (texts.length === 0) return null;
         return <p className="text-[13px] text-gray-300 font-semibold mt-1">{texts.join(' • ')}</p>;
      }
      if (!opcoes) return null;
      const selectTexts = Object.entries(opcoes).filter(([_, val]) => val && val !== 'personalizado').map(([_, val]) => val);
      if (selectTexts.length === 0) return null;
      return <p className="text-[13px] text-gray-300 font-semibold mt-1">{selectTexts.join(' • ')}</p>;
   };

   return (
      <div className="bg-phalis-black/40 rounded-lg p-4 group border border-gray-800 hover:border-phalis-action/20 transition-all shadow-md">
         <div className="flex flex-col sm:flex-row gap-5">
            {/* Imagem e Informações Principais */}
            <div className="flex flex-1 gap-4 min-w-0">
               <div className="h-16 w-16 rounded overflow-hidden bg-black flex-shrink-0 relative border border-white/5 self-center">
                  <Image src={item.itemImageUrl || "https://placehold.co/100x100?text=Sem+Foto"} alt={item.itemNome} fill className="object-cover" />
               </div>
               <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <div>
                     <h3 className="text-white font-bold text-base leading-tight truncate">{item.itemNome}</h3>
                     {renderOpcoes()}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-[11px]">
                     <div className="flex gap-1"><span className="text-gray-500">Custo:</span><span className="text-red-400 font-medium">R$ {(Number(preco.valorTotalCusto || preco.custoTotal || preco.precoCusto || preco.valorCusto || preco.m2Custo || 0)).toFixed(2)}</span></div>
                     <div className="flex gap-1"><span className="text-gray-500">Arte:</span><span className="text-blue-400 font-medium">R$ {(Number(preco.precoArte || preco.valorArte || 0)).toFixed(2)}</span></div>
                     <div className="flex gap-1"><span className="text-gray-500">Desc.:</span><span className="text-yellow-500 font-medium">R$ {(Number(preco.desconto || 0)).toFixed(2)}</span></div>
                      <div className="flex gap-1 text-gray-400 font-medium sm:pl-3 sm:border-l border-white/10">
                         {type === 'UNIDADE' && `Qtd: ${preco.quantidade}`}
                         {type === 'METRO' && `Dim: ${preco.largura}x${preco.altura}m`}
                         {type === 'SERVICO' && `Serviço`}
                         <span className="ml-2 text-phalis-action">Lucro: R$ {(item.valor - Number(preco.valorTotalCusto || preco.custoTotal || preco.precoCusto || preco.valorCusto || preco.m2Custo || 0)).toFixed(2)}</span>
                      </div>
                  </div>
               </div>
            </div>

            {/* Preço e Botões de Ação */}
            <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:min-w-[140px] pt-4 sm:pt-0 border-t sm:border-t-0 sm:border-l border-white/5">
               <div className="text-left sm:text-right">
                  <p className="text-white font-bold text-xl leading-none">R$ {item.valor.toFixed(2)}</p>
                  <p className="text-[9px] text-phalis-action font-black uppercase tracking-widest mt-1.5">{type}</p>
               </div>
               <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="h-8 px-2.5 text-gray-400 hover:text-white hover:bg-white/5 text-xs gap-1.5 font-semibold" onClick={() => onEdit(item)}>
                     <Pencil className="h-3.5 w-3.5" /> <span className="hidden xs:inline">Editar</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 px-2.5 text-gray-500 hover:text-red-400 hover:bg-red-400/5 text-xs gap-1.5 font-semibold" onClick={() => onRemove(item.id)}>
                     <Trash2 className="h-3.5 w-3.5" /> <span className="hidden xs:inline">Excluir</span>
                  </Button>
               </div>
            </div>
         </div>
      </div>
   );
};

// ==============================
// Página principal do Carrinho
// ==============================
export default function CarrinhoPage() {
   const { itens, removeItem, clearCart, valorTotal, editingOrder, selectedClient, setSelectedClient, origemOrcamento } = useCart();
   const [cliente, setCliente] = useState<Cliente | null>(selectedClient);
   const [pagamento, setPagamento] = useState<string | null>(null);
   const [formaPagamento, setFormaPagamento] = useState<string | null>(null);
   const [isLoading, setIsLoading] = useState(false);
   const [isClienteAvulsoModalOpen, setIsClienteAvulsoModalOpen] = useState(false);
   const [isConfirmNovoOrcamentoOpen, setIsConfirmNovoOrcamentoOpen] = useState(false);
   const [isConfirmCancelarAnteriorOpen, setIsConfirmCancelarAnteriorOpen] = useState(false);
   const router = useRouter();
   const { user } = useAuth();

   const isEditMode = !!editingOrder;
   const totalPagoAnterior = editingOrder?.totalPago ?? 0;
   const diferenca = isEditMode ? (totalPagoAnterior - valorTotal) : 0;
   const geraCredito = diferenca > 0;
   const geraDebitoExtra = diferenca < 0;

   useEffect(() => {
      if (selectedClient) {
         setCliente(selectedClient);
      }
   }, [selectedClient]);

   const handleSelectCliente = (c: Cliente | null) => {
      setCliente(c);
      setSelectedClient(c);
   };

   const isFormCompleto = isEditMode
      ? itens.length > 0
      : itens.length > 0 && !!cliente && !!pagamento && (pagamento === 'PENDENTE' || !!formaPagamento);

   const buildItensPayload = () => itens.map(item => {
      const det = item.detalhes as any;
      const preco = det?.preco || {};
      const type = (det?.type || 'UNIDADE').toLowerCase();
      return {
         productId: item.productId,
         valor: item.valor,
         tipoPrecificacao: type.toUpperCase(),
         valorCusto: type === 'unidade' ? preco.precoCusto : (type === 'metro' ? preco.m2Custo : null),
         valorArte: preco.valorArte || preco.precoArte || 0,
         valorVenda: type === 'unidade' ? preco.precoVenda : (type === 'metro' ? preco.m2Venda : preco.valorVenda),
         valorDesconto: preco.desconto || 0,
         quantidade: type === 'unidade' ? preco.quantidade : null,
         largura: type === 'metro' ? preco.largura : null,
         altura: type === 'metro' ? preco.altura : null,
         observacao: det?.observacao || null,
         opcoes: det?.opcoes || null,
      };
   });

   const handleFinalizar = async () => {
      if (!isFormCompleto || !user) return;
      setIsLoading(true);
      try {
         if (isEditMode && editingOrder) {
            const payload = { clientId: editingOrder.cliente.id, total: valorTotal, itens: buildItensPayload() };
            const response = await authenticatedFetch(`/api/pedidos/${editingOrder.id}`, { method: 'PUT', body: JSON.stringify(payload) });
            if (!response.ok) throw new Error('Falha ao atualizar pedido');
            const salvo = await response.json();
            clearCart();
            router.push(`/historico-pedidos?highlight=${salvo.id}`);
         } else {
            if (!cliente) return;
            const payload = {
               clientId: cliente.id,
               statusFinanceiro: pagamento,
               formaPagamento: pagamento === 'PENDENTE' ? null : formaPagamento,
               total: valorTotal,
               itens: buildItensPayload(),
               orcamentoId: origemOrcamento?.id || null,
            };
            const response = await authenticatedFetch('/api/pedidos', { method: 'POST', body: JSON.stringify(payload) });
            if (!response.ok) throw new Error('Falha ao criar pedido');
            const salvo = await response.json();
            clearCart();
            router.push(`/historico-pedidos?highlight=${salvo.id}`);
         }
      } catch (error) {
         console.error(error);
         alert('Erro ao finalizar pedido.');
      } finally {
         setIsLoading(false);
      }
   };

   // Helper para converter imagem local para DataURL
   const carregarImagemComoDataURL = async (url: string): Promise<string> => {
      try {
         const response = await fetch(url);
         const blob = await response.blob();
         return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
         });
      } catch (error) {
         console.error("Erro ao carregar imagem:", url, error);
         throw error;
      }
   };

   const handleGerarOrcamentoClick = () => {
      if (!cliente) {
         setIsClienteAvulsoModalOpen(true);
         return;
      }
      prosseguirFluxoOrcamento();
   };

   const prosseguirFluxoOrcamento = () => {
      if (origemOrcamento) {
         setIsConfirmNovoOrcamentoOpen(true);
      } else {
         executarGeracaoPDF(false);
      }
   };

   const executarGeracaoPDF = async (cancelarAnterior: boolean = false) => {
      if (itens.length === 0) return;
      setIsLoading(true);

      try {
         // 0. Salva o orçamento no backend para gerar o código visual único e auditoria (e marcar o anterior como substituído se aplicável)
         let codigoVisual = '';
         let savedOrcamentoId: number | null = null;
         try {
            const payload = {
               clientId: cliente?.id || null,
               total: valorTotal,
               itens: buildItensPayload(),
               substituiOrcamentoId: (cancelarAnterior && origemOrcamento) ? origemOrcamento.id : null,
            };
            const response = await authenticatedFetch('/api/orcamentos', {
               method: 'POST',
               body: JSON.stringify(payload),
            });

            if (response.ok) {
               const orcamentoSalvo = await response.json();
               codigoVisual = orcamentoSalvo.codigoVisual || '';
               savedOrcamentoId = orcamentoSalvo.id || null;
            }
         } catch (apiErr) {
            console.warn('Não foi possível registrar o orçamento no servidor:', apiErr);
         }

         const doc = new jsPDF();
         const pageWidth = doc.internal.pageSize.getWidth();
         const pageHeight = doc.internal.pageSize.getHeight();

         // 1. Carrega as imagens de fundo
         const bgPag1 = await carregarImagemComoDataURL('/bg-pag1.png');
         const bgPag2 = await carregarImagemComoDataURL('/bg-pag2.png');

         // 2. Adiciona o background na primeira página (já criada pelo new jsPDF)
         doc.addImage(bgPag1, 'PNG', 0, 0, pageWidth, pageHeight);

         // 3. Monkey-patch na função addPage para que toda nova página (criada pelo autoTable) receba o background 2.
         const originalAddPage = doc.addPage.bind(doc);
         doc.addPage = function () {
            originalAddPage();
            // Sempre que uma nova página for criada, injetamos a imagem da página 2
            this.addImage(bgPag2, 'PNG', 0, 0, pageWidth, pageHeight);
            return this;
         };

         // 4. Desenha as informações do Cliente
         // Ajustamos o Y inicial para 75 para descer o bloco e não sobrepor a arte do papel timbrado
         let currentY = 75; 
         doc.setFont("helvetica", "bold");
         doc.setFontSize(11);
         doc.setTextColor(0, 0, 0);

         // Código do Orçamento
         if (codigoVisual) {
            doc.text(`Orçamento Nº: ${codigoVisual}`, 14, currentY);
            currentY += 5;
         }
         
         if (cliente) {
            doc.text(`Cliente: ${cliente.nome}`, 14, currentY);
            currentY += 5;
            doc.setFont("helvetica", "normal");
            
            if (cliente.telefone1) {
               doc.text(`Telefone: ${cliente.telefone1}`, 14, currentY);
               currentY += 5;
            }
            if (cliente.email) {
               doc.text(`Email: ${cliente.email}`, 14, currentY);
               currentY += 5;
            }
            if (cliente.cpfCnpj) {
               doc.text(`CPF/CNPJ: ${cliente.cpfCnpj}`, 14, currentY);
               currentY += 5;
            }
         } else {
            doc.text(`Cliente: Não Informado (Orçamento Avulso)`, 14, currentY);
            currentY += 5;
         }

         currentY += 2;
         doc.setFont("helvetica", "italic");
         doc.setFontSize(9);
         doc.text(`Emitido em: ${new Date().toLocaleString('pt-BR')} por ${user?.nome || 'Atendente'}`, 14, currentY);
         
         currentY += 6;

         // 5. Monta os Dados da Tabela
         // Colunas: Item - Ficha do item (Tipo) - Observação - Quantidade - Valor unidade - Valor do item
         const tableColumn = ["Item", "Ficha do item", "Observação", "Qtd", "Valor Un.", "Valor Total"];
         const tableRows: any[] = [];

         itens.forEach(item => {
            const det = item.detalhes as any;
            const type = (det?.type as string)?.toUpperCase() || 'UNIDADE';
            const preco = det?.preco || {};
            
            // Ficha do Item (itens/opções técnicas que compõem o produto)
            const itemsFicha: string[] = [];
            const opcaoNomes = det?.opcaoNomes as Record<string, string> | undefined;

            if (opcaoNomes && typeof opcaoNomes === 'object') {
               const orderedKeys = ['papel', 'tamanho', 'cores', 'acabamento'];
               const visited = new Set<string>();

               orderedKeys.forEach(k => {
                  if (opcaoNomes[k]) {
                     itemsFicha.push(`- ${opcaoNomes[k]}`);
                     visited.add(k);
                  }
               });

               Object.entries(opcaoNomes).forEach(([k, v]) => {
                  if (!visited.has(k) && v) {
                     itemsFicha.push(`- ${v}`);
                  }
               });
            } else if (det?.opcoes && typeof det.opcoes === 'object') {
               Object.entries(det.opcoes).forEach(([_, val]) => {
                  if (val && val !== 'personalizado') {
                     itemsFicha.push(`- ${val}`);
                  }
               });
            }

            if (type === 'METRO' && (!opcaoNomes?.tamanho || !itemsFicha.some(i => i.includes('x')))) {
               if (preco.largura || preco.altura) {
                  itemsFicha.push(`- ${preco.largura || 0}x${preco.altura || 0}m`);
               }
            }

            const fichaStr = itemsFicha.length > 0 ? itemsFicha.join('\n') : '-';

            // Observação (Apenas o texto digitado pelo usuário)
            const obsStr = det.observacao || "-";

            // Quantidade
            const qtd = type === 'UNIDADE' ? (preco.quantidade || 1) : 1;
            
            // Valor Unidade
            const valorUnidade = item.valor / qtd;

            tableRows.push([
               item.itemNome,
               fichaStr,
               obsStr,
               qtd.toString(),
               `R$ ${valorUnidade.toFixed(2)}`,
               `R$ ${item.valor.toFixed(2)}`
            ]);
         });

         // 6. Desenha a Tabela usando autoTable
         autoTable(doc, {
            startY: currentY + 4, // Abaixo das informações do cliente
            head: [tableColumn],
            body: tableRows,
            theme: 'grid',
            styles: { fontSize: 9, cellPadding: 3 },
            headStyles: { fillColor: [41, 41, 41], textColor: [255, 255, 255], fontStyle: 'bold' }, // Cabeçalho escuro/neutro
            columnStyles: {
               4: { fontStyle: 'italic' }, // Valor Unitário em itálico
               5: { fontStyle: 'bold' }    // Valor Total em negrito
            },
            margin: { bottom: 65 }, // Margem inferior de 65 para não escrever em cima do grande rodapé do cliente
         });

         let finalY = (doc as any).lastAutoTable.finalY || (currentY + 30);
         
         // Se a tabela terminou muito perto do rodapé, pulamos para a próxima página antes de escrever o TOTAL
         if (finalY + 25 > pageHeight - 60) {
            doc.addPage();
            finalY = 75; // Ao pular página, resetamos o Y para a margem superior
         }
         
         // 7. Desenha o Total e Validade
         doc.setFontSize(14);
         doc.setFont("helvetica", "bold");
         doc.text(`TOTAL DO ORÇAMENTO: R$ ${valorTotal.toFixed(2)}`, 14, finalY + 12);
         
         doc.setFontSize(9);
         doc.setFont("helvetica", "normal");
         doc.text("Este orçamento pode ser aprovado e convertido em pedido a qualquer momento.", 14, finalY + 20);

         // 8. Salva o PDF
         const clienteNomeFormatado = cliente?.nome?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'avulso';
         const fileName = codigoVisual 
            ? `Orcamento_${codigoVisual}_${clienteNomeFormatado}.pdf`
            : `Orcamento_${clienteNomeFormatado}_${new Date().getTime()}.pdf`;
         doc.save(fileName);

         // 9. Limpa o carrinho e redireciona para a tela de orçamentos com o orçamento recém-criado expandido
         clearCart();
         if (savedOrcamentoId) {
            router.push(`/orcamentos?highlight=${savedOrcamentoId}`);
         } else {
            router.push('/orcamentos');
         }

      } catch (error) {
         console.error("Erro ao gerar PDF:", error);
         alert("Ocorreu um erro ao gerar o PDF. Verifique se os arquivos de background estão corretos.");
      } finally {
         setIsLoading(false);
      }
   };

   if (itens.length === 0 && !isEditMode) {
      return (
         <div className="w-full 2xl:w-4/5 2xl:mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-white">Carrinho</h1>
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
               <ShoppingCart className="h-16 w-16 text-gray-600" />
               <p className="text-gray-400 text-lg">Seu carrinho está vazio.</p>
               <p className="text-gray-500 text-sm">Adicione produtos a partir do catálogo.</p>
               <Button asChild className="bg-phalis-action text-phalis-black hover:bg-phalis-action-hover font-bold mt-4">
                  <Link href="/catalogo"><Plus className="h-4 w-4 mr-2" />Ir para o Catálogo</Link>
               </Button>
            </div>
         </div>
      );
   }

   return (
      <div className="w-full 2xl:w-4/5 2xl:mx-auto space-y-6">

         {/* Banner de Modo de Edição */}
         {isEditMode && (
            <div className="bg-amber-500/10 border border-amber-500/40 rounded-xl p-4 flex items-start gap-3">
               <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
               <div>
                  <p className="text-amber-300 font-bold text-sm">Modo de Edição Ativo</p>
                  <p className="text-amber-400/80 text-xs mt-0.5">
                     Você está editando o pedido <span className="font-mono font-bold">{editingOrder?.codigoVisual}</span> do cliente <span className="font-bold">{editingOrder?.cliente.nome}</span>.
                     Adicione, remova ou altere os itens e clique em <span className="font-bold">SALVAR ALTERAÇÕES</span>.
                  </p>
               </div>
            </div>
         )}

         <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-white">
               {isEditMode ? `Editando ${editingOrder?.codigoVisual}` : 'Carrinho'}
            </h1>
            <Button variant="ghost" className="text-gray-400 hover:text-phalis-danger hover:bg-phalis-danger/10" onClick={clearCart}>
               <Trash2 className="h-4 w-4 mr-2" />
               {isEditMode ? 'Cancelar Edição' : 'Limpar Carrinho'}
            </Button>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Coluna Esquerda: Lista de Itens */}
            <div className="lg:col-span-2 space-y-3">
               {itens.map(item => (
                  <CartItemCard
                     key={item.id}
                     item={item}
                     onRemove={removeItem}
                     onEdit={(it) => router.push(`/pedido?id=${it.productId}&editCart=${it.id}`)}
                  />
               ))}
               {/* Resumo Financeiro Detalhado */}
               <div className="bg-[#111111] border border-gray-800 rounded-lg p-4 flex flex-wrap gap-y-3 justify-between items-center">
                  <div className="text-center px-2 flex-1 min-w-[100px]">
                     <p className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">Custo Total</p>
                     <p className="text-base font-bold text-red-400">
                        R$ {itens.reduce((acc, item) => {
                           const p = (item.detalhes as any)?.preco || {};
                           return acc + Number(p.valorTotalCusto || p.custoTotal || p.precoCusto || p.valorCusto || p.m2Custo || 0);
                        }, 0).toFixed(2)}
                     </p>
                  </div>
                  <div className="w-px h-6 bg-gray-800 hidden lg:block" />
                  <div className="text-center px-2 flex-1 min-w-[100px]">
                     <p className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">Total Arte</p>
                     <p className="text-base font-bold text-blue-400">
                        R$ {itens.reduce((acc, item) => {
                           const p = (item.detalhes as any)?.preco || {};
                           return acc + Number(p.precoArte || p.valorArte || 0);
                        }, 0).toFixed(2)}
                     </p>
                  </div>
                  <div className="w-px h-6 bg-gray-800 hidden lg:block" />
                  <div className="text-center px-2 flex-1 min-w-[100px]">
                     <p className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">Total Desconto</p>
                     <p className="text-base font-bold text-yellow-500">
                        R$ {itens.reduce((acc, item) => {
                           const p = (item.detalhes as any)?.preco || {};
                           return acc + Number(p.desconto || 0);
                        }, 0).toFixed(2)}
                     </p>
                  </div>
                  <div className="w-px h-6 bg-gray-800 hidden lg:block" />
                  <div className="text-center px-2 flex-1 min-w-[110px]">
                     <p className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">Lucro Líquido</p>
                     <p className="text-base font-bold text-phalis-action">
                        R$ {(valorTotal - itens.reduce((acc, item) => {
                           const p = (item.detalhes as any)?.preco || {};
                           return acc + Number(p.valorTotalCusto || p.custoTotal || p.precoCusto || p.valorCusto || p.m2Custo || 0);
                        }, 0)).toFixed(2)}
                     </p>
                  </div>
                  <div className="w-px h-6 bg-gray-800 hidden lg:block" />
                  <div className="text-center px-2 flex-1 min-w-[100px]">
                     <p className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">Total Pedido</p>
                     <p className="text-base font-bold text-white">
                        R$ {valorTotal.toFixed(2)}
                     </p>
                  </div>
               </div>

               <Button asChild variant="outline" className="w-full border-dashed border-gray-600 text-gray-400 hover:border-phalis-action hover:text-phalis-action bg-transparent hover:bg-transparent">
                  <Link href="/catalogo"><Plus className="h-4 w-4 mr-2" />Adicionar mais produtos</Link>
               </Button>
            </div>

            {/* Coluna Direita: Resumo + Finalização */}
            <div className="space-y-4">
               <div className="bg-phalis-black rounded-lg p-5 space-y-4">
                  <h2 className="text-lg font-semibold text-white">{isEditMode ? 'Resumo da Edição' : 'Finalização'}</h2>

                  {isEditMode ? (
                     <div className="bg-phalis-gray rounded-lg px-4 py-3">
                        <p className="text-xs text-gray-500 mb-0.5">Cliente</p>
                        <p className="text-white font-semibold">{editingOrder?.cliente.nome}</p>
                     </div>
                  ) : (
                     <>
                        <div className="space-y-1">
                           <Label className="text-gray-300 text-sm ml-1">Cliente *</Label>
                           <ClientCombobox selectedClientId={cliente?.id || null} onSelectClient={handleSelectCliente} />
                        </div>
                        <div className="space-y-1">
                           <Label className="text-gray-300 text-sm ml-1">Status Financeiro *</Label>
                           <Select value={pagamento || ""} onValueChange={setPagamento}>
                              <SelectTrigger className="bg-phalis-gray border-0"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                              <SelectContent className="bg-phalis-gray border-0">
                                 <SelectItem value="PENDENTE">Não Pago</SelectItem>
                                 <SelectItem value="PARCIAL">Pago 50%</SelectItem>
                                 <SelectItem value="PAGO">Pago</SelectItem>
                              </SelectContent>
                           </Select>
                        </div>
                        {pagamento !== 'PENDENTE' && (
                           <div className="space-y-1">
                              <Label className="text-gray-300 text-sm ml-1">Forma de Pagamento *</Label>
                              <Select value={formaPagamento || ""} onValueChange={setFormaPagamento}>
                                 <SelectTrigger className="bg-phalis-gray border-0"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                                 <SelectContent className="bg-phalis-gray border-0">
                                    <SelectItem value="PIX">PIX</SelectItem>
                                    <SelectItem value="CREDITO">Crédito</SelectItem>
                                    <SelectItem value="DEBITO">Débito</SelectItem>
                                    <SelectItem value="DINHEIRO">Dinheiro</SelectItem>
                                 </SelectContent>
                              </Select>
                           </div>
                        )}
                     </>
                  )}
               </div>

               {/* Resumo de Valores */}
               <div className="bg-phalis-black rounded-lg p-5 space-y-3">
                  <div className="flex justify-between text-sm text-gray-400">
                     <span>Itens ({itens.length})</span>
                     <span className="text-white">R$ {valorTotal.toFixed(2)}</span>
                  </div>

                  {isEditMode && (
                     <>
                        <div className="flex justify-between text-sm text-gray-400">
                           <span>Já pago anteriormente</span>
                           <span className="text-blue-400">R$ {totalPagoAnterior.toFixed(2)}</span>
                        </div>
                        <hr className="border-gray-700" />
                        {geraCredito && (
                           <div className="flex items-start gap-2 bg-green-500/10 border border-green-500/30 rounded-lg px-3 py-2">
                              <Wallet className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
                              <p className="text-xs text-green-400">O cliente pagou mais que o novo total. <span className="font-bold">R$ {diferenca.toFixed(2)}</span> serão adicionados como crédito na loja.</p>
                           </div>
                        )}
                        {geraDebitoExtra && (
                           <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2">
                              <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
                              <p className="text-xs text-amber-400">O novo total é maior que o valor já pago. Faltam <span className="font-bold">R$ {Math.abs(diferenca).toFixed(2)}</span> para quitação.</p>
                           </div>
                        )}
                     </>
                  )}

                  {!isEditMode && <hr className="border-gray-700" />}
                  <div className="flex justify-between items-center">
                     <span className="text-lg font-semibold text-white">Total</span>
                     <span className="text-2xl font-bold text-phalis-action">R$ {valorTotal.toFixed(2)}</span>
                  </div>
               </div>

               <div className="flex flex-col gap-3">
                  <Button
                     disabled={itens.length === 0 || isLoading}
                     onClick={handleGerarOrcamentoClick}
                     variant="outline"
                     className="w-full border-gray-600 text-gray-300 hover:text-white bg-transparent hover:bg-gray-800 font-bold py-6 text-lg"
                  >
                     <FileText className="mr-2 h-5 w-5" /> GERAR ORÇAMENTO
                  </Button>

                  <Button
                     disabled={!isFormCompleto || isLoading}
                     onClick={handleFinalizar}
                     className="w-full bg-phalis-action text-phalis-black font-bold text-lg py-6 hover:bg-phalis-action-hover disabled:opacity-50"
                  >
                     {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : isEditMode ? 'SALVAR ALTERAÇÕES' : 'FINALIZAR PEDIDO'}
                  </Button>
               </div>

               {!isFormCompleto && !isEditMode && (
                  <p className="text-xs text-gray-500 text-center">
                     {!cliente && 'Selecione um cliente. '}
                     {!pagamento && 'Selecione o status financeiro. '}
                     {pagamento && pagamento !== 'PENDENTE' && !formaPagamento && 'Selecione a forma de pagamento.'}
                  </p>
               )}
            </div>
         </div>

         {/* Modal de Aviso de Cliente não selecionado (Avulso) */}
         <AlertDialog open={isClienteAvulsoModalOpen} onOpenChange={setIsClienteAvulsoModalOpen}>
            <AlertDialogContent className="bg-phalis-black border border-gray-800 text-white">
               <AlertDialogHeader>
                  <AlertDialogTitle className="text-phalis-action flex items-center gap-2">
                     <FileText className="h-5 w-5" />
                     Gerar orçamento sem cliente?
                  </AlertDialogTitle>
                  <AlertDialogDescription asChild>
                     <div className="text-sm text-gray-300 space-y-2 mt-2">
                        <div>
                           Nenhum cliente foi selecionado para este orçamento.
                        </div>
                        <div>
                           Você pode <strong className="text-white">vincular um cliente</strong> agora para salvar os dados de contato, ou pode prosseguir gerando como um <strong className="text-phalis-action">orçamento avulso</strong>.
                        </div>
                     </div>
                  </AlertDialogDescription>
               </AlertDialogHeader>
               <AlertDialogFooter className="flex gap-2 mt-4">
                  <Button
                     variant="outline"
                     onClick={() => setIsClienteAvulsoModalOpen(false)}
                     className="border-gray-700 text-gray-300 hover:text-white bg-phalis-gray/50 hover:bg-phalis-gray"
                  >
                     Vincular Cliente
                  </Button>
                  <Button
                     onClick={() => {
                        setIsClienteAvulsoModalOpen(false);
                        prosseguirFluxoOrcamento();
                     }}
                     className="bg-phalis-action text-phalis-black hover:bg-phalis-action-hover font-bold"
                  >
                     Gerar como Avulso
                  </Button>
               </AlertDialogFooter>
            </AlertDialogContent>
         </AlertDialog>

         {/* Passo 1: Confirmação de Gerar Novo Orçamento */}
         <AlertDialog open={isConfirmNovoOrcamentoOpen} onOpenChange={setIsConfirmNovoOrcamentoOpen}>
            <AlertDialogContent className="bg-phalis-black border border-gray-800 text-white">
               <AlertDialogHeader>
                  <AlertDialogTitle className="text-orange-400 flex items-center gap-2">
                     <FileText className="h-5 w-5" />
                     Gerar novo orçamento?
                  </AlertDialogTitle>
                  <AlertDialogDescription asChild>
                     <div className="text-sm text-gray-300 space-y-2 mt-2">
                        <div>
                           Este carrinho foi carregado a partir do orçamento <strong className="text-white font-mono">{origemOrcamento?.codigoVisual}</strong>.
                        </div>
                        <div>
                           Deseja realmente gerar um novo orçamento a partir destes itens?
                        </div>
                     </div>
                  </AlertDialogDescription>
               </AlertDialogHeader>
               <AlertDialogFooter className="flex gap-2 mt-4">
                  <AlertDialogCancel className="bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white">
                     Voltar
                  </AlertDialogCancel>
                  <Button
                     onClick={() => {
                        setIsConfirmNovoOrcamentoOpen(false);
                        setIsConfirmCancelarAnteriorOpen(true);
                     }}
                     className="bg-phalis-action text-phalis-black hover:bg-phalis-action-hover font-bold"
                  >
                     Continuar
                  </Button>
               </AlertDialogFooter>
            </AlertDialogContent>
         </AlertDialog>

         {/* Passo 2: Pergunta se deseja Cancelar o Orçamento Anterior */}
         <AlertDialog open={isConfirmCancelarAnteriorOpen} onOpenChange={setIsConfirmCancelarAnteriorOpen}>
            <AlertDialogContent className="bg-phalis-black border border-gray-800 text-white">
               <AlertDialogHeader>
                  <AlertDialogTitle className="text-orange-400 flex items-center gap-2">
                     <AlertTriangle className="h-5 w-5" />
                     Cancelar orçamento anterior?
                  </AlertDialogTitle>
                  <AlertDialogDescription asChild>
                     <div className="text-sm text-gray-300 space-y-2 mt-2">
                        <div>
                           Deseja cancelar o orçamento anterior (<strong className="text-white font-mono">{origemOrcamento?.codigoVisual}</strong>) para evitar orçamentos duplicados?
                        </div>
                     </div>
                  </AlertDialogDescription>
               </AlertDialogHeader>
               <AlertDialogFooter className="flex gap-2 mt-4">
                  <Button
                     variant="outline"
                     onClick={() => {
                        setIsConfirmCancelarAnteriorOpen(false);
                        executarGeracaoPDF(false);
                     }}
                     className="border-gray-700 text-gray-300 hover:text-white bg-phalis-gray/50 hover:bg-phalis-gray"
                  >
                     Não, manter ativo
                  </Button>
                  <Button
                     onClick={() => {
                        setIsConfirmCancelarAnteriorOpen(false);
                        executarGeracaoPDF(true);
                     }}
                     className="bg-orange-500 text-black hover:bg-orange-600 font-bold"
                  >
                     Sim, cancelar anterior
                  </Button>
               </AlertDialogFooter>
            </AlertDialogContent>
         </AlertDialog>
      </div>
   );
}
