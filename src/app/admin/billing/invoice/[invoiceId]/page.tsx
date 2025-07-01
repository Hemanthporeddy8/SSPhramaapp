
"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { getInvoiceById, getPatientById } from '@/lib/mockData';
import type { Invoice, User } from '@/lib/types';
import { Loader2, ArrowLeft, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function InvoicePage() {
    const router = useRouter();
    const params = useParams();
    const invoiceId = params.invoiceId as string;

    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [patient, setPatient] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDownloading, setIsDownloading] = useState(false);

    useEffect(() => {
        if (invoiceId) {
            setIsLoading(true);
            getInvoiceById(invoiceId).then(invoiceData => {
                if (invoiceData) {
                    setInvoice(invoiceData);
                    getPatientById(invoiceData.patientId).then(patientData => {
                        setPatient(patientData || null);
                        setIsLoading(false);
                    }).catch(err => {
                        console.error("Failed to load patient data:", err);
                        setIsLoading(false);
                    });
                } else {
                    console.error("Invoice not found");
                    setIsLoading(false);
                }
            }).catch(error => {
                console.error("Failed to load invoice data:", error);
                setIsLoading(false);
            });
        }
    }, [invoiceId]);
    
    const handleDownloadPdf = async () => {
        const invoiceElement = document.getElementById('invoice-card');
        if (!invoiceElement) {
            console.error("Invoice element not found");
            return;
        }

        setIsDownloading(true);

        try {
            const canvas = await html2canvas(invoiceElement, {
                scale: 2, // Use a higher scale for better resolution
                useCORS: true,
                backgroundColor: '#ffffff',
            });
            const imgData = canvas.toDataURL('image/png');
            
            // A4 size in points: 595.28 x 841.89
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'pt',
                format: 'a4'
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;

            // Calculate the aspect ratio
            const ratio = canvasWidth / canvasHeight;

            // Fit the image to the PDF page with margins
            let imgWidth = pdfWidth - 40; // 20pt margin on each side
            let imgHeight = imgWidth / ratio;

            // If the image height is still too large, resize based on height
            if (imgHeight > pdfHeight - 40) {
              imgHeight = pdfHeight - 40; // 20pt margin top/bottom
              imgWidth = imgHeight * ratio;
            }

            const x = (pdfWidth - imgWidth) / 2;
            const y = 20;

            pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
            pdf.save(`invoice-${invoice?.invoiceNumber || invoiceId}.pdf`);

        } catch (error) {
            console.error('Error generating PDF:', error);
            // Optionally, show a toast notification for the error
        } finally {
            setIsDownloading(false);
        }
    };


    if (isLoading) {
        return (
          <div className="flex items-center justify-center h-screen bg-gray-100">
            <div className="flex items-center text-lg">
                <Loader2 className="h-8 w-8 animate-spin text-primary mr-3" />
                Loading invoice...
            </div>
          </div>
        );
    }

    if (!invoice || !patient) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100">
                <div className="text-center">
                    <h2 className="text-2xl font-semibold mb-2">Invoice Not Found</h2>
                    <p className="text-muted-foreground mb-4">The invoice with ID '{invoiceId}' could not be found.</p>
                    <Button asChild variant="outline">
                        <Link href="/admin/billing"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Billing</Link>
                    </Button>
                </div>
            </div>
        );
    }
    
    const calculateAge = (dobString?: string): string => {
        if (!dobString) return 'N/A';
        const birthDate = new Date(dobString);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age.toString();
    };

    const subtotal = invoice.amount;
    const totalTax = invoice.taxAmount || 0;
    const cgst = totalTax / 2;
    const sgst = totalTax / 2;
    const grandTotal = subtotal + totalTax;

    return (
        <div className="bg-gray-200 min-h-screen p-4 sm:p-6 md:p-8 flex flex-col items-center">
            <div className="w-full max-w-4xl mb-4 flex justify-between items-center print:hidden">
                <Button variant="outline" onClick={() => router.back()} disabled={isDownloading}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button onClick={handleDownloadPdf} disabled={isDownloading}>
                    {isDownloading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Download className="mr-2 h-4 w-4" />
                    )}
                    {isDownloading ? 'Downloading...' : 'Download PDF'}
                </Button>
            </div>
            <Card id="invoice-card" className="w-full max-w-4xl p-6 sm:p-8 md:p-10 shadow-lg print:shadow-none print:border-none bg-white">
                <CardHeader className="text-center p-0 mb-8 border-b-2 border-black pb-4">
                    <h1 className="text-3xl font-bold tracking-wider text-black">PATHASSIST LABORATORIES</h1>
                    <h2 className="text-2xl font-semibold text-gray-800 mt-2">LABORATORY INVOICE</h2>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm mb-8">
                        <div><span className="font-semibold">Bill No:</span> {invoice.invoiceNumber}</div>
                        <div><span className="font-semibold">Patient Name:</span> {patient.name}</div>
                        <div><span className="font-semibold">Age / Gender:</span> {calculateAge(patient.dateOfBirth)} / {patient.gender || 'N/A'}</div>
                        <div><span className="font-semibold">Invoice Date:</span> {new Date(invoice.issueDate).toLocaleDateString()}</div>
                        <div><span className="font-semibold">Referred by:</span> Dr. A. Mehta</div>
                        <div><span className="font-semibold">Payment Mode:</span> {invoice.status === 'Paid' ? 'UPI (GPay)' : 'Pending'}</div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-100">
                                <tr className="border-b-2 border-gray-300">
                                    <th className="text-left font-semibold p-2">Description</th>
                                    <th className="text-right font-semibold p-2">Qty</th>
                                    <th className="text-right font-semibold p-2">Rate (₹)</th>
                                    <th className="text-right font-semibold p-2">Amount (₹)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoice.items.map((item, index) => (
                                    <tr key={index} className="border-b border-gray-200">
                                        <td className="py-2 px-2">{item.description}</td>
                                        <td className="text-right py-2 px-2">{item.quantity}</td>
                                        <td className="text-right py-2 px-2">{item.unitPrice.toFixed(2)}</td>
                                        <td className="text-right py-2 px-2">{item.total.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    <div className="mt-6 flex justify-end">
                        <div className="w-full max-w-sm space-y-2 text-sm">
                           <div className="flex justify-between p-1">
                                <span className="font-semibold">Subtotal</span>
                                <span>{subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between p-1">
                                <span>CGST</span>
                                <span>{cgst.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between p-1">
                                <span>SGST</span>
                                <span>{sgst.toFixed(2)}</span>
                            </div>
                            <Separator className="my-2 bg-gray-300"/>
                            <div className="flex justify-between font-bold text-base p-2 bg-gray-100 rounded-md">
                                <span>Grand Total</span>
                                <span>₹{grandTotal.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="mt-20 flex justify-between items-end p-0 border-t border-dashed pt-6">
                    <div>
                        <p className="font-semibold italic">Authorised Signatory</p>
                        <p className="text-sm text-gray-600">Billing Department</p>
                    </div>
                    <p className="text-sm font-medium text-gray-700">Thank you for choosing PathAssist!</p>
                </CardFooter>
            </Card>
        </div>
    );
}
