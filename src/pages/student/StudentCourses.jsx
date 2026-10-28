import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import ProgressBar from '@/components/ui/ProgressBar';
import LoadingState from '@/components/ui/LoadingState';
import EmptyState from '@/components/ui/EmptyState';
import Badge from '@/components/ui/Badge';
import { BookOpen, PlayCircle, Clock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getStudentEnrollments } from '@/services/firebase/enrollments';
import { getCoursesByIds } from '@/services/firebase/courses';
import { getStudentProgress } from '@/services/firebase/progress';

const StudentCourses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        if (!user) return;

        const studentId = user.uid;
        const enrollments = await getStudentEnrollments(studentId);
        const courseIds = enrollments.map(e => e.courseId);

        if (courseIds.length === 0) {
          setCourses([]);
          setLoading(false);
          return;
        }

        const coursesMapRaw = await getCoursesByIds(courseIds);
        const coursesMap = coursesMapRaw.filter(c => c.status === 'published');

        if (coursesMap.length === 0) {
          setCourses([]);
          setLoading(false);
          return;
        }

        const progressDocs = await getStudentProgress(studentId);
        const completedLessons = progressDocs.filter(p => p.completed);

        const coursesWithProgress = coursesMap.map(course => {
          const courseProgress = completedLessons.filter(p => p.courseId === course.id);
          const total = course.totalLessons || 1; // Default to 1 to avoid division by zero
          const progressPercentage = Math.min(Math.round((courseProgress.length / total) * 100), 100);
          return {
            ...course,
            progressPercentage
          };
        });

        setCourses(coursesWithProgress);
      } catch (err) {
        console.error("Error fetching student courses:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [user]);

  if (loading) return <LoadingState message="Loading your courses..." />;
  
  if (error) return (
    <div className="p-6 bg-red-50 text-red-700 rounded-xl border border-red-100">
      <h3 className="font-bold mb-2">Error Loading Courses</h3>
      <p>{error}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary">My Courses</h1>
        <p className="text-slate-600">Continue your learning and track your course progress.</p>
      </div>

      {courses.length === 0 ? (
        <EmptyState 
          title="No courses assigned yet." 
          description="You are not enrolled in any active courses at the moment." 
          icon={BookOpen}
        />
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {courses.map(course => (
            <Card key={course.id} className="flex flex-col h-full hover:border-primary/50 transition-colors">
              <div className="h-40 bg-blue-50 rounded-t-xl flex items-center justify-center relative overflow-hidden">
                <BookOpen size={48} className="text-primary/20" />
                {course.progressPercentage === 100 && (
                  <div className="absolute top-3 right-3">
                    <Badge variant="success">Completed</Badge>
                  </div>
                )}
              </div>
              
              <div className="p-5 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2 gap-2">
                  <h3 className="font-bold text-lg text-secondary line-clamp-2">{course.title}</h3>
                </div>
                
                <span className="text-xs font-semibold text-primary bg-blue-50 px-2 py-1 rounded w-fit mb-3">
                  {course.category || 'Course'}
                </span>
                
                <p className="text-slate-600 text-sm mb-6 line-clamp-2 flex-1">
                  {course.description}
                </p>
                
                <div className="mt-auto space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-600 font-medium">Progress</span>
                      <span className="font-bold text-secondary">{course.progressPercentage}%</span>
                    </div>
                    <ProgressBar progress={course.progressPercentage} className={course.progressPercentage === 100 ? 'text-success' : ''} />
                  </div>
                  
                  <Link to={`/student/courses/${course.id}`} className="block">
                    <Button className="w-full flex items-center justify-center gap-2" variant={course.progressPercentage === 100 ? 'outline' : 'primary'}>
                      {course.progressPercentage === 100 ? 'Review Course' : course.progressPercentage > 0 ? 'Continue Learning' : 'Start Course'}
                      <PlayCircle size={18} />
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentCourses;
