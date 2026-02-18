// Arquivo: app/mocks/MswComponent.tsx
'use client'; // Este componente SÓ roda no cliente

import { useEffect, useState } from 'react';

// 1. MUDANÇA: O componente agora aceita 'children'
export function MswComponent({ children }: { children: React.ReactNode }) {

   // 2. Estado para saber se o MSW está pronto
   const [isMockingEnabled, setIsMockingEnabled] = useState(false);

   useEffect(() => {
      const initMsw = async () => {
         // Só roda em 'development' E se ainda não foi iniciado E se não estiver desabilitado por env
         const isMswDisabled = process.env.NEXT_PUBLIC_DISABLE_MSW === 'true';

         if (process.env.NODE_ENV === 'development' && !isMockingEnabled && !isMswDisabled) {

            const { worker } = await import('./browser');

            // 3. ESPERA o worker iniciar
            //    'worker.start()' retorna uma Promise
            await worker.start({
               onUnhandledRequest: 'bypass',
            });

            // 4. Libera o app para ser renderizado
            setIsMockingEnabled(true);
         }
      };

      initMsw();

   }, [isMockingEnabled]); // Depende do estado

   // 5. Se não estivermos em 'development', apenas renderiza o app
   if (process.env.NODE_ENV !== 'development') {
      return <>{children}</>;
   }

   // 6. Se estivermos em 'development', SÓ renderiza o app
   //    DEPOIS que o MSW estiver pronto OU se estiver desabilitado
   const isMswDisabled = process.env.NEXT_PUBLIC_DISABLE_MSW === 'true';
   if (isMockingEnabled || isMswDisabled) {
      return <>{children}</>;
   }

   // 7. Enquanto o MSW carrega, mostra um loader global
   return (
      <div className="flex min-h-screen items-center justify-center bg-phalis-dark text-white">
         Carregando Mock Server...
      </div>
   );
}