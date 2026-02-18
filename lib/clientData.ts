// Arquivo: lib/clientData.ts
import { MOCK_CLIENTS } from "./mocks/clients";
import { type Cliente } from "@/types/client";

export * from "@/types/client";
export * from "./mocks/clients";

// Funções de cliente (mantidas iguais, mas agora com tipos exportados)
export const fetchClients = async (): Promise<Cliente[]> => {
   await new Promise(resolve => setTimeout(resolve, 300));
   return MOCK_CLIENTS;
};
export const addClient = async (data: Omit<Cliente, 'id'>): Promise<Cliente> => {
   await new Promise(resolve => setTimeout(resolve, 500));
   const novoCliente: Cliente = { ...data, id: `cli_${Math.random().toString(36).substr(2, 9)}` };
   MOCK_CLIENTS.unshift(novoCliente);
   return novoCliente;
};
export const editClient = async (id: string, data: Omit<Cliente, 'id'>): Promise<Cliente | null> => {
   await new Promise(resolve => setTimeout(resolve, 500));
   const index = MOCK_CLIENTS.findIndex(c => c.id === id);
   if (index === -1) return null;
   MOCK_CLIENTS[index] = { ...data, id };
   return MOCK_CLIENTS[index];
};
