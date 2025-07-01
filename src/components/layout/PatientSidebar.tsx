"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, CalendarPlus, FileText, DollarSign, User, BriefcaseMedical, Settings, LifeBuoy, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from 'next/image';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/dashboard/appointments/book', label: 'Book Appointment', icon: CalendarPlus },
  { href: '/dashboard/appointments', label: 'My Appointments', icon: BriefcaseMedical },
  { href: '/dashboard/reports', label: 'My Reports', icon: FileText },
  { href: '/dashboard/billing', label: 'My Bills', icon: DollarSign },
  { href: '/dashboard/profile', label: 'Profile', icon: User },
];

const bottomNavItems = [
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
    { href: '/dashboard/support', label: 'Support', icon: LifeBuoy },
];

export function PatientSidebarContent() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <div className="flex h-full max-h-screen flex-col">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          // Removed logo image
          <span className="text-lg">PathAssist</span>
        </Link>
      </div>
      <ScrollArea className="flex-1 overflow-y-auto">
        <nav className="grid items-start gap-1 px-4 py-4 text-sm font-medium">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-primary/10',
                pathname === item.href && 'bg-primary/10 text-primary font-semibold'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </ScrollArea>
      <div className="mt-auto p-4 border-t">
         <nav className="grid items-start gap-1 text-sm font-medium">
            {bottomNavItems.map((item) => (
                <Link
                key={item.label}
                href={item.href}
                className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-primary/10',
                    pathname === item.href && 'bg-primary/10 text-primary font-semibold'
                )}
                >
                <item.icon className="h-4 w-4" />
                {item.label}
                </Link>
            ))}
            <Button variant="ghost" onClick={logout} className="w-full justify-start flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                <LogOut className="h-4 w-4" />
                Logout
            </Button>
        </nav>
      </div>
    </div>
  );
}
