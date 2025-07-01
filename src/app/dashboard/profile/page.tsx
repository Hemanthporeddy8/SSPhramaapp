"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import type { PatientProfile } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, UserCircle2 } from 'lucide-react';
import Image from 'next/image';

// Mock function to fetch profile data
const fetchProfileData = async (userId: string): Promise<PatientProfile> => {
  console.log(`Fetching profile for user: ${userId}`);
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
  return {
    id: userId,
    email: 'patient@example.com', // This would come from auth or DB
    name: 'John Doe', // This would come from auth or DB
    role: 'patient',
    firstName: 'John',
    lastName: 'Doe',
    phone: '123-456-7890',
    dateOfBirth: '1990-01-01',
    address: '123 Main St, Anytown, USA',
    medicalHistorySummary: 'No significant medical history.',
  };
};

// Mock function to update profile data
const updateProfileData = async (userId: string, data: Partial<PatientProfile>): Promise<PatientProfile> => {
  console.log(`Updating profile for user: ${userId} with data:`, data);
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  // Return merged data as if API responded
  const currentData = await fetchProfileData(userId); // Fetch again to simulate DB state
  return { ...currentData, ...data };
};


export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchProfileData(user.id)
        .then(data => {
          setProfile(prev => ({...prev, ...data, email: user.email, name: user.name})); // Ensure auth user details are preserved/updated
          setIsLoading(false);
        })
        .catch(error => {
          console.error("Failed to fetch profile:", error);
          toast({ title: "Error", description: "Could not load profile data.", variant: "destructive" });
          setIsLoading(false);
        });
    }
  }, [user, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!profile) return;
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };
  
  const handleSaveChanges = async () => {
    if (!profile || !user) return;
    setIsSaving(true);
    try {
      const updatedProfile = await updateProfileData(user.id, profile);
      setProfile(updatedProfile);
      toast({ title: "Profile Updated", description: "Your profile information has been saved successfully." });
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast({ title: "Error", description: "Could not save profile data.", variant: "destructive" });
    }
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return <p className="text-center text-muted-foreground">Could not load profile data.</p>;
  }

  return (
    <div className="container mx-auto">
      <Card className="max-w-3xl mx-auto shadow-xl">
        <CardHeader className="items-center text-center">
            <div className="relative mb-4">
                <Image 
                    src={`https://placehold.co/128x128.png?text=${profile.name?.[0] || 'P'}`} 
                    alt="Profile Picture" 
                    width={128} 
                    height={128} 
                    className="rounded-full border-4 border-primary/50 shadow-md"
                    data-ai-hint="profile avatar"
                />
                <Button size="icon" variant="outline" className="absolute bottom-0 right-0 rounded-full h-8 w-8 bg-background">
                    <UserCircle2 className="h-4 w-4" />
                    <span className="sr-only">Change picture</span>
                </Button>
            </div>
          <CardTitle className="text-2xl font-bold">{profile.name}</CardTitle>
          <CardDescription>View and update your personal information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" name="firstName" value={profile.firstName || ''} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" name="lastName" value={profile.lastName || ''} onChange={handleInputChange} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" value={profile.email} disabled />
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" name="phone" type="tel" value={profile.phone || ''} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input id="dateOfBirth" name="dateOfBirth" type="date" value={profile.dateOfBirth || ''} onChange={handleInputChange} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea id="address" name="address" value={profile.address || ''} onChange={handleInputChange} placeholder="123 Main St, Anytown, USA" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="medicalHistorySummary">Medical History Summary</Label>
            <Textarea id="medicalHistorySummary" name="medicalHistorySummary" value={profile.medicalHistorySummary || ''} onChange={handleInputChange} placeholder="Brief summary of your medical history..." />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSaveChanges} disabled={isSaving} size="lg" className="ml-auto">
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Changes
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
