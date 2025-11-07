// Arquivo: app/mocks/browser.ts
'use client' // (A partir do MSW v2, isso não é mais necessário, mas não prejudica)
import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

// Configura o worker com os handlers que definimos
export const worker = setupWorker(...handlers);