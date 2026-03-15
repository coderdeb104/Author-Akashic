"use client";

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from './scroll-area';

export type MultiSelectOption = {
  value: string;
  label: string;
};

interface MultiSelectProps {
  options: MultiSelectOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  className?: string;
  placeholder?: string;
}

function MultiSelect({ options, selected, onChange, className, placeholder = "Select..." }: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (value: string) => {
    const newSelected = selected.includes(value)
      ? selected.filter((item) => item !== value)
      : [...selected, value];
    onChange(newSelected);
  };

  const selectedOptions = options.filter((option) => selected.includes(option.value));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between h-auto min-h-10", className)}
        >
          <div className="flex flex-wrap gap-1">
            {selectedOptions.length > 0 ? (
              selectedOptions.map(option => <Badge key={option.value} variant="secondary">{option.label}</Badge>)
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <ScrollArea className="max-h-60">
            <div className="p-1">
                {options.length > 0 ? options.map((option) => (
                    <div
                        key={option.value}
                        onClick={() => handleSelect(option.value)}
                        className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent focus:bg-accent"
                    >
                        <div
                            className={cn(
                                "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                selected.includes(option.value) ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible"
                            )}
                        >
                            <Check className={cn("h-4 w-4")} />
                        </div>
                        {option.label}
                    </div>
                )) : (
                    <div className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm text-muted-foreground">
                        No fictions found.
                    </div>
                )}
            </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

export { MultiSelect };
