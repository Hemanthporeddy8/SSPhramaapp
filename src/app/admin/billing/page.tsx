
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { getAllInvoices } from '@/lib/mockData';
import type { Invoice, PaymentStatus } from '@/lib/types';
import { Loader2, DollarSign, Search, Eye, ArrowUpDown, Edit, FilePlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const getPaymentStatusBadgeVariant = (status: PaymentStatus): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'Paid': return 'default'; 
      case 'Pending': return 'secondary';
      case 'Failed': return 'destructive';
      default: return 'outline';
    }
};

type SortableInvoiceKeys = keyof Invoice | 'patientName' | 'grandTotal';


export default function AdminManageBillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: SortableInvoiceKeys; direction: 'ascending' | 'descending' } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setIsLoading(true);
    getAllInvoices()
      .then(data => {
        setInvoices(data.map(inv => ({ ...inv, currency: inv.currency || 'INR' }))); // Ensure INR default
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Failed to fetch invoices:", error);
        toast({ title: "Error", description: "Could not load invoices.", variant: "destructive" });
        setIsLoading(false);
      });
  }, [toast]);

  const requestSort = (key: SortableInvoiceKeys) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedInvoices = useMemo(() => {
    let sortableItems = [...invoices];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let valA: any;
        let valB: any;

        if (sortConfig.key === 'grandTotal') {
          valA = a.amount + (a.taxAmount || 0);
          valB = b.amount + (b.taxAmount || 0);
        } else {
          valA = a[sortConfig.key as keyof Invoice];
          valB = b[sortConfig.key as keyof Invoice];
        }

        if (typeof valA === 'string' && typeof valB === 'string') {
          return sortConfig.direction === 'ascending' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortConfig.direction === 'ascending' ? valA - valB : valB - valA;
        }
        if (sortConfig.key === 'issueDate' || sortConfig.key === 'dueDate') {
            const dateA = new Date(valA as string).getTime();
            const dateB = new Date(valB as string).getTime();
            return sortConfig.direction === 'ascending' ? dateA - dateB : dateB - dateA;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [invoices, sortConfig]);

  const filteredInvoices = sortedInvoices.filter(invoice =>
    invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.items.some(item => item.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getSortIndicator = (key: SortableInvoiceKeys) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowUpDown className="ml-1 h-3 w-3 opacity-50 group-hover:opacity-100" />;
    }
    return sortConfig.direction === 'ascending' ? 
      <ArrowUpDown className="ml-1 h-3 w-3 opacity-100" /> : 
      <ArrowUpDown className="ml-1 h-3 w-3 opacity-100 transform rotate-180" />;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <Card className="shadow-xl">
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <DollarSign className="h-6 w-6 text-primary" />
              Manage Billing
            </CardTitle>
            <CardDescription>View billing summaries, manage invoices, and track payments. All amounts in INR (₹).</CardDescription>
          </div>
          <Button asChild>
            <Link href="/admin/billing/new">
                <FilePlus className="mr-2 h-4 w-4" />
                New Bill
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by Invoice #, Patient, or Service..."
                className="pl-8 w-full"
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
                    <TableHead>
                      <Button variant="ghost" size="sm" className="p-0 hover:bg-transparent group" onClick={() => requestSort('invoiceNumber')}>
                        Invoice #{getSortIndicator('invoiceNumber')}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" size="sm" className="p-0 hover:bg-transparent group" onClick={() => requestSort('patientName')}>
                        Patient Name{getSortIndicator('patientName')}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" size="sm" className="p-0 hover:bg-transparent group" onClick={() => requestSort('issueDate')}>
                        Issue Date{getSortIndicator('issueDate')}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" size="sm" className="p-0 hover:bg-transparent group" onClick={() => requestSort('grandTotal')}>
                        Amount (₹){getSortIndicator('grandTotal')}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" size="sm" className="p-0 hover:bg-transparent group" onClick={() => requestSort('status')}>
                        Status{getSortIndicator('status')}
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                      <TableCell>{invoice.patientName}</TableCell>
                      <TableCell>{new Date(invoice.issueDate).toLocaleDateString()}</TableCell>
                      <TableCell>₹{(invoice.amount + (invoice.taxAmount || 0)).toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge 
                            variant={getPaymentStatusBadgeVariant(invoice.status)}
                            className={invoice.status === 'Paid' ? 'bg-green-500/80 hover:bg-green-500 text-white' : invoice.status === 'Pending' ? 'bg-yellow-500/80 hover:bg-yellow-500 text-white' : ''}
                        >
                            {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/billing/invoice/${invoice.id}`}>
                            <Eye className="mr-1.5 h-3.5 w-3.5" /> View
                          </Link>
                        </Button>
                         <Button variant="secondary" size="sm" asChild>
                          <Link href={`/admin/billing/edit/${invoice.id}`}>
                            <Edit className="mr-1.5 h-3.5 w-3.5" /> Edit
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
                {searchTerm ? "No invoices found matching your search." : "No invoices available."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
