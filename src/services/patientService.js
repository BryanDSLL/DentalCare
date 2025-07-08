import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { db } from '../firebase';

export const patientService = {
  async createPatient(patient) {
    try {
      const docRef = await addDoc(collection(db, 'patients'), {
        ...patient,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating patient:', error);
      throw error;
    }
  },

  async getPatients() {
    try {
      const patientsQuery = query(collection(db, 'patients'), orderBy('name'));
      const querySnapshot = await getDocs(patientsQuery);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting patients:', error);
      throw error;
    }
  },

  async updatePatient(id, updates) {
    try {
      const patientRef = doc(db, 'patients', id);
      await updateDoc(patientRef, {
        ...updates,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating patient:', error);
      throw error;
    }
  },

  async deletePatient(id) {
    try {
      await deleteDoc(doc(db, 'patients', id));
    } catch (error) {
      console.error('Error deleting patient:', error);
      throw error;
    }
  }
};