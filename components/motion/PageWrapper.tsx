'use client';

// Importa a biblioteca 'motion' do framer-motion
import { motion } from 'framer-motion';
import React from 'react';

// Este componente vai "embrulhar" o conteúdo de cada página
const PageWrapper = ({ children }: { children: React.ReactNode }) => {
   return (
      <motion.div
         // Estado inicial: invisível e um pouco abaixo
         initial={{ opacity: 0, y: 15 }}
         // Estado final: totalmente visível na posição original
         animate={{ opacity: 1, y: 0 }}
         // Duração e tipo da transição
         transition={{ duration: 0.4, ease: 'easeOut' }}
      >
         {children}
      </motion.div>
   );
};

export default PageWrapper;