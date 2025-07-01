
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { addInvoice, getAllPatients, availableServices } from '@/lib/mockData';
import type { User, InvoiceItem, Invoice } from '@/lib/types';
import { Loader2, Save, FilePlus, ArrowLeft, PlusCircle, Trash2, Check, ChevronsUpDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { Checkbox } from "@/components/ui/checkbox";

export default function CreateInvoicePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(true);

  // Patient and Appointment data
  const [patients, setPatients] = useState<User[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | undefined>();
  const [openPatientCombobox, setOpenPatientCombobox] = useState(false);
  
  // Invoice Form State
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`);
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([{ description: '', quantity: 1, unitPrice: 0, total: 0 }]);
  
  // State for the item description combobox
  const [openItemCombobox, setOpenItemCombobox] = useState<number | null>(null);
  const [itemSearchValue, setItemSearchValue] = useState("");

  // Billing states
  const [subtotal, setSubtotal] = useState<number>(0);
  const [taxAmount, setTaxAmount] = useState<number>(0);
  const [grandTotal, setGrandTotal] = useState<number>(0);
  const [isGstApplicable, setIsGstApplicable] = useState(false);
  const [cgstRate, setCgstRate] = useState<number>(9);
  const [sgstRate, setSgstRate] = useState<number>(9);

  // Fetch all patients on component mount
  useEffect(() => {
    getAllPatients()
      .then(setPatients)
      .finally(() => setIsFetchingData(false));
  }, []);

  // Recalculate subtotal whenever items change
  useEffect(() => {
    const newSubtotal = items.reduce((acc, item) => acc + item.total, 0);
    setSubtotal(newSubtotal);
  }, [items]);

  // Recalculate tax and grand total when subtotal or GST details change
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
    
    if (field === 'description') {
        item.description = String(value);
    } else if (field === 'quantity' || field === 'unitPrice') {
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
        toast({ title: "Cannot remove", description: "At least one item is required in the invoice.", variant: "destructive" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || items.some(item => !item.description || item.quantity <= 0 || item.unitPrice < 0)) {
      toast({
        title: 'Missing Information',
        description: 'Please select a patient and ensure all invoice items are filled out correctly (description, quantity > 0, price >= 0).',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const newInvoiceData = {
        patientId: selectedPatientId,
        appointmentId: 'manual-creation', // Placeholder as we are not linking to a specific appointment
        invoiceNumber,
        issueDate,
        dueDate: dueDate || undefined,
        items,
        amount: subtotal,
        taxAmount,
        status: 'Pending',
        currency: 'INR',
      };
      await addInvoice(newInvoiceData as Omit<Invoice, 'id' | 'invoiceUrl' | 'patientName'>);
      toast({
        title: 'Invoice Created Successfully!',
        description: `${invoiceNumber} has been created.`,
      });
      router.push('/admin/billing');
    } catch (error) {
      console.error("Failed to create invoice:", error);
      toast({
        title: 'Error Creating Invoice',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const cgstAmount = subtotal * (cgstRate / 100);
  const sgstAmount = subtotal * (sgstRate / 100);


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
            <FilePlus className="h-7 w-7 text-primary" /> Create New Invoice
          </CardTitle>
          <CardDescription>Fill in the details to generate a new invoice.</CardDescription>
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
                          disabled={isFetchingData}
                        >
                          {isFetchingData ? "Loading patients..." : (selectedPatientId
                            ? patients.find(p => p.id === selectedPatientId)?.name
                            : "Select patient...")}
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

            {/* Totals Section */}
            <div className="flex justify-end pt-4 border-t">
                <div className="w-full max-w-sm space-y-3">
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
                        <label
                            htmlFor="applyGst"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            Apply GST
                        </label>
                    </div>

                    {isGstApplicable && (
                        <>
                            <div className="grid grid-cols-2 gap-4 items-center pl-6">
                                <Label htmlFor="cgstRate">CGST Rate (%)</Label>
                                <Input 
                                    id="cgstRate"
                                    type="number"
                                    className="h-8"
                                    value={cgstRate}
                                    onChange={(e) => setCgstRate(Number(e.target.value) || 0)}
                                    min="0"
                                />
                                <Label htmlFor="sgstRate">SGST Rate (%)</Label>
                                <Input 
                                    id="sgstRate"
                                    type="number"
                                    className="h-8"
                                    value={sgstRate}
                                    onChange={(e) => setSgstRate(Number(e.target.value) || 0)}
                                    min="0"
                                />
                            </div>
                            <div className="flex justify-between items-center pl-6">
                                <Label className="text-muted-foreground">CGST</Label>
                                <span className="text-muted-foreground">₹{cgstAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center pl-6">
                                <Label className="text-muted-foreground">SGST</Label>
                                <span className="text-muted-foreground">₹{sgstAmount.toFixed(2)}</span>
                            </div>
                        </>
                    )}
                    
                    <div className="flex justify-between items-center text-lg font-bold border-t pt-2 mt-2">
                        <Label>Grand Total</Label>
                        <span>₹{grandTotal.toFixed(2)}</span>
                    </div>
                </div>
            </div>

          </CardContent>
          <CardFooter className="pt-6">
            <Button type="submit" size="lg" className="w-full md:w-auto ml-auto" disabled={isLoading || isFetchingData}>
              {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Save className="mr-2 h-5 w-5" />
              )}
              Save Invoice
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
