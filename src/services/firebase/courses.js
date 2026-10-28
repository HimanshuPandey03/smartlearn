import { collection, doc, getDoc, getDocs, query, where, addDoc, updateDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from './firestore';

export const getCourseById = async (courseId) => {
  const docRef = doc(db, 'courses', courseId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
};

export const getCoursesByIds = async (courseIds) => {
  if (!courseIds || courseIds.length === 0) return [];
  const coursesRef = collection(db, 'courses');
  const q = query(coursesRef, where('__name__', 'in', courseIds));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getAllCourses = async (includeArchived = false) => {
  const coursesRef = collection(db, 'courses');
  const q = includeArchived 
    ? query(coursesRef)
    : query(coursesRef, where('status', '!=', 'archived'));
    
  const querySnapshot = await getDocs(q);
  const courses = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return courses.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
};

export const createCourse = async (courseData) => {
  const docRef = await addDoc(collection(db, 'courses'), {
    ...courseData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return docRef.id;
};

export const updateCourse = async (courseId, updateData) => {
  const docRef = doc(db, 'courses', courseId);
  await updateDoc(docRef, {
    ...updateData,
    updatedAt: serverTimestamp()
  });
};
