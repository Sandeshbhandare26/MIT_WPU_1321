import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, updateDoc, doc, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "demo.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "demo.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "000000000000",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:000:web:000"
};

let app, db, auth;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
} catch (error) {
  console.warn('Firebase initialization failed, running in demo mode:', error.message);
  db = null;
  auth = null;
}

export { db, auth };

// Patient operations
export const savePatient = async (patientData) => {
  if (!db) {
    console.log('[Demo] Saving patient:', patientData);
    return { id: 'demo-' + Date.now(), ...patientData };
  }
  try {
    const docRef = await addDoc(collection(db, 'patients'), {
      ...patientData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return { id: docRef.id, ...patientData };
  } catch (error) {
    console.error('Error saving patient:', error);
    throw error;
  }
};

export const getPatients = async () => {
  if (!db) {
    console.log('[Demo] Fetching patients');
    return [];
  }
  try {
    const q = query(collection(db, 'patients'), orderBy('createdAt', 'desc'), limit(50));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error('Error fetching patients:', error);
    return [];
  }
};

// Booking operations
export const saveBooking = async (bookingData) => {
  if (!db) {
    console.log('[Demo] Saving booking:', bookingData);
    return { id: 'booking-' + Date.now(), ...bookingData };
  }
  try {
    const docRef = await addDoc(collection(db, 'bookings'), {
      ...bookingData,
      createdAt: new Date().toISOString()
    });
    return { id: docRef.id, ...bookingData };
  } catch (error) {
    console.error('Error saving booking:', error);
    throw error;
  }
};

// Hospital operations
export const getHospitals = async () => {
  if (!db) {
    console.log('[Demo] Fetching hospitals');
    return [];
  }
  try {
    const snap = await getDocs(collection(db, 'hospitals'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error('Error fetching hospitals:', error);
    return [];
  }
};

export const subscribeToPatients = (callback) => {
  if (!db) return () => {};
  const q = query(collection(db, 'patients'), orderBy('createdAt', 'desc'), limit(20));
  return onSnapshot(q, (snap) => {
    const patients = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(patients);
  });
};
