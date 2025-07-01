
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getAllTestReports } from '@/lib/mockData'; // Ensure this function exists and fetches all reports
import type { TestReport } from '@/lib/types';
import { Loader2, FileText, Search, Download, ArrowUpDown } from 'lucide-react';
import React from 'react'; // Added React import

export default function AdminManageReportsPage() {
  const [reports, setReports] = useState<TestReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof TestReport | 'patientName'; direction: 'ascending' | 'descending' } | null>(null);


  useEffect(() => {
    setIsLoading(true);
    getAllTestReports()
      .then(data => {
        setReports(data);
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Failed to fetch reports:", error);
        setIsLoading(false);
      });
  }, []);

  const requestSort = (key: keyof TestReport | 'patientName') => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedReports = React.useMemo(() => {
    let sortableItems = [...reports];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        // Handle patientName specifically as it's directly on the TestReport object
        const valA = a[sortConfig.key as keyof TestReport];
        const valB = b[sortConfig.key as keyof TestReport];

        if (typeof valA === 'string' && typeof valB === 'string') {
          if (valA.toLowerCase() < valB.toLowerCase()) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
          }
          if (valA.toLowerCase() > valB.toLowerCase()) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
          }
        } else if (typeof valA === 'number' && typeof valB === 'number') {
            if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
            if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
        } else if (sortConfig.key === 'uploadDate') { // Date sorting
            if (new Date(valA as string) < new Date(valB as string)) return sortConfig.direction === 'ascending' ? -1 : 1;
            if (new Date(valA as string) > new Date(valB as string)) return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [reports, sortConfig]);


  const filteredReports = sortedReports.filter(report =>
    report.reportName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (report.description && report.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const getSortIndicator = (key: keyof TestReport | 'patientName') => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowUpDown className="ml-2 h-3 w-3 opacity-50" />;
    }
    return sortConfig.direction === 'ascending' ? 
      <ArrowUpDown className="ml-2 h-3 w-3" /> : // Replace with UpArrow icon if available
      <ArrowUpDown className="ml-2 h-3 w-3 transform rotate-180" />; // Replace with DownArrow icon if available
  };


  return (
    <div className="container mx-auto">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            Manage Reports
          </CardTitle>
          <CardDescription>Oversee, search, and download all uploaded patient reports.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search reports by name, patient, or description..."
                className="pl-8 w-full"
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
                    <TableHead>
                      <Button variant="ghost" size="sm" className="p-0 hover:bg-transparent" onClick={() => requestSort('reportName')}>
                        Report Name {getSortIndicator('reportName')}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" size="sm" className="p-0 hover:bg-transparent" onClick={() => requestSort('patientName')}>
                        Patient Name {getSortIndicator('patientName')}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" size="sm" className="p-0 hover:bg-transparent" onClick={() => requestSort('uploadDate')}>
                        Upload Date {getSortIndicator('uploadDate')}
                      </Button>
                    </TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.map((report) => (
                    <TableRow key={report.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{report.reportName}</TableCell>
                      <TableCell>{report.patientName}</TableCell>
                      <TableCell>{new Date(report.uploadDate).toLocaleDateString()}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-xs truncate">{report.description || 'N/A'}</TableCell>
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
            </div>
          ) : (
            <div className="text-center py-10">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? "No reports found matching your search." : "No reports available."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
