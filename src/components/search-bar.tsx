
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Button } from './ui/button';

export function SearchBar({ placeholder, query }: { placeholder: string, query?: string }) {
    return (
        <form className="flex w-full max-w-sm items-center space-x-2">
            <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    name="q"
                    defaultValue={query}
                    placeholder={placeholder}
                    className="pl-10 bg-background/50"
                />
            </div>
            <Button type="submit">Search</Button>
        </form>
    );
}
