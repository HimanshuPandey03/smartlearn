import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { quizzesAPI, notesAPI } from '@/services/api';
import { 
  Users, BookOpen, CheckSquare, FileText, 
  Plus, Award, ArrowUpRight, Loader2 
} from 'lucide-react';
import { Link } from 'react-router-dom';

const TeacherDashboard = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [quizRes, noteRes] = await Promise.all([
          quizzesAPI.getAll({ mine: true }).catch(() => ({ quizzes: [] })),
          notesAPI.getAll().catch(() => ({ notes: [] }))
        ]);

        if (quizRes.quizzes) setQuizzes(quizRes.quizzes);
        if (noteRes.notes) setNotes(noteRes.notes);
      } catch (err) {
        console.error('Teacher dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const totalAttempts = quizzes.reduce((sum, q) => sum + (parseInt(q.total_attempts || 0, 10)), 0);

  return (
    <div className="space-y-6">
      {/* Header with Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary">Teacher Portal</h1>
          <p className="text-slate-600">Create quizzes, upload revision notes, and monitor student assessments in MySQL.</p>
        </div>

        <div className="flex gap-2">
          <Link to="/teacher/notes">
            <Button size="sm" variant="outline" className="flex items-center gap-1.5 text-xs">
              <FileText size={15} />
              <span>Upload Notes</span>
            </Button>
          </Link>
          <Link to="/teacher/quizzes">
            <Button size="sm" className="flex items-center gap-1.5 text-xs">
              <Plus size={15} />
              <span>Create Quiz</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center gap-4 bg-white border border-slate-200">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
            <CheckSquare size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold text-secondary">{loading ? '...' : quizzes.length}</div>
            <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Quizzes Created</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4 bg-white border border-slate-200">
          <div className="p-3 bg-blue-100 text-primary rounded-xl">
            <FileText size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold text-secondary">{loading ? '...' : notes.length}</div>
            <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Notes Uploaded</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4 bg-white border border-slate-200">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
            <Award size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold text-secondary">{loading ? '...' : totalAttempts}</div>
            <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Total Submissions</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4 bg-white border border-slate-200">
          <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
            <Users size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold text-secondary">Active</div>
            <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Database Status</div>
          </div>
        </Card>
      </div>

      {/* Grid: Quizzes Summary and Uploaded Notes */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Your Quizzes */}
        <Card className="p-6 bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-secondary flex items-center gap-2">
                <CheckSquare size={18} className="text-purple-600" />
                <span>Your Quizzes</span>
              </h2>
              <Link to="/teacher/quizzes" className="text-xs text-primary font-semibold hover:underline">View All</Link>
            </div>

            {loading ? (
              <div className="py-8 flex justify-center text-slate-400">
                <Loader2 className="animate-spin" size={24} />
              </div>
            ) : quizzes.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                You haven't created any quizzes yet. Click "Create Quiz" above.
              </div>
            ) : (
              <div className="space-y-3">
                {quizzes.slice(0, 4).map((q) => (
                  <div key={q.id} className="p-3 rounded-lg border border-slate-100 bg-slate-50 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-secondary">{q.title}</p>
                      <span className="text-[10px] text-purple-700 font-semibold">{q.subject}</span>
                    </div>
                    <div className="text-right text-xs">
                      <span className="px-2 py-0.5 rounded-full font-bold bg-blue-100 text-primary">
                        {q.total_attempts || 0} Attempts
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4">
            <Link to="/teacher/quizzes" className="text-xs font-semibold text-primary flex items-center gap-1 hover:underline">
              <span>Go to Quizzes Manager</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>
        </Card>

        {/* Your Notes */}
        <Card className="p-6 bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-secondary flex items-center gap-2">
                <FileText size={18} className="text-primary" />
                <span>Uploaded Study Notes</span>
              </h2>
              <Link to="/teacher/notes" className="text-xs text-primary font-semibold hover:underline">View All</Link>
            </div>

            {loading ? (
              <div className="py-8 flex justify-center text-slate-400">
                <Loader2 className="animate-spin" size={24} />
              </div>
            ) : notes.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No notes uploaded yet. Click "Upload Notes" above.
              </div>
            ) : (
              <div className="space-y-3">
                {notes.slice(0, 4).map((n) => (
                  <div key={n.id} className="p-3 rounded-lg border border-slate-100 bg-slate-50 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-secondary">{n.title}</p>
                      <span className="text-[10px] text-blue-700 font-semibold">{n.subject}</span>
                    </div>
                    <div className="text-right text-[11px] text-slate-400">
                      {new Date(n.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4">
            <Link to="/teacher/notes" className="text-xs font-semibold text-primary flex items-center gap-1 hover:underline">
              <span>Go to Notes & Materials Manager</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TeacherDashboard;
