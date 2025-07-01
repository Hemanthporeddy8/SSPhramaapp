
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UploadCloud, FileCheck2, ChevronsUpDown, Check } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { getAllPatients } from '@/lib/mockData';
import type { User } from '@/lib/types';
import { cn } from '@/lib/utils';


// Mock data for appointments - this should ideally come from mockData.ts or be fetched based on patient
const mockAppointments: Record<string, Array<{ id: string; name: string }>> = {
  patient1: [ { id: "appt1", name: "CBC (2024-07-20)"}, { id: "appt2", name: "Lipid Profile (2024-07-22)"} ],
  patient2: [ { id: "appt3", name: "Thyroid Test (2024-07-21)"} ],
  patient3: [],
  patient4: [ { id: "appt7", name: "Allergy Panel (2024-08-01)" } ], // Added for Emily Jones
};


export default function UploadReportPage() {
  const [patients, setPatients] = useState<User[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string | undefined>();
  const [selectedAppointment, setSelectedAppointment] = useState<string | undefined>();
  const [reportName, setReportName] = useState('');
  const [reportFile, setReportFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingPatients, setIsFetchingPatients] = useState(true);
  const [openPatientCombobox, setOpenPatientCombobox] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsFetchingPatients(true);
    getAllPatients()
      .then(data => {
        setPatients(data);
        setIsFetchingPatients(false);
      })
      .catch(error => {
        console.error("Failed to fetch patients:", error);
        toast({ title: "Error", description: "Could not load patients list.", variant: "destructive" });
        setIsFetchingPatients(false);
      });
  }, [toast]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setReportFile(event.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient || !selectedAppointment || !reportName || !reportFile) {
      toast({
        title: 'Missing Information',
        description: 'Please fill all required fields and select a report file.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append('patientId', selectedPatient);
    formData.append('appointmentId', selectedAppointment);
    formData.append('reportName', reportName);
    formData.append('reportFile', reportFile);
    formData.append('description', description);

    console.log("Uploading report with data:", {
        patientId: selectedPatient,
        appointmentId: selectedAppointment,
        reportName,
        fileName: reportFile.name,
        fileSize: reportFile.size,
        description,
    });
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);

    toast({
      title: 'Report Uploaded Successfully!',
      description: `${reportName} for ${patients.find(p=>p.id === selectedPatient)?.name} has been uploaded.`,
      action: <Button variant="outline" size="sm" onClick={() => console.log("View report")}>View</Button>
    });

    setSelectedPatient(undefined);
    setSelectedAppointment(undefined);
    setReportName('');
    setReportFile(null);
    setDescription('');
    const fileInput = document.getElementById('reportFile') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };
  
  const currentAppointments = selectedPatient && patients.find(p => p.id === selectedPatient) ? mockAppointments[selectedPatient] || [] : [];


  return (
    <div className="container mx-auto">
      <Card className="max-w-2xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <UploadCloud className="h-7 w-7 text-primary" /> Upload Test Report
          </CardTitle>
          <CardDescription>Attach and upload PDF test reports for patients.</CardDescription>
        </CardHeader>
        <form onSubmit={handleUpload}>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="patient-combobox" className="text-base font-medium mb-1 block">Select Patient</Label>
               {isFetchingPatients ? (
                 <div className="flex items-center text-sm text-muted-foreground">
                   <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading patients...
                 </div>
               ) : (
                <Popover open={openPatientCombobox} onOpenChange={setOpenPatientCombobox}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openPatientCombobox}
                      className="w-full justify-between h-11 text-base"
                      id="patient-combobox"
                    >
                      {selectedPatient
                        ? patients.find(patient => patient.id === selectedPatient)?.name
                        : "Select patient..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command>
                      <CommandInput placeholder="Search patient..." />
                      <CommandList>
                        <CommandEmpty>No patient found.</CommandEmpty>
                        <CommandGroup>
                          {patients.map(patient => (
                            <CommandItem
                              key={patient.id}
                              value={patient.name}
                              onSelect={() => {
                                setSelectedPatient(patient.id === selectedPatient ? undefined : patient.id);
                                setSelectedAppointment(undefined); // Reset appointment on patient change
                                setOpenPatientCombobox(false);
                              }}
                              className="text-base py-2"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedPatient === patient.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {patient.name} (ID: {patient.id})
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
               )}
            </div>

            <div>
              <Label htmlFor="appointment" className="text-base font-medium mb-1 block">Select Appointment</Label>
              <Select 
                value={selectedAppointment} 
                onValueChange={setSelectedAppointment} 
                disabled={!selectedPatient || currentAppointments.length === 0 || isFetchingPatients}
              >
                <SelectTrigger id="appointment" className="w-full h-11 text-base">
                  <SelectValue placeholder={
                      isFetchingPatients ? "Loading patients..." : 
                      !selectedPatient ? "Select patient first" : 
                      currentAppointments.length === 0 ? "No appointments for this patient" : 
                      "Choose an appointment"
                    } />
                </SelectTrigger>
                <SelectContent>
                  {currentAppointments.map((appt: {id: string, name: string}) => (
                    <SelectItem key={appt.id} value={appt.id} className="text-base py-2">
                      {appt.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="reportName" className="text-base font-medium mb-1 block">Report Name</Label>
              <Input 
                id="reportName" 
                value={reportName} 
                onChange={(e) => setReportName(e.target.value)} 
                placeholder="e.g., Complete Blood Count Report"
                className="h-11 text-base"
              />
            </div>

            <div>
              <Label htmlFor="reportFile" className="text-base font-medium mb-1 block">Report File (PDF)</Label>
              <Input 
                id="reportFile" 
                type="file" 
                accept=".pdf" 
                onChange={handleFileChange}
                className="h-11 text-base file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
              />
              {reportFile && (
                <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
                  <FileCheck2 className="h-4 w-4 text-green-500" /> Selected: {reportFile.name} ({(reportFile.size / 1024).toFixed(1)} KB)
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="description" className="text-base font-medium mb-1 block">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Any additional notes or summary for this report..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[100px] text-base"
              />
            </div>
          </CardContent>
          <CardFooter className="pt-6">
            <Button type="submit" size="lg" className="w-full md:w-auto ml-auto" disabled={isLoading || isFetchingPatients}>
              {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <UploadCloud className="mr-2 h-5 w-5" />
              )}
              Upload Report
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
    
