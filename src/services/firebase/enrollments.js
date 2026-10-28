import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firestore';

export const getStudentEnrollments = async (studentId) => {
  const enrollmentsRef = collection(db, 'enrollments');
  const q = query(enrollmentsRef, where('studentId', '==', studentId), where('status', '==', 'active'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
