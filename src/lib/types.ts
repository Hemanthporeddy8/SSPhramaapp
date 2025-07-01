
export interface User {
  id: string;
  email: string;
  role: 'patient' | 'admin';
  name: string; // Full name
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: string; // ISO string 'YYYY-MM-DD'
  age?: number; // Calculated or stored
  gender?: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  address?: string;
  medicalHistorySummary?: string;
}

export type AppointmentStatus = 'Scheduled' | 'Sample Collected' | 'In Lab' | 'Report Ready' | 'Cancelled';
export type PaymentStatus = 'Paid' | 'Pending' | 'Failed';

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string; // Can be derived if patient object is linked
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g., "10:00 AM - 10:30 AM"
  serviceName: string; // Comma-separated string of service names
  serviceIds?: string[]; // Array of service IDs
  status: AppointmentStatus;
  paymentStatus: PaymentStatus;
  notes?: string;
}

export interface TestReport {
  id: string;
  patientId: string;
  patientName: string; // Can be derived
  appointmentId: string;
  reportName: string;
  uploadDate: string; // ISO string
  fileUrl: string; // Mock URL or path to actual file
  description?: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}
export interface Invoice {
  id:string;
  patientId: string;
  patientName: string; // Can be derived
  appointmentId: string; // Could be multiple appointments or general invoice
  invoiceNumber: string;
  amount: number; // Subtotal amount before tax.
  taxAmount?: number; // Total tax amount.
  currency?: string; // e.g., 'INR'
  issueDate: string; // ISO string
  dueDate?: string; // ISO string
  status: PaymentStatus;
  invoiceUrl: string; // URL to the detailed invoice page
  items: InvoiceItem[];
}


export interface AdminProfile extends User {
  department?: string;
  // other admin-specific fields
}
