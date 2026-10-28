import { collection, doc, getDocs, query, where, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firestore';

export const getModulesByCourse = async (courseId, includeArchived = false) => {
  const modulesRef = collection(db, 'modules');
  let q = query(modulesRef, where('courseId', '==', courseId));
  const querySnapshot = await getDocs(q);
  let modules = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  if (!includeArchived) {
    modules = modules.filter(m => m.status !== 'archived');
  }
  
  return modules.sort((a, b) => (a.order || 0) - (b.order || 0));
};

export const createModule = async (moduleData) => {
  const docRef = await addDoc(collection(db, 'modules'), {
    ...moduleData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return docRef.id;
};

export const updateModule = async (moduleId, updateData) => {
  const docRef = doc(db, 'modules', moduleId);
  await updateDoc(docRef, {
    ...updateData,
    updatedAt: serverTimestamp()
  });
};

export const getPublishedModulesByCourse = async (courseId) => {
  const modulesRef = collection(db, 'modules');
  const q = query(modulesRef, where('courseId', '==', courseId));
  const querySnapshot = await getDocs(q);
  let modules = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return modules.filter(m => m.status === 'published').sort((a, b) => (a.order || 0) - (b.order || 0));
};
