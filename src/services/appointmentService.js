import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';
import { db } from '../firebase';

export const appointmentService = {
  async createAppointment(appointment) {
    try {
      const docRef = await addDoc(collection(db, 'appointments'), {
        ...appointment,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  },

  async getAppointments(date = null) {
    try {
      let appointmentsQuery = collection(db, 'appointments');
      
      if (date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        
        appointmentsQuery = query(
          appointmentsQuery,
          where('date', '>=', startOfDay),
          where('date', '<=', endOfDay),
          orderBy('date')
        );
      } else {
        appointmentsQuery = query(appointmentsQuery, orderBy('date'));
      }

      const querySnapshot = await getDocs(appointmentsQuery);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting appointments:', error);
      throw error;
    }
  },

  async updateAppointment(id, updates) {
    try {
      const appointmentRef = doc(db, 'appointments', id);
      await updateDoc(appointmentRef, {
        ...updates,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating appointment:', error);
      throw error;
    }
  },

  async deleteAppointment(id) {
    try {
      await deleteDoc(doc(db, 'appointments', id));
    } catch (error) {
      console.error('Error deleting appointment:', error);
      throw error;
    }
  }
};