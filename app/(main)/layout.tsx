import React from 'react';
import Header from '@/components/header/Header';
import PageWrapper from '@/components/motion/PageWrapper';

export default function MainAppLayout({
   children,
}: {
   children: React.ReactNode;
}) {
   return (
      <div className="min-h-screen">

         <Header />

         <main className="main-content p-4 lg:p-6">
            <PageWrapper>
               {children}
            </PageWrapper>
         </main>

      </div>
   );
}