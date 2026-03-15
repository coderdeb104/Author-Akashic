
'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import type { Fiction } from '@/lib/types';

type CharacterFiltersProps = {
  races: string[];
  fictions: Fiction[];
  currentFilters: {
    race?: string;
    sex?: string;
    vital_status?: string;
    fiction_id?: string;
  }
};

export function CharacterFilters({ races, fictions, currentFilters }: CharacterFiltersProps) {
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
    current.delete('race');
    current.delete('sex');
    current.delete('vital_status');
    current.delete('fiction_id');
    const search = current.toString();
    const query = search ? `?${search}` : '';
    router.push(`${pathname}${query}`, { scroll: false });
  }

  const hasActiveFilters = !!(currentFilters.race || currentFilters.sex || currentFilters.vital_status || currentFilters.fiction_id);

  return (
    <div className="flex flex-col md:flex-row items-center gap-2 mb-6 p-4 border rounded-lg bg-card/50">
      <h3 className="text-sm font-semibold whitespace-nowrap pr-4">Filter by:</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:flex-row md:flex-wrap gap-2 flex-grow w-full">
        <Select onValueChange={(value) => handleFilterChange('fiction_id', value === 'all' ? '' : value)} value={currentFilters.fiction_id || 'all'}>
          <SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder="Fiction" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Fictions</SelectItem>
            {fictions.map((fiction) => <SelectItem key={fiction.id} value={fiction.id}>{fiction.title}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select onValueChange={(value) => handleFilterChange('race', value === 'all' ? '' : value)} value={currentFilters.race || 'all'}>
          <SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder="Race" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Races</SelectItem>
            {races.map((race) => <SelectItem key={race} value={race}>{race}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select onValueChange={(value) => handleFilterChange('sex', value === 'all' ? '' : value)} value={currentFilters.sex || 'all'}>
          <SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder="Sex" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sexes</SelectItem>
            <SelectItem value="Male">Male</SelectItem>
            <SelectItem value="Female">Female</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>

        <Select onValueChange={(value) => handleFilterChange('vital_status', value === 'all' ? '' : value)} value={currentFilters.vital_status || 'all'}>
          <SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder="Vital Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Alive">Alive</SelectItem>
            <SelectItem value="Dead">Dead</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
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
