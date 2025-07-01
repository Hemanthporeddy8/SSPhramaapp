"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { CalendarPlus, FileText, DollarSign, UserCircle, Activity, Clock, ShieldCheck, MessageSquare } from 'lucide-react';
import Image from 'next/image';

// Mock data for dashboard
const upcomingAppointments = [
  { id: '1', testName: 'Complete Blood Count', date: '2024-07-25', time: '10:00 AM', status: 'Scheduled' },
  { id: '2', testName: 'Lipid Profile', date: '2024-07-28', time: '02:30 PM', status: 'Scheduled' },
];

const recentReports = [
  { id: '1', reportName: 'Thyroid Function Test Report', date: '2024-07-15', url: '#' },
  { id: '2', reportName: 'Vitamin D Test Report', date: '2024-07-10', url: '#' },
];

export default function PatientDashboardPage() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto space-y-8">
      <Card className="shadow-lg border-primary/20">
        <CardHeader className="bg-primary/5 rounded-t-lg p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-3xl font-bold text-primary">Welcome back, {user?.name}!</CardTitle>
              <CardDescription className="text-lg text-muted-foreground mt-1">
                Here's a quick overview of your health journey.
              </CardDescription>
            </div>
            <Button asChild size="lg">
              <Link href="/dashboard/appointments/book">
                <CalendarPlus className="mr-2 h-5 w-5" /> Book New Appointment
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <QuickActionCard title="Book Appointment" icon={<CalendarPlus className="h-8 w-8 text-primary" />} href="/dashboard/appointments/book" description="Schedule your next lab test easily."/>
          <QuickActionCard title="View Reports" icon={<FileText className="h-8 w-8 text-primary" />} href="/dashboard/reports" description="Access your latest test results."/>
          <QuickActionCard title="Check Billing" icon={<DollarSign className="h-8 w-8 text-primary" />} href="/dashboard/billing" description="View your invoices and payment status."/>
          <QuickActionCard title="My Profile" icon={<UserCircle className="h-8 w-8 text-primary" />} href="/dashboard/profile" description="Update your personal information."/>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Clock className="h-6 w-6 text-primary" /> Upcoming Appointments
            </CardTitle>
            <CardDescription>Your scheduled lab tests.</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingAppointments.length > 0 ? (
              <ul className="space-y-4">
                {upcomingAppointments.map((appt) => (
                  <li key={appt.id} className="p-4 rounded-md border bg-card hover:bg-muted/50 transition-colors">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold">{appt.testName}</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(appt.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at {appt.time}
                        </p>
                      </div>
                      <span className="text-sm font-medium px-2 py-1 rounded-full bg-primary/20 text-primary">{appt.status}</span>
                    </div>
                    <Button variant="link" size="sm" className="p-0 h-auto mt-2 text-primary">View Details</Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-center py-4">No upcoming appointments.</p>
            )}
            <Button variant="outline" className="w-full mt-6" asChild>
              <Link href="/dashboard/appointments">View All Appointments</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <FileText className="h-6 w-6 text-primary" /> Recent Test Reports
            </CardTitle>
            <CardDescription>Your latest available reports.</CardDescription>
          </CardHeader>
          <CardContent>
            {recentReports.length > 0 ? (
              <ul className="space-y-4">
                {recentReports.map((report) => (
                  <li key={report.id} className="p-4 rounded-md border bg-card hover:bg-muted/50 transition-colors">
                     <div className="flex justify-between items-center">
                        <div>
                            <h4 className="font-semibold">{report.reportName}</h4>
                            <p className="text-sm text-muted-foreground">
                            Available since: {new Date(report.date).toLocaleDateString()}
                            </p>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={report.url} target="_blank">Download PDF</Link>
                        </Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-center py-4">No recent reports available.</p>
            )}
            <Button variant="outline" className="w-full mt-6" asChild>
              <Link href="/dashboard/reports">View All Reports</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <ShieldCheck className="h-6 w-6 text-primary" /> Health Tips & News
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
          <div className="flex items-start gap-4 p-4 rounded-md border bg-card">
            <Image src="https://placehold.co/100x100.png" alt="Health Tip 1" width={80} height={80} className="rounded-md object-cover" data-ai-hint="health wellbeing"/>
            <div>
              <h4 className="font-semibold mb-1">Stay Hydrated for Better Health</h4>
              <p className="text-sm text-muted-foreground">Drinking enough water is crucial for overall well-being and can impact test results.</p>
              <Button variant="link" size="sm" className="p-0 h-auto mt-1 text-primary">Read More</Button>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 rounded-md border bg-card">
            <Image src="https://placehold.co/100x100.png" alt="Health Tip 2" width={80} height={80} className="rounded-md object-cover" data-ai-hint="nutrition fitness"/>
            <div>
              <h4 className="font-semibold mb-1">Understanding Your Lab Results</h4>
              <p className="text-sm text-muted-foreground">Learn how to interpret common lab test values and what they mean for your health.</p>
              <Button variant="link" size="sm" className="p-0 h-auto mt-1 text-primary">Read More</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface QuickActionCardProps {
  title: string;
  icon: React.ReactNode;
  href: string;
  description: string;
}

function QuickActionCard({ title, icon, href, description }: QuickActionCardProps) {
  return (
    <Link href={href} className="block group">
      <Card className="h-full hover:shadow-xl transition-shadow hover:border-primary">
        <CardContent className="p-6 flex flex-col items-center text-center">
          <div className="p-4 bg-primary/10 rounded-full mb-4 group-hover:scale-110 transition-transform">
            {icon}
          </div>
          <h3 className="text-lg font-semibold mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
