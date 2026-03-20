
'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { Menu, Users, MapPin, Shield, Calendar, QuoteIcon, Wand2, BookText, PenTool, BookCopy, UsersRound } from "lucide-react";

const navItems = [
    { href: "/fictions", icon: BookCopy, label: "Fictions" },
    { href: "/characters", icon: Users, label: "Characters" },
    { href: "/minor-characters", icon: UsersRound, label: "Minor Characters" },
    { href: "/places", icon: MapPin, label: "Places" },
    { href: "/family-names", icon: Shield, label: "Family Names" },
    { href: "/events", icon: Calendar, label: "Events" },
    { href: "/quotes", icon: QuoteIcon, label: "Quotes" },
    { href: "/worldbuild", icon: BookText, label: "Worldbuild" },
    { href: "/tone-changer", icon: PenTool, label: "Tone Changer" },
];

function NavContent() {
    const pathname = usePathname();
    return (
        <nav className="grid items-start gap-2">
            {navItems.map((item) => (
                <Link
                    key={item.label}
                    href={item.href}
                    className={cn(
                        "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                        pathname.startsWith(item.href) ? "bg-accent text-accent-foreground" : "transparent",
                    )}
                >
                    <item.icon className="mr-2 h-4 w-4 text-primary" />
                    <span>{item.label}</span>
                </Link>
            ))}
        </nav>
    );
}

export default function AppSidebar({ isMobile = false }: { isMobile?: boolean }) {
    if (isMobile) {
        return (
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <Menu className="h-6 w-6" />
                        <span className="sr-only">Toggle Menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="pr-0">
                    <SheetHeader>
                        <SheetTitle className="sr-only">Main Menu</SheetTitle>
                    </SheetHeader>
                    <Link href="/characters" className="flex items-center space-x-2 px-4 mb-4">
                        <Wand2 className="h-6 w-6 text-primary" />
                        <span className="font-headline text-lg font-bold">Writer Akashic</span>
                    </Link>
                    <div className="px-4">
                        <NavContent />
                    </div>
                </SheetContent>
            </Sheet>
        );
    }

    return (
        <div className="flex h-full flex-col py-4">
            <h2 className="relative px-4 font-headline text-lg font-semibold tracking-tight text-primary">
                MY AKASHIC
            </h2>
            <div className="mt-4 flex-1">
                <NavContent />
            </div>
        </div>
    );
}
