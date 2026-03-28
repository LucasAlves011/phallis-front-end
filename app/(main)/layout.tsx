import React from 'react';
import Header from '@/components/header/Header';
import PageWrapper from '@/components/motion/PageWrapper';
import { AuthGuard } from '@/lib/auth/AuthGuard';
import ForcePasswordChangeModal from '@/components/auth/ForcePasswordChangeModal';

export default function MainAppLayout({
   children,
}: {
   children: React.ReactNode;
}) {
   return (
      <AuthGuard>
         <div className="min-h-screen">
            <ForcePasswordChangeModal />

            <Header />

            <main className="main-content p-4 lg:p-6">
               <PageWrapper>
                  {children}
               </PageWrapper>
            </main>

         </div>
      </AuthGuard>
   );
}