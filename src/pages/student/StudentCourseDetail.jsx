import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import ProgressBar from '@/components/ui/ProgressBar';
import LoadingState from '@/components/ui/LoadingState';
import EmptyState from '@/components/ui/EmptyState';
import Badge from '@/components/ui/Badge';
import { ArrowLeft, BookOpen, CheckCircle, Circle, PlayCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getCourseById } from '@/services/firebase/courses';
import { getStudentEnrollments } from '@/services/firebase/enrollments';
import { getPublishedModulesByCourse } from '@/services/firebase/modules';
import { getPublishedLessonsByCourse } from '@/services/firebase/lessons';
import { getStudentProgress } from '@/services/firebase/progress';

const StudentCourseDetail = () => {
  const { courseId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [completedLessonIds, setCompletedLessonIds] = useState(new Set());
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedModules, setExpandedModules] = useState({});

  useEffect(() => {
    fetchCourseData();
  }, [courseId, user]);

  const fetchCourseData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      
      // Check authorization
      const enrollments = await getStudentEnrollments(user.uid);
      const isEnrolled = enrollments.some(e => e.courseId === courseId);
      if (!isEnrolled) {
        setError("You are not enrolled in this course.");
        setLoading(false);
        return;
      }

      // Fetch course
      const courseData = await getCourseById(courseId);
      if (!courseData || courseData.status !== 'published') {
        setError("Course not found or is unavailable.");
        setLoading(false);
        return;
      }
      setCourse(courseData);

      // Fetch modules and lessons
      const fetchedModules = await getPublishedModulesByCourse(courseId);
      const fetchedLessons = await getPublishedLessonsByCourse(courseId);
      
      setModules(fetchedModules);
      setLessons(fetchedLessons);

      // Initialize all modules to be expanded by default
      const expState = {};
      fetchedModules.forEach(m => expState[m.id] = true);
      setExpandedModules(expState);

      // Fetch progress
      const progressDocs = await getStudentProgress(user.uid);
      const completedSet = new Set(
        progressDocs
          .filter(p => p.courseId === courseId && p.completed)
          .map(p => p.lessonId)
      );
      setCompletedLessonIds(completedSet);

    } catch (err) {
      console.error(err);
      setError("An error occurred while loading the course.");
    } finally {
      setLoading(false);
    }
  };

  const toggleModule = (moduleId) => {
    setExpandedModules(prev => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  if (loading) return <LoadingState message="Loading course details..." />;
  if (error) return (
    <div className="space-y-4">
      <Link to="/student/courses" className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors">
        <ArrowLeft size={20} /> Back to My Courses
      </Link>
      <EmptyState title="Access Denied" description={error} />
    </div>
  );

  const totalLessons = lessons.length;
  const completedLessonsCount = completedLessonIds.size;
  const overallProgress = totalLessons > 0 ? Math.round((completedLessonsCount / totalLessons) * 100) : 0;

  // Determine next lesson
  let nextLessonUrl = null;
  if (totalLessons > 0) {
    const firstIncomplete = lessons.find(l => !completedLessonIds.has(l.id));
    if (firstIncomplete) {
      nextLessonUrl = `/student/courses/${courseId}/lessons/${firstIncomplete.id}`;
    } else {
      nextLessonUrl = `/student/courses/${courseId}/lessons/${lessons[0].id}`; // Review mode
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <Link to="/student/courses" className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-secondary">{course.title}</h1>
          <span className="text-sm font-semibold text-primary">{course.category}</span>
        </div>
      </div>

      <Card className="p-6">
        <p className="text-slate-600 mb-6">{course.description}</p>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
          <div className="flex-1 w-full">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-bold text-secondary">Course Progress</span>
              <span className="font-bold text-primary">{overallProgress}%</span>
            </div>
            <ProgressBar progress={overallProgress} className={overallProgress === 100 ? 'text-success' : ''} />
            <p className="text-xs text-slate-500 mt-2">{completedLessonsCount} of {totalLessons} lessons completed</p>
          </div>
          <div className="w-full md:w-auto shrink-0">
            {nextLessonUrl && (
              <Button 
                onClick={() => navigate(nextLessonUrl)} 
                className="w-full md:w-auto flex items-center justify-center gap-2"
                variant={overallProgress === 100 ? 'outline' : 'primary'}
              >
                {overallProgress === 100 ? 'Review Course' : overallProgress > 0 ? 'Continue Learning' : 'Start Learning'}
                <PlayCircle size={18} />
              </Button>
            )}
          </div>
        </div>
      </Card>

      <h2 className="text-xl font-bold text-secondary mt-8 mb-4">Course Modules</h2>

      {modules.length === 0 ? (
        <EmptyState title="No modules yet" description="Content is being prepared for this course." />
      ) : (
        <div className="space-y-4">
          {modules.map(module => {
            const moduleLessons = lessons.filter(l => l.moduleId === module.id);
            const moduleCompleted = moduleLessons.filter(l => completedLessonIds.has(l.id)).length;
            const moduleTotal = moduleLessons.length;
            const modProgress = moduleTotal > 0 ? Math.round((moduleCompleted / moduleTotal) * 100) : 0;
            const isExpanded = expandedModules[module.id];

            return (
              <Card key={module.id} className="overflow-hidden border-slate-200">
                <div 
                  className="p-4 bg-white hover:bg-slate-50 cursor-pointer transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                  onClick={() => toggleModule(module.id)}
                >
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-secondary mb-1">{module.title}</h3>
                    {module.description && <p className="text-sm text-slate-500 line-clamp-1">{module.description}</p>}
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-slate-500 mb-1">{moduleCompleted} / {moduleTotal} lessons</p>
                      <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div className={`h-full ${modProgress === 100 ? 'bg-success' : 'bg-primary'}`} style={{ width: `${modProgress}%` }} />
                      </div>
                    </div>
                    <button className="text-slate-400 p-1 rounded-full hover:bg-slate-200">
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-slate-100 bg-slate-50 p-2 sm:p-4 space-y-2">
                    {moduleLessons.length === 0 ? (
                      <p className="text-sm text-slate-500 text-center py-2">No lessons available in this module.</p>
                    ) : (
                      moduleLessons.map(lesson => {
                        const isCompleted = completedLessonIds.has(lesson.id);
                        return (
                          <Link 
                            key={lesson.id} 
                            to={`/student/courses/${courseId}/lessons/${lesson.id}`}
                            className={`flex items-center gap-3 p-3 rounded-lg border transition-all hover:shadow-sm ${
                              isCompleted ? 'bg-white border-green-100' : 'bg-white border-slate-200 hover:border-primary/30'
                            }`}
                          >
                            <div className={`flex-shrink-0 ${isCompleted ? 'text-success' : 'text-slate-300'}`}>
                              {isCompleted ? <CheckCircle size={20} /> : <Circle size={20} />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`font-semibold text-sm truncate ${isCompleted ? 'text-secondary' : 'text-slate-700'}`}>
                                {lesson.title}
                              </p>
                              {lesson.description && <p className="text-xs text-slate-500 truncate">{lesson.description}</p>}
                            </div>
                            {!isCompleted && (
                              <span className="text-xs font-semibold text-primary px-2 py-1 bg-blue-50 rounded hidden sm:inline-block shrink-0">
                                Start
                              </span>
                            )}
                          </Link>
                        );
                      })
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentCourseDetail;
