
"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { getPatientById, getAppointmentsByPatientId, getTestReportsByPatientId, getInvoicesByPatientId } from '@/lib/mockData';
import type { User, Appointment, TestReport, Invoice, AppointmentStatus, PaymentStatus } from '@/lib/types';
import { Loader2, UserCircle, CalendarDays, FileTextIcon, DollarSign, ArrowLeft, Download, Eye, Edit } from 'lucide-react';

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

export default function PatientDetailPage() {
  const params = useParams();
  const patientId = params.patientId as string;

  const [patient, setPatient] = useState<User | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [reports, setReports] = useState<TestReport[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (patientId) {
      setIsLoading(true);
      Promise.all([
        getPatientById(patientId),
        getAppointmentsByPatientId(patientId),
        getTestReportsByPatientId(patientId),
        getInvoicesByPatientId(patientId),
      ]).then(([patientData, appointmentsData, reportsData, invoicesData]) => {
        setPatient(patientData || null);
        setAppointments(appointmentsData);
        setReports(reportsData);
        setInvoices(invoicesData.map(inv => ({ ...inv, currency: inv.currency || 'INR' }))); // Ensure INR default
        setIsLoading(false);
      }).catch(error => {
        console.error("Failed to load patient details:", error);
        setIsLoading(false);
      });
    }
  }, [patientId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="container mx-auto text-center py-10">
        <UserCircle className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Patient Not Found</h2>
        <p className="text-muted-foreground mb-4">The patient with ID '{patientId}' could not be found.</p>
        <Button asChild variant="outline">
          <Link href="/admin/users"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Patient List</Link>
        </Button>
      </div>
    );
  }
  
  const calculateAge = (dobString?: string): number | string => {
    if (!dobString) return 'N/A';
    const birthDate = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
  };


  return (
    <div className="container mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="outline" asChild>
          <Link href="/admin/users">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Patient List
          </Link>
        </Button>
      </div>

      {/* Patient Information Card */}
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-start gap-4 space-y-0">
            <Image 
                src={`https://placehold.co/100x100.png?text=${patient.name?.[0] || 'P'}`} 
                alt={`${patient.name}'s profile`} 
                width={80} 
                height={80} 
                className="rounded-full border"
                data-ai-hint="profile avatar"
            />
            <div className="flex-1">
                <CardTitle className="text-3xl font-bold">{patient.name}</CardTitle>
                <CardDescription className="text-md">Patient ID: {patient.id}</CardDescription>
            </div>
            <Button variant="outline" size="icon"><Edit className="h-4 w-4" /></Button>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
          <div><strong>Email:</strong> {patient.email}</div>
          <div><strong>Phone:</strong> {patient.phone || 'N/A'}</div>
          <div><strong>Date of Birth:</strong> {patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : 'N/A'}</div>
          <div><strong>Age:</strong> {calculateAge(patient.dateOfBirth)}</div>
          <div><strong>Gender:</strong> {patient.gender || 'N/A'}</div>
          <div className="md:col-span-2"><strong>Address:</strong> {patient.address || 'N/A'}</div>
          <div className="md:col-span-3">
            <strong>Medical History Summary:</strong>
            <p className="text-sm text-muted-foreground mt-1">{patient.medicalHistorySummary || 'N/A'}</p>
          </div>
        </CardContent>
      </Card>

      {/* Appointments Card */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><CalendarDays className="h-6 w-6 text-primary" />Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          {appointments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map(appt => (
                  <TableRow key={appt.id}>
                    <TableCell>{appt.serviceName}</TableCell>
                    <TableCell>{new Date(appt.date).toLocaleDateString()}</TableCell>
                    <TableCell>{appt.timeSlot}</TableCell>
                    <TableCell><Badge variant={getAppointmentStatusBadgeVariant(appt.status)}>{appt.status}</Badge></TableCell>
                    <TableCell><Badge variant={getPaymentStatusBadgeVariant(appt.paymentStatus)} className={appt.paymentStatus === 'Paid' ? 'bg-green-500/80 hover:bg-green-500 text-white' : ''}>{appt.paymentStatus}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : <p className="text-muted-foreground">No appointments found for this patient.</p>}
        </CardContent>
      </Card>

      {/* Test Reports Card */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileTextIcon className="h-6 w-6 text-primary" />Test Reports</CardTitle>
        </CardHeader>
        <CardContent>
          {reports.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report Name</TableHead>
                  <TableHead>Upload Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map(report => (
                  <TableRow key={report.id}>
                    <TableCell>{report.reportName}</TableCell>
                    <TableCell>{new Date(report.uploadDate).toLocaleDateString()}</TableCell>
                    <TableCell className="max-w-xs truncate">{report.description || 'N/A'}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={report.fileUrl} target="_blank" download>
                          <Download className="mr-2 h-4 w-4" /> Download
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : <p className="text-muted-foreground">No test reports found for this patient.</p>}
        </CardContent>
      </Card>

      {/* Billing History Card */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><DollarSign className="h-6 w-6 text-primary" />Billing History</CardTitle>
        </CardHeader>
        <CardContent>
          {invoices.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Amount (₹)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map(invoice => (
                  <TableRow key={invoice.id}>
                    <TableCell>{invoice.invoiceNumber}</TableCell>
                    <TableCell>{new Date(invoice.issueDate).toLocaleDateString()}</TableCell>
                    <TableCell>₹{invoice.amount.toFixed(2)}</TableCell>
                    <TableCell><Badge variant={getPaymentStatusBadgeVariant(invoice.status)} className={invoice.status === 'Paid' ? 'bg-green-500/80 hover:bg-green-500 text-white' : invoice.status === 'Pending' ? 'bg-yellow-500/80 hover:bg-yellow-500 text-white' : ''}>{invoice.status}</Badge></TableCell>
                    <TableCell className="text-right space-x-2">
                       {invoice.status === 'Pending' && (
                        <Button variant="secondary" size="sm">Mark as Paid</Button>
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
          ) : <p className="text-muted-foreground">No billing history found for this patient.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
