import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firestore';

export const getAssignmentsForCourses = async (courseIds) => {
  if (!courseIds || courseIds.length === 0) return [];
  const assignmentsRef = collection(db, 'assignments');
  const q = query(assignmentsRef, where('courseId', 'in', courseIds), where('status', '==', 'active'));
  const querySnapshot = await getDocs(q);
  const results = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  // Client-side sorting for due dates
  return results.sort((a, b) => a.dueDate?.toMillis() - b.dueDate?.toMillis());
};
