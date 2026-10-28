import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import LoadingState from '@/components/ui/LoadingState';
import EmptyState from '@/components/ui/EmptyState';
import { ArrowLeft, CheckCircle, FileText, Download, ExternalLink, Image, Film, PlayCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getLessonById, getPublishedLessonsByCourse } from '@/services/firebase/lessons';
import { getStudentEnrollments } from '@/services/firebase/enrollments';
import { getResourcesByLesson } from '@/services/firebase/resources';
import { getStudentProgress, markLessonComplete } from '@/services/firebase/progress';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/services/firebase/firestore';

const StudentLessonDetail = () => {
  const { courseId, lessonId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState(null);
  const [course, setCourse] = useState(null);
  const [moduleData, setModuleData] = useState(null);
  const [resources, setResources] = useState([]);
  const [allLessons, setAllLessons] = useState([]);
  
  const [isCompleted, setIsCompleted] = useState(false);
  const [isMarking, setIsMarking] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLessonData();
  }, [lessonId, user]);

  const fetchLessonData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      window.scrollTo(0, 0);
      
      // 1. Verify Enrollment
      const enrollments = await getStudentEnrollments(user.uid);
      const isEnrolled = enrollments.some(e => e.courseId === courseId);
      if (!isEnrolled) {
        setError("You don't have access to this course.");
        setLoading(false);
        return;
      }

      // 2. Fetch Lesson
      const lessonData = await getLessonById(lessonId);
      if (!lessonData || lessonData.status !== 'published') {
        setError("Lesson not found or is unavailable.");
        setLoading(false);
        return;
      }
      setLesson(lessonData);

      // 3. Fetch Context (Course, Module)
      const cSnap = await getDoc(doc(db, 'courses', courseId));
      if (cSnap.exists()) setCourse({ id: cSnap.id, ...cSnap.data() });
      
      const mSnap = await getDoc(doc(db, 'modules', lessonData.moduleId));
      if (mSnap.exists()) setModuleData({ id: mSnap.id, ...mSnap.data() });

      // 4. Fetch Resources
      const res = await getResourcesByLesson(lessonId);
      setResources(res);

      // 5. Fetch Progress
      const progressDocs = await getStudentProgress(user.uid);
      const prog = progressDocs.find(p => p.lessonId === lessonId && p.completed);
      setIsCompleted(!!prog);

      // 6. Navigation Logic
      const lessonsList = await getPublishedLessonsByCourse(courseId);
      setAllLessons(lessonsList);

    } catch (err) {
      console.error(err);
      setError("Unable to load this lesson. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async () => {
    if (isCompleted) return;
    setIsMarking(true);
    try {
      await markLessonComplete(user.uid, courseId, lesson.moduleId, lessonId);
      setIsCompleted(true);
      
      // Check if this was the last lesson
      const currentIndex = allLessons.findIndex(l => l.id === lessonId);
      if (currentIndex === allLessons.length - 1) {
        // Automatically check if all other lessons are completed? That requires another progress fetch.
        // For simplicity, we just leave it marked as completed.
      }
    } catch (err) {
      console.error("Failed to mark complete:", err);
      alert("Failed to save progress.");
    } finally {
      setIsMarking(false);
    }
  };

  const getResourceIcon = (type) => {
    switch(type) {
      case 'pdf': return <FileText className="text-red-500" />;
      case 'image': return <Image className="text-blue-500" />;
      case 'video': return <Film className="text-purple-500" />;
      case 'link': return <ExternalLink className="text-slate-500" />;
      default: return <Download className="text-slate-500" />;
    }
  };

  const getResourceAction = (type) => {
    switch(type) {
      case 'pdf': return 'Open PDF';
      case 'video': return 'Watch Video';
      case 'image': return 'View Image';
      case 'link': return 'Open Link';
      default: return 'Download';
    }
  };

  if (loading) return <LoadingState message="Loading lesson..." />;
  if (error) return (
    <div className="space-y-4 max-w-3xl mx-auto">
      <Link to={`/student/courses/${courseId}`} className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors">
        <ArrowLeft size={20} /> Back to Course
      </Link>
      <EmptyState title="Access Denied" description={error} />
    </div>
  );

  const currentIndex = allLessons.findIndex(l => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Breadcrumbs */}
      <div className="text-sm text-slate-500 flex flex-wrap items-center gap-2 mb-2">
        <Link to="/student/courses" className="hover:text-primary transition-colors">My Courses</Link>
        <span>→</span>
        <Link to={`/student/courses/${courseId}`} className="hover:text-primary transition-colors line-clamp-1 max-w-[150px] sm:max-w-xs">{course?.title}</Link>
        <span>→</span>
        <span className="text-slate-700 font-medium line-clamp-1 max-w-[150px] sm:max-w-xs">{moduleData?.title}</span>
      </div>

      <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
        <Link to={`/student/courses/${courseId}`} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-600 transition-colors shrink-0">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <span className="text-xs font-bold text-primary uppercase tracking-wider">Lesson {currentIndex + 1}</span>
          <h1 className="text-2xl sm:text-3xl font-bold text-secondary">{lesson.title}</h1>
        </div>
      </div>

      {lesson.description && (
        <p className="text-lg text-slate-600 leading-relaxed bg-blue-50/50 p-4 rounded-xl border border-blue-100">
          {lesson.description}
        </p>
      )}

      {/* Lesson Content Area */}
      <Card className="p-6 sm:p-8">
        <div className="prose prose-slate prose-blue max-w-none text-slate-800 leading-relaxed whitespace-pre-wrap">
          {lesson.content ? lesson.content : (
            <p className="italic text-slate-400">No content available for this lesson.</p>
          )}
        </div>
      </Card>

      {/* Learning Resources */}
      {resources.length > 0 && (
        <div className="mt-8">
          <h3 className="font-bold text-lg text-secondary mb-4 flex items-center gap-2">
            <FileText className="text-primary" size={20} /> Learning Resources
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {resources.map(res => (
              <a 
                key={res.id} 
                href={res.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 hover:border-primary/40 hover:shadow-sm transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                  {getResourceIcon(res.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-secondary truncate group-hover:text-primary transition-colors">{res.title}</h4>
                  <p className="text-xs text-slate-500 font-medium">{getResourceAction(res.type)}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      <hr className="border-slate-200 my-8" />

      {/* Completion & Navigation */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 p-6 rounded-2xl border border-slate-200">
        <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-3">
          {prevLesson ? (
            <Button 
              variant="outline" 
              onClick={() => navigate(`/student/courses/${courseId}/lessons/${prevLesson.id}`)}
              className="flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <ArrowLeft size={16} /> Previous Lesson
            </Button>
          ) : (
            <div className="hidden sm:block w-[140px]"></div>
          )}
        </div>

        <div className="w-full sm:w-auto text-center">
          {isCompleted ? (
            <div className="inline-flex items-center gap-2 px-6 py-2.5 bg-green-100 text-success rounded-lg font-bold">
              <CheckCircle size={20} /> Completed
            </div>
          ) : (
            <Button 
              onClick={handleMarkComplete} 
              disabled={isMarking}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8"
              variant="success"
            >
              {isMarking ? 'Saving...' : 'Mark as Complete'}
            </Button>
          )}
        </div>

        <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-3">
          {nextLesson ? (
            <Button 
              variant={isCompleted ? "primary" : "outline"}
              onClick={() => navigate(`/student/courses/${courseId}/lessons/${nextLesson.id}`)}
              className="flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              Next Lesson <ArrowRight size={16} />
            </Button>
          ) : (
            isCompleted && (
              <Button 
                variant="primary" 
                onClick={() => navigate(`/student/courses/${courseId}`)}
                className="flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                Course Outline <ArrowRight size={16} />
              </Button>
            )
          )}
        </div>
      </div>
      
      {/* Course Completed Message */}
      {!nextLesson && isCompleted && (
        <div className="mt-8 text-center p-8 bg-blue-50 border border-blue-100 rounded-2xl">
          <div className="w-16 h-16 bg-success text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-200">
            <CheckCircle size={32} />
          </div>
          <h2 className="text-2xl font-bold text-secondary mb-2">Course Completed 100%</h2>
          <p className="text-slate-600 mb-6 max-w-md mx-auto">Congratulations! You have completed all the lessons in this course. You can review the material anytime.</p>
          <Button onClick={() => navigate('/student/courses')} className="px-8">Back to My Courses</Button>
        </div>
      )}
    </div>
  );
};

export default StudentLessonDetail;
