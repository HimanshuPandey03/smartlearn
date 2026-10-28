import { Routes, Route } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import AuthLayout from '@/layouts/AuthLayout';
import DashboardLayout from '@/layouts/DashboardLayout';
import { ProtectedRoute, RoleProtectedRoute } from '@/components/navigation/ProtectedRoute';

// Public Pages
import LandingPage from '@/pages/public/LandingPage';
import AboutPage from '@/pages/public/AboutPage';
import ContactPage from '@/pages/public/ContactPage';

// Auth Pages
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';

// Student Pages
import StudentDashboard from '@/pages/student/StudentDashboard';
import StudentProfile from '@/pages/student/StudentProfile';
import StudentCourses from '@/pages/student/StudentCourses';
import StudentCourseDetail from '@/pages/student/StudentCourseDetail';
import StudentLessonDetail from '@/pages/student/StudentLessonDetail';
import StudentMaterials from '@/pages/student/StudentMaterials';
import StudentQuizzes from '@/pages/student/StudentQuizzes';
import ComingSoon from '@/pages/shared/ComingSoon';

// Teacher Pages
import TeacherDashboard from '@/pages/teacher/TeacherDashboard';
import TeacherQuizzes from '@/pages/teacher/quizzes/TeacherQuizzes';
import TeacherNotes from '@/pages/teacher/notes/TeacherNotes';

// Admin Pages
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminQuizzes from '@/pages/admin/quizzes/AdminQuizzes';
import AdminNotes from '@/pages/admin/notes/AdminNotes';
import AdminUsers from '@/pages/admin/users/AdminUsers';
import AdminCourses from '@/pages/admin/courses/AdminCourses';
import AdminCourseDetail from '@/pages/admin/courses/AdminCourseDetail';
import AdminModuleDetail from '@/pages/admin/courses/AdminModuleDetail';
import AdminLessonDetail from '@/pages/admin/courses/AdminLessonDetail';

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Route>

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        {/* Student Routes */}
        <Route element={<RoleProtectedRoute allowedRoles={['student']} />}>
          <Route path="/student" element={<DashboardLayout role="student" />}>
            <Route index element={<StudentDashboard />} />
            <Route path="materials" element={<StudentMaterials />} />
            <Route path="quizzes" element={<StudentQuizzes />} />
            <Route path="courses" element={<StudentCourses />} />
            <Route path="courses/:courseId" element={<StudentCourseDetail />} />
            <Route path="courses/:courseId/lessons/:lessonId" element={<StudentLessonDetail />} />
            <Route path="profile" element={<StudentProfile />} />
          </Route>
        </Route>

        {/* Teacher Routes */}
        <Route element={<RoleProtectedRoute allowedRoles={['teacher', 'admin']} />}>
          <Route path="/teacher" element={<DashboardLayout role="teacher" />}>
            <Route index element={<TeacherDashboard />} />
            <Route path="notes" element={<TeacherNotes />} />
            <Route path="quizzes" element={<TeacherQuizzes />} />
            <Route path="content" element={<AdminCourses />} />
            <Route path="courses/:courseId" element={<AdminCourseDetail />} />
            <Route path="courses/:courseId/modules/:moduleId" element={<AdminModuleDetail />} />
            <Route path="courses/:courseId/modules/:moduleId/lessons/:lessonId" element={<AdminLessonDetail />} />
            <Route path="profile" element={<StudentProfile />} />
          </Route>
        </Route>

        {/* Admin Routes (Overall Check) */}
        <Route element={<RoleProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin" element={<DashboardLayout role="admin" />}>
            <Route index element={<AdminDashboard />} />
            <Route path="quizzes" element={<AdminQuizzes />} />
            <Route path="notes" element={<AdminNotes />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="courses" element={<AdminCourses />} />
            <Route path="courses/:courseId" element={<AdminCourseDetail />} />
            <Route path="courses/:courseId/modules/:moduleId" element={<AdminModuleDetail />} />
            <Route path="courses/:courseId/modules/:moduleId/lessons/:lessonId" element={<AdminLessonDetail />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
