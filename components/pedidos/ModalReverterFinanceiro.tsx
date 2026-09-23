// Arquivo: components/pedidos/ModalReverterFinanceiro.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
   DialogDescription,
   DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from "@/components/ui/select";
import { MoneyInput } from "@/components/ui/money-input";
import { AlertTriangle, Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import { type Pedido } from '@/lib/orderData';
import { authenticatedFetch } from '@/lib/api';

export type TransicaoRegressiva = 'PAGO_PARA_PENDENTE' | 'PARCIAL_PARA_PENDENTE' | 'PAGO_PARA_PARCIAL';

interface ModalReverterFinanceiroProps {
   isOpen: boolean;
   onClose: () => void;
   pedido: Pedido | null;
   transicao: TransicaoRegressiva | null;
   valorJaPago?: number;
   onSuccess: (updatedData: any) => void;
}

const FORMAS_PAGAMENTO: { value: 'CREDITO' | 'DEBITO' | 'PIX' | 'DINHEIRO'; label: string }[] = [
   { value: 'CREDITO', label: 'Cartão de Crédito' },
   { value: 'DEBITO', label: 'Cartão de Débito' },
   { value: 'PIX', label: 'PIX' },
   { value: 'DINHEIRO', label: 'Dinheiro' },
];

export const ModalReverterFinanceiro: React.FC<ModalReverterFinanceiroProps> = ({
   isOpen,
   onClose,
   pedido,
   transicao,
   valorJaPago,
   onSuccess,
}) => {
   const [password, setPassword] = useState('');
   const [showPassword, setShowPassword] = useState(false);
   const [novoValorPago, setNovoValorPago] = useState('');
   const [formaPagamento, setFormaPagamento] = useState<'CREDITO' | 'DEBITO' | 'PIX' | 'DINHEIRO'>('PIX');
   const [motivo, setMotivo] = useState('');
   const [loading, setLoading] = useState(false);
   const [errorMessage, setErrorMessage] = useState('');
   const [valorPagoReal, setValorPagoReal] = useState<number | null>(null);
   const [loadingConta, setLoadingConta] = useState(false);

   const valorTotal = Number(pedido?.valor) || 0;

   useEffect(() => {
      if (isOpen && pedido?.id) {
         setPassword('');
         setShowPassword(false);
         setMotivo('');
         setErrorMessage('');
         setLoadingConta(true);

         // Busca o valor real pago da conta no back-end para exibir o valor 100% exato
         authenticatedFetch(`/api/contas-receber/pedido/${pedido.id}`)
            .then(res => res.ok ? res.json() : null)
            .then(data => {
               if (data && data.valorPago != null) {
                  const real = Number(data.valorPago);
                  setValorPagoReal(real);
                  if (transicao === 'PAGO_PARA_PARCIAL') {
                     setNovoValorPago(real > 0 && real < valorTotal ? real.toFixed(2) : (valorTotal / 2).toFixed(2));
                     setFormaPagamento('PIX');
                  }
               } else {
                  const fallback = valorJaPago !== undefined ? valorJaPago : (pedido.statusFinanceiro === 'PAGO' ? valorTotal : 0);
                  setValorPagoReal(fallback);
                  if (transicao === 'PAGO_PARA_PARCIAL') {
                     setNovoValorPago((valorTotal / 2).toFixed(2));
                     setFormaPagamento('PIX');
                  }
               }
            })
            .catch(() => {
               const fallback = valorJaPago !== undefined ? valorJaPago : (pedido.statusFinanceiro === 'PAGO' ? valorTotal : 0);
               setValorPagoReal(fallback);
               if (transicao === 'PAGO_PARA_PARCIAL') {
                  setNovoValorPago((valorTotal / 2).toFixed(2));
                  setFormaPagamento('PIX');
               }
            })
            .finally(() => {
               setLoadingConta(false);
            });
      }
   }, [isOpen, pedido?.id, transicao, valorTotal, valorJaPago]);

   if (!pedido || !transicao) return null;

   const isAjusteParcial = transicao === 'PAGO_PARA_PARCIAL';
   const valorExibir = valorPagoReal != null ? valorPagoReal : (valorJaPago !== undefined ? valorJaPago : (pedido.statusFinanceiro === 'PAGO' ? valorTotal : 0));

   const handleConfirm = async (e: React.FormEvent) => {
      e.preventDefault();
      setErrorMessage('');

      if (!password.trim()) {
         setErrorMessage('Digite sua senha para confirmar a operação.');
         return;
      }

      let payloadNovoValor: number | null = null;
      if (isAjusteParcial) {
         const num = parseFloat(novoValorPago.replace(',', '.'));
         if (isNaN(num) || num <= 0) {
            setErrorMessage('Informe um valor parcial válido maior que zero.');
            return;
         }
         if (num >= valorTotal) {
            setErrorMessage(`O valor parcial deve ser menor que o total do pedido (R$ ${valorTotal.toFixed(2)}).`);
            return;
         }
         payloadNovoValor = num;
      }

      setLoading(true);

      try {
         const payload = {
            novoStatus: isAjusteParcial ? 'PARCIAL' : 'PENDENTE',
            novoValorPago: payloadNovoValor,
            formaPagamento: isAjusteParcial ? formaPagamento : null,
            password: password,
            motivo: motivo.trim() || (isAjusteParcial ? 'Ajuste de pagamento integral para parcial' : 'Reversão de pagamento para pendente'),
         };

         const response = await authenticatedFetch(`/api/pedidos/${pedido.id}/reverter-pagamento`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
         });

         const data = await response.json();

         if (!response.ok) {
            throw new Error(data.message || 'Falha ao reverter status financeiro.');
         }

         onSuccess(data);
         onClose();
      } catch (err: any) {
         setErrorMessage(err.message || 'Erro ao processar solicitação.');
      } finally {
         setLoading(false);
      }
   };

   return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && !loading && onClose()}>
         <DialogContent className="bg-phalis-black border-gray-800 text-white max-w-md">
            <form onSubmit={handleConfirm}>
               <DialogHeader className="space-y-2">
                  <div className="flex items-center gap-2">
                     <div className={`p-2 rounded-full ${isAjusteParcial ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}`}>
                        <AlertTriangle className="h-5 w-5" />
                     </div>
                     <DialogTitle className="text-lg font-bold">
                        {isAjusteParcial ? 'Ajustar para Pagamento Parcial' : 'Reverter para Status Pendente'}
                     </DialogTitle>
                  </div>
                  <DialogDescription className="text-gray-400 text-xs leading-relaxed">
                     {transicao === 'PAGO_PARA_PENDENTE' && (
                        <>O pedido <strong className="text-white">#{pedido.codigoVisual || pedido.id}</strong> está registrado como <strong>PAGO</strong>. Ao reverter para <strong>PENDENTE</strong>, todos os pagamentos serão cancelados.</>
                     )}
                     {transicao === 'PARCIAL_PARA_PENDENTE' && (
                        <>O pedido <strong className="text-white">#{pedido.codigoVisual || pedido.id}</strong> possui pagamentos parciais. Ao reverter para <strong>PENDENTE</strong>, os registros de pagamento serão removidos.</>
                     )}
                     {transicao === 'PAGO_PARA_PARCIAL' && (
                        <>O pedido <strong className="text-white">#{pedido.codigoVisual || pedido.id}</strong> foi marcado como pago integralmente por engano. O pagamento total anterior será substituído pelo valor parcial digitado.</>
                     )}
                  </DialogDescription>
               </DialogHeader>

               {/* Caixa de Alerta de Impacto */}
               <div className={`my-4 p-3 rounded-xl border text-xs space-y-1 ${
                  isAjusteParcial
                     ? 'bg-amber-950/30 border-amber-800/60 text-amber-300'
                     : 'bg-red-950/30 border-red-800/60 text-red-300'
               }`}>
                  <div className="flex justify-between font-semibold">
                     <span>Total do Pedido:</span>
                     <span className="text-white">R$ {valorTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold items-center">
                     <span>{isAjusteParcial ? 'Pagamento a Cancelar:' : 'Pagamentos a Excluir:'}</span>
                     <span className="underline font-bold">
                        {loadingConta ? (
                           <Loader2 className="h-3 w-3 animate-spin inline-block" />
                        ) : (
                           `R$ ${valorExibir.toFixed(2)}`
                        )}
                     </span>
                  </div>
                  <p className="text-[11px] opacity-80 pt-1 border-t border-current/20">
                     {isAjusteParcial
                        ? 'O valor total pago será descartado e substituído pelo novo valor parcial.'
                        : 'O saldo devedor do pedido voltará a ser de 100% em aberto.'}
                  </p>
               </div>

               {/* Campos Específicos para Ajuste Parcial */}
               {isAjusteParcial && (
                  <div className="space-y-3 mb-4">
                     <div className="space-y-1">
                        <Label className="text-xs font-semibold text-gray-300">Novo Valor Pago Parcial (R$) *</Label>
                        <MoneyInput
                           value={novoValorPago}
                           onChange={(e) => setNovoValorPago(e.target.value)}
                           className="bg-phalis-gray border-0"
                           placeholder="0.00"
                           disabled={loading}
                        />
                     </div>

                     <div className="space-y-1">
                        <Label className="text-xs font-semibold text-gray-300">Forma de Pagamento</Label>
                        <Select value={formaPagamento} onValueChange={(val) => setFormaPagamento(val as 'CREDITO' | 'DEBITO' | 'PIX' | 'DINHEIRO')} disabled={loading}>
                           <SelectTrigger className="bg-phalis-gray border-0 text-white text-xs">
                              <SelectValue placeholder="Selecione a forma" />
                           </SelectTrigger>
                           <SelectContent className="bg-phalis-gray border-0 text-white text-xs">
                              {FORMAS_PAGAMENTO.map((f) => (
                                 <SelectItem key={f.value} value={f.value}>
                                    {f.label}
                                 </SelectItem>
                              ))}
                           </SelectContent>
                        </Select>
                     </div>
                  </div>
               )}

               {/* Campo de Senha de Confirmação */}
               <div className="space-y-1 mb-4">
                  <Label className="text-xs font-semibold text-white flex items-center gap-1.5">
                     <Lock className="h-3.5 w-3.5 text-phalis-action" />
                     Senha de Confirmação *
                  </Label>
                  <div className="relative">
                     <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Digite sua senha para autorizar..."
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-phalis-gray border-0 pr-10 text-white"
                        disabled={loading}
                        autoFocus
                     />
                     <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                     >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                     </button>
                  </div>
               </div>

               {errorMessage && (
                  <div className="p-2 mb-4 bg-red-500/20 border border-red-500/40 rounded-lg text-xs text-red-300">
                     {errorMessage}
                  </div>
               )}

               <DialogFooter className="gap-2 sm:gap-0">
                  <Button
                     type="button"
                     variant="outline"
                     onClick={onClose}
                     disabled={loading}
                     className="bg-gray-800 border-0 hover:bg-gray-700 text-gray-300"
                  >
                     Cancelar
                  </Button>
                  <Button
                     type="submit"
                     disabled={loading}
                     className={isAjusteParcial
                        ? "bg-amber-600 hover:bg-amber-500 text-white font-semibold"
                        : "bg-phalis-danger hover:bg-red-700 text-white font-semibold"
                     }
                  >
                     {loading ? (
                        <>
                           <Loader2 className="h-4 w-4 animate-spin mr-2" />
                           Processando...
                        </>
                     ) : (
                        isAjusteParcial ? 'Confirmar Ajuste' : 'Confirmar e Excluir Pagamentos'
                     )}
                  </Button>
               </DialogFooter>
            </form>
         </DialogContent>
      </Dialog>
   );
};
