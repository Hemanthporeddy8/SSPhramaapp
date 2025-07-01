"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send } from 'lucide-react';
import type { DateRange } from "react-day-picker"

// Mock data
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
];

export default function BookAppointmentPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | undefined>();
  const [selectedService, setSelectedService] = useState<string | undefined>();
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTimeSlot || !selectedService) {
      toast({
        title: 'Missing Information',
        description: 'Please select a date, time slot, and service.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);

    toast({
      title: 'Appointment Booked!',
      description: `Your appointment for ${availableServices.find(s => s.id === selectedService)?.name} on ${selectedDate.toLocaleDateString()} at ${selectedTimeSlot} has been scheduled.`,
    });

    // Reset form (optional)
    // setSelectedDate(new Date());
    // setSelectedTimeSlot(undefined);
    // setSelectedService(undefined);
    // setNotes('');
  };

  return (
    <div className="container mx-auto">
      <Card className="max-w-4xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Book a New Appointment</CardTitle>
          <CardDescription>Choose your preferred date, time, and service for your lab test.</CardDescription>
        </CardHeader>
        <form onSubmit={handleBooking}>
          <CardContent className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <Label htmlFor="appointment-date" className="text-lg font-medium mb-2 block">Select Date</Label>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border p-0 w-full"
                  disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() -1)) || date > new Date(new Date().setDate(new Date().getDate() + 30))} // Disable past dates and dates beyond 30 days
                />
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <Label htmlFor="service" className="text-lg font-medium mb-2 block">Select Service</Label>
                <Select value={selectedService} onValueChange={setSelectedService}>
                  <SelectTrigger id="service" className="w-full h-12 text-base">
                    <SelectValue placeholder="Choose a lab test" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableServices.map(service => (
                      <SelectItem key={service.id} value={service.id} className="text-base py-2">
                        {service.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="time-slot" className="text-lg font-medium mb-2 block">Select Time Slot</Label>
                <Select value={selectedTimeSlot} onValueChange={setSelectedTimeSlot} disabled={!selectedDate}>
                  <SelectTrigger id="time-slot" className="w-full h-12 text-base">
                    <SelectValue placeholder={selectedDate ? "Choose an available time" : "Select a date first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTimeSlots.map(slot => (
                      <SelectItem key={slot} value={slot} className="text-base py-2">
                        {slot}
                      </SelectItem>
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
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-6">
            <Button type="submit" size="lg" className="w-full md:w-auto ml-auto" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Send className="mr-2 h-5 w-5" />
              )}
              Confirm Booking
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
