'use client';

import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronDown, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MultiSelectOption {
   value: string;
   label: string;
   color?: string;
}

interface MultiSelectFilterProps {
   title: string;
   options: MultiSelectOption[];
   selectedValues: string[];
   onChange: (values: string[]) => void;
   className?: string;
}

export function MultiSelectFilter({
   title,
   options,
   selectedValues,
   onChange,
   className
}: MultiSelectFilterProps) {
   const [open, setOpen] = React.useState(false);

   const isAllSelected = selectedValues.length === 0;

   const handleToggle = (value: string) => {
      if (selectedValues.includes(value)) {
         const next = selectedValues.filter(v => v !== value);
         onChange(next);
      } else {
         onChange([...selectedValues, value]);
      }
   };

   const handleSelectAll = () => {
      onChange([]);
   };

   const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange([]);
   };

   // Label do Trigger
   const getTriggerLabel = () => {
      if (selectedValues.length === 0) {
         return `${title}: Todos`;
      }
      if (selectedValues.length === 1) {
         const opt = options.find(o => o.value === selectedValues[0]);
         return opt ? `${title}: ${opt.label}` : `${title}: 1 selecionado`;
      }
      return `${title}: ${selectedValues.length} selecionados`;
   };

   return (
      <Popover open={open} onOpenChange={setOpen}>
         <PopoverTrigger asChild>
            <Button
               variant="outline"
               role="combobox"
               aria-expanded={open}
               className={cn(
                  "h-10 justify-between bg-phalis-gray border-0 text-xs font-medium hover:bg-gray-800 text-gray-200 min-w-[190px]",
                  selectedValues.length > 0 && "text-white border border-phalis-action/40 bg-phalis-action/10",
                  className
               )}
            >
               <span className="truncate">{getTriggerLabel()}</span>
               <div className="flex items-center gap-1 ml-2 shrink-0">
                  {selectedValues.length > 0 && (
                     <span
                        onClick={handleClear}
                        className="rounded-full p-0.5 hover:bg-white/20 text-gray-400 hover:text-white transition-colors"
                        title="Limpar seleção"
                     >
                        <X size={13} />
                     </span>
                  )}
                  <ChevronDown className="h-4 w-4 opacity-50" />
               </div>
            </Button>
         </PopoverTrigger>

         <PopoverContent className="w-64 p-2 bg-[#18181b] border-gray-800 text-white rounded-xl shadow-2xl z-50">
            {/* Header com ações rápidas */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-800 text-[11px]">
               <span className="font-semibold text-gray-400">{title}</span>
               {selectedValues.length > 0 ? (
                  <button
                     type="button"
                     onClick={handleSelectAll}
                     className="text-phalis-action hover:underline font-semibold"
                  >
                     Limpar (Todos)
                  </button>
               ) : (
                  <span className="text-gray-500">Exibindo todos</span>
               )}
            </div>

            {/* Opção Todos */}
            <div
               onClick={handleSelectAll}
               className={cn(
                  "flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-colors mb-1",
                  isAllSelected ? "bg-phalis-action/20 text-phalis-action font-bold" : "hover:bg-gray-800 text-gray-300"
               )}
            >
               <span>Todos os status</span>
               {isAllSelected && <Check size={14} className="text-phalis-action" />}
            </div>

            {/* Lista de Opções */}
            <div className="space-y-0.5">
               {options.map((opt) => {
                  const isChecked = selectedValues.includes(opt.value);
                  return (
                     <div
                        key={opt.value}
                        onClick={() => handleToggle(opt.value)}
                        className={cn(
                           "flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-colors",
                           isChecked
                              ? "bg-white/10 text-white font-semibold"
                              : "hover:bg-gray-800/60 text-gray-300"
                        )}
                     >
                        <div className="flex items-center gap-2">
                           <Checkbox
                              checked={isChecked}
                              onCheckedChange={() => handleToggle(opt.value)}
                              className="border-gray-600 data-[state=checked]:bg-phalis-action data-[state=checked]:text-phalis-black data-[state=checked]:border-phalis-action"
                           />
                           <span>{opt.label}</span>
                        </div>
                        {opt.color && (
                           <span className="h-2 w-2 rounded-full" style={{ backgroundColor: opt.color }} />
                        )}
                     </div>
                  );
               })}
            </div>
         </PopoverContent>
      </Popover>
   );
}
