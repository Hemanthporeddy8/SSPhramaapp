
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CalendarPlus, ChevronsUpDown, Check, UserPlusIcon } from 'lucide-react';
import { getAllPatients, adminBookAppointment, addPatient } from '@/lib/mockData';
import type { User } from '@/lib/types';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';


const availableTimeSlots = [
  "09:00 AM - 09:30 AM", "09:30 AM - 10:00 AM", "10:00 AM - 10:30 AM",
  "10:30 AM - 11:00 AM", "11:00 AM - 11:30 AM", "11:30 AM - 12:00 PM",
  "02:00 PM - 02:30 PM", "02:30 PM - 03:00 PM", "03:00 PM - 03:30 PM",
  "03:30 PM - 04:00 PM", "04:00 PM - 04:30 PM", "04:30 PM - 05:00 PM",
];

const availableServices = [
  { id: "cbc", name: "Complete Blood Count (CBC)" },
  { id: "lipid", name: "Lipid Profile" },
  { id: "thyroid", name: "Thyroid Function Test (TFT)" },
  { id: "glucose", name: "Glucose Test (Fasting/Random)" },
  { id: "vitamin_d", name: "Vitamin D Test" },
  { id: "allergy_panel", name: "Allergy Panel - Basic" },
  { id: "liver_function", name: "Liver Function Test (LFT)" },
  { id: "renal_function", name: "Renal Function Test (RFT)" },
];

type PatientEntryMode = 'select' | 'new';

export default function AdminBookAppointmentPage() {
  const [patients, setPatients] = useState<User[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string | undefined>();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | undefined>();
  const [timeInputValue, setTimeInputValue] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingPatients, setIsFetchingPatients] = useState(true);
  const [openPatientCombobox, setOpenPatientCombobox] = useState(false);
  const [openServiceCombobox, setOpenServiceCombobox] = useState(false);
  const [openTimeCombobox, setOpenTimeCombobox] = useState(false);
  const { toast } = useToast();

  const [patientEntryMode, setPatientEntryMode] = useState<PatientEntryMode>('select');
  const [newPatientFullName, setNewPatientFullName] = useState('');
  const [newPatientPhoneNumber, setNewPatientPhoneNumber] = useState('');

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

  useEffect(() => {
    if (openTimeCombobox) {
      setTimeInputValue(selectedTimeSlot || '');
    }
  }, [openTimeCombobox, selectedTimeSlot]);

  const resetForm = () => {
    setPatientEntryMode('select');
    setSelectedPatient(undefined);
    setNewPatientFullName('');
    setNewPatientPhoneNumber('');
    setSelectedDate(new Date());
    setSelectedTimeSlot(undefined);
    setTimeInputValue('');
    setSelectedServices([]);
    setNotes('');
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    let patientIdForBooking: string | undefined = selectedPatient;
    let patientNameForBooking: string | undefined;

    if (patientEntryMode === 'new') {
      if (!newPatientFullName || !newPatientPhoneNumber) {
        toast({ title: 'Missing New Patient Info', description: 'Please enter full name and phone number for the new patient.', variant: 'destructive' });
        return;
      }
      try {
        setIsLoading(true);
        const tempEmail = `${newPatientFullName.replace(/\s+/g, '.').toLowerCase()}-${Date.now()}@pathassist-temp.com`;
        const newPatientData = {
            name: newPatientFullName,
            email: tempEmail,
            phone: newPatientPhoneNumber,
            // Provide minimal required fields for User type, others can be undefined or default
            dateOfBirth: undefined, 
            gender: undefined,
            address: undefined,
            medicalHistorySummary: undefined,
        };
        const addedUser = await addPatient(newPatientData as Omit<User, 'id' | 'role' | 'age'>);
        patientIdForBooking = addedUser.id;
        patientNameForBooking = addedUser.name;
        // Optionally, refresh patient list if desired, or add to current list
        setPatients(prev => [...prev, addedUser]); 
      } catch (error) {
        console.error("Failed to add new patient:", error);
        toast({ title: "Error Adding Patient", description: "Could not add the new patient. Please try again.", variant: "destructive" });
        setIsLoading(false);
        return;
      }
    } else { // 'select' mode
      if (!selectedPatient) {
        toast({ title: 'Missing Information', description: 'Please select a patient.', variant: 'destructive' });
        return;
      }
      patientNameForBooking = patients.find(p => p.id === selectedPatient)?.name || 'Unknown Patient';
    }

    if (!patientIdForBooking || !selectedDate || !selectedTimeSlot || selectedServices.length === 0) {
      toast({
        title: 'Missing Information',
        description: 'Please ensure a patient is selected/added, and date, time slot, and at least one service are chosen.',
        variant: 'destructive',
      });
      setIsLoading(false); // Ensure loading is stopped if it was started for new patient add
      return;
    }

    setIsLoading(true); // Ensure loading is true for booking process
    const serviceNames = selectedServices.map(id =>
        availableServices.find(s => s.id === id)?.name || 'Unknown Service'
    );

    const bookingDetails = {
      patientId: patientIdForBooking,
      patientName: patientNameForBooking || 'Unknown Patient',
      date: selectedDate.toISOString().split('T')[0], // YYYY-MM-DD
      timeSlot: selectedTimeSlot,
      serviceNames: serviceNames,
      notes,
    };
    
    try {
      await adminBookAppointment(bookingDetails);
      toast({
        title: 'Appointment Booked Successfully!',
        description: `Appointment for ${bookingDetails.serviceNames.join(', ')} for ${bookingDetails.patientName} on ${new Date(bookingDetails.date).toLocaleDateString()} at ${bookingDetails.timeSlot} has been scheduled.`,
      });
      resetForm();
    } catch (error) {
        console.error("Failed to book appointment:", error);
        toast({ title: "Booking Error", description: "Could not book the appointment. Please try again.", variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  };

  if (isFetchingPatients && patientEntryMode === 'select') { // Only show full page loader if fetching for select mode
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-2">Loading patient data...</p>
      </div>
    );
  }

  const getServiceButtonLabel = () => {
    if (selectedServices.length === 0) return "Select services...";
    if (selectedServices.length === 1) {
      const service = availableServices.find(s => s.id === selectedServices[0]);
      return service ? service.name : "1 service selected";
    }
    return `${selectedServices.length} services selected`;
  };

  return (
    <div className="container mx-auto">
      <Card className="max-w-4xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <CalendarPlus className="h-7 w-7 text-primary" /> Book Appointment (Admin)
          </CardTitle>
          <CardDescription>Schedule a new lab test for a patient. You can select an existing patient or add a new one.</CardDescription>
        </CardHeader>
        <form onSubmit={handleBooking}>
          <CardContent className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <Label className="text-lg font-medium mb-2 block">Patient Option</Label>
                <RadioGroup defaultValue="select" value={patientEntryMode} onValueChange={(value) => setPatientEntryMode(value as PatientEntryMode)} className="flex space-x-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="select" id="selectPatient" />
                    <Label htmlFor="selectPatient">Select Existing Patient</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="new" id="newPatient" />
                    <Label htmlFor="newPatient">Add New Patient</Label>
                  </div>
                </RadioGroup>
              </div>

              {patientEntryMode === 'select' && (
                <div>
                  <Label htmlFor="patient-combobox" className="text-base font-medium mb-1 block">Select Patient</Label>
                  {isFetchingPatients ? (
                     <div className="flex items-center text-sm text-muted-foreground h-12">
                       <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading patients...
                     </div>
                   ) : (
                    <Popover open={openPatientCombobox} onOpenChange={setOpenPatientCombobox}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openPatientCombobox}
                          className="w-full justify-between h-12 text-base"
                          id="patient-combobox"
                          disabled={isLoading}
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
              )}

              {patientEntryMode === 'new' && (
                <div className="space-y-4 p-4 border rounded-md bg-muted/30">
                  <div className="flex items-center gap-2 text-primary font-medium">
                    <UserPlusIcon className="h-5 w-5" />
                    <span>New Patient Details</span>
                  </div>
                  <div>
                    <Label htmlFor="newPatientFullName" className="text-base font-medium mb-1 block">Full Name <span className="text-destructive">*</span></Label>
                    <Input
                      id="newPatientFullName"
                      value={newPatientFullName}
                      onChange={(e) => setNewPatientFullName(e.target.value)}
                      placeholder="Enter patient's full name"
                      className="h-11 text-base"
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <Label htmlFor="newPatientPhoneNumber" className="text-base font-medium mb-1 block">Phone Number <span className="text-destructive">*</span></Label>
                    <Input
                      id="newPatientPhoneNumber"
                      type="tel"
                      value={newPatientPhoneNumber}
                      onChange={(e) => setNewPatientPhoneNumber(e.target.value)}
                      placeholder="Enter patient's phone number"
                      className="h-11 text-base"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="appointment-date" className="text-lg font-medium mb-2 block">Select Date</Label>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border p-0 w-full"
                  disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() -1)) || date > new Date(new Date().setDate(new Date().getDate() + 60)) || isLoading}
                />
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <Label htmlFor="service-combobox" className="text-lg font-medium mb-2 block">Select Service(s)</Label>
                <Popover open={openServiceCombobox} onOpenChange={setOpenServiceCombobox}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openServiceCombobox}
                      className="w-full justify-between h-12 text-base"
                      id="service-combobox"
                      disabled={isLoading}
                    >
                      {getServiceButtonLabel()}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command>
                      <CommandInput placeholder="Search service..." />
                      <CommandList>
                        <CommandEmpty>No service found.</CommandEmpty>
                        <CommandGroup>
                          {availableServices.map(service => (
                            <CommandItem
                              key={service.id}
                              value={service.name}
                              onSelect={() => {
                                setSelectedServices(prev =>
                                  prev.includes(service.id)
                                    ? prev.filter(sId => sId !== service.id)
                                    : [...prev, service.id]
                                );
                              }}
                              className="text-base py-2"
                            >
                              <Checkbox
                                className="mr-2"
                                checked={selectedServices.includes(service.id)}
                                onCheckedChange={() => { 
                                   setSelectedServices(prev =>
                                    prev.includes(service.id)
                                      ? prev.filter(sId => sId !== service.id)
                                      : [...prev, service.id]
                                  );
                                }}
                                aria-label={`Select ${service.name}`}
                              />
                              {service.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label htmlFor="time-slot-combobox" className="text-lg font-medium mb-2 block">Select Time Slot</Label>
                <Popover open={openTimeCombobox} onOpenChange={setOpenTimeCombobox}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openTimeCombobox}
                      className="w-full justify-between h-12 text-base"
                      disabled={!selectedDate || isLoading}
                      id="time-slot-combobox"
                    >
                      {selectedTimeSlot || (selectedDate ? "Choose or enter time" : "Select a date first")}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command
                      filter={(value, search) => {
                        if (value.toLowerCase().includes(search.toLowerCase())) return 1;
                        return 0;
                      }}
                    >
                      <CommandInput
                        placeholder="Filter or type custom time"
                        value={timeInputValue}
                        onValueChange={setTimeInputValue}
                        className="text-base"
                      />
                      <CommandList>
                        <CommandEmpty>
                          {timeInputValue.trim() ? (
                            <div className="py-2 text-center text-sm">
                              No predefined slots match.
                            </div>
                          ) : (
                            "No predefined time slots."
                          )}
                        </CommandEmpty>
                        <CommandGroup>
                          {availableTimeSlots.map(slot => (
                            <CommandItem
                              key={slot}
                              value={slot}
                              onSelect={(currentValue) => {
                                setSelectedTimeSlot(currentValue);
                                setTimeInputValue(currentValue);
                                setOpenTimeCombobox(false);
                              }}
                              className="text-base py-2"
                            >
                               <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedTimeSlot === slot ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {slot}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                    {timeInputValue && !availableTimeSlots.some(slot => slot.toLowerCase() === timeInputValue.toLowerCase()) && timeInputValue.trim() !== "" && (
                        <div className="p-2 border-t mt-1">
                            <Button
                                variant="outline"
                                className="w-full h-9 text-sm"
                                onClick={() => {
                                    setSelectedTimeSlot(timeInputValue.trim());
                                    setOpenTimeCombobox(false);
                                }}
                            >
                                Use custom time: "{timeInputValue.trim()}"
                            </Button>
                        </div>
                    )}
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label htmlFor="notes" className="text-lg font-medium mb-2 block">Additional Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any specific instructions or information for the lab..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[100px] text-base"
                  disabled={isLoading}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-6">
            <Button type="submit" size="lg" className="w-full md:w-auto ml-auto" disabled={isLoading || (patientEntryMode === 'select' && isFetchingPatients) }>
              {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <CalendarPlus className="mr-2 h-5 w-5" />
              )}
              Confirm Booking
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
    
