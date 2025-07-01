
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, BriefcaseMedical, FileText, UploadCloud, DollarSign, Settings, LifeBuoy, LogOut, CalendarPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from 'next/image';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/appointments/book', label: 'Book Appointment', icon: CalendarPlus },
  { href: '/admin/appointments', label: 'Manage Appointments', icon: BriefcaseMedical },
  { href: '/admin/users', label: 'Manage Patients', icon: Users },
  { href: '/admin/reports/upload', label: 'Upload Reports', icon: UploadCloud },
  { href: '/admin/reports', label: 'Manage Reports', icon: FileText },
  { href: '/admin/billing', label: 'Manage Billing', icon: DollarSign },
];

const bottomNavItems = [
    { href: '/admin/settings', label: 'Settings', icon: Settings },
    { href: '/admin/support', label: 'Support', icon: LifeBuoy },
];

export function AdminSidebarContent() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <div className="flex h-full max-h-screen flex-col">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/admin/dashboard" className="flex items-center gap-2 font-semibold">
          // Removed logo image
          <span className="text-lg">PathAssist Admin</span>
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
