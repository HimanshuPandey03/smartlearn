import { collection, query, where, getDocs, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firestore';

export const getStudentProgress = async (studentId) => {
  const progressRef = collection(db, 'progress');
  const q = query(progressRef, where('studentId', '==', studentId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const markLessonComplete = async (studentId, courseId, moduleId, lessonId) => {
  // Use a deterministic ID so we don't create duplicates and can easily update
  const progressDocId = `${studentId}_${lessonId}`;
  const docRef = doc(db, 'progress', progressDocId);
  
  await setDoc(docRef, {
    studentId,
    courseId,
    moduleId,
    lessonId,
    completed: true,
    completedAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }, { merge: true }); // Merge true in case it already exists
};
