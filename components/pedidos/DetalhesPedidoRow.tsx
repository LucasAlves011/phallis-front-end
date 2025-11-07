// Arquivo: components/pedidos/DetalhesPedidoRow.tsx
import React from 'react';
import { Pedido, HistoricoItem } from '@/lib/orderData';
import { optionGroupsConfig, getProductById, type Product } from '@/lib/productData';
import Image from 'next/image';

type DetalhesProps = {
   pedido: Pedido;
};

// Função de formatação de data
const formatarData = (isoString: string) => {
   return new Date(isoString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
   });
};

// Componente de Linha de Detalhe (alinhado à esquerda)
const DetailRow = ({ label, value }: { label: string, value: React.ReactNode }) => (
   <div className="py-2 border-b border-phalis-gray/50 text-sm">
      <span className="text-gray-400">{label}: </span>
      <span className="font-medium text-white">{value}</span>
   </div>
);

// Novo componente para o Log de Tempo
const TimeLog = ({ title, data }: { title: string, data: HistoricoItem[] }) => (
   <div>
      <h5 className="text-base font-semibold text-white mb-2">{title}</h5>
      <div className="space-y-2">
         {/* Mostra o histórico em ordem REVERSA (mais recente primeiro) */}
         {[...data].reverse().map((item, index) => (
            <div key={index} className="flex justify-between text-xs">
               <span className="text-white">{item.status.replace(/_/g, ' ').toUpperCase()}</span>
               <span className="text-gray-400">{formatarData(item.data)}</span>
            </div>
         ))}
      </div>
   </div>
);

// --- Renderizadores Específicos ---

const DetalhesUnidadeMetro: React.FC<{ pedido: Pedido; produto: Product }> = ({ pedido, produto }) => {
   const { detalhes, itemImageUrl, itemNome } = pedido;

   if (detalhes.type !== 'unidade' && detalhes.type !== 'metro') return null;
   const { opcoes } = detalhes;

   return (
      // Layout do grid principal atualizado para 4 colunas
      <div className="bg-phalis-gray rounded-lg p-4 grid grid-cols-1 md:grid-cols-4 gap-4">

         {/* Coluna 1: Imagem do Produto */}
         <div className="md:col-span-1">
            <div className="relative w-full h-40 rounded-md overflow-hidden bg-phalis-dark">
               <Image src={itemImageUrl} alt={itemNome} fill className="object-cover" />
            </div>
         </div>

         {/* Coluna 2: Opções do Builder */}
         <div className="md:col-span-1">
            <h4 className="text-lg font-semibold text-white mb-2">{itemNome}</h4>
            {optionGroupsConfig.map(group => {
               const optionId = opcoes[group.id] || 'N/A';
               const optionLabel = produto.options?.[group.id]?.find(o => o.id === optionId)?.name || optionId;
               return <DetailRow key={group.id} label={group.name.split('. ')[1]} value={optionLabel} />
            })}
         </div>

         {/* Coluna 3: Preço (Polimórfico) */}
         <div className="md:col-span-1">
            <h4 className="text-lg font-semibold text-white mb-2">Valores</h4>
            {detalhes.type === 'unidade' && (
               <>
                  <DetailRow label="Quantidade" value={detalhes.preco.quantidade} />
                  <DetailRow label="Custo (Unit)" value={`R$ ${detalhes.preco.precoCusto.toFixed(2)}`} />
                  <DetailRow label="Venda (Unit)" value={`R$ ${detalhes.preco.precoVenda.toFixed(2)}`} />
                  <DetailRow label="Arte" value={`R$ ${detalhes.preco.precoArte.toFixed(2)}`} />
                  <DetailRow label="TOTAL" value={
                     <span className="text-xl font-bold text-phalis-action">
                        R$ {detalhes.preco.total.toFixed(2)}
                     </span>
                  } />
               </>
            )}
            {detalhes.type === 'metro' && (
               <>
                  <DetailRow label="Largura" value={`${detalhes.preco.largura} cm`} />
                  <DetailRow label="Altura" value={`${detalhes.preco.altura} cm`} />
                  <DetailRow label="Custo (m²)" value={`R$ ${detalhes.preco.m2Custo.toFixed(2)}`} />
                  <DetailRow label="Venda (m²)" value={`R$ ${detalhes.preco.m2Venda.toFixed(2)}`} />
                  <DetailRow label="Arte" value={`R$ ${detalhes.preco.valorArte.toFixed(2)}`} />
                  <DetailRow label="TOTAL" value={
                     <span className="text-xl font-bold text-phalis-action">
                        R$ {detalhes.preco.total.toFixed(2)}
                     </span>
                  } />
               </>
            )}
         </div>

         {/* Nova Coluna 4 (Gestão do Tempo) */}
         <div className="md:col-span-1 space-y-4">
            <h4 className="text-lg font-semibold text-white mb-2">Gestão do Tempo</h4>
            <div className="text-xs space-y-1">
               <span className="text-gray-400 block">Pedido Criado em:</span>
               <span className="text-white font-medium">{formatarData(pedido.dataCriacao)}</span>
            </div>
            <TimeLog title="Financeiro" data={pedido.historicoFinanceiro} />
            <TimeLog title="Produção" data={pedido.historicoProducao} />
         </div>
      </div>
   );
};

const DetalhesArte: React.FC<{ pedido: Pedido; }> = ({ pedido }) => {
   const { detalhes, itemImageUrl, itemNome } = pedido;
   if (detalhes.type !== 'arte') return null;
   const { preco } = detalhes;

   return (
      // Layout do grid de Arte atualizado
      <div className="bg-phalis-gray rounded-lg p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
         {/* Coluna 1: Imagem */}
         <div className="md:col-span-1">
            <div className="relative w-full h-40 rounded-md overflow-hidden bg-phalis-dark">
               <Image src={itemImageUrl} alt={itemNome} fill className="object-cover" />
            </div>
         </div>
         {/* Coluna 2: Detalhes */}
         <div className="md:col-span-1">
            <h4 className="text-lg font-semibold text-white mb-2">{itemNome}</h4>
            <DetailRow label="Descrição/Observações" value={preco.observacao} />
            <DetailRow label="Valor Venda" value={
               <span className="text-xl font-bold text-phalis-action">
                  R$ {preco.valorVenda.toFixed(2)}
               </span>
            } />
         </div>
         {/* Nova Coluna 3 (Gestão do Tempo) */}
         <div className="md:col-span-1 space-y-4">
            <h4 className="text-lg font-semibold text-white mb-2">Gestão do Tempo</h4>
            <div className="text-xs space-y-1">
               <span className="text-gray-400 block">Pedido Criado em:</span>
               <span className="text-white font-medium">{formatarData(pedido.dataCriacao)}</span>
            </div>
            <TimeLog title="Financeiro" data={pedido.historicoFinanceiro} />
            <TimeLog title="Produção" data={pedido.historicoProducao} />
         </div>
      </div>
   );
};

// --- Componente Principal ---
const DetalhesPedidoRow: React.FC<DetalhesProps> = ({ pedido }) => {
   const produto = getProductById(pedido.productId);

   if (!produto) {
      return <div className="text-red-500 p-4">Erro: Produto original (ID: {pedido.productId}) não encontrado.</div>
   }

   switch (pedido.detalhes.type) {
      case 'unidade':
      case 'metro':
         return <DetalhesUnidadeMetro pedido={pedido} produto={produto} />;
      case 'arte':
         return <DetalhesArte pedido={pedido} />;
      default:
         return <div>Detalhes indisponíveis.</div>;
   }
};

export default DetalhesPedidoRow;