
"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { getAppointmentById, updateAppointment, availableServices, appointmentStatuses, paymentStatuses } from '@/lib/mockData';
import type { Appointment, AppointmentStatus, PaymentStatus } from '@/lib/types';
import { Loader2, Save, ArrowLeft, CalendarDays, ChevronsUpDown, Check, UserCircle } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from '@/lib/utils';

const timeSlots = [
  "09:00 AM - 09:30 AM", "09:30 AM - 10:00 AM", "10:00 AM - 10:30 AM",
  "10:30 AM - 11:00 AM", "11:00 AM - 11:30 AM", "11:30 AM - 12:00 PM",
  "02:00 PM - 02:30 PM", "02:30 PM - 03:00 PM", "03:00 PM - 03:30 PM",
  "03:30 PM - 04:00 PM", "04:00 PM - 04:30 PM", "04:30 PM - 05:00 PM",
];

export default function EditAppointmentPage() {
  const router = useRouter();
  const params = useParams();
  const appointmentId = params.appointmentId as string;
  const { toast } = useToast();

  const [appointment, setAppointment] = useState<Partial<Appointment> | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | undefined>();
  const [timeInputValue, setTimeInputValue] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<AppointmentStatus | undefined>();
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | undefined>();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [openServiceCombobox, setOpenServiceCombobox] = useState(false);
  const [openTimeCombobox, setOpenTimeCombobox] = useState(false);

  useEffect(() => {
    if (appointmentId) {
      setIsLoading(true);
      getAppointmentById(appointmentId)
        .then(data => {
          if (data) {
            setAppointment(data);
            setSelectedDate(new Date(data.date));
            setSelectedTimeSlot(data.timeSlot);
            setTimeInputValue(data.timeSlot);
            setSelectedServices(data.serviceIds || availableServices.filter(s => data.serviceName.includes(s.name)).map(s => s.id));
            setNotes(data.notes || '');
            setStatus(data.status);
            setPaymentStatus(data.paymentStatus);
          } else {
            toast({ title: "Error", description: "Appointment not found.", variant: "destructive" });
            router.push('/admin/appointments');
          }
          setIsLoading(false);
        })
        .catch(error => {
          console.error("Failed to fetch appointment:", error);
          toast({ title: "Error", description: "Could not load appointment details.", variant: "destructive" });
          setIsLoading(false);
          router.push('/admin/appointments');
        });
    }
  }, [appointmentId, toast, router]);

  useEffect(() => {
    if (openTimeCombobox) {
      setTimeInputValue(selectedTimeSlot || '');
    }
  }, [openTimeCombobox, selectedTimeSlot]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointment || !appointmentId || !selectedDate || !selectedTimeSlot || selectedServices.length === 0 || !status || !paymentStatus) {
        toast({ title: "Missing Information", description: "Please ensure all fields are filled.", variant: "destructive" });
        return;
    }
    
    setIsSaving(true);
    const serviceNames = selectedServices.map(id =>
        availableServices.find(s => s.id === id)?.name || 'Unknown Service'
    );

    const updatedData: Partial<Appointment> = {
      date: selectedDate.toISOString().split('T')[0],
      timeSlot: selectedTimeSlot,
      serviceName: serviceNames.join(', '),
      serviceIds: selectedServices,
      notes,
      status,
      paymentStatus,
    };

    try {
      await updateAppointment(appointmentId, updatedData);
      toast({
        title: 'Appointment Updated!',
        description: `Appointment for ${appointment.patientName} has been updated successfully.`,
      });
      router.push('/admin/appointments');
    } catch (error) {
      console.error("Failed to update appointment:", error);
      toast({ title: "Error Updating Appointment", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-2">Loading appointment details...</p>
      </div>
    );
  }

  if (!appointment) {
    return <p className="text-center text-muted-foreground">Appointment data could not be loaded.</p>;
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
      <div className="mb-4">
        <Button variant="outline" asChild>
          <Link href="/admin/appointments">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Appointments List
          </Link>
        </Button>
      </div>
      <Card className="max-w-4xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <CalendarDays className="h-7 w-7 text-primary" /> Edit Appointment
          </CardTitle>
          <CardDescription>Modify details for appointment ID: {appointment.id}</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <Label className="text-lg font-medium mb-2 block">Patient</Label>
                <div className="flex items-center gap-3 p-3 border rounded-md bg-muted/50">
                    <UserCircle className="h-8 w-8 text-muted-foreground"/>
                    <div>
                        <p className="font-semibold">{appointment.patientName}</p>
                        <p className="text-sm text-muted-foreground">ID: {appointment.patientId}</p>
                    </div>
                </div>
              </div>
              <div>
                <Label htmlFor="appointment-date" className="text-lg font-medium mb-2 block">Select Date</Label>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border p-0 w-full"
                  disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() -1)) || date > new Date(new Date().setDate(new Date().getDate() + 60)) || isSaving}
                />
              </div>
              <div>
                <Label htmlFor="status" className="text-lg font-medium mb-2 block">Appointment Status</Label>
                <Select value={status} onValueChange={(value) => setStatus(value as AppointmentStatus)} disabled={isSaving}>
                  <SelectTrigger id="status" className="h-12 text-base">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {appointmentStatuses.map(s => (
                      <SelectItem key={s} value={s} className="text-base py-2">{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                      disabled={isSaving}
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
                      disabled={!selectedDate || isSaving}
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
                          {timeSlots.map(slot => (
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
                    {timeInputValue && !timeSlots.some(slot => slot.toLowerCase() === timeInputValue.toLowerCase()) && timeInputValue.trim() !== "" && (
                        <div className="p-2 border-t mt-1">
                            <Button
                                variant="outline"
                                className="w-full h-9 text-sm"
                                onClick={() => {
                                    setSelectedTimeSlot(timeInputValue.trim());
                                    setOpenTimeCombobox(false);
                                }}
                                disabled={isSaving}
                            >
                                Use custom time: "{timeInputValue.trim()}"
                            </Button>
                        </div>
                    )}
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label htmlFor="paymentStatus" className="text-lg font-medium mb-2 block">Payment Status</Label>
                <Select value={paymentStatus} onValueChange={(value) => setPaymentStatus(value as PaymentStatus)} disabled={isSaving}>
                  <SelectTrigger id="paymentStatus" className="h-12 text-base">
                    <SelectValue placeholder="Select payment status" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentStatuses.map(s => (
                      <SelectItem key={s} value={s} className="text-base py-2">{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="notes" className="text-lg font-medium mb-2 block">Additional Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any specific instructions or information for the lab..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[100px] text-base"
                  disabled={isSaving}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-6 justify-end space-x-3">
             <Button type="button" variant="outline" onClick={() => router.push('/admin/appointments')} disabled={isSaving}>
                Cancel
            </Button>
            <Button type="submit" size="lg" disabled={isSaving || isLoading}>
              {isSaving ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Save className="mr-2 h-5 w-5" />
              )}
              Save Changes
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
