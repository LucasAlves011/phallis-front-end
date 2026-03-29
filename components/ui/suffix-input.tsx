// Arquivo: components/ui/suffix-input.tsx
import React from 'react';
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Bloqueia teclas que geram valores negativos ou inválidos em inputs numéricos
const blockNegativeKeys = (e: React.KeyboardEvent<HTMLInputElement>) => {
   if (e.key === '-' || e.key === '+' || e.key === 'e' || e.key === 'E') {
      e.preventDefault();
   }
};

export interface SuffixInputProps extends React.ComponentPropsWithoutRef<typeof Input> {
   suffix: string;
}

const SuffixInput = React.forwardRef<HTMLInputElement, SuffixInputProps>(
   ({ className, suffix, onChange, ...props }, ref) => {

      const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
         if (e.target.value !== '' && Number(e.target.value) < 0) {
            e.target.value = '0';
         }
         onChange?.(e);
      };

      return (
         <div
            className={cn(
               "flex h-10 max-h-10 w-full items-center rounded-md border border-input bg-phalis-gray px-3 text-sm",
               "ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
               "placeholder:text-muted-foreground",
               "disabled:cursor-not-allowed disabled:opacity-50",
               className
            )}
         >
            <Input
               type="number"
               min={0}
               className={cn(
                  "w-full p-0 bg-transparent border-0",
                  "focus-visible:ring-0 focus-visible:ring-offset-0",
                  "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
               )}
               onWheel={(e) => e.currentTarget.blur()}
               onKeyDown={blockNegativeKeys}
               onChange={handleChange}
               ref={ref}
               {...props}
            />
            <span className="text-gray-400 pl-2">{suffix}</span>
         </div>
      );
   }
);
SuffixInput.displayName = "SuffixInput";

export { SuffixInput };