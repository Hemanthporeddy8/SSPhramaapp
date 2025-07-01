
"use client";

import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, User as UserIcon, Settings, Menu, Bell } from 'lucide-react';
import type { ReactNode } from 'react';
import { useSidebar } from '@/components/ui/sidebar'; // Import useSidebar

interface AppHeaderProps {
  pageTitle?: string;
  sidebarContent?: ReactNode; // For mobile sidebar
}

export function AppHeader({ pageTitle, sidebarContent }: AppHeaderProps) {
  const { user, logout } = useAuth();
  const { toggleSidebar, isMobile } = useSidebar(); // Get toggleSidebar and isMobile

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
      {isMobile && sidebarContent && (
         <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="shrink-0 md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col p-0">
             {sidebarContent}
          </SheetContent>
        </Sheet>
      )}
      {!isMobile && (
         <Button variant="outline" size="icon" onClick={toggleSidebar} className="shrink-0 hidden md:flex">
           <Menu className="h-5 w-5" />
           <span className="sr-only">Toggle sidebar</span>
         </Button>
      )}
      
      {pageTitle && <h1 className="text-xl font-semibold">{pageTitle}</h1>}
      
      <div className="ml-auto flex items-center gap-4">
        <Button variant="ghost" size="icon" className="rounded-full">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notifications</span>
        </Button>
        {user && (
          <></>
        )}
      </div>
    </header>
  );
}
