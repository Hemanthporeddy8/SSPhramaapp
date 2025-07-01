"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/contexts/AuthContext';
import type { TestReport } from '@/lib/types';
import { Loader2, FileText, Download, Search, ArrowUpDown } from 'lucide-react';
import { Input } from '@/components/ui/input';

// Mock function to fetch reports
const fetchReports = async (userId: string): Promise<TestReport[]> => {
  console.log(`Fetching reports for user: ${userId}`);
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  return [
    { id: '1', patientId: userId, patientName: 'John Doe', appointmentId: 'appt2', reportName: 'Lipid Profile Full Report', uploadDate: '2024-07-21T10:00:00Z', fileUrl: '/mock-report.pdf', description: 'Detailed analysis of cholesterol levels.' },
    { id: '2', patientId: userId, patientName: 'John Doe', appointmentId: 'apptOld1', reportName: 'CBC Analysis 2023', uploadDate: '2023-12-15T14:30:00Z', fileUrl: '/mock-report.pdf', description: 'Complete blood count from last year.' },
    { id: '3', patientId: userId, patientName: 'John Doe', appointmentId: 'apptOld2', reportName: 'Vitamin D Levels', uploadDate: '2024-01-10T09:15:00Z', fileUrl: '/mock-report.pdf' },
  ].sort((a,b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
};

export default function MyReportsPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<TestReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user) {
      fetchReports(user.id)
        .then(data => {
          setReports(data);
          setIsLoading(false);
        })
        .catch(error => {
          console.error("Failed to fetch reports:", error);
          setIsLoading(false);
        });
    }
  }, [user]);
  
  const filteredReports = reports.filter(report => 
    report.reportName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (report.description && report.description.toLowerCase().includes(searchTerm.toLowerCase()))
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
          <CardTitle className="text-2xl font-bold">My Test Reports</CardTitle>
          <CardDescription>Access and download your available lab test reports.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search reports by name or description..."
                className="pl-8 sm:w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {filteredReports.length > 0 ? (
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Report Name</TableHead>
                    <TableHead>
                        <Button variant="ghost" size="sm" className="p-0 hover:bg-transparent">
                            Upload Date <ArrowUpDown className="ml-2 h-3 w-3" />
                        </Button>
                    </TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.map((report) => (
                    <TableRow key={report.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium">{report.reportName}</TableCell>
                      <TableCell>{new Date(report.uploadDate).toLocaleDateString()}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-xs truncate">{report.description || 'N/A'}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={report.fileUrl} target="_blank" download>
                            <Download className="mr-2 h-4 w-4" /> Download PDF
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
                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                {searchTerm ? "No reports found matching your search." : "No reports available at the moment."}
                </p>
                {searchTerm && <p className="text-sm text-muted-foreground">Try adjusting your search term.</p>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

