"use client"

import * as React from "react"
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu"
import { Button } from "@/src/components/ui/button"
import type { Column } from "@tanstack/react-table"
import { ChevronDown } from "lucide-react"

// 1. A LISTA DE OPÇÕES FOI REMOVIDA DAQUI.
// Ela será passada como uma propriedade.

// 2. A INTERFACE DE PROPS AGORA INCLUI 'options'
interface DropdownHeaderTableProps<TData, TValue> {
  column: Column<TData, TValue>
  title: string
}

export function DropdownHeaderTable<TData, TValue>({
  column,
  title,
}: Readonly<DropdownHeaderTableProps<TData, TValue>>) {

  const selectedValues = new Set((column.getFilterValue() as string[]) ?? []);

    // Usamos a função da tabela para pegar os valores únicos da coluna
  const facetedValues = column.getFacetedUniqueValues();
  // Transformamos o resultado (que é um Map) em um array de opções para o nosso menu
  const options = React.useMemo(() => {
    const sortedValues = Array.from(facetedValues.keys()).sort((a, b) => {
      // If both are numbers, sort numerically; otherwise, use localeCompare for strings
      if (!isNaN(Number(a)) && !isNaN(Number(b))) {
        return Number(a) - Number(b);
      }
      return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: "base" });
    });
    return sortedValues.map(value => ({
      value: value,
      label: value, // Usamos o próprio valor como label, mas você poderia customizar
    }));
  }, [facetedValues]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="-ml-3 h-8 group cursor-pointer">
          <span>{title}</span>
          {selectedValues.size > 0 && (
            <span className="ml-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
              {selectedValues.size}
            </span>
          )}
          <ChevronDown
            className="ml-2 h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180"
            aria-hidden="true"
          />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-40" align="start">
        <div className="max-h-auto overflow-y-auto p-1">
          {/* 3. O .map() AGORA USA A PROP 'options' */}
          {options.map((option) => {
            const isChecked = selectedValues.has(option.value);

            return (
              <DropdownMenuCheckboxItem
                key={option.value}
                checked={isChecked}
                onCheckedChange={() => {
                  const newSelectedValues = new Set(selectedValues);
                  if (isChecked) {
                    newSelectedValues.delete(option.value);
                  } else {
                    newSelectedValues.add(option.value);
                  }
                  
                  const filterValues = Array.from(newSelectedValues);
                  column.setFilterValue(
                    filterValues.length > 0 ? filterValues : undefined
                  );
                }}
              >
                {option.label}
              </DropdownMenuCheckboxItem>
            );
          })}
        </div>
        
        {selectedValues.size > 0 && (
            <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onSelect={() => column.setFilterValue(undefined)}
                    className="justify-center text-center"
                >
                    Limpar filtro
                </DropdownMenuItem>
            </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}