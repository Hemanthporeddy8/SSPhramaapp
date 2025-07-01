"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCircle } from 'lucide-react';

export default function AdminProfilePage() {
  return (
    <div className="container mx-auto">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <UserCircle className="h-6 w-6 text-primary" />
            Admin Profile
          </CardTitle>
          <CardDescription>View and manage your admin profile.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10">
            <UserCircle className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-muted-foreground">Admin Profile Page</h3>
            <p className="text-muted-foreground">This page is under construction. Admin profile details will be available here.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
