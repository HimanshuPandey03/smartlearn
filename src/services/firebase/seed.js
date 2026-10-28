import { doc, setDoc, serverTimestamp, collection, writeBatch } from 'firebase/firestore';
import { db } from './firestore';

export const seedStudentData = async (studentId) => {
  if (!studentId) throw new Error("Student ID is required to seed data");
  
  const batch = writeBatch(db);
  
  // 1. Create Mock Courses
  const course1Id = "c_mscit_101";
  batch.set(doc(db, 'courses', course1Id), {
    title: "MS-CIT Preparation",
    description: "Complete curriculum to prepare for MKCL's MS-CIT examination.",
    category: "MS-CIT",
    status: "published",
    totalLessons: 10,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  const course2Id = "c_comp_fund_201";
  batch.set(doc(db, 'courses', course2Id), {
    title: "Computer Fundamentals",
    description: "Build a strong foundation in computer hardware and software.",
    category: "Computer Fundamentals",
    status: "published",
    totalLessons: 5,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  
  // 2. Create Enrollments
  batch.set(doc(collection(db, 'enrollments')), {
    studentId,
    courseId: course1Id,
    status: "active",
    enrolledAt: serverTimestamp()
  });
  
  batch.set(doc(collection(db, 'enrollments')), {
    studentId,
    courseId: course2Id,
    status: "active",
    enrolledAt: serverTimestamp()
  });

  // 3. Create Progress (simulate 4 completed lessons in MS-CIT, 5 in Computer Fund.)
  for(let i = 1; i <= 4; i++) {
    batch.set(doc(collection(db, 'progress')), {
      studentId,
      courseId: course1Id,
      lessonId: `l_${course1Id}_${i}`,
      completed: true,
      completedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }
  for(let i = 1; i <= 5; i++) {
    batch.set(doc(collection(db, 'progress')), {
      studentId,
      courseId: course2Id,
      lessonId: `l_${course2Id}_${i}`,
      completed: true,
      completedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }
  
  // 4. Create Mock Quizzes and Attempts
  const quiz1Id = "q_hardware_01";
  batch.set(doc(db, 'quizzes', quiz1Id), {
    title: "Hardware Basics",
    courseId: course2Id,
    totalQuestions: 10,
    status: "active"
  });
  
  const quiz2Id = "q_windows_01";
  batch.set(doc(db, 'quizzes', quiz2Id), {
    title: "Windows OS",
    courseId: course1Id,
    totalQuestions: 10,
    status: "active"
  });

  // Attempt 1
  batch.set(doc(collection(db, 'quizAttempts')), {
    studentId,
    quizId: quiz1Id,
    quizTitle: "Hardware Basics",
    score: 8.5,
    totalMarks: 10,
    percentage: 85,
    completedAt: serverTimestamp()
  });
  
  // Attempt 2
  batch.set(doc(collection(db, 'quizAttempts')), {
    studentId,
    quizId: quiz2Id,
    quizTitle: "Windows OS",
    score: 7,
    totalMarks: 10,
    percentage: 70,
    completedAt: serverTimestamp()
  });

  // 5. Assignments
  batch.set(doc(collection(db, 'assignments')), {
    title: "MS Word Practice Document",
    courseId: course1Id,
    dueDate: new Date(Date.now() + 86400000 * 2), // 2 days from now
    status: "active",
    createdAt: serverTimestamp()
  });

  await batch.commit();
  return true;
};
