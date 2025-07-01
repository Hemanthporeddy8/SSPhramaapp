
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import type { Invoice, PaymentStatus } from '@/lib/types';
import { Loader2, DollarSign, Download, Search, ArrowUpDown } from 'lucide-react';
import { Input } from '@/components/ui/input';

// Mock function to fetch invoices
const fetchInvoices = async (userId: string): Promise<Invoice[]> => {
  console.log(`Fetching invoices for user: ${userId}`);
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  return [
    { id: '1', patientId: userId, patientName: 'John Doe', appointmentId: 'appt2', invoiceNumber: 'INV-2024-001', amount: 75.00, issueDate: '2024-07-21T00:00:00Z', status: 'Paid', invoiceUrl: '/mock-invoice.pdf', items: [{description: 'Lipid Profile', quantity: 1, unitPrice: 75, total: 75}] },
    { id: '2', patientId: userId, patientName: 'John Doe', appointmentId: 'appt3', invoiceNumber: 'INV-2024-002', amount: 50.00, issueDate: '2024-07-16T00:00:00Z', dueDate: '2024-07-31T00:00:00Z', status: 'Pending', invoiceUrl: '/mock-invoice.pdf', items: [{description: 'Thyroid Test', quantity: 1, unitPrice: 50, total: 50}] },
    { id: '3', patientId: userId, patientName: 'John Doe', appointmentId: 'apptOld1', invoiceNumber: 'INV-2023-105', amount: 45.00, issueDate: '2023-12-15T00:00:00Z', status: 'Paid', invoiceUrl: '/mock-invoice.pdf', items: [{description: 'CBC Analysis', quantity: 1, unitPrice: 45, total: 45}] },
  ].sort((a,b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());
};

const getStatusBadgeVariant = (status: PaymentStatus): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case 'Paid': return 'default'; // Success green-ish (customize or use primary)
    case 'Pending': return 'secondary'; // Orange-ish or grey
    case 'Failed': return 'destructive';
    default: return 'outline';
  }
};

export default function MyBillingPage() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user) {
      fetchInvoices(user.id)
        .then(data => {
          setInvoices(data);
          setIsLoading(false);
        })
        .catch(error => {
          console.error("Failed to fetch invoices:", error);
          setIsLoading(false);
        });
    }
  }, [user]);

  const filteredInvoices = invoices.filter(invoice => 
    invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.items.some(item => item.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">My Bills & Invoices</CardTitle>
          <CardDescription>View your billing history and download invoices.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by invoice number or service..."
                className="pl-8 sm:w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {filteredInvoices.length > 0 ? (
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>
                        <Button variant="ghost" size="sm" className="p-0 hover:bg-transparent">
                            Issue Date <ArrowUpDown className="ml-2 h-3 w-3" />
                        </Button>
                    </TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                      <TableCell>{new Date(invoice.issueDate).toLocaleDateString()}</TableCell>
                      <TableCell>{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}</TableCell>
                      <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(invoice.status)} className={invoice.status === 'Paid' ? 'bg-green-500/80 hover:bg-green-500 text-white' : invoice.status === 'Pending' ? 'bg-yellow-500/80 hover:bg-yellow-500 text-white' : ''}>
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        {invoice.status === 'Pending' && (
                            <Button variant="default" size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground">Pay Now</Button>
                        )}
                        <Button variant="outline" size="sm" asChild>
                          <Link href={invoice.invoiceUrl} target="_blank" download>
                            <Download className="mr-2 h-4 w-4" /> Invoice
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
             <div className="text-center py-10">
                <DollarSign className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                {searchTerm ? "No invoices found matching your search." : "No billing information available at the moment."}
                </p>
                {searchTerm && <p className="text-sm text-muted-foreground">Try adjusting your search term.</p>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
