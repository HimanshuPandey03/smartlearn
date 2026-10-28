import { collection, doc, getDocs, query, where, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firestore';

export const getResourcesByLesson = async (lessonId) => {
  const resourcesRef = collection(db, 'resources');
  const q = query(resourcesRef, where('lessonId', '==', lessonId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a, b) => a.createdAt?.toMillis() - b.createdAt?.toMillis());
};

export const createResource = async (resourceData) => {
  const docRef = await addDoc(collection(db, 'resources'), {
    ...resourceData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return docRef.id;
};

export const deleteResource = async (resourceId) => {
  const docRef = doc(db, 'resources', resourceId);
  await deleteDoc(docRef); // Resources can be hard deleted as they are attached to lessons
};
