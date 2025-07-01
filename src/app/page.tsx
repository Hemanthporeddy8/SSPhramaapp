import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Stethoscope, CalendarCheck, FileText, ShieldCheck } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center bg-background shadow-sm">
        <Link href="/" className="flex items-center justify-center">
          // Removed logo image
          <span className="ml-2 text-xl font-bold text-primary">PathAssist</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link href="/login" className="text-sm font-medium hover:underline underline-offset-4 text-primary">
            Login
          </Link>
          <Button asChild>
            <Link href="/register">Get Started</Link>
          </Button>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-br from-primary/20 via-background to-background">
          <div className="container px-4 md:px-6 text-center">
            <div className="space-y-6">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none text-foreground font-headline">
                Your Health Journey, <span className="text-primary">Simplified</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                PathAssist offers seamless appointment scheduling, real-time status tracking, and secure access to your medical reports.
              </p>
              <div className="space-x-4">
                <Button asChild size="lg">
                  <Link href="/register">Sign Up Now</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="#features">Learn More</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-background">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">Key Features</div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-foreground font-headline">Everything You Need for Modern Lab Services</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                PathAssist is designed to make managing your lab appointments and results effortless and secure.
              </p>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3">
              <div className="grid gap-2 p-6 rounded-lg border bg-card shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 rounded-full bg-primary/20 text-primary">
                    <CalendarCheck className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">Easy Appointment Scheduling</h3>
                </div>
                <p className="text-sm text-muted-foreground">Book your lab tests online with our user-friendly calendar. Choose your preferred date and time slot hassle-free.</p>
              </div>
              <div className="grid gap-2 p-6 rounded-lg border bg-card shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 rounded-full bg-primary/20 text-primary">
                    <Stethoscope className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">Real-Time Status Tracking</h3>
                </div>
                <p className="text-sm text-muted-foreground">Stay updated on your sample collection, lab processing, and report availability with real-time notifications.</p>
              </div>
              <div className="grid gap-2 p-6 rounded-lg border bg-card shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 rounded-full bg-primary/20 text-primary">
                     <FileText className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">Secure Report Access</h3>
                </div>
                <p className="text-sm text-muted-foreground">View and download your test reports securely anytime, anywhere. Your health data is protected.</p>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 border-t bg-muted/40">
           <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight text-foreground font-headline">
                Ready to take control of your lab experience?
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Join PathAssist today and experience a new level of convenience and transparency in healthcare.
              </p>
            </div>
            <div className="mx-auto w-full max-w-sm space-y-2">
              <Button asChild className="w-full" size="lg">
                <Link href="/register">
                  Sign Up for Free
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t bg-background">
        <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} PathAssist. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="/terms" className="text-xs hover:underline underline-offset-4 text-muted-foreground">
            Terms of Service
          </Link>
          <Link href="/privacy" className="text-xs hover:underline underline-offset-4 text-muted-foreground">
            Privacy Policy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
