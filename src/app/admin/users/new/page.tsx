
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { addPatient } from '@/lib/mockData';
import type { User } from '@/lib/types';
import { Loader2, Save, UserPlus, ArrowLeft } from 'lucide-react';

export default function AddNewPatientPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState<User['gender'] | undefined>(undefined);
  const [address, setAddress] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !dateOfBirth) {
      toast({
        title: 'Missing Required Fields',
        description: 'Please fill in Name, Email, and Date of Birth.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const newPatientData = {
        name: fullName,
        email,
        phone,
        dateOfBirth,
        gender,
        address,
        medicalHistorySummary: medicalHistory,
      };
      // Type assertion needed as addPatient expects specific fields, User type has more
      await addPatient(newPatientData as Omit<User, 'id' | 'role' | 'age'>); 
      toast({
        title: 'Patient Added Successfully!',
        description: `${fullName} has been added to the system.`,
      });
      router.push('/admin/users');
    } catch (error) {
      console.error("Failed to add patient:", error);
      toast({
        title: 'Error Adding Patient',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto">
       <div className="mb-4">
        <Button variant="outline" asChild>
          <Link href="/admin/users">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Patient List
          </Link>
        </Button>
      </div>
      <Card className="max-w-2xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <UserPlus className="h-7 w-7 text-primary" /> Add New Patient
          </CardTitle>
          <CardDescription>Enter the details for the new patient.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name <span className="text-destructive">*</span></Label>
                <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g., John Doe" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e.g., john.doe@example.com" required />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g., 555-123-4567" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth <span className="text-destructive">*</span></Label>
                <Input id="dateOfBirth" type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} required />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select value={gender} onValueChange={(value) => setGender(value as User['gender'])}>
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                  <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="e.g., 123 Main St, Anytown, USA" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="medicalHistory">Medical History Summary</Label>
              <Textarea id="medicalHistory" value={medicalHistory} onChange={(e) => setMedicalHistory(e.target.value)} placeholder="Brief summary of relevant medical history..." />
            </div>
          </CardContent>
          <CardFooter className="pt-6">
            <Button type="submit" size="lg" className="w-full md:w-auto ml-auto" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Save className="mr-2 h-5 w-5" />
              )}
              Save Patient
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
