// Arquivo: components/ui/money-input.tsx
import React from 'react';
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type MoneyInputProps = React.ComponentPropsWithoutRef<typeof Input>;

// Bloqueia teclas que geram valores negativos ou inválidos em inputs numéricos
const blockNegativeKeys = (e: React.KeyboardEvent<HTMLInputElement>) => {
   if (e.key === '-' || e.key === '+' || e.key === 'e' || e.key === 'E') {
      e.preventDefault();
   }
};

const MoneyInput = React.forwardRef<HTMLInputElement, MoneyInputProps>(
   ({ className, value, onChange, ...props }, ref) => {

      const hasValue = value != null && value !== '';

      const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
         // Garante que o valor nunca seja negativo
         if (e.target.value !== '' && Number(e.target.value) < 0) {
            e.target.value = '0';
         }
         onChange?.(e);
      };

      return (
         <div
            className={cn(
               "flex h-10 max-h-10 min-h-10 w-full items-center rounded-md border border-input bg-phalis-gray px-3 text-sm",
               "ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
               "placeholder:text-muted-foreground",
               "disabled:cursor-not-allowed disabled:opacity-50",
               className
            )}
         >
            <span className={cn("text-gray-400", !hasValue && "hidden")}>R$</span>

            <Input
               type="number"
               step="0.01"
               min={0}
               className={cn(
                  "w-full h-full p-0 pl-2 bg-transparent border-0",
                  "focus-visible:ring-0 focus-visible:ring-offset-0",
                  "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
               )}
               onWheel={(e) => e.currentTarget.blur()}
               onKeyDown={blockNegativeKeys}
               onChange={handleChange}
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