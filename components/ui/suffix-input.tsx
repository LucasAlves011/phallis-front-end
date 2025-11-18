// Arquivo: components/ui/suffix-input.tsx
import React from 'react';
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// 1. Nossas props são as do Input + uma 'suffix'
export interface SuffixInputProps extends React.ComponentPropsWithoutRef<typeof Input> {
   suffix: string;
}

const SuffixInput = React.forwardRef<HTMLInputElement, SuffixInputProps>(
   ({ className, suffix, ...props }, ref) => {
      return (
         // 2. Este 'div' é o wrapper que VAI PARECER o input
         <div
            className={cn(
               "flex h-10 w-full items-center rounded-md border border-input bg-phalis-gray px-3 py-2 text-sm",
               "ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
               "placeholder:text-muted-foreground",
               "disabled:cursor-not-allowed disabled:opacity-50",
               className
            )}
         >
            {/* 3. O Input real, sem bordas ou fundo */}
            <Input
               type="number"
               className={cn(
                  "w-full p-0 bg-transparent border-0", // Alinhado à esquerda
                  "focus-visible:ring-0 focus-visible:ring-offset-0",
                  "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
               )}
               ref={ref}
               {...props} // Passa todas as props (value, onChange, placeholder, etc.)
            />

            {/* 4. O sufixo "m" */}
            <span className="text-gray-400 pl-2">{suffix}</span>
         </div>
      );
   }
);
SuffixInput.displayName = "SuffixInput";

export { SuffixInput };