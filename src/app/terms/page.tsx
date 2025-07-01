
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="text-center">
          <FileText className="mx-auto h-12 w-12 text-primary mb-4" />
          <CardTitle className="text-3xl font-bold">Terms of Service</CardTitle>
          <CardDescription>Last updated: {new Date().toLocaleDateString()}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>Welcome to PathAssist! These terms and conditions outline the rules and regulations for the use of PathAssist's Website and Services.</p>
          <p>By accessing this website we assume you accept these terms and conditions. Do not continue to use PathAssist if you do not agree to take all of the terms and conditions stated on this page.</p>
          <h2 className="text-xl font-semibold text-foreground pt-2">1. Intellectual Property Rights</h2>
          <p>Other than the content you own, under these Terms, PathAssist and/or its licensors own all the intellectual property rights and materials contained in this Website.</p>
          <h2 className="text-xl font-semibold text-foreground pt-2">2. Restrictions</h2>
          <p>You are specifically restricted from all of the following: publishing any Website material in any other media; selling, sublicensing and/or otherwise commercializing any Website material...</p>
          <p className="italic pt-4">This is a placeholder page. Full terms of service would be detailed here.</p>
        </CardContent>
        <CardFooter>
            <Button asChild className="mx-auto">
                <Link href="/">Return to Home</Link>
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
