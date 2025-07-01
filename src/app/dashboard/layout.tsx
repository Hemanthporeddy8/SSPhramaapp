"use client";

import { AppHeader } from '@/components/layout/AppHeader';
import { PatientSidebarContent } from '@/components/layout/PatientSidebar';
import { Sidebar, SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useRequireAuth('patient');

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen w-full">
        <Sidebar collapsible="icon">
          <PatientSidebarContent />
        </Sidebar>
        <SidebarInset className="flex flex-col">
          <AppHeader pageTitle="Patient Dashboard" sidebarContent={<PatientSidebarContent />} />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-background">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
