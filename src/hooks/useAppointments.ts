import { useState, useEffect } from 'react';
import { demoFirestore } from '../lib/demoAuth';
import { Appointment, AppointmentFormData } from '../types';

export const useAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    try {
      const appointmentsCollection = demoFirestore.collection('appointments');
      const querySnapshot = await appointmentsCollection.getDocs();
      const appointmentsData = querySnapshot.docs.map(doc => ({
        ...doc.data()
      })) as Appointment[];
      setAppointments(appointmentsData.sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.time.localeCompare(b.time);
      }));
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const addAppointment = async (appointmentData: AppointmentFormData, patientName: string): Promise<void> => {
    try {
      const appointmentsCollection = demoFirestore.collection('appointments');
      const docRef = await appointmentsCollection.addDoc({
        ...appointmentData,
        patientName,
        status: 'scheduled',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      const newAppointment: Appointment = {
        id: docRef.id,
        ...appointmentData,
        patientName,
        status: 'scheduled',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setAppointments(prev => [...prev, newAppointment].sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.time.localeCompare(b.time);
      }));
    } catch (error) {
      console.error('Error adding appointment:', error);
      throw error;
    }
  };

  const updateAppointment = async (id: string, appointmentData: Partial<Appointment>): Promise<void> => {
    try {
      const appointmentDoc = demoFirestore.doc('appointments', id);
      await appointmentDoc.updateDoc({
        ...appointmentData,
        updatedAt: new Date().toISOString()
      });
      setAppointments(prev => prev.map(appointment => 
        appointment.id === id 
          ? { ...appointment, ...appointmentData, updatedAt: new Date().toISOString() }
          : appointment
      ).sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.time.localeCompare(b.time);
      }));
    } catch (error) {
      console.error('Error updating appointment:', error);
      throw error;
    }
  };

  const deleteAppointment = async (id: string): Promise<void> => {
    try {
      const appointmentDoc = demoFirestore.doc('appointments', id);
      await appointmentDoc.deleteDoc();
      setAppointments(prev => prev.filter(appointment => appointment.id !== id));
    } catch (error) {
      console.error('Error deleting appointment:', error);
      throw error;
    }
  };

  const getAppointmentsByDate = (date: string) => {
    return appointments.filter(appointment => appointment.date === date);
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  return {
    appointments,
    loading,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    getAppointmentsByDate,
    refreshAppointments: fetchAppointments
  };
};