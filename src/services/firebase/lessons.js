import { collection, doc, getDocs, query, where, addDoc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from './firestore';

export const getLessonsByModule = async (moduleId, includeArchived = false) => {
  const lessonsRef = collection(db, 'lessons');
  const q = query(lessonsRef, where('moduleId', '==', moduleId));
  const querySnapshot = await getDocs(q);
  let lessons = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  if (!includeArchived) {
    lessons = lessons.filter(l => l.status !== 'archived');
  }
  
  return lessons.sort((a, b) => (a.order || 0) - (b.order || 0));
};

export const getLessonById = async (lessonId) => {
  const docRef = doc(db, 'lessons', lessonId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
};

export const createLesson = async (lessonData) => {
  const docRef = await addDoc(collection(db, 'lessons'), {
    ...lessonData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return docRef.id;
};

export const updateLesson = async (lessonId, updateData) => {
  const docRef = doc(db, 'lessons', lessonId);
  await updateDoc(docRef, {
    ...updateData,
    updatedAt: serverTimestamp()
  });
};

export const getPublishedLessonsByCourse = async (courseId) => {
  const lessonsRef = collection(db, 'lessons');
  const q = query(lessonsRef, where('courseId', '==', courseId));
  const querySnapshot = await getDocs(q);
  let lessons = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return lessons.filter(l => l.status === 'published').sort((a, b) => (a.order || 0) - (b.order || 0));
};
