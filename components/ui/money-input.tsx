// Arquivo: components/ui/money-input.tsx
import React from 'react';
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type MoneyInputProps = React.ComponentPropsWithoutRef<typeof Input>;

const MoneyInput = React.forwardRef<HTMLInputElement, MoneyInputProps>(
   ({ className, value, ...props }, ref) => {

      // Lógica para checar se o input tem valor
      const hasValue = value != null && value !== '';

      return (
         <div
            className={cn(
               "flex h-10 w-full items-center rounded-md border border-input bg-phalis-gray px-3 py-2 text-sm",
               "ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
               "placeholder:text-muted-foreground",
               "disabled:cursor-not-allowed disabled:opacity-50",
               className
            )}
         >

            {/* ========================================================== */}
            {/* MUDANÇA 1: Trocado 'invisible' por 'hidden' */}
            {/* 'hidden' (display: none) remove o elemento do layout,
            corrigindo o "espaço em branco". */}
            {/* ========================================================== */}
            <span className={cn(
               "text-gray-400",
               !hasValue && "hidden" // <-- A CORREÇÃO
            )}>
               R$
            </span>

            <Input
               type="number"
               step="0.01"
               className={cn(
                  // ==========================================================
                  // MUDANÇA 2: Removido 'text-right'
                  // ==========================================================
                  "w-full p-0 pl-2 bg-transparent border-0", // <-- A CORREÇÃO
                  "focus-visible:ring-0 focus-visible:ring-offset-0",
                  "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
               )}
               ref={ref}
               value={value}
               {...props}
            />
         </div>
      );
   }
);
MoneyInput.displayName = "MoneyInput";

export { MoneyInput };