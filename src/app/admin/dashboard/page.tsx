
"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BriefcaseMedical, FileText, UploadCloud, Download, CalendarDays, BarChart3, AlertTriangle, ShieldCheck, CalendarPlus } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import React from 'react';


// Mock data for admin dashboard
const summaryData = {
  totalPatients: 1250,
  appointmentsToday: 45,
  pendingReports: 12,
  totalRevenueMonth: 25600.50,
};

const recentActivities = [
  { id: 1, type: 'New Patient Registration', description: 'Patient John Doe registered.', time: '10 mins ago' },
  { id:2, type: 'Report Uploaded', description: 'Blood Test report for Jane Smith uploaded.', time: '30 mins ago' },
  { id: 3, type: 'Appointment Booked', description: 'New appointment for Michael B. at 3 PM.', time: '1 hour ago'},
];

export default function AdminDashboardPage() {
  return (
    <div className="container mx-auto space-y-8">
      <Card className="shadow-lg border-primary/20">
        <CardHeader className="bg-primary/5 rounded-t-lg p-6">
           <CardTitle className="text-3xl font-bold text-primary">Admin Dashboard</CardTitle>
           <CardDescription className="text-lg text-muted-foreground mt-1">
             Oversee operations and manage PathAssist services.
           </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Patients" value={summaryData.totalPatients.toLocaleString()} icon={<Users className="h-8 w-8 text-primary" />} />
        <StatCard title="Appointments Today" value={summaryData.appointmentsToday.toLocaleString()} icon={<CalendarDays className="h-8 w-8 text-primary" />} />
        <StatCard title="Pending Reports" value={summaryData.pendingReports.toLocaleString()} icon={<AlertTriangle className="h-8 w-8 text-orange-500" />} />
        <StatCard title="Revenue (This Month)" value={`$${summaryData.totalRevenueMonth.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} icon={<BarChart3 className="h-8 w-8 text-green-500" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <QuickLinkButton href="/admin/appointments/book" icon={<CalendarPlus />} label="Book Appointment" />
            <QuickLinkButton href="/admin/appointments" icon={<BriefcaseMedical />} label="Manage Appointments" />
            <QuickLinkButton href="/admin/users" icon={<Users />} label="Manage Patients" />
            <QuickLinkButton href="/admin/reports/upload" icon={<UploadCloud />} label="Upload Report" />
            <QuickLinkButton href="/admin/reports" icon={<FileText />} label="View All Reports" />
            <QuickLinkButton href="/admin/billing" icon={<FileText />} label="Manage Billing" />
            <Button variant="outline" className="h-20 flex-col gap-1">
              <Download className="h-6 w-6" />
              <span>Export Daily Report</span>
            </Button>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="text-xl">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
                {recentActivities.length > 0 ? (
                <ul className="space-y-4">
                    {recentActivities.map((activity) => (
                    <li key={activity.id} className="flex items-start gap-3">
                        <div className="p-2 bg-primary/10 rounded-full mt-1">
                            {activity.type.includes("Patient") ? <Users className="h-4 w-4 text-primary" /> : 
                             activity.type.includes("Report") ? <FileText className="h-4 w-4 text-primary" /> :
                             <BriefcaseMedical className="h-4 w-4 text-primary" />}
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm">{activity.type}</h4>
                            <p className="text-xs text-muted-foreground">{activity.description}</p>
                            <p className="text-xs text-muted-foreground/70">{activity.time}</p>
                        </div>
                    </li>
                    ))}
                </ul>
                ) : (
                <p className="text-muted-foreground text-sm">No recent activities.</p>
                )}
            </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">System Status</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3 p-4 border rounded-lg bg-card">
                <div className="p-3 rounded-full bg-green-500/20 text-green-600">
                    <ShieldCheck className="h-6 w-6"/>
                </div>
                <div>
                    <div className="font-semibold">Online Services</div>
                    <div className="text-sm text-muted-foreground">All systems operational.</div>
                </div>
            </div>
            <div className="flex items-center gap-3 p-4 border rounded-lg bg-card">
                <div className="p-3 rounded-full bg-primary/20 text-primary">
                    <BarChart3 className="h-6 w-6"/>
                </div>
                <div>
                    <div className="font-semibold">Database Health</div>
                    <div className="text-sm text-muted-foreground">Nominal performance.</div>
                </div>
            </div>
            <div className="flex items-center gap-3 p-4 border rounded-lg bg-card">
                <div className="p-3 rounded-full bg-yellow-500/20 text-yellow-600">
                    <AlertTriangle className="h-6 w-6"/>
                </div>
                <div>
                    <div className="font-semibold">Lab Integrations</div>
                    <div className="text-sm text-muted-foreground">2 integrations pending sync.</div>
                </div>
            </div>
        </CardContent>
      </Card>

    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}

function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <Card className="shadow-md hover:shadow-xl transition-shadow">
      <CardContent className="p-6 flex items-center gap-4">
        <div className="p-3 bg-primary/10 rounded-lg">{icon}</div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

interface QuickLinkButtonProps {
  href: string;
  icon: React.ReactElement;
  label: string;
}

function QuickLinkButton({ href, icon, label }: QuickLinkButtonProps) {
  return (
    <Button variant="outline" asChild className="h-20 flex-col gap-1 hover:bg-primary/5 hover:border-primary">
      <Link href={href}>
        {React.cloneElement(icon, { className: "h-6 w-6" })}
        <span>{label}</span>
      </Link>
    </Button>
  );
}
