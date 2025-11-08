// Arquivo: lib/auth/AuthGuard.tsx
'use client';

import React, { useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useRouter } from 'next/navigation';

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
   const { user, isLoading } = useAuth();
   const router = useRouter();

   useEffect(() => {
      if (!isLoading && !user) {
         router.replace('/login');
      }
   }, [user, isLoading, router]);

   if (isLoading || user) {
      return <>{children}</>;
   }

   return null;
};