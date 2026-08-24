'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
   Loader2,
   CheckCircle2,
   Clock,
   FileText,
   Check,
   AlertCircle,
   PackageCheck,
   Printer,
   Scissors,
   Package,
   MapPin,
   MessageCircle,
   ExternalLink,
   Sparkles,
   ShieldCheck,
   ShoppingBag
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Turnstile } from '@marsidev/react-turnstile';

type RastreioItemDTO = {
   nome: string;
   quantidade: number;
};

type RastreioHistoricoDTO = {
   status: string;
   data: string;
};

type RastreioPedidoDTO = {
   primeiroNomeCliente: string;
   codigoVisual: string;
   dataCriacao: string;
   totalPago: number;
   totalPedido: number;
   statusFinanceiro: string;
   statusProducao: string;
   itens: RastreioItemDTO[];
   historico: RastreioHistoricoDTO[];
};

const ETAPAS_PRODUCAO = [
   {
      id: 'PRE_PRODUCAO',
      titulo: 'Pedido Recebido',
      descricao: 'Arquivos recebidos e conferência inicial.',
      icone: PackageCheck,
   },
   {
      id: 'EM_PRODUCAO',
      titulo: 'Em Produção',
      descricao: 'Seu material está sendo impresso.',
      icone: Printer,
   },
   {
      id: 'ACABAMENTO',
      titulo: 'Acabamento & Corte',
      descricao: 'Cortes, dobras e controle de qualidade.',
      icone: Scissors,
   },
   {
      id: 'PRONTO',
      titulo: 'Pronto para Retirada',
      descricao: 'Embalado e aguardando você na loja.',
      icone: Package,
   },
   {
      id: 'ENTREGUE',
      titulo: 'Pedido Entregue',
      descricao: 'Entregue com sucesso. Obrigado!',
      icone: CheckCircle2,
   },
];

const STATUS_INFO: Record<string, {
   badge: string;
   badgeColor: string;
   titulo: string;
   mensagem: string;
   bgGradient: string;
   borderColor: string;
   textColor: string;
   icon: React.ElementType;
}> = {
   PRE_PRODUCAO: {
      badge: 'Aguardando Produção',
      badgeColor: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
      titulo: 'Recebemos o seu pedido!',
      mensagem: 'Nossa equipe está preparando os arquivos para iniciar a produção do seu material.',
      bgGradient: 'from-blue-950/40 via-blue-900/10 to-transparent',
      borderColor: 'border-blue-900/40',
      textColor: 'text-blue-400',
      icon: PackageCheck,
   },
   EM_PRODUCAO: {
      badge: 'Em Produção',
      badgeColor: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
      titulo: 'Seu pedido está sendo produzido!',
      mensagem: 'As máquinas estão rodando! Seus itens estão no processo de impressão com todo o cuidado.',
      bgGradient: 'from-cyan-950/40 via-cyan-900/10 to-transparent',
      borderColor: 'border-cyan-900/40',
      textColor: 'text-cyan-400',
      icon: Printer,
   },
   ACABAMENTO: {
      badge: 'Fase de Acabamento',
      badgeColor: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
      titulo: 'Quase lá! Fase de acabamento',
      mensagem: 'Estamos realizando cortes, dobras, laminações e a inspeção de qualidade final.',
      bgGradient: 'from-purple-950/40 via-purple-900/10 to-transparent',
      borderColor: 'border-purple-900/40',
      textColor: 'text-purple-400',
      icon: Scissors,
   },
   PRONTO: {
      badge: 'Pronto para Retirada',
      badgeColor: 'bg-green-500/20 text-green-400 border-green-500/40',
      titulo: 'Tudo pronto! Pode vir buscar 🎉',
      mensagem: 'Seu pedido já foi finalizado e conferido. Ele está embalado e te aguardando em nossa loja física.',
      bgGradient: 'from-green-950/40 via-green-900/10 to-transparent',
      borderColor: 'border-green-800/40',
      textColor: 'text-green-400',
      icon: Package,
   },
   ENTREGUE: {
      badge: 'Entregue com Sucesso',
      badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      titulo: 'Pedido Concluído!',
      mensagem: 'Seu pedido foi entregue. Esperamos que tenha ficado incrível! Conte sempre com a Gráfica Phalis.',
      bgGradient: 'from-emerald-950/40 via-emerald-900/10 to-transparent',
      borderColor: 'border-emerald-900/40',
      textColor: 'text-emerald-400',
      icon: CheckCircle2,
   },
   CANCELADO: {
      badge: 'Pedido Cancelado',
      badgeColor: 'bg-red-500/15 text-red-400 border-red-500/30',
      titulo: 'Este pedido foi cancelado',
      mensagem: 'Para mais detalhes ou para fazer um novo orçamento, entre em contato com nossa equipe.',
      bgGradient: 'from-red-950/40 via-red-900/10 to-transparent',
      borderColor: 'border-red-900/40',
      textColor: 'text-red-400',
      icon: AlertCircle,
   },
};

const formatarDataHora = (isoString?: string) => {
   if (!isoString) return '';
   return new Date(isoString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
   }).replace(',', ' às');
};

export default function RastreioPublicoPage() {
   const params = useParams();
   const hash = params?.hash as string;

   const [loading, setLoading] = useState(true);
   const [erro, setErro] = useState('');
   const [pedido, setPedido] = useState<RastreioPedidoDTO | null>(null);

   const [turnstileToken, setTurnstileToken] = useState<string>('');
   const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITEKEY || '';

   useEffect(() => {
      if (!hash || !turnstileToken) return;

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

      fetch(`${apiUrl}/api/public/rastreio/${hash}`, {
         headers: {
            'X-Turnstile-Token': turnstileToken,
            'X-Requested-With': 'XMLHttpRequest'
         }
      })
         .then(async (res) => {
            if (!res.ok) {
               if (res.status === 404) throw new Error("Pedido não encontrado ou link expirado.");
               if (res.status === 403) throw new Error("Falha na verificação de segurança. Recarregue a página.");
               throw new Error("Erro ao carregar as informações do pedido.");
            }
            return res.json();
         })
         .then(data => {
            setPedido(data);
            setLoading(false);
         })
         .catch(err => {
            setErro(err.message);
            setLoading(false);
         });
   }, [hash, turnstileToken]);

   if (!turnstileToken) {
      return (
         <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center p-6 text-center">
            <div className="max-w-xs w-full bg-[#121215] border border-gray-800 rounded-3xl p-6 shadow-2xl space-y-4">
               <div className="w-12 h-12 rounded-2xl bg-phalis-action/10 border border-phalis-action/20 flex items-center justify-center mx-auto text-phalis-action">
                  <ShieldCheck className="w-6 h-6" />
               </div>
               <div>
                  <h2 className="text-white font-bold text-base">Verificação de Segurança</h2>
                  <p className="text-gray-400 text-xs mt-1">Confirme que você é humano para visualizar o rastreio.</p>
               </div>
               <div className="pt-2 flex justify-center">
                  <Turnstile
                     siteKey={turnstileSiteKey}
                     onSuccess={(token) => setTurnstileToken(token)}
                     options={{ theme: 'dark', size: 'flexible' }}
                  />
               </div>
            </div>
         </div>
      );
   }

   if (loading) {
      return (
         <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center p-6 text-center">
            <div className="relative">
               <div className="w-14 h-14 rounded-2xl bg-phalis-action/10 border border-phalis-action/30 flex items-center justify-center animate-pulse">
                  <Loader2 className="w-7 h-7 text-phalis-action animate-spin" />
               </div>
            </div>
            <h3 className="text-white font-bold text-base mt-4">Localizando seu pedido...</h3>
            <p className="text-gray-400 text-xs mt-1">Só um instante enquanto buscamos as etapas mais recentes.</p>
         </div>
      );
   }

   if (erro || !pedido) {
      return (
         <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center p-6 text-center">
            <div className="bg-[#121215] p-6 rounded-3xl border border-red-900/40 max-w-sm w-full space-y-4 shadow-2xl">
               <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-red-400">
                  <AlertCircle className="w-6 h-6" />
               </div>
               <h2 className="text-white text-lg font-bold">Ops! Algo deu errado</h2>
               <p className="text-gray-400 text-xs">{erro || "Pedido não encontrado."}</p>
               <a
                  href="https://wa.me/55819985890254"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full bg-phalis-gray/60 hover:bg-phalis-gray text-white font-semibold text-xs py-2.5 px-4 rounded-xl border border-gray-700 transition-colors"
               >
                  <MessageCircle className="w-4 h-4 text-green-400" />
                  Falar com o Suporte
               </a>
            </div>
         </div>
      );
   }

   // Identifica etapa atual
   const currentStatusIndex = ETAPAS_PRODUCAO.findIndex(step => step.id === pedido.statusProducao);
   const isCancelado = pedido.statusProducao === 'CANCELADO';
   const isPronto = pedido.statusProducao === 'PRONTO';
   const infoAtual = STATUS_INFO[pedido.statusProducao] || STATUS_INFO.PRE_PRODUCAO;
   const CurrentIcon = infoAtual.icon;

   // Cálculos Financeiros
   const totalPedido = Number(pedido.totalPedido || 0);
   const totalPago = Number(pedido.totalPago || 0);
   const saldoRestante = Math.max(0, totalPedido - totalPago);

   return (
      <div className="min-h-screen bg-[#09090b] text-white flex flex-col font-sans pb-12 selection:bg-phalis-action/20 selection:text-phalis-action">

         {/* HEADER MOBILE-FIRST */}
         <header className="relative bg-gradient-to-b from-[#141418] via-[#0e0e11] to-[#09090b] px-5 pt-8 pb-3 overflow-hidden">
            {/* Linha decorativa no topo */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-phalis-action via-purple-500 to-pink-500" />

            <div className="max-w-md mx-auto flex flex-col items-center text-center relative z-10">
               {/* Logo Phalis */}
               <div className="relative w-36 h-10 mb-4">
                  <Image
                     src="/phalis-logo.svg"
                     alt="Logo Gráfica Phalis"
                     fill
                     priority
                     className="object-contain drop-shadow-[0_0_15px_rgba(234,88,12,0.2)]"
                  />
               </div>

               {/* Saudação e Código */}
               <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/5 border border-white/15 text-xs sm:text-sm font-mono text-gray-200 mb-3 shadow-lg shadow-black/40">
                  <span className="text-gray-400 font-medium">Pedido</span>
                  <strong className="text-phalis-action font-extrabold text-sm sm:text-base tracking-wider">{pedido.codigoVisual}</strong>
               </div>

               <h1 className="text-2xl font-black text-white tracking-tight">
                  Olá, <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-100 to-gray-400">{pedido.primeiroNomeCliente}</span>!
               </h1>
               <p className="text-xs text-gray-400 mt-1">
                  Acompanhe em tempo real a produção do seu material
               </p>
            </div>
         </header>

         {/* CONTEÚDO PRINCIPAL */}
         <main className="max-w-md w-full mx-auto px-4 pt-1 space-y-4 relative z-10">

            {/* CARD 1: STATUS ATUAL CONTEXTUAL */}
            <div className={cn(
               "relative rounded-3xl p-5 border shadow-xl bg-gradient-to-b overflow-hidden",
               infoAtual.bgGradient,
               infoAtual.borderColor
            )}>
               <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                     <div className={cn(
                        "w-10 h-10 rounded-2xl flex items-center justify-center border shadow-md",
                        infoAtual.badgeColor
                     )}>
                        <CurrentIcon className="w-5 h-5" />
                     </div>
                     <div>
                        <span className={cn(
                           "inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                           infoAtual.badgeColor
                        )}>
                           {infoAtual.badge}
                        </span>
                        <h2 className="text-white font-bold text-base mt-1 leading-snug">
                           {infoAtual.titulo}
                        </h2>
                     </div>
                  </div>
               </div>

               <p className="text-xs text-gray-300 mt-3 leading-relaxed">
                  {infoAtual.mensagem}
               </p>
            </div>

            {/* CARD DE RETIRADA (APENAS SE ESTIVER PRONTO) */}
            {isPronto && (
               <div className="bg-gradient-to-b from-green-950/40 to-green-950/10 border border-green-800/40 rounded-3xl p-5 space-y-4 shadow-xl shadow-green-950/20">
                  <div className="flex items-start gap-3">
                     <div className="p-2.5 rounded-2xl bg-green-500/10 text-green-400 border border-green-500/20 flex-shrink-0">
                        <MapPin className="w-5 h-5" />
                     </div>
                     <div>
                        <h3 className="font-bold text-white text-sm">Onde retirar seu pedido:</h3>
                        <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                           Rua Vinte e Um de Abril, 2210 - San Martin, Recife - PE
                           <br />
                           <span className="text-green-400/90 font-medium">(Em frente ao terminal de ônibus)</span>
                        </p>
                     </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 pt-1">
                     <a
                        href="https://www.google.com/maps/search/?api=1&query=Grafica+Phalis+Rua+Vinte+e+Um+de+Abril+2210+San+Martin+Recife+PE"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-green-500 hover:bg-green-400 text-black font-bold text-xs py-3 px-4 rounded-2xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-green-500/20"
                     >
                        <ExternalLink className="w-4 h-4" />
                        Como Chegar (Maps)
                     </a>
                     <a
                        href={`https://wa.me/55819985890254?text=${encodeURIComponent('Olá! Estou indo retirar o pedido ' + pedido.codigoVisual)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-white/5 hover:bg-white/10 text-white font-semibold text-xs py-3 px-4 rounded-2xl flex items-center justify-center gap-2 border border-white/10 transition-colors"
                     >
                        <MessageCircle className="w-4 h-4 text-green-400" />
                        Avisar no WhatsApp
                     </a>
                  </div>
               </div>
            )}

            {/* CARD 2: TIMELINE / LINHA DO TEMPO */}
            <div className="bg-[#121215] border border-gray-800/80 rounded-3xl p-5 shadow-xl space-y-4">
               <div className="flex items-center justify-between border-b border-gray-800/60 pb-3">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                     <Sparkles className="w-3.5 h-3.5 text-phalis-action" />
                     Etapas de Produção
                  </h3>
                  <span className="text-[11px] text-gray-500 font-mono">
                     Criado em {formatarDataHora(pedido.dataCriacao)}
                  </span>
               </div>

               {isCancelado ? (
                  <div className="bg-red-950/20 border border-red-900/30 p-4 rounded-2xl flex items-center gap-3">
                     <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
                     <div>
                        <h4 className="font-bold text-red-400 text-sm">Produção Cancelada</h4>
                        <p className="text-xs text-gray-400 mt-0.5">Este pedido foi interrompido no sistema.</p>
                     </div>
                  </div>
               ) : (
                  <div className="relative space-y-7 py-2">
                     {ETAPAS_PRODUCAO.map((step, idx) => {
                        const isCompleted = currentStatusIndex >= idx;
                        const isCurrent = currentStatusIndex === idx;
                        const isLast = idx === ETAPAS_PRODUCAO.length - 1;
                        const StepIcon = step.icone;

                        // Localiza data do histórico
                        const histEvent = pedido.historico.find(h => h.status === step.id);
                        const dataStr = histEvent
                           ? formatarDataHora(histEvent.data)
                           : (idx === 0 ? formatarDataHora(pedido.dataCriacao) : null);

                        return (
                           <div key={step.id} className="relative flex items-start gap-4">
                              {/* Coluna Esquerda: Ícone do Nó + Linha Conectora */}
                              <div className="relative flex flex-col items-center flex-shrink-0">
                                 {/* Marcador */}
                                 <div className={cn(
                                    "w-7 h-7 rounded-full flex items-center justify-center transition-all z-10",
                                    isCurrent
                                       ? "bg-phalis-action text-black ring-4 ring-phalis-action/20 shadow-[0_0_14px_rgba(234,88,12,0.5)]"
                                       : isCompleted
                                          ? "bg-green-600 text-white shadow-[0_0_8px_rgba(34,197,94,0.3)]"
                                          : "bg-gray-800 text-gray-500 border border-gray-700"
                                 )}>
                                    {isCompleted && !isCurrent ? (
                                       <Check className="w-3.5 h-3.5 stroke-[3]" />
                                    ) : (
                                       <StepIcon className="w-3.5 h-3.5" />
                                    )}
                                 </div>

                                 {/* Linha vertical conectando ao próximo nó */}
                                 {!isLast && (
                                    <div className={cn(
                                       "w-0.5 absolute top-7 bottom-[-28px]",
                                       isCompleted && currentStatusIndex > idx
                                          ? "bg-green-600/60"
                                          : isCurrent
                                             ? "bg-gradient-to-b from-phalis-action/60 to-gray-800"
                                             : "bg-gray-800"
                                    )} />
                                 )}
                              </div>

                              {/* Coluna Direita: Informações do Passo */}
                              <div className="flex-1 min-w-0 pt-0.5">
                                 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-0.5">
                                    <span className={cn(
                                       "text-sm font-bold truncate",
                                       isCurrent ? "text-phalis-action" : isCompleted ? "text-white" : "text-gray-500"
                                    )}>
                                       {step.titulo}
                                    </span>
                                    {isCompleted && dataStr && (
                                       <span className="text-[10px] text-gray-400 font-mono font-medium sm:text-right">
                                          {dataStr}
                                       </span>
                                    )}
                                 </div>
                                 <p className={cn(
                                    "text-xs mt-0.5 leading-relaxed",
                                    isCurrent ? "text-gray-300" : isCompleted ? "text-gray-400" : "text-gray-600"
                                 )}>
                                    {step.descricao}
                                 </p>
                              </div>
                           </div>
                        );
                     })}
                  </div>
               )}
            </div>

            {/* CARD 3: RESUMO DOS ITENS */}
            <div className="bg-[#121215] border border-gray-800/80 rounded-3xl p-5 shadow-xl space-y-3">
               <div className="flex items-center justify-between border-b border-gray-800/60 pb-3">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                     <ShoppingBag className="w-3.5 h-3.5 text-phalis-action" />
                     Itens do Pedido ({pedido.itens?.length || 0})
                  </h3>
               </div>

               <div className="space-y-2">
                  {pedido.itens.map((item, idx) => (
                     <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-black/40 rounded-2xl border border-gray-800/50 hover:border-gray-700/60 transition-colors"
                     >
                        <div className="flex items-center gap-3 min-w-0 pr-2">
                           <div className="w-8 h-8 rounded-xl bg-gray-800/60 border border-gray-700/50 flex items-center justify-center text-gray-400 flex-shrink-0">
                              <FileText className="w-4 h-4" />
                           </div>
                           <span className="text-xs font-semibold text-gray-200 truncate">
                              {item.nome}
                           </span>
                        </div>
                        <span className="bg-phalis-gray text-gray-300 border border-gray-700 px-2.5 py-1 rounded-xl text-[11px] font-mono font-bold flex-shrink-0">
                           {item.quantidade || 1} un
                        </span>
                     </div>
                  ))}
               </div>
            </div>

            {/* CARD 4: RESUMO FINANCEIRO */}
            <div className="bg-[#121215] border border-gray-800/80 rounded-3xl p-5 shadow-xl space-y-3">
               <div className="flex items-center justify-between border-b border-gray-800/60 pb-3">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                     <Clock className="w-3.5 h-3.5 text-phalis-action" />
                     Resumo Financeiro
                  </h3>
               </div>

               <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between text-gray-400">
                     <span>Total do Pedido:</span>
                     <span className="text-white font-bold text-sm">
                        R$ {totalPedido.toFixed(2)}
                     </span>
                  </div>

                  {pedido.statusFinanceiro === 'PARCIAL' && (
                     <>
                        <div className="flex items-center justify-between text-gray-400">
                           <span>Valor Pago (Entrada):</span>
                           <span className="text-green-400 font-semibold">
                              R$ {totalPago.toFixed(2)}
                           </span>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-gray-800 text-orange-400 font-bold">
                           <span>Restante na Retirada:</span>
                           <span className="text-sm">
                              R$ {saldoRestante.toFixed(2)}
                           </span>
                        </div>
                     </>
                  )}
               </div>

               {/* Badge Financeiro */}
               <div className="pt-1">
                  {pedido.statusFinanceiro === 'PAGO' ? (
                     <div className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold">
                        <CheckCircle2 className="w-4 h-4" />
                        Pagamento Concluído
                     </div>
                  ) : pedido.statusFinanceiro === 'PARCIAL' ? (
                     <div className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-bold">
                        <Clock className="w-4 h-4" />
                        Entrada Paga • Quitar saldo na retirada
                     </div>
                  ) : (
                     <div className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold">
                        <Clock className="w-4 h-4" />
                        Pagamento Pendente (Pague na Retirada ou via PIX)
                     </div>
                  )}
               </div>
            </div>

            {/* CARD 5: CANAL DE SUPORTE WHATSAPP */}
            <div className="bg-gradient-to-b from-[#16161b] to-[#101013] border border-gray-800 rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
               <div className="flex items-center gap-3 text-center sm:text-left">
                  <div className="w-10 h-10 rounded-2xl bg-green-500/10 text-green-400 border border-green-500/20 flex items-center justify-center flex-shrink-0">
                     <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                     <h4 className="font-bold text-xs text-white">Precisa de ajuda ou tem alguma dúvida?</h4>
                     <p className="text-[11px] text-gray-400 mt-0.5">Fale diretamente com o nosso atendimento.</p>
                  </div>
               </div>
               <a
                  href={`https://wa.me/5581985890254?text=${encodeURIComponent('Olá! Gostaria de falar sobre o meu pedido ' + pedido.codigoVisual)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto bg-green-600 hover:bg-green-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-green-600/20"
               >
                  <MessageCircle className="w-4 h-4" />
                  Chamar no WhatsApp
               </a>
            </div>

         </main>

         {/* FOOTER */}
         <footer className="mt-10 mb-4 text-center px-4 space-y-2">
            <p className="text-gray-600 text-[11px]">
               Gráfica Phalis © {new Date().getFullYear()} • Soluções em Artes e Impressos
            </p>
            <p className="text-gray-500 text-xs">
               Software desenvolvido por{' '}
               <a
                  href="https://www.linkedin.com/in/lucas-matheus-dev/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-gray-300 hover:text-white transition-colors border-b border-gray-600 hover:border-white pb-0.5"
               >
                  Lucas Alves
               </a>
            </p>
         </footer>
      </div>
   );
}
