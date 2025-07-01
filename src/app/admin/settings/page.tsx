"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings } from 'lucide-react';

export default function AdminSettingsPage() {
  return (
    <div className="container mx-auto">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <Settings className="h-6 w-6 text-primary" />
            Admin Settings
          </CardTitle>
          <CardDescription>Configure system settings and admin preferences.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10">
            <Settings className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-muted-foreground">Admin Settings Page</h3>
            <p className="text-muted-foreground">This page is under construction. System configuration options will be available here.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
