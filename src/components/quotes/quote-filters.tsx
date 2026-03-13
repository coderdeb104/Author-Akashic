
'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

type QuoteFiltersProps = {
  speakers: string[];
  currentFilters: {
    speaker?: string;
  }
};

export function QuoteFilters({ speakers, currentFilters }: QuoteFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleFilterChange = (key: string, value: string) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));

    if (!value) {
      current.delete(key);
    } else {
      current.set(key, value);
    }

    const search = current.toString();
    const query = search ? `?${search}` : '';

    router.push(`${pathname}${query}`, { scroll: false });
  };
  
  const clearFilters = () => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.delete('speaker');
    const search = current.toString();
    const query = search ? `?${search}` : '';
    router.push(`${pathname}${query}`, { scroll: false });
  }

  const hasActiveFilters = !!currentFilters.speaker;

  return (
    <div className="flex flex-col md:flex-row items-center gap-2 mb-6 p-4 border rounded-lg bg-card/50">
      <h3 className="text-sm font-semibold whitespace-nowrap pr-4">Filter by:</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 flex-grow w-full">
        <Select onValueChange={(value) => handleFilterChange('speaker', value === 'all' ? '' : value)} value={currentFilters.speaker || 'all'}>
          <SelectTrigger><SelectValue placeholder="Speaker" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Speakers</SelectItem>
            {speakers.map((speaker) => <SelectItem key={speaker} value={speaker}>{speaker}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      {hasActiveFilters && (
        <Button variant="ghost" onClick={clearFilters} className="mt-2 md:mt-0 md:ml-2 self-end md:self-center">
            <X className="mr-2 h-4 w-4" />
            Clear
        </Button>
      )}
    </div>
  );
}
