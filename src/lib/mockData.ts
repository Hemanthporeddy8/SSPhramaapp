
import type { User, Appointment, TestReport, Invoice, InvoiceItem, AppointmentStatus, PaymentStatus } from './types';

export let mockPatients: User[] = [
  {
    id: 'patient1',
    email: 'john.doe@example.com',
    role: 'patient',
    name: 'John Doe',
    firstName: 'John',
    lastName: 'Doe',
    phone: '555-0101',
    dateOfBirth: '1985-06-15', 
    gender: 'Male',
    address: '123 Health St, Wellness City, CA 90210',
    medicalHistorySummary: 'Generally healthy. Seasonal allergies.',
  },
  {
    id: 'patient2',
    email: 'jane.smith@example.com',
    role: 'patient',
    name: 'Jane Smith',
    firstName: 'Jane',
    lastName: 'Smith',
    phone: '555-0102',
    dateOfBirth: '1992-11-20', 
    gender: 'Female',
    address: '456 Vitality Ave, Medville, TX 75001',
    medicalHistorySummary: 'History of migraines. Otherwise healthy.',
  },
  {
    id: 'patient3',
    email: 'michael.brown@example.com',
    role: 'patient',
    name: 'Michael Brown',
    firstName: 'Michael',
    lastName: 'Brown',
    phone: '555-0103',
    dateOfBirth: '1978-03-01', 
    gender: 'Male',
    address: '789 Recovery Rd, Clinic Town, FL 33101',
    medicalHistorySummary: 'Previous knee surgery (ACL repair). Manages hypertension with medication.',
  },
  {
    id: 'patient4',
    email: 'emily.jones@example.com',
    role: 'patient',
    name: 'Emily Jones',
    firstName: 'Emily',
    lastName: 'Jones',
    phone: '555-0104',
    dateOfBirth: '2001-07-22', 
    gender: 'Female',
    address: '101 Test Drive, LabCity, NY 10001',
    medicalHistorySummary: 'No significant medical history.',
  }
];

export let mockAppointmentsData: Appointment[] = [
  // John Doe
  { id: 'appt1', patientId: 'patient1', patientName: 'John Doe', date: '2024-07-25', timeSlot: '10:00 AM - 10:30 AM', serviceName: 'Complete Blood Count', serviceIds: ['cbc'], status: 'Report Ready', paymentStatus: 'Paid' },
  { id: 'appt2', patientId: 'patient1', patientName: 'John Doe', date: '2024-06-10', timeSlot: '09:00 AM - 09:30 AM', serviceName: 'Lipid Profile', serviceIds: ['lipid'], status: 'Report Ready', paymentStatus: 'Paid' },
  // Jane Smith
  { id: 'appt3', patientId: 'patient2', patientName: 'Jane Smith', date: '2024-07-20', timeSlot: '02:30 PM - 03:00 PM', serviceName: 'Thyroid Function Test', serviceIds: ['thyroid'], status: 'Sample Collected', paymentStatus: 'Pending' },
  { id: 'appt4', patientId: 'patient2', patientName: 'Jane Smith', date: '2024-05-15', timeSlot: '11:00 AM - 11:30 AM', serviceName: 'Vitamin D Test', serviceIds: ['vitamin_d'], status: 'Report Ready', paymentStatus: 'Paid' },
  // Michael Brown
  { id: 'appt5', patientId: 'patient3', patientName: 'Michael Brown', date: '2024-07-28', timeSlot: '03:00 PM - 03:30 PM', serviceName: 'Glucose Test', serviceIds: ['glucose'], status: 'Scheduled', paymentStatus: 'Paid' },
  { id: 'appt6', patientId: 'patient3', patientName: 'Michael Brown', date: '2024-04-01', timeSlot: '09:00 AM - 09:30 AM', serviceName: 'Renal Function Test', serviceIds: ['renal_function'], status: 'Report Ready', paymentStatus: 'Paid' },
  // Emily Jones
  { id: 'appt7', patientId: 'patient4', patientName: 'Emily Jones', date: '2024-08-01', timeSlot: '10:30 AM - 11:00 AM', serviceName: 'Allergy Panel', serviceIds: ['allergy_panel'], status: 'Scheduled', paymentStatus: 'Pending' },
];

export const mockReportsData: TestReport[] = [
  // John Doe
  { id: 'report1', patientId: 'patient1', patientName: 'John Doe', appointmentId: 'appt1', reportName: 'CBC Report (July 2024)', uploadDate: '2024-07-26T10:00:00Z', fileUrl: '/mock-report.pdf', description: 'Complete Blood Count analysis.' },
  { id: 'report2', patientId: 'patient1', patientName: 'John Doe', appointmentId: 'appt2', reportName: 'Lipid Profile (June 2024)', uploadDate: '2024-06-11T14:30:00Z', fileUrl: '/mock-report.pdf', description: 'Detailed cholesterol levels.' },
  // Jane Smith
  { id: 'report3', patientId: 'patient2', patientName: 'Jane Smith', appointmentId: 'appt4', reportName: 'Vitamin D Levels (May 2024)', uploadDate: '2024-05-16T09:15:00Z', fileUrl: '/mock-report.pdf', description: 'Vitamin D sufficiency test.' },
  // Michael Brown
  { id: 'report4', patientId: 'patient3', patientName: 'Michael Brown', appointmentId: 'appt6', reportName: 'Renal Function (April 2024)', uploadDate: '2024-04-02T11:00:00Z', fileUrl: '/mock-report.pdf', description: 'Kidney function assessment.' },
  // Emily Jones - Add a report for Emily to have more variety
  { id: 'report5', patientId: 'patient4', patientName: 'Emily Jones', appointmentId: 'appt7', reportName: 'Pre-Allergy Panel Checkup', uploadDate: '2024-07-29T15:00:00Z', fileUrl: '/mock-report.pdf', description: 'Basic health markers before allergy panel.' },
];

export let mockInvoicesData: Invoice[] = [
  // John Doe
  { id: 'inv1', patientId: 'patient1', patientName: 'John Doe', appointmentId: 'appt1', invoiceNumber: 'INV-2024-071', 
    amount: 700, taxAmount: 126, currency: 'INR', 
    issueDate: '2024-07-25T00:00:00Z', status: 'Paid', invoiceUrl: '/admin/billing/invoice/inv1', items: [
    {description: 'Complete Blood Count', quantity: 1, unitPrice: 500, total: 500},
    {description: 'Syringe & Needle', quantity: 1, unitPrice: 100, total: 100},
    {description: 'Lab Processing Fee', quantity: 1, unitPrice: 100, total: 100},
  ] },
  { id: 'inv2', patientId: 'patient1', patientName: 'John Doe', appointmentId: 'appt2', invoiceNumber: 'INV-2024-062', 
    amount: 1100, taxAmount: 198, currency: 'INR', 
    issueDate: '2024-06-10T00:00:00Z', status: 'Paid', invoiceUrl: '/admin/billing/invoice/inv2', items: [{description: 'Lipid Profile', quantity: 1, unitPrice: 1100, total: 1100}] },
  // Jane Smith
  { id: 'inv3', patientId: 'patient2', patientName: 'Jane Smith', appointmentId: 'appt3', invoiceNumber: 'INV-2024-073', 
    amount: 800, taxAmount: 144, currency: 'INR', 
    issueDate: '2024-07-20T00:00:00Z', dueDate: '2024-08-05T00:00:00Z', status: 'Pending', invoiceUrl: '/admin/billing/invoice/inv3', items: [{description: 'Thyroid Function Test', quantity: 1, unitPrice: 800, total: 800}] },
  // Michael Brown
  { id: 'inv4', patientId: 'patient3', patientName: 'Michael Brown', appointmentId: 'appt5', invoiceNumber: 'INV-2024-078', 
    amount: 350, taxAmount: 63, currency: 'INR', 
    issueDate: '2024-07-28T00:00:00Z', status: 'Paid', invoiceUrl: '/admin/billing/invoice/inv4', items: [{description: 'Glucose Test (Fasting)', quantity: 1, unitPrice: 350, total: 350}] },
  // Emily Jones
  { id: 'inv5', patientId: 'patient4', patientName: 'Emily Jones', appointmentId: 'appt7', invoiceNumber: 'INV-2024-081', 
    amount: 2500, taxAmount: 450, currency: 'INR', 
    issueDate: '2024-08-01T00:00:00Z', dueDate: '2024-08-15T00:00:00Z', status: 'Pending', invoiceUrl: '/admin/billing/invoice/inv5', items: [{description: 'Allergy Panel - Basic', quantity: 1, unitPrice: 2500, total: 2500}] },
];

// --- Getter Functions ---

export const getAllPatients = async (): Promise<User[]> => {
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
  return mockPatients;
};

export const getPatientById = async (id: string): Promise<User | undefined> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const patient = mockPatients.find(p => p.id === id);
  if (patient && patient.dateOfBirth) {
    const birthDate = new Date(patient.dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return { ...patient, age };
  }
  return patient;
};

export const addPatient = async (patientData: Omit<User, 'id' | 'role' | 'age'>): Promise<User> => {
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
  const newPatient: User = {
    id: `patient-${Date.now()}-${Math.random().toString(36).substring(7)}`, // More unique ID
    role: 'patient',
    email: patientData.email || `${patientData.name?.replace(/\s+/g, '.').toLowerCase() || 'new.patient'}@pathassist-temp.com`,
    ...patientData,
  };
  // Ensure name is split into firstName and lastName if possible
  if (newPatient.name && !newPatient.firstName && !newPatient.lastName) {
    const nameParts = newPatient.name.split(' ');
    newPatient.firstName = nameParts[0];
    newPatient.lastName = nameParts.slice(1).join(' ') || undefined; // Handle single name
  }
  mockPatients.push(newPatient);
  console.log('Added new patient:', newPatient);
  return newPatient;
};

export const getAppointmentsByPatientId = async (patientId: string): Promise<Appointment[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockAppointmentsData.filter(appt => appt.patientId === patientId).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const getAllAppointmentsAdminView = async (): Promise<Appointment[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  // Ensure patientName is populated from mockPatients if not directly on appointment
  return mockAppointmentsData.map(appt => {
    const patient = mockPatients.find(p => p.id === appt.patientId);
    return {
      ...appt,
      patientName: patient ? patient.name : appt.patientName || 'Unknown Patient'
    };
  }).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const getAppointmentById = async (id: string): Promise<Appointment | undefined> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const appointment = mockAppointmentsData.find(appt => appt.id === id);
  if (appointment) {
    const patient = mockPatients.find(p => p.id === appointment.patientId);
    return {
      ...appointment,
      patientName: patient ? patient.name : appointment.patientName || 'Unknown Patient',
    };
  }
  return undefined;
};

export const updateAppointment = async (appointmentId: string, updatedData: Partial<Appointment>): Promise<Appointment | undefined> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const appointmentIndex = mockAppointmentsData.findIndex(appt => appt.id === appointmentId);
  if (appointmentIndex === -1) {
    return undefined;
  }
  mockAppointmentsData[appointmentIndex] = { ...mockAppointmentsData[appointmentIndex], ...updatedData };
  console.log('Updated appointment:', mockAppointmentsData[appointmentIndex]);
  return mockAppointmentsData[appointmentIndex];
};


export const getTestReportsByPatientId = async (patientId: string): Promise<TestReport[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockReportsData.filter(report => report.patientId === patientId).sort((a,b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
};

export const getAllTestReports = async (): Promise<TestReport[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return [...mockReportsData].sort((a,b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
};

export const getInvoicesByPatientId = async (patientId: string): Promise<Invoice[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockInvoicesData.filter(invoice => invoice.patientId === patientId).sort((a,b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());
};

export const getAllInvoices = async (): Promise<Invoice[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockInvoicesData.map(inv => {
        const patient = mockPatients.find(p => p.id === inv.patientId);
        return {
            ...inv,
            patientName: patient ? patient.name : 'Unknown Patient',
            currency: inv.currency || 'INR' // Default to INR
        };
    }).sort((a,b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());
};

export const getInvoiceById = async (id: string): Promise<Invoice | undefined> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const foundInvoice = mockInvoicesData.find(inv => inv.id === id);
  if (!foundInvoice) return undefined;

  // Recalculate subtotal from items to ensure data integrity
  const subtotalFromItems = foundInvoice.items.reduce((acc, item) => acc + item.total, 0);

  return {
    ...foundInvoice,
    amount: subtotalFromItems, // Ensure amount is always the correct subtotal
    currency: foundInvoice.currency || 'INR'
  };
};

export const addInvoice = async (invoiceData: Omit<Invoice, 'id' | 'invoiceUrl' | 'patientName'>): Promise<Invoice> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const patient = mockPatients.find(p => p.id === invoiceData.patientId);
  const newId = `inv-${Date.now()}`;
  const newInvoice: Invoice = {
    id: newId,
    patientName: patient ? patient.name : 'Unknown Patient',
    ...invoiceData,
    invoiceUrl: `/admin/billing/invoice/${newId}`, // Generate a mock URL
  };
  mockInvoicesData.unshift(newInvoice); // Add to the beginning of the array
  console.log('Added new invoice:', newInvoice);
  return newInvoice;
};

export const updateInvoice = async (invoiceId: string, updatedData: Partial<Invoice>): Promise<Invoice | undefined> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const invoiceIndex = mockInvoicesData.findIndex(inv => inv.id === invoiceId);
  if (invoiceIndex === -1) {
    return undefined;
  }
  
  const originalInvoice = mockInvoicesData[invoiceIndex];
  
  // Create the updated invoice object, ensuring patientName is preserved or updated
  const patient = mockPatients.find(p => p.id === (updatedData.patientId || originalInvoice.patientId));
  const patientName = patient ? patient.name : originalInvoice.patientName;

  mockInvoicesData[invoiceIndex] = { 
    ...originalInvoice, 
    ...updatedData,
    patientName,
   };
  
  console.log('Updated invoice:', mockInvoicesData[invoiceIndex]);
  return mockInvoicesData[invoiceIndex];
};


interface AdminBookingDetails {
    patientId: string;
    patientName: string; // This will be the name of existing or newly added patient
    date: string;
    timeSlot: string;
    serviceNames: string[];
    serviceIds?: string[];
    notes?: string;
}

export const adminBookAppointment = async (bookingDetails: AdminBookingDetails): Promise<Appointment> => {
    await new Promise(resolve => setTimeout(resolve, 1000)); 
    
    const primaryServiceName = bookingDetails.serviceNames.join(', ');

    const newAppointment: Appointment = {
        id: `appt-${Date.now()}-${Math.random().toString(36).substring(7)}`, 
        patientId: bookingDetails.patientId,
        patientName: bookingDetails.patientName, // Use the name passed (could be new or existing)
        date: bookingDetails.date,
        timeSlot: bookingDetails.timeSlot,
        serviceName: primaryServiceName, 
        serviceIds: bookingDetails.serviceIds || [],
        status: 'Scheduled', 
        paymentStatus: 'Pending', 
        notes: bookingDetails.notes,
    };
    
    mockAppointmentsData.push(newAppointment);
    console.log("Admin booked appointment:", newAppointment);
    return newAppointment;
};


// Available services for booking/editing appointments
export const availableServices = [
  { id: "cbc", name: "Complete Blood Count (CBC)" },
  { id: "lipid", name: "Lipid Profile" },
  { id: "thyroid", name: "Thyroid Function Test (TFT)" },
  { id: "glucose", name: "Glucose Test (Fasting/Random)" },
  { id: "vitamin_d", name: "Vitamin D Test" },
  { id: "allergy_panel", name: "Allergy Panel - Basic" },
  { id: "liver_function", name: "Liver Function Test (LFT)" },
  { id: "renal_function", name: "Renal Function Test (RFT)" },
];

export const appointmentStatuses: AppointmentStatus[] = ['Scheduled', 'Sample Collected', 'In Lab', 'Report Ready', 'Cancelled'];
export const paymentStatuses: PaymentStatus[] = ['Paid', 'Pending', 'Failed'];
