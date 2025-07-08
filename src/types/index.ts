export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  duration: number;
  notes: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentFormData {
  patientId: string;
  date: string;
  time: string;
  duration: number;
  notes: string;
}

export interface PatientFormData {
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
}