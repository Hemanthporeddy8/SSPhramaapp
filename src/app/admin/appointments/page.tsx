
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { getAllAppointmentsAdminView } from '@/lib/mockData';
import type { Appointment, AppointmentStatus, PaymentStatus } from '@/lib/types';
import { Loader2, BriefcaseMedical, Search, Edit, XCircle, ArrowUpDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const getAppointmentStatusBadgeVariant = (status: AppointmentStatus): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case 'Scheduled': return 'default';
    case 'Sample Collected': return 'secondary';
    case 'In Lab': return 'outline';
    case 'Report Ready': return 'default'; 
    case 'Cancelled': return 'destructive';
    default: return 'outline';
  }
};

const getPaymentStatusBadgeVariant = (status: PaymentStatus): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'Paid': return 'default'; 
      case 'Pending': return 'secondary';
      case 'Failed': return 'destructive';
      default: return 'outline';
    }
};

type SortableAppointmentKeys = keyof Appointment | 'patientName';


export default function AdminManageAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: SortableAppointmentKeys; direction: 'ascending' | 'descending' } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setIsLoading(true);
    getAllAppointmentsAdminView()
      .then(data => {
        setAppointments(data);
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Failed to fetch appointments:", error);
        toast({ title: "Error", description: "Could not load appointments.", variant: "destructive" });
        setIsLoading(false);
      });
  }, [toast]);

  const requestSort = (key: SortableAppointmentKeys) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedAppointments = useMemo(() => {
    let sortableItems = [...appointments];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const valA = a[sortConfig.key as keyof Appointment];
        const valB = b[sortConfig.key as keyof Appointment];

        if (typeof valA === 'string' && typeof valB === 'string') {
          return sortConfig.direction === 'ascending' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        if (sortConfig.key === 'date') {
            const dateA = new Date(valA as string).getTime();
            const dateB = new Date(valB as string).getTime();
            return sortConfig.direction === 'ascending' ? dateA - dateB : dateB - dateA;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [appointments, sortConfig]);

  const filteredAppointments = sortedAppointments.filter(appointment =>
    appointment.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const getSortIndicator = (key: SortableAppointmentKeys) => {
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
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <BriefcaseMedical className="h-6 w-6 text-primary" />
            Manage Appointments
          </CardTitle>
          <CardDescription>View, modify, and manage all patient appointments.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by Service Name or Patient..."
                className="pl-8 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {filteredAppointments.length > 0 ? (
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Button variant="ghost" size="sm" className="p-0 hover:bg-transparent group" onClick={() => requestSort('serviceName')}>
                        Service Name{getSortIndicator('serviceName')}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" size="sm" className="p-0 hover:bg-transparent group" onClick={() => requestSort('patientName')}>
                        Patient Name{getSortIndicator('patientName')}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" size="sm" className="p-0 hover:bg-transparent group" onClick={() => requestSort('date')}>
                        Date{getSortIndicator('date')}
                      </Button>
                    </TableHead>
                    <TableHead>Time Slot</TableHead>
                    <TableHead>
                      <Button variant="ghost" size="sm" className="p-0 hover:bg-transparent group" onClick={() => requestSort('status')}>
                        Status{getSortIndicator('status')}
                      </Button>
                    </TableHead>
                     <TableHead>
                      <Button variant="ghost" size="sm" className="p-0 hover:bg-transparent group" onClick={() => requestSort('paymentStatus')}>
                        Payment{getSortIndicator('paymentStatus')}
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAppointments.map((appointment) => (
                    <TableRow key={appointment.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{appointment.serviceName}</TableCell>
                      <TableCell>{appointment.patientName}</TableCell>
                      <TableCell>{new Date(appointment.date).toLocaleDateString()}</TableCell>
                      <TableCell>{appointment.timeSlot}</TableCell>
                      <TableCell>
                        <Badge 
                            variant={getAppointmentStatusBadgeVariant(appointment.status)}
                            className={appointment.status === 'Report Ready' ? 'bg-green-500/80 hover:bg-green-500 text-white' : ''}
                        >
                            {appointment.status}
                        </Badge>
                      </TableCell>
                       <TableCell>
                        <Badge 
                            variant={getPaymentStatusBadgeVariant(appointment.paymentStatus)}
                            className={appointment.paymentStatus === 'Paid' ? 'bg-green-500/80 hover:bg-green-500 text-white' : appointment.paymentStatus === 'Pending' ? 'bg-yellow-500/80 hover:bg-yellow-500 text-white' : ''}
                        >
                            {appointment.paymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                          <Link href={`/admin/appointments/edit/${appointment.id}`}>
                            <Edit className="h-3.5 w-3.5" />
                            <span className="sr-only">Edit Appointment</span>
                          </Link>
                        </Button>
                         <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => toast({title: "Cancel Action", description: "Cancel functionality to be implemented."})}>
                          <XCircle className="h-3.5 w-3.5" />
                          <span className="sr-only">Cancel Appointment</span>
                        </Button>
                         <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/users/${appointment.patientId}`}>
                            View Patient
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
              <BriefcaseMedical className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? "No appointments found matching your search." : "No appointments available."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
