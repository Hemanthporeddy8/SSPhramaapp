"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LifeBuoy } from 'lucide-react';

export default function AdminSupportPage() {
  return (
    <div className="container mx-auto">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <LifeBuoy className="h-6 w-6 text-primary" />
            Admin Support
          </CardTitle>
          <CardDescription>Access admin-specific support resources and contact channels.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10">
            <LifeBuoy className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-muted-foreground">Admin Support Page</h3>
            <p className="text-muted-foreground">This page is under construction. Admin support information will be available here.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
