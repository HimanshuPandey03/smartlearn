import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '@/components/ui/Card';
import ProgressBar from '@/components/ui/ProgressBar';
import LoadingState from '@/components/ui/LoadingState';
import EmptyState from '@/components/ui/EmptyState';
import Button from '@/components/ui/Button';
import { BookOpen, CheckCircle, Clock, Award, FileText, CheckSquare, ArrowRight, Download } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { quizzesAPI, notesAPI } from '@/services/api';

const StudentDashboard = () => {
  const { user, userProfile } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    totalNotes: 0,
    recentNotes: [],
    quizzesAttempted: 0,
    averageScore: 0,
    recentQuizzes: [],
    availableQuizzesCount: 0
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [attemptsRes, quizzesRes, notesRes] = await Promise.all([
        quizzesAPI.getMyAttempts().catch(() => ({ attempts: [] })),
        quizzesAPI.getAll().catch(() => ({ quizzes: [] })),
        notesAPI.getAll().catch(() => ({ notes: [] }))
      ]);

      const allAttempts = attemptsRes.attempts || [];
      const totalScore = allAttempts.reduce((acc, curr) => acc + (parseFloat(curr.percentage) || 0), 0);
      const averageScore = allAttempts.length > 0 ? Math.round(totalScore / allAttempts.length) : 0;
      
      setData({
        totalNotes: notesRes.notes?.length || 0,
        recentNotes: (notesRes.notes || []).slice(0, 3),
        quizzesAttempted: allAttempts.length,
        averageScore,
        recentQuizzes: allAttempts.slice(0, 4),
        availableQuizzesCount: quizzesRes.quizzes?.length || 0
      });

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  if (loading) return <LoadingState message="Loading your dashboard..." />;

  const firstName = userProfile?.name?.split(' ')[0] || 'Student';

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary">Welcome back, {firstName}!</h1>
          <p className="text-slate-600">Access your study notes and test your knowledge with interactive quizzes.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/student/materials">
            <Button size="sm" variant="outline" className="flex items-center gap-1.5 text-xs">
              <FileText size={15} />
              <span>View Notes</span>
            </Button>
          </Link>
          <Link to="/student/quizzes">
            <Button size="sm" className="flex items-center gap-1.5 text-xs">
              <CheckSquare size={15} />
              <span>Take Quiz</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 flex flex-col items-center justify-center text-center bg-white border border-slate-200">
          <div className="w-10 h-10 rounded-full bg-blue-100 text-primary flex items-center justify-center mb-2">
            <FileText size={20} />
          </div>
          <span className="text-2xl font-bold text-secondary">{data.totalNotes}</span>
          <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Study Notes</span>
        </Card>
        
        <Card className="p-4 flex flex-col items-center justify-center text-center bg-white border border-slate-200">
          <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mb-2">
            <CheckSquare size={20} />
          </div>
          <span className="text-2xl font-bold text-secondary">{data.availableQuizzesCount}</span>
          <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Available Quizzes</span>
        </Card>

        <Card className="p-4 flex flex-col items-center justify-center text-center bg-white border border-slate-200">
          <div className="w-10 h-10 rounded-full bg-green-100 text-success flex items-center justify-center mb-2">
            <CheckCircle size={20} />
          </div>
          <span className="text-2xl font-bold text-secondary">{data.quizzesAttempted}</span>
          <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Quizzes Attempted</span>
        </Card>

        <Card className="p-4 flex flex-col items-center justify-center text-center bg-white border border-slate-200">
          <div className="w-10 h-10 rounded-full bg-amber-100 text-accent flex items-center justify-center mb-2">
            <Award size={20} />
          </div>
          <span className="text-2xl font-bold text-secondary">{data.quizzesAttempted > 0 ? `${data.averageScore}%` : '--'}</span>
          <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Average Score</span>
        </Card>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main Area: Latest Notes Uploaded */}
        <div className="md:col-span-2 space-y-6">
          <Card className="p-6 bg-white border border-slate-200 min-h-[300px] flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-base font-bold text-secondary flex items-center gap-2">
                  <FileText size={18} className="text-primary" />
                  <span>Latest Notes Uploaded by Teachers</span>
                </h2>
                <Link to="/student/materials" className="text-xs font-semibold text-primary hover:underline">
                  View All Notes
                </Link>
              </div>

              {data.recentNotes.length === 0 ? (
                <EmptyState 
                  title="No study notes available yet." 
                  description="Your teachers will upload syllabus notes and revision materials here." 
                />
              ) : (
                <div className="space-y-3">
                  {data.recentNotes.map((note) => (
                    <div 
                      key={note.id} 
                      className="border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:border-primary/50 transition-colors bg-slate-50/50"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-primary">
                            {note.subject}
                          </span>
                          <span className="text-xs text-slate-400">By {note.teacher_name}</span>
                        </div>
                        <h3 className="font-bold text-secondary text-sm">{note.title}</h3>
                        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{note.description || 'No description'}</p>
                      </div>

                      {note.file_url ? (
                        <a
                          href={note.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-hover flex items-center gap-1.5 shrink-0 shadow-xs"
                        >
                          <Download size={13} />
                          <span>Download</span>
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Text Note</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 mt-4">
              <Link to="/student/materials" className="text-xs font-semibold text-primary flex items-center gap-1 hover:underline">
                <span>Browse all study materials</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </Card>
        </div>

        {/* Sidebar Area: Recent Quiz Attempts */}
        <div className="space-y-6">
          <Card className="p-6 bg-white border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-secondary flex items-center gap-2">
                  <Award size={18} className="text-amber-500" />
                  <span>My Quiz Performance</span>
                </h2>
                <Link to="/student/quizzes" className="text-xs text-primary font-semibold hover:underline">Take Quiz</Link>
              </div>

              {data.recentQuizzes.length === 0 ? (
                <EmptyState 
                  title="No quiz attempts yet." 
                  description="Complete quizzes to view your scores and score breakdown." 
                  className="min-h-[150px] p-4" 
                />
              ) : (
                <div className="space-y-4">
                  {data.recentQuizzes.map((quiz) => (
                    <div key={quiz.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="flex justify-between items-start text-xs mb-1.5">
                        <span className="font-bold text-secondary line-clamp-1 pr-2">{quiz.quiz_title}</span>
                        <span className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                          quiz.percentage >= 60 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {quiz.percentage}%
                        </span>
                      </div>
                      <ProgressBar progress={parseFloat(quiz.percentage)} height="h-1.5" />
                      <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1.5">
                        <span>Score: {quiz.score}/{quiz.total_marks}</span>
                        <span>{new Date(quiz.attempted_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 mt-4">
              <Link to="/student/quizzes" className="text-xs font-semibold text-primary flex items-center gap-1 hover:underline">
                <span>Go to Quizzes page</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
