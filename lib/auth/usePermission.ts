// Arquivo: lib/auth/usePermission.ts
import { useAuth } from './AuthContext';
import { Permission } from '@/types/client';

export function usePermission() {
   const { user } = useAuth();

   const isAdmin = () => user?.role === 'admin';

   const hasPermission = (permission: Permission) => {
      if (!user) return false;
      // 1. Admin tem acesso total (God Mode)
      if (user.role === 'admin') return true;
      // 2. Verifica o array de permissões
      return user.permissions?.includes(permission) || false;
   };

   // Helper para verificar MÚLTIPLAS permissões (ex: ver menu se tiver X ou Y)
   const hasAnyPermission = (permissions: Permission[]) => {
      return permissions.some(p => hasPermission(p));
   };

   return { hasPermission, hasAnyPermission, isAdmin, user };
}
