'use client';

import React, { useState, useEffect } from 'react';
import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from "@/components/ui/table";
import {
   AlertDialog,
   AlertDialogAction,
   AlertDialogCancel,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogHeader,
   AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { type Orcamento, type ItemOrcamento } from '@/types/orcamento';
import { cn } from '@/lib/utils';
import { Loader2, Download, ShoppingCart, ChevronDown, ChevronUp, MessageCircle, FileText, AlertTriangle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart, type CartItem } from '@/lib/cartStore';
import { useRouter } from 'next/navigation';
import { authenticatedFetch } from '@/lib/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Image from 'next/image';

interface TabelaOrcamentosProps {
   orcamentos: Orcamento[];
   highlightId: string | null;
   isLoading?: boolean;
}

const statusBadgeColors: Record<string, string> = {
   ABERTO: 'bg-yellow-500 text-black',
   CONVERTIDO: 'bg-green-600 text-white',
   SUBSTITUIDO: 'bg-orange-500 text-black',
   CANCELADO: 'bg-red-600 text-white',
};

const formatarWhatsApp = (numero: string | undefined | null) => {
   if (!numero) return '#';
   const ddi = '55';
   const digitos = numero.replace(/\D/g, '');
   return `https://wa.me/${ddi}${digitos}`;
};

const formatarData = (isoString: string) => {
   return new Date(isoString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
   });
};

const carregarImagemComoDataURL = async (url: string): Promise<string> => {
   const response = await fetch(url);
   const blob = await response.blob();
   return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
   });
};

export default function TabelaOrcamentos({ orcamentos, highlightId, isLoading = false }: TabelaOrcamentosProps) {
   const [openRowId, setOpenRowId] = useState<number | null>(() => {
      if (highlightId && !isNaN(Number(highlightId))) {
         return Number(highlightId);
      }
      return null;
   });
   const [downloadingId, setDownloadingId] = useState<number | null>(null);
   const [orcamentoParaSubstituir, setOrcamentoParaSubstituir] = useState<Orcamento | null>(null);
   const [isAlertOpen, setIsAlertOpen] = useState(false);
   const [cancelingId, setCancelingId] = useState<number | null>(null);
   const [orcamentoToCancel, setOrcamentoToCancel] = useState<Orcamento | null>(null);
   const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
   const [motivoCancelamento, setMotivoCancelamento] = useState('');
   const [motivoError, setMotivoError] = useState(false);

   const { totalItens, loadOrcamentoToCart } = useCart();
   const router = useRouter();

   useEffect(() => {
      if (highlightId) {
         const numericId = Number(highlightId);
         if (!isNaN(numericId)) {
            setOpenRowId(numericId);
         }
      }
   }, [highlightId]);

   const toggleRow = (id: number) => {
      setOpenRowId(prev => (prev === id ? null : id));
   };

   const executarCarregamento = (orcamento: Orcamento) => {
      const cartItems: CartItem[] = (orcamento.itens || []).map((item, idx) => ({
         id: `cart_${Date.now()}_${idx}_${Math.random().toString(36).slice(2, 6)}`,
         productId: String(item.productId || ''),
         itemNome: item.itemNome,
         itemImageUrl: item.itemImageUrl || '',
         valor: item.valor,
         detalhes: {
            type: item.tipoPrecificacao ? item.tipoPrecificacao.toLowerCase() : 'unidade',
            opcoes: item.opcoes || {},
            opcaoNomes: item.opcoes || {},
            observacao: item.observacao || '',
            preco: {
               quantidade: item.quantidade || 1,
               precoCusto: item.valorCusto || 0,
               precoVenda: item.valorVenda || 0,
               precoArte: item.valorArte || 0,
               desconto: item.valorDesconto || 0,
               largura: item.largura || 0,
               altura: item.altura || 0,
               total: item.valor,
            }
         }
      }));

      loadOrcamentoToCart(orcamento.cliente || null, cartItems, { id: orcamento.id, codigoVisual: orcamento.codigoVisual });
      router.push('/carrinho');
   };

   const handleCarregarNoCarrinho = (orcamento: Orcamento) => {
      if (!orcamento.itens || orcamento.itens.length === 0) return;

      if (totalItens > 0) {
         setOrcamentoParaSubstituir(orcamento);
         setIsAlertOpen(true);
      } else {
         executarCarregamento(orcamento);
      }
   };

   const handleCancelarOrcamento = async () => {
      if (!orcamentoToCancel) return;
      if (!motivoCancelamento.trim()) {
         setMotivoError(true);
         return;
      }
      setCancelingId(orcamentoToCancel.id);
      try {
         const response = await authenticatedFetch(`/api/orcamentos/${orcamentoToCancel.id}/cancelar`, {
            method: 'POST',
            body: JSON.stringify({ motivo: motivoCancelamento.trim() }),
         });
         if (!response.ok) throw new Error('Falha ao cancelar orçamento');
         const updated = await response.json();
         orcamentoToCancel.status = 'CANCELADO';
         orcamentoToCancel.motivoCancelamento = updated.motivoCancelamento || motivoCancelamento.trim();
         orcamentoToCancel.dataCancelamento = updated.dataCancelamento || new Date().toISOString();
         orcamentoToCancel.canceladoPor = updated.canceladoPor || null;
         setIsCancelConfirmOpen(false);
         setMotivoCancelamento('');
         setMotivoError(false);
      } catch (err) {
         console.error('Erro ao cancelar:', err);
         alert('Erro ao cancelar o orçamento.');
      } finally {
         setCancelingId(null);
      }
   };

   const handleBaixarPDF = async (orcamento: Orcamento) => {
      setDownloadingId(orcamento.id);
      try {
         const doc = new jsPDF();
         const pageWidth = doc.internal.pageSize.getWidth();
         const pageHeight = doc.internal.pageSize.getHeight();

         const bgPag1 = await carregarImagemComoDataURL('/bg-pag1.png');
         const bgPag2 = await carregarImagemComoDataURL('/bg-pag2.png');

         doc.addImage(bgPag1, 'PNG', 0, 0, pageWidth, pageHeight);

         const originalAddPage = doc.addPage.bind(doc);
         doc.addPage = function () {
            originalAddPage();
            this.addImage(bgPag2, 'PNG', 0, 0, pageWidth, pageHeight);
            return this;
         };

         let currentY = 75;
         doc.setFont("helvetica", "bold");
         doc.setFontSize(11);
         doc.setTextColor(0, 0, 0);

         doc.text(`Orçamento Nº: ${orcamento.codigoVisual}`, 14, currentY);
         currentY += 5;

         if (orcamento.cliente) {
            doc.text(`Cliente: ${orcamento.cliente.nome}`, 14, currentY);
            currentY += 5;
            doc.setFont("helvetica", "normal");
            if (orcamento.cliente.telefone1) {
               doc.text(`Telefone: ${orcamento.cliente.telefone1}`, 14, currentY);
               currentY += 5;
            }
            if (orcamento.cliente.email) {
               doc.text(`Email: ${orcamento.cliente.email}`, 14, currentY);
               currentY += 5;
            }
            if (orcamento.cliente.cpfCnpj) {
               doc.text(`CPF/CNPJ: ${orcamento.cliente.cpfCnpj}`, 14, currentY);
               currentY += 5;
            }
         } else {
            doc.text(`Cliente: Não Informado (Orçamento Avulso)`, 14, currentY);
            currentY += 5;
         }

         currentY += 2;
         doc.setFont("helvetica", "italic");
         doc.setFontSize(9);
         doc.text(`Emitido em: ${formatarData(orcamento.dataCriacao)} por ${orcamento.criadoPor?.nome || 'Atendente'}`, 14, currentY);
         currentY += 6;

         const tableColumn = ["Item", "Ficha do item", "Observação", "Qtd", "Valor Un.", "Valor Total"];
         const tableRows: any[] = [];

         (orcamento.itens || []).forEach(item => {
            const type = (item.tipoPrecificacao || 'UNIDADE').toUpperCase();
            const itemsFicha: string[] = [];

            if (item.opcoes && typeof item.opcoes === 'object') {
               const opcoes = item.opcoes as Record<string, any>;
               const orderedKeys = ['papel', 'tamanho', 'cores', 'acabamento'];
               const visited = new Set<string>();

               orderedKeys.forEach(k => {
                  if (opcoes[k] && opcoes[k] !== 'personalizado') {
                     itemsFicha.push(`- ${opcoes[k]}`);
                     visited.add(k);
                  }
               });

               Object.entries(opcoes).forEach(([k, val]) => {
                  if (!visited.has(k) && val && val !== 'personalizado') {
                     itemsFicha.push(`- ${val}`);
                  }
               });
            }

            if (type === 'METRO' && !itemsFicha.some(i => i.includes('x') || i.includes('m²') || i.includes('m'))) {
               if (item.largura || item.altura) {
                  itemsFicha.push(`- ${item.largura || 0}x${item.altura || 0}m`);
               }
            }

            const fichaStr = itemsFicha.length > 0 ? itemsFicha.join('\n') : '-';
            const obsStr = item.observacao || "-";
            const qtd = type === 'UNIDADE' ? (item.quantidade || 1) : 1;
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

         autoTable(doc, {
            startY: currentY + 4,
            head: [tableColumn],
            body: tableRows,
            theme: 'grid',
            styles: { fontSize: 9, cellPadding: 3 },
            headStyles: { fillColor: [41, 41, 41], textColor: [255, 255, 255], fontStyle: 'bold' },
            columnStyles: {
               4: { fontStyle: 'italic' },
               5: { fontStyle: 'bold' }
            },
            margin: { bottom: 65 },
         });

         let finalY = (doc as any).lastAutoTable.finalY || (currentY + 30);
         if (finalY + 25 > pageHeight - 60) {
            doc.addPage();
            finalY = 75;
         }

         doc.setFontSize(14);
         doc.setFont("helvetica", "bold");
         doc.text(`TOTAL DO ORÇAMENTO: R$ ${orcamento.valor.toFixed(2)}`, 14, finalY + 12);

         doc.setFontSize(9);
         doc.setFont("helvetica", "normal");
         doc.text("Este orçamento pode ser aprovado e convertido em pedido a qualquer momento.", 14, finalY + 20);

         // Se o orçamento estiver cancelado ou substituído, desenha marca d'água gigante perfeitamente centralizada na diagonal exata da página A4
         if (orcamento.status === 'CANCELADO' || orcamento.status === 'SUBSTITUIDO') {
            const totalPages = (doc as any).internal.getNumberOfPages();
            for (let i = 1; i <= totalPages; i++) {
               doc.setPage(i);
               try {
                  (doc as any).saveGraphicsState();
                  (doc as any).setGState(new (doc as any).GState({ opacity: 0.35 }));
               } catch (e) {
                  // Fallback
               }

               const fontSize = 115;
               doc.setFont("helvetica", "bold");
               doc.setFontSize(fontSize);
               doc.setTextColor(220, 38, 38);

               const text = "CANCELADO";
               const textWidth = doc.getTextWidth(text);
               const capHeight = fontSize * 0.352778 * 0.70;

               const angleDeg = 45;
               const rad = angleDeg * (Math.PI / 180);

               const cx = pageWidth / 2;
               const cy = pageHeight / 2;

               const x0 = cx - (textWidth / 2) * Math.cos(rad) + (capHeight / 2) * Math.sin(rad);
               const y0 = cy + (textWidth / 2) * Math.sin(rad) + (capHeight / 2) * Math.cos(rad);

               doc.text(text, x0, y0, { angle: angleDeg });

               try {
                  (doc as any).restoreGraphicsState();
               } catch (e) {
                  // Fallback
               }
            }
         }

         const clienteNomeFormatado = orcamento.cliente?.nome?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'avulso';
         doc.save(`Orcamento_${orcamento.codigoVisual}_${clienteNomeFormatado}.pdf`);
      } catch (err) {
         console.error('Erro ao reemitir PDF:', err);
         alert('Erro ao gerar o PDF do orçamento.');
      } finally {
         setDownloadingId(null);
      }
   };

   return (
      <>
         <Table>
            <TableHeader>
               <TableRow className="border-gray-800 hover:bg-transparent">
                  <TableHead className="text-gray-400 font-bold w-[130px]">Código</TableHead>
                  <TableHead className="text-gray-400 font-bold">Data de Emissão</TableHead>
                  <TableHead className="text-gray-400 font-bold">Cliente</TableHead>
                  <TableHead className="text-gray-400 font-bold">Emissor</TableHead>
                  <TableHead className="text-gray-400 font-bold text-right">Total</TableHead>
                  <TableHead className="text-gray-400 font-bold text-center">Status</TableHead>
                  <TableHead className="text-gray-400 font-bold text-center w-[80px]">Ações</TableHead>
               </TableRow>
            </TableHeader>
            <TableBody>
               {orcamentos.length === 0 && !isLoading ? (
                  <TableRow>
                     <TableCell colSpan={7} className="text-center text-gray-500 py-10">
                        Nenhum orçamento encontrado.
                     </TableCell>
                  </TableRow>
               ) : (
                  orcamentos.map((orcamento) => {
                     const isOpen = openRowId === orcamento.id;
                     const isHighlighted = highlightId === String(orcamento.id);

                     return (
                        <React.Fragment key={orcamento.id}>
                           <TableRow
                              onClick={() => toggleRow(orcamento.id)}
                              className={cn(
                                 "border-gray-800 cursor-pointer transition-colors hover:bg-phalis-gray/40",
                                 isOpen && "bg-phalis-gray/30",
                                 isHighlighted && "bg-phalis-action/10 border-l-4 border-l-phalis-action"
                              )}
                           >
                              {/* Código Visual e ID */}
                              <TableCell>
                                 <div className="font-mono font-bold text-phalis-action text-sm">
                                    {orcamento.codigoVisual}
                                 </div>
                                 <div className="text-xs text-gray-500 font-mono">#{orcamento.id}</div>
                              </TableCell>

                              {/* Data de Emissão */}
                              <TableCell className="text-gray-300 text-sm">
                                 {formatarData(orcamento.dataCriacao)}
                              </TableCell>

                              {/* Cliente */}
                              <TableCell className="text-white font-medium">
                                 {orcamento.cliente ? (
                                    <div className="flex items-center gap-2">
                                       <span>{orcamento.cliente.nome}</span>
                                       {orcamento.cliente.telefone1 && (
                                          <a
                                             href={formatarWhatsApp(orcamento.cliente.telefone1)}
                                             target="_blank"
                                             rel="noreferrer"
                                             onClick={(e) => e.stopPropagation()}
                                             className="text-green-400 hover:text-green-300"
                                             title="Conversar no WhatsApp"
                                          >
                                             <MessageCircle className="h-4 w-4" />
                                          </a>
                                       )}
                                    </div>
                                 ) : (
                                    <span className="text-gray-500 italic">Cliente Avulso</span>
                                 )}
                              </TableCell>

                              {/* Emissor */}
                              <TableCell className="text-gray-400 text-sm">
                                 {orcamento.criadoPor?.nome || 'Sistema'}
                              </TableCell>

                              {/* Valor Total */}
                              <TableCell className="text-right font-bold text-white text-base">
                                 R$ {Number(orcamento.valor || 0).toFixed(2)}
                              </TableCell>

                              {/* Status */}
                              <TableCell className="text-center">
                                 <div className="flex flex-col items-center gap-0.5">
                                    <span className={cn("px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase", statusBadgeColors[orcamento.status] || 'bg-gray-700 text-gray-300')}>
                                       {orcamento.status}
                                    </span>
                                    {orcamento.status === 'CONVERTIDO' && orcamento.pedidoVisual && (
                                       <span className="text-[10px] text-green-400 font-mono font-bold" title={orcamento.pedidoId ? `Pedido #${orcamento.pedidoId}` : undefined}>
                                          {orcamento.pedidoVisual}
                                       </span>
                                    )}
                                    {orcamento.status === 'SUBSTITUIDO' && orcamento.orcamentoSubstitutoVisual && (
                                       <span className="text-[10px] text-orange-400 font-mono font-bold" title={orcamento.orcamentoSubstitutoId ? `Orçamento #${orcamento.orcamentoSubstitutoId}` : undefined}>
                                          {orcamento.orcamentoSubstitutoVisual}
                                       </span>
                                    )}
                                 </div>
                              </TableCell>

                              {/* Botão Expandir */}
                              <TableCell className="text-center">
                                 <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                                    onClick={(e) => {
                                       e.stopPropagation();
                                       toggleRow(orcamento.id);
                                    }}
                                 >
                                    {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                 </Button>
                              </TableCell>
                           </TableRow>

                           {/* Linha Expandida de Detalhes */}
                           {isOpen && (
                              <TableRow className="border-gray-800 bg-[#0d0d0d] hover:bg-[#0d0d0d]">
                                 <TableCell colSpan={7} className="p-6">
                                    <div className="space-y-4">
                                       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-gray-800">
                                          <div>
                                             <h3 className="text-base font-bold text-white flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-phalis-action" />
                                                Itens do Orçamento ({orcamento.itens?.length || 0})
                                             </h3>
                                             <p className="text-xs text-gray-400 mt-0.5">
                                                Confira os itens, materiais selecionados e observações orçadas.
                                             </p>
                                          </div>

                                          <div className="flex flex-wrap gap-2 w-full sm:w-auto items-center">
                                             <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={downloadingId === orcamento.id}
                                                onClick={() => handleBaixarPDF(orcamento)}
                                                className="border-gray-700 text-gray-300 hover:text-white bg-phalis-gray/50 hover:bg-phalis-gray text-xs font-semibold gap-1.5"
                                             >
                                                {downloadingId === orcamento.id ? (
                                                   <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                ) : (
                                                   <Download className="h-3.5 w-3.5" />
                                                )}
                                                Gerar PDF
                                             </Button>

                                             {orcamento.status === 'ABERTO' && (
                                                <Button
                                                   variant="outline"
                                                   size="sm"
                                                   disabled={cancelingId === orcamento.id}
                                                   onClick={() => {
                                                      setOrcamentoToCancel(orcamento);
                                                      setMotivoCancelamento('');
                                                      setMotivoError(false);
                                                      setIsCancelConfirmOpen(true);
                                                   }}
                                                   className="border-red-900/40 text-red-400 hover:text-red-300 bg-red-950/20 hover:bg-red-950/40 text-xs font-semibold gap-1.5"
                                                >
                                                   {cancelingId === orcamento.id ? (
                                                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                   ) : (
                                                      <Trash2 className="h-3.5 w-3.5" />
                                                   )}
                                                   Cancelar Orçamento
                                                </Button>
                                             )}

                                             {orcamento.status === 'ABERTO' ? (
                                                <Button
                                                   size="sm"
                                                   onClick={() => handleCarregarNoCarrinho(orcamento)}
                                                   className="bg-phalis-action text-phalis-black hover:bg-phalis-action-hover text-xs font-bold gap-1.5"
                                                >
                                                   <ShoppingCart className="h-3.5 w-3.5" />
                                                   Carregar no Carrinho
                                                </Button>
                                             ) : orcamento.status === 'CONVERTIDO' ? (
                                                <span className="text-xs text-green-400 font-medium italic px-2">
                                                   ✓ Convertido em Pedido {orcamento.pedidoVisual ? `(${orcamento.pedidoVisual})` : ''}
                                                </span>
                                             ) : orcamento.status === 'SUBSTITUIDO' ? (
                                                <span className="text-xs text-orange-400 font-medium italic px-2">
                                                   Substituído por {orcamento.orcamentoSubstitutoVisual || 'outro orçamento'}
                                                </span>
                                             ) : (
                                                <span className="text-xs text-gray-500 italic px-2">
                                                   Orçamento Cancelado
                                                </span>
                                             )}
                                          </div>
                                       </div>

                                       {/* Card de Auditoria se Cancelado ou Substituído */}
                                       {(orcamento.status === 'CANCELADO' || orcamento.status === 'SUBSTITUIDO') && (
                                          <div className={cn(
                                             "border rounded-lg p-3 text-xs space-y-1",
                                             orcamento.status === 'SUBSTITUIDO' ? "bg-orange-950/20 border-orange-900/30" : "bg-red-950/20 border-red-900/30"
                                          )}>
                                             <div className="flex items-center justify-between">
                                                <span className={cn(
                                                   "font-bold uppercase flex items-center gap-1.5",
                                                   orcamento.status === 'SUBSTITUIDO' ? 'text-orange-400' : 'text-red-400'
                                                )}>
                                                   <AlertTriangle className="h-4 w-4" />
                                                   {orcamento.status === 'SUBSTITUIDO' ? 'Orçamento Substituído' : 'Orçamento Cancelado'}
                                                </span>
                                                {orcamento.dataCancelamento && (
                                                   <span className="text-gray-400 text-[11px]">
                                                      {formatarData(orcamento.dataCancelamento)}
                                                   </span>
                                                )}
                                             </div>
                                             {orcamento.motivoCancelamento && (
                                                <p className="text-gray-300 mt-1">
                                                   <strong className="text-gray-400">Motivo:</strong> {orcamento.motivoCancelamento}
                                                </p>
                                             )}
                                             {orcamento.canceladoPor && (
                                                <p className="text-gray-400 text-[11px]">
                                                   Responsável: <strong className="text-gray-300">{orcamento.canceladoPor.nome}</strong>
                                                </p>
                                             )}
                                          </div>
                                       )}

                                       {/* Grid de Itens */}
                                       <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                          {(orcamento.itens || []).map((item, idx) => (
                                             <div
                                                key={idx}
                                                className="bg-phalis-black border border-gray-800 rounded-lg p-4 flex gap-4 items-start"
                                             >
                                                {item.itemImageUrl ? (
                                                   <div className="h-14 w-14 rounded overflow-hidden relative bg-gray-900 flex-shrink-0 border border-gray-800">
                                                      <Image src={item.itemImageUrl} alt={item.itemNome} fill className="object-cover" />
                                                   </div>
                                                ) : (
                                                   <div className="h-14 w-14 rounded bg-gray-800 flex items-center justify-center flex-shrink-0 text-gray-500 text-xs">
                                                      Foto
                                                   </div>
                                                )}

                                                <div className="flex-1 min-w-0">
                                                   <div className="flex justify-between items-start">
                                                      <p className="text-white font-bold text-sm truncate">{item.itemNome}</p>
                                                      <p className="text-phalis-action font-bold text-sm ml-2">
                                                         R$ {Number(item.valor || 0).toFixed(2)}
                                                      </p>
                                                   </div>

                                                   <div className="mt-1 text-xs text-gray-400 space-y-0.5">
                                                      {item.tipoPrecificacao && (
                                                         <p><span className="text-gray-500">Tipo:</span> {item.tipoPrecificacao}</p>
                                                      )}
                                                      {item.quantidade && (
                                                         <p><span className="text-gray-500">Qtd:</span> {item.quantidade}</p>
                                                      )}
                                                      {item.largura && item.altura && (
                                                         <p><span className="text-gray-500">Dimensões:</span> {item.largura}x{item.altura}m</p>
                                                      )}
                                                      {item.opcoes && Object.keys(item.opcoes).length > 0 && (
                                                         <div className="flex flex-wrap gap-1 pt-1">
                                                            {Object.entries(item.opcoes).map(([k, v]) => {
                                                               if (!v || v === 'personalizado') return null;
                                                               return (
                                                                  <span key={k} className="inline-block bg-gray-800 text-gray-300 text-[10px] px-1.5 py-0.5 rounded border border-gray-700">
                                                                     {String(v)}
                                                                  </span>
                                                               );
                                                            })}
                                                         </div>
                                                      )}
                                                      {item.observacao && item.observacao !== '-' && (
                                                         <p className="italic text-gray-300 pt-1"><span className="text-gray-500 not-italic">Obs:</span> {item.observacao}</p>
                                                      )}
                                                   </div>
                                                </div>
                                             </div>
                                          ))}
                                       </div>
                                    </div>
                                 </TableCell>
                              </TableRow>
                           )}
                        </React.Fragment>
                     );
                  })
               )}
            </TableBody>
         </Table>

         <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
            <AlertDialogContent className="bg-phalis-black border border-gray-800 text-white">
               <AlertDialogHeader>
                  <AlertDialogTitle className="text-amber-400 flex items-center gap-2">
                     <AlertTriangle className="h-5 w-5" />
                     Substituir itens do carrinho?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-300">
                     Você já possui <strong className="text-white">{totalItens} item(ns)</strong> no carrinho. Ao carregar este orçamento, os itens atuais serão apagados e substituídos pelos itens de <strong className="text-phalis-action">{orcamentoParaSubstituir?.codigoVisual}</strong>.
                     <br /><br />
                     Deseja continuar?
                  </AlertDialogDescription>
               </AlertDialogHeader>
               <AlertDialogFooter>
                  <AlertDialogCancel className="bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white">
                     Cancelar
                  </AlertDialogCancel>
                  <AlertDialogAction
                     onClick={() => {
                        if (orcamentoParaSubstituir) {
                           executarCarregamento(orcamentoParaSubstituir);
                        }
                     }}
                     className="bg-phalis-action text-phalis-black hover:bg-phalis-action-hover font-bold"
                  >
                     Substituir e Carregar
                  </AlertDialogAction>
               </AlertDialogFooter>
            </AlertDialogContent>
         </AlertDialog>

         {/* Modal de Cancelamento de Orçamento */}
         <AlertDialog open={isCancelConfirmOpen} onOpenChange={(open) => {
            setIsCancelConfirmOpen(open);
            if (!open) {
               setMotivoCancelamento('');
               setMotivoError(false);
            }
         }}>
            <AlertDialogContent className="bg-phalis-black border border-gray-800 text-white">
               <AlertDialogHeader>
                  <AlertDialogTitle className="text-red-400 flex items-center gap-2">
                     <Trash2 className="h-5 w-5" />
                     Cancelar orçamento?
                  </AlertDialogTitle>
                  <AlertDialogDescription asChild>
                     <div className="text-gray-300 space-y-3 mt-2 text-sm">
                        <div>
                           Tem certeza de que deseja cancelar o orçamento <strong className="text-white font-mono">{orcamentoToCancel?.codigoVisual}</strong>?
                        </div>
                        <div>
                           <label className="block text-xs font-semibold text-gray-300 mb-1">
                              Motivo do Cancelamento <span className="text-red-400">*</span>
                           </label>
                           <textarea
                              value={motivoCancelamento}
                              onChange={(e) => {
                                 setMotivoCancelamento(e.target.value);
                                 if (e.target.value.trim()) setMotivoError(false);
                              }}
                              placeholder="Informe o motivo do cancelamento deste orçamento..."
                              className={cn(
                                 "w-full h-20 bg-black/50 border rounded-md p-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1",
                                 motivoError ? "border-red-500 focus:ring-red-500" : "border-gray-700 focus:ring-red-400"
                              )}
                           />
                           {motivoError && (
                              <p className="text-red-400 text-[11px] mt-1">
                                 O motivo do cancelamento é obrigatório.
                              </p>
                           )}
                        </div>
                        <div className="text-red-400/90 text-xs">
                           Após o cancelamento, este orçamento não poderá mais ser convertido em pedido nem carregado no carrinho.
                        </div>
                     </div>
                  </AlertDialogDescription>
               </AlertDialogHeader>
               <AlertDialogFooter className="flex gap-2 mt-2">
                  <AlertDialogCancel className="bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white">
                     Voltar
                  </AlertDialogCancel>
                  <Button
                     disabled={cancelingId === orcamentoToCancel?.id}
                     onClick={handleCancelarOrcamento}
                     className="bg-red-600 text-white hover:bg-red-700 font-bold"
                  >
                     {cancelingId === orcamentoToCancel?.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                     ) : (
                        'Confirmar Cancelamento'
                     )}
                  </Button>
               </AlertDialogFooter>
            </AlertDialogContent>
         </AlertDialog>
      </>
   );
}
