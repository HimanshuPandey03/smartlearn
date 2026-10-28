import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from './firestore';

export const getStudentQuizAttempts = async (studentId) => {
  const attemptsRef = collection(db, 'quizAttempts');
  const q = query(attemptsRef, where('studentId', '==', studentId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getRecentQuizAttempts = async (studentId, limitCount = 5) => {
  const attemptsRef = collection(db, 'quizAttempts');
  // OrderBy requires a composite index, so we sort client-side for now to avoid manual index creation overhead in Phase 3
  const q = query(attemptsRef, where('studentId', '==', studentId));
  const querySnapshot = await getDocs(q);
  const results = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return results.sort((a, b) => b.completedAt?.toMillis() - a.completedAt?.toMillis()).slice(0, limitCount);
};

export const getQuizById = async (quizId) => {
  const { doc, getDoc } = await import('firebase/firestore');
  const docRef = doc(db, 'quizzes', quizId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
};
