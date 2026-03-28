'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Loader2, PackageOpen, CheckCircle2, Clock, Truck, FileText, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

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

const FLUXO_PRODUCAO = [
    { id: 'PRE_PROD', label: 'Pedido Recebido' },
    { id: 'EM_PRODUCAO', label: 'Em Produção' },
    { id: 'ACABAMENTO', label: 'Acabamento' },
    { id: 'PRONTO', label: 'Pronto p/ Retirada' },
    { id: 'ENTREGUE', label: 'Entregue' }
];

export default function RastreioPublicoPage() {
    const params = useParams();
    const hash = params?.hash as string;

    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState('');
    const [pedido, setPedido] = useState<RastreioPedidoDTO | null>(null);

    useEffect(() => {
        if (!hash) return;

        // O front-end tem a URL base da API no env NEXT_PUBLIC_API_URL
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

        fetch(`${apiUrl}/api/public/rastreio/${hash}`)
            .then(async (res) => {
                if (!res.ok) {
                    if (res.status === 404) throw new Error("Pedido não encontrado ou link inválido.");
                    throw new Error("Erro ao carregar o rastreio.");
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
    }, [hash]);

    if (loading) {
        return (
            <div className="min-h-screen bg-phalis-black flex flex-col items-center justify-center p-4">
                <Loader2 className="w-12 h-12 text-phalis-action animate-spin mb-4" />
                <p className="text-gray-400">Buscando informações do seu pedido...</p>
            </div>
        );
    }

    if (erro || !pedido) {
        return (
            <div className="min-h-screen bg-phalis-black flex flex-col items-center justify-center p-4">
                <div className="bg-phalis-dark p-6 rounded-2xl border border-red-900/50 max-w-sm w-full text-center space-y-4 shadow-2xl">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
                    <h2 className="text-white text-xl font-bold">Ops! Algo deu errado.</h2>
                    <p className="text-gray-400 text-sm">{erro || "Pedido não encontrado."}</p>
                </div>
            </div>
        );
    }

    // Calcula em qual passo da timeline estamos
    const currentStatusIndex = FLUXO_PRODUCAO.findIndex(step => step.id === pedido.statusProducao);
    const isCancelado = pedido.statusProducao === 'CANCELADO';

    // Status Financeiro mais Amigável
    let finLabel = "Pendente";
    let finColor = "text-red-500 bg-red-500/10 border-red-500/30";
    if (pedido.statusFinanceiro === 'PAGO') {
        finLabel = "Pagamento Concluído";
        finColor = "text-green-400 bg-green-400/10 border-green-400/30";
    } else if (pedido.statusFinanceiro === 'PARCIAL') {
        finLabel = `Parte Paga (R$ ${pedido.totalPago.toFixed(2)})`;
        finColor = "text-yellow-500 bg-yellow-500/10 border-yellow-500/30";
    }

    return (
        <div className="min-h-screen bg-[#0d0d0d] text-white flex flex-col font-sans pb-10">
            {/* Cabeçalho */}
            <div className="bg-phalis-dark border-b border-gray-800 p-6 flex flex-col items-center justify-center pt-8 pb-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-phalis-action" />

                <div className="mb-4 relative w-36 h-12">
                    <Image src="/phalis-logo.svg" alt="Logo Phallis" fill className="object-contain drop-shadow-[0_0_10px_rgba(0,190,212,0.3)]" />
                </div>

                <h1 className="text-2xl font-bold">Olá, {pedido.primeiroNomeCliente}!</h1>
                <p className="text-gray-400 mt-1">Acompanhe o status do seu pedido</p>
                <div className="bg-black/50 px-4 py-1.5 rounded-full border border-gray-700 mt-4 font-mono text-sm tracking-widest text-cyan-400">
                    {pedido.codigoVisual}
                </div>
            </div>

            <div className="max-w-md w-full mx-auto p-4 space-y-6 -mt-4 relative z-10">

                {/* TIMELINE DE RASTREIO */}
                <div className="bg-[#151515] border border-gray-800 rounded-2xl p-6 shadow-xl space-y-6">
                    <h3 className="uppercase tracking-wider text-xs font-bold text-gray-500 mb-2">Progresso</h3>

                    {isCancelado ? (
                        <div className="bg-red-950/30 border border-red-900/50 p-4 rounded-xl flex items-center gap-3">
                            <XOctagon className="w-8 h-8 text-red-500" />
                            <div>
                                <h4 className="font-bold text-red-400">Pedido Cancelado</h4>
                                <p className="text-xs text-red-300">Entre em contato com a loja.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="relative border-l-2 border-gray-800 ml-3 space-y-8 py-2">
                            {FLUXO_PRODUCAO.map((step, idx) => {
                                const isCompleted = currentStatusIndex >= idx;
                                const isCurrent = currentStatusIndex === idx;

                                // Procura a data em que esse status foi atingido no histórico
                                // Se passou por ele, a primeira vez que apareceu no histórico serve como marcação de tempo.
                                const histEvent = pedido.historico.find(h => h.status === step.id);
                                const dataStr = histEvent
                                    ? new Date(histEvent.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
                                    : (idx === 0 ? new Date(pedido.dataCriacao).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : null);

                                return (
                                    <div key={step.id} className="relative pl-6">
                                        <div className={cn(
                                            "absolute -left-[9px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2",
                                            isCurrent ? "bg-phalis-action border-black shadow-[0_0_10px_#00bcd4] animate-pulse" :
                                                isCompleted ? "bg-phalis-action border-phalis-action" : "bg-gray-800 border-gray-700"
                                        )}>
                                            {isCompleted && !isCurrent && <Check className="w-3 h-3 text-black absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className={cn(
                                                "font-semibold text-sm",
                                                isCurrent ? "text-white" : isCompleted ? "text-gray-300" : "text-gray-600"
                                            )}>
                                                {step.label}
                                            </span>
                                            {isCompleted && dataStr && (
                                                <span className="text-xs text-cyan-600/70 font-mono mt-0.5">{dataStr}</span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* DETALHES DO PEDIDO */}
                <div className="bg-[#151515] border border-gray-800 rounded-2xl p-6 shadow-xl space-y-4">
                    <h3 className="uppercase tracking-wider text-xs font-bold text-gray-500">Resumo dos Itens</h3>
                    <ul className="space-y-3">
                        {pedido.itens.map((item, idx) => (
                            <li key={idx} className="flex justify-between items-center text-sm bg-black/30 p-3 rounded-lg border border-gray-800/50">
                                <div className="flex items-center gap-3">
                                    <FileText className="w-4 h-4 text-gray-500" />
                                    <span className="text-gray-200">{item.nome}</span>
                                </div>
                                <span className="bg-gray-800 text-gray-400 px-2 py-0.5 rounded text-xs font-bold">x{item.quantidade || 1}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* DETALHES FINANCEIROS */}
                <div className="bg-[#151515] border border-gray-800 rounded-2xl p-6 shadow-xl space-y-4">
                    <h3 className="uppercase tracking-wider text-xs font-bold text-gray-500">Financeiro</h3>
                    <div className="flex items-center justify-between">
                        <span className="text-gray-400">Total do Pedido:</span>
                        <span className="font-bold text-lg">R$ {pedido.totalPedido.toFixed(2)}</span>
                    </div>
                    <div className={cn("inline-flex items-center px-3 py-1.5 rounded-md border text-xs font-bold w-full justify-center gap-2", finColor)}>
                        {pedido.statusFinanceiro === 'PAGO' ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                        {finLabel}
                    </div>
                </div>

            </div>

            {/* Assinatura do Desenvolvedor Discreta, mas legível */}
            <footer className="mt-12 mb-6 text-center">
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

// Para usar ícones que não estavam importados ainda
const XOctagon = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
);
