"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import type { Appointment, AppointmentStatus } from '@/lib/types';
import { Loader2, CalendarPlus, Search, Filter, ArrowUpDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


// Mock function to fetch appointments
const fetchAppointments = async (userId: string): Promise<Appointment[]> => {
  console.log(`Fetching appointments for user: ${userId}`);
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  return [
    { id: '1', patientId: userId, patientName: 'John Doe', date: '2024-07-25', timeSlot: '10:00 AM - 10:30 AM', serviceName: 'Complete Blood Count', status: 'Scheduled', paymentStatus: 'Paid' },
    { id: '2', patientId: userId, patientName: 'John Doe', date: '2024-07-20', timeSlot: '02:30 PM - 03:00 PM', serviceName: 'Lipid Profile', status: 'Report Ready', paymentStatus: 'Paid' },
    { id: '3', patientId: userId, patientName: 'John Doe', date: '2024-07-15', timeSlot: '11:00 AM - 11:30 AM', serviceName: 'Thyroid Function Test', status: 'Sample Collected', paymentStatus: 'Pending' },
    { id: '4', patientId: userId, patientName: 'John Doe', date: '2024-07-10', timeSlot: '09:00 AM - 09:30 AM', serviceName: 'Glucose Test', status: 'In Lab', paymentStatus: 'Paid' },
    { id: '5', patientId: userId, patientName: 'John Doe', date: '2024-07-05', timeSlot: '03:00 PM - 03:30 PM', serviceName: 'Vitamin D Test', status: 'Cancelled', paymentStatus: 'Pending' },
  ].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Sort by most recent
};

const getStatusBadgeVariant = (status: AppointmentStatus): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case 'Scheduled': return 'default'; // blue-ish
    case 'Sample Collected': return 'secondary'; // grey-ish
    case 'In Lab': return 'outline'; // With border, text color primary
    case 'Report Ready': return 'default'; // Success green-ish (customize if possible or use primary)
    case 'Cancelled': return 'destructive';
    default: return 'outline';
  }
};

export default function MyAppointmentsPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilters, setStatusFilters] = useState<Record<AppointmentStatus, boolean>>({
    'Scheduled': true,
    'Sample Collected': true,
    'In Lab': true,
    'Report Ready': true,
    'Cancelled': true,
  });

  useEffect(() => {
    if (user) {
      fetchAppointments(user.id)
        .then(data => {
          setAppointments(data);
          setIsLoading(false);
        })
        .catch(error => {
          console.error("Failed to fetch appointments:", error);
          setIsLoading(false);
        });
    }
  }, [user]);

  const handleStatusFilterChange = (status: AppointmentStatus) => {
    setStatusFilters(prev => ({ ...prev, [status]: !prev[status] }));
  };

  const filteredAppointments = appointments
    .filter(appt => statusFilters[appt.status])
    .filter(appt => 
      appt.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appt.date.includes(searchTerm)
    );
  
  const appointmentStatuses: AppointmentStatus[] = ['Scheduled', 'Sample Collected', 'In Lab', 'Report Ready', 'Cancelled'];


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
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="text-2xl font-bold">My Appointments</CardTitle>
            <CardDescription>View your appointment history and upcoming schedules.</CardDescription>
          </div>
          <Button asChild>
            <Link href="/dashboard/appointments/book">
              <CalendarPlus className="mr-2 h-4 w-4" /> Book New Appointment
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by service or date..."
                className="pl-8 sm:w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="shrink-0">
                  <Filter className="mr-2 h-4 w-4" /> Status Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {appointmentStatuses.map((status) => (
                    <DropdownMenuCheckboxItem
                        key={status}
                        checked={statusFilters[status]}
                        onCheckedChange={() => handleStatusFilterChange(status)}
                    >
                        {status}
                    </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {filteredAppointments.length > 0 ? (
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Service Name</TableHead>
                    <TableHead>
                        <Button variant="ghost" size="sm" className="p-0 hover:bg-transparent">
                            Date <ArrowUpDown className="ml-2 h-3 w-3" />
                        </Button>
                    </TableHead>
                    <TableHead>Time Slot</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAppointments.map((appt) => (
                    <TableRow key={appt.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium">{appt.serviceName}</TableCell>
                      <TableCell>{new Date(appt.date).toLocaleDateString()}</TableCell>
                      <TableCell>{appt.timeSlot}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(appt.status)} className="capitalize">
                          {appt.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={appt.paymentStatus === 'Paid' ? 'default' : 'destructive'} className={appt.paymentStatus === 'Paid' ? 'bg-green-500/80 hover:bg-green-500 text-white' : ''}>
                          {appt.paymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="link" size="sm" asChild className="text-primary">
                          <Link href={`/dashboard/appointments/${appt.id}`}>View Details</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-10">
              <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No appointments found matching your criteria.</p>
              {searchTerm && <p className="text-sm text-muted-foreground">Try adjusting your search or filters.</p>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
