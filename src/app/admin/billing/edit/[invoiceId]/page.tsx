"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { getInvoiceById, updateInvoice, getAllPatients, availableServices } from '@/lib/mockData';
import type { User, Invoice, InvoiceItem, PaymentStatus } from '@/lib/types';
import { Loader2, Save, FileEdit, ArrowLeft, PlusCircle, Trash2, Check, ChevronsUpDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function EditInvoicePage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.invoiceId as string;
  const { toast } = useToast();

  const [invoice, setInvoice] = useState<Partial<Invoice> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Patient data
  const [patients, setPatients] = useState<User[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | undefined>();
  const [openPatientCombobox, setOpenPatientCombobox] = useState(false);

  // Form State
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [status, setStatus] = useState<PaymentStatus>('Pending');
  
  // Item description combobox
  const [openItemCombobox, setOpenItemCombobox] = useState<number | null>(null);
  const [itemSearchValue, setItemSearchValue] = useState("");

  // Billing states
  const [subtotal, setSubtotal] = useState<number>(0);
  const [taxAmount, setTaxAmount] = useState<number>(0);
  const [grandTotal, setGrandTotal] = useState<number>(0);
  const [isGstApplicable, setIsGstApplicable] = useState(false);
  const [cgstRate, setCgstRate] = useState<number>(9);
  const [sgstRate, setSgstRate] = useState<number>(9);

  // Fetch data on mount
  useEffect(() => {
    if (!invoiceId) return;

    setIsLoading(true);
    Promise.all([
        getInvoiceById(invoiceId),
        getAllPatients(),
    ]).then(([invoiceData, patientsData]) => {
        if (invoiceData) {
            setInvoice(invoiceData);
            setInvoiceNumber(invoiceData.invoiceNumber);
            setSelectedPatientId(invoiceData.patientId);
            setIssueDate(invoiceData.issueDate.split('T')[0]);
            setDueDate(invoiceData.dueDate ? invoiceData.dueDate.split('T')[0] : '');
            setItems(invoiceData.items);
            setStatus(invoiceData.status);
            
            if(invoiceData.taxAmount && invoiceData.taxAmount > 0) {
              setIsGstApplicable(true);
              // Simple assumption for rates, might not be accurate if rates were different
              const sub = invoiceData.items.reduce((acc, item) => acc + item.total, 0);
              const totalTaxRate = sub > 0 ? (invoiceData.taxAmount / sub) * 100 : 0;
              setCgstRate(totalTaxRate / 2);
              setSgstRate(totalTaxRate / 2);
            }

        } else {
            toast({ title: "Error", description: "Invoice not found.", variant: "destructive" });
            router.push('/admin/billing');
        }
        setPatients(patientsData);
        setIsLoading(false);
    }).catch(error => {
        console.error("Failed to load data:", error);
        toast({ title: "Error", description: "Could not load invoice details.", variant: "destructive" });
        setIsLoading(false);
        router.push('/admin/billing');
    });
  }, [invoiceId, toast, router]);

  // Recalculate subtotal
  useEffect(() => {
    const newSubtotal = items.reduce((acc, item) => acc + item.total, 0);
    setSubtotal(newSubtotal);
  }, [items]);

  // Recalculate tax and grand total
  useEffect(() => {
    if (isGstApplicable) {
        const newTaxAmount = subtotal * ((cgstRate + sgstRate) / 100);
        setTaxAmount(newTaxAmount);
        setGrandTotal(subtotal + newTaxAmount);
    } else {
        setTaxAmount(0);
        setGrandTotal(subtotal);
    }
  }, [isGstApplicable, subtotal, cgstRate, sgstRate]);


  const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items];
    const item = { ...newItems[index] };
    
    if (field === 'description') item.description = String(value);
    else if (field === 'quantity' || field === 'unitPrice') {
        const numericValue = Number(value) || 0;
        if (field === 'quantity') item.quantity = numericValue;
        if (field === 'unitPrice') item.unitPrice = numericValue;
    }
    
    item.total = item.quantity * item.unitPrice;
    newItems[index] = item;
    setItems(newItems);
  };
  
  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0, total: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
        setItems(items.filter((_, i) => i !== index));
    } else {
        toast({ title: "Cannot remove", description: "At least one item is required.", variant: "destructive" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || items.some(item => !item.description || item.quantity <= 0 || item.unitPrice < 0)) {
      toast({
        title: 'Missing Information',
        description: 'Please select a patient and ensure all items are filled out.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      const updatedData: Partial<Invoice> = {
        patientId: selectedPatientId,
        invoiceNumber,
        issueDate,
        dueDate: dueDate || undefined,
        items,
        amount: subtotal,
        taxAmount,
        status,
        currency: 'INR',
      };
      await updateInvoice(invoiceId, updatedData);
      toast({
        title: 'Invoice Updated Successfully!',
        description: `${invoiceNumber} has been updated.`,
      });
      router.push('/admin/billing');
    } catch (error) {
      console.error("Failed to update invoice:", error);
      toast({
        title: 'Error Updating Invoice',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const cgstAmount = subtotal * (cgstRate / 100);
  const sgstAmount = subtotal * (sgstRate / 100);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-2">Loading invoice editor...</p>
      </div>
    );
  }

  if (!invoice) {
    return null;
  }

  return (
    <div className="container mx-auto">
      <div className="mb-4">
        <Button variant="outline" asChild>
          <Link href="/admin/billing">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Billing List
          </Link>
        </Button>
      </div>
      <Card className="max-w-4xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <FileEdit className="h-7 w-7 text-primary" /> Edit Invoice
          </CardTitle>
          <CardDescription>Modify details for invoice: {invoice.invoiceNumber}</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {/* Patient & Invoice Details Section */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="patient">Patient <span className="text-destructive">*</span></Label>
                    <Popover open={openPatientCombobox} onOpenChange={setOpenPatientCombobox}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openPatientCombobox}
                          className="w-full justify-between"
                        >
                          {selectedPatientId
                            ? patients.find(p => p.id === selectedPatientId)?.name
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
                                    setSelectedPatientId(patient.id);
                                    setOpenPatientCombobox(false);
                                  }}
                                >
                                  <Check className={cn("mr-2 h-4 w-4", selectedPatientId === patient.id ? "opacity-100" : "opacity-0")} />
                                  {patient.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="invoiceNumber">Invoice Number</Label>
                    <Input id="invoiceNumber" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="issueDate">Issue Date</Label>
                    <Input id="issueDate" type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                </div>
            </div>

            {/* Invoice Items Section */}
            <div className="space-y-4 pt-4 border-t">
                <Label className="text-lg font-medium">Invoice Items</Label>
                {items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-center">
                        <Popover open={openItemCombobox === index} onOpenChange={(isOpen) => setOpenItemCombobox(isOpen ? index : null)}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    className="col-span-6 justify-between"
                                >
                                    <span className="truncate">
                                        {item.description || "Select a test..."}
                                    </span>
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="p-0 w-[--radix-popover-trigger-width]">
                                <Command
                                    filter={(value, search) => {
                                        const service = availableServices.find(s => s.name === value);
                                        if (service?.name.toLowerCase().includes(search.toLowerCase())) return 1;
                                        return 0;
                                    }}
                                >
                                    <CommandInput 
                                        placeholder="Search test or add custom..." 
                                        value={itemSearchValue}
                                        onValueChange={setItemSearchValue}
                                    />
                                    <CommandList>
                                        <CommandEmpty>
                                            {itemSearchValue.trim() ? `No test found for "${itemSearchValue}".` : "No test found."}
                                        </CommandEmpty>
                                        <CommandGroup>
                                            {availableServices.map(service => (
                                                <CommandItem
                                                    key={service.id}
                                                    value={service.name}
                                                    onSelect={(currentValue) => {
                                                        handleItemChange(index, 'description', currentValue);
                                                        setItemSearchValue("");
                                                        setOpenItemCombobox(null);
                                                    }}
                                                >
                                                    <Check className={cn("mr-2 h-4 w-4", item.description === service.name ? "opacity-100" : "opacity-0")} />
                                                    {service.name}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                    {itemSearchValue && !availableServices.some(s => s.name.toLowerCase() === itemSearchValue.toLowerCase()) && (
                                        <div className="p-2 border-t mt-1">
                                            <Button
                                                variant="outline"
                                                className="w-full h-9 text-sm"
                                                onClick={() => {
                                                    handleItemChange(index, 'description', itemSearchValue.trim());
                                                    setOpenItemCombobox(null);
                                                    setItemSearchValue("");
                                                }}
                                            >
                                                Add custom item: "{itemSearchValue.trim()}"
                                            </Button>
                                        </div>
                                    )}
                                </Command>
                            </PopoverContent>
                        </Popover>
                        <Input 
                            type="number" 
                            placeholder="Qty" 
                            className="col-span-2"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                            min="1"
                        />
                        <Input 
                            type="number" 
                            placeholder="Unit Price (₹)" 
                            className="col-span-2"
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                            min="0"
                            step="0.01"
                        />
                        <div className="col-span-1 text-right font-medium">₹{item.total.toFixed(2)}</div>
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(index)} className="col-span-1 text-destructive hover:text-destructive">
                           <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addItem} className="mt-2">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Item
                </Button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 pt-4 border-t">
                {/* Billing Details */}
                <div className="space-y-3">
                    <Label className="text-lg font-medium">Billing Summary</Label>
                    <div className="flex justify-between items-center">
                        <Label>Subtotal</Label>
                        <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox 
                            id="applyGst" 
                            checked={isGstApplicable} 
                            onCheckedChange={(checked) => setIsGstApplicable(checked as boolean)}
                        />
                        <label htmlFor="applyGst" className="text-sm font-medium">Apply GST</label>
                    </div>

                    {isGstApplicable && (
                        <>
                            <div className="grid grid-cols-2 gap-4 items-center pl-6">
                                <Label htmlFor="cgstRate">CGST Rate (%)</Label>
                                <Input id="cgstRate" type="number" className="h-8" value={cgstRate} onChange={(e) => setCgstRate(Number(e.target.value) || 0)} />
                                <Label htmlFor="sgstRate">SGST Rate (%)</Label>
                                <Input id="sgstRate" type="number" className="h-8" value={sgstRate} onChange={(e) => setSgstRate(Number(e.target.value) || 0)} />
                            </div>
                            <div className="flex justify-between items-center pl-6"><Label className="text-muted-foreground">CGST</Label><span className="text-muted-foreground">₹{cgstAmount.toFixed(2)}</span></div>
                            <div className="flex justify-between items-center pl-6"><Label className="text-muted-foreground">SGST</Label><span className="text-muted-foreground">₹{sgstAmount.toFixed(2)}</span></div>
                        </>
                    )}
                    
                    <div className="flex justify-between items-center text-lg font-bold border-t pt-2 mt-2">
                        <Label>Grand Total</Label>
                        <span>₹{grandTotal.toFixed(2)}</span>
                    </div>
                </div>
                {/* Status */}
                <div className="space-y-2">
                    <Label htmlFor="status" className="text-lg font-medium">Payment Status</Label>
                    <Select value={status} onValueChange={(value) => setStatus(value as PaymentStatus)}>
                        <SelectTrigger id="status">
                            <SelectValue placeholder="Select payment status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Paid">Paid</SelectItem>
                            <SelectItem value="Failed">Failed</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

          </CardContent>
          <CardFooter className="pt-6 flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.push('/admin/billing')} disabled={isSaving}>
                Cancel
            </Button>
            <Button type="submit" size="lg" className="w-full md:w-auto" disabled={isSaving}>
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
