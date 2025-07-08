import { useState, useEffect } from 'react';
import { demoFirestore } from '../lib/demoAuth';
import { Patient, PatientFormData } from '../types';

export const usePatients = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPatients = async () => {
    try {
      const patientsCollection = demoFirestore.collection('patients');
      const querySnapshot = await patientsCollection.getDocs();
      const patientsData = querySnapshot.docs.map(doc => ({
        ...doc.data()
      })) as Patient[];
      setPatients(patientsData.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const addPatient = async (patientData: PatientFormData): Promise<void> => {
    try {
      const patientsCollection = demoFirestore.collection('patients');
      const docRef = await patientsCollection.addDoc({
        ...patientData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      const newPatient: Patient = {
        id: docRef.id,
        ...patientData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setPatients(prev => [...prev, newPatient].sort((a, b) => a.name.localeCompare(b.name)));
    } catch (error) {
      console.error('Error adding patient:', error);
      throw error;
    }
  };

  const updatePatient = async (id: string, patientData: PatientFormData): Promise<void> => {
    try {
      const patientDoc = demoFirestore.doc('patients', id);
      await patientDoc.updateDoc({
        ...patientData,
        updatedAt: new Date().toISOString()
      });
      setPatients(prev => prev.map(patient => 
        patient.id === id 
          ? { ...patient, ...patientData, updatedAt: new Date().toISOString() }
          : patient
      ).sort((a, b) => a.name.localeCompare(b.name)));
    } catch (error) {
      console.error('Error updating patient:', error);
      throw error;
    }
  };

  const deletePatient = async (id: string): Promise<void> => {
    try {
      const patientDoc = demoFirestore.doc('patients', id);
      await patientDoc.deleteDoc();
      setPatients(prev => prev.filter(patient => patient.id !== id));
    } catch (error) {
      console.error('Error deleting patient:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  return {
    patients,
    loading,
    addPatient,
    updatePatient,
    deletePatient,
    refreshPatients: fetchPatients
  };
};