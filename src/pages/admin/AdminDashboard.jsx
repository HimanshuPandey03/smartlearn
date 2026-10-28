import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { adminAPI } from '@/services/api';
import { 
  Users, UserCheck, BookOpen, CheckSquare, 
  FileText, Activity, Award, Calendar, Loader2, ArrowUpRight 
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getOverview();
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch platform metrics from MySQL database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const stats = data?.stats || {
    totalStudents: 0,
    totalTeachers: 0,
    totalQuizzes: 0,
    totalNotes: 0,
    totalAttempts: 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary">Overall Management Dashboard</h1>
          <p className="text-slate-600">Full system monitoring and access control oversight across all teachers and students.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/quizzes">
            <Button size="sm" variant="outline" className="text-xs">
              Check Quizzes
            </Button>
          </Link>
          <Link to="/admin/notes">
            <Button size="sm" variant="outline" className="text-xs">
              Check Notes
            </Button>
          </Link>
          <Link to="/admin/users">
            <Button size="sm" className="text-xs">
              View All Users
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-danger rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Real MySQL Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4 flex items-center gap-4 bg-white border border-slate-200">
          <div className="p-3 bg-blue-100 text-primary rounded-xl">
            <Users size={22} />
          </div>
          <div>
            <div className="text-2xl font-bold text-secondary">{loading ? '...' : stats.totalStudents}</div>
            <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Total Students</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4 bg-white border border-slate-200">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
            <UserCheck size={22} />
          </div>
          <div>
            <div className="text-2xl font-bold text-secondary">{loading ? '...' : stats.totalTeachers}</div>
            <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Total Teachers</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4 bg-white border border-slate-200">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
            <CheckSquare size={22} />
          </div>
          <div>
            <div className="text-2xl font-bold text-secondary">{loading ? '...' : stats.totalQuizzes}</div>
            <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Quizzes Live</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4 bg-white border border-slate-200">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
            <FileText size={22} />
          </div>
          <div>
            <div className="text-2xl font-bold text-secondary">{loading ? '...' : stats.totalNotes}</div>
            <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Notes Uploaded</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4 bg-white border border-slate-200 col-span-2 md:col-span-1">
          <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
            <Award size={22} />
          </div>
          <div>
            <div className="text-2xl font-bold text-secondary">{loading ? '...' : stats.totalAttempts}</div>
            <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Quiz Attempts</div>
          </div>
        </Card>
      </div>

      {/* Main Grid: Recent Submissions & Recent Notes */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Student Quiz Submissions */}
        <Card className="p-6 bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-secondary flex items-center gap-2">
                <Activity size={18} className="text-primary" />
                <span>Recent Student Quiz Submissions</span>
              </h2>
              <span className="text-xs text-slate-400 font-medium">Live Feed</span>
            </div>

            {loading ? (
              <div className="py-8 flex justify-center text-slate-400">
                <Loader2 className="animate-spin" size={24} />
              </div>
            ) : !data?.recentSubmissions || data.recentSubmissions.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-6 text-center">No student submissions recorded yet.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {data.recentSubmissions.map((sub) => (
                  <div key={sub.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-secondary">{sub.student_name}</p>
                      <p className="text-[11px] text-slate-500">Quiz: {sub.quiz_title}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        sub.percentage >= 60 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {sub.score}/{sub.total_marks} ({sub.percentage}%)
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5">{new Date(sub.attempted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 mt-4">
            <Link to="/admin/quizzes" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
              <span>View all quizzes and attempts</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>
        </Card>

        {/* Recent Teacher Notes Uploaded */}
        <Card className="p-6 bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-secondary flex items-center gap-2">
                <BookOpen size={18} className="text-emerald-600" />
                <span>Recent Teacher Notes Uploaded</span>
              </h2>
              <span className="text-xs text-slate-400 font-medium">MySQL Data</span>
            </div>

            {loading ? (
              <div className="py-8 flex justify-center text-slate-400">
                <Loader2 className="animate-spin" size={24} />
              </div>
            ) : !data?.recentNotes || data.recentNotes.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-6 text-center">No notes uploaded yet.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {data.recentNotes.map((n) => (
                  <div key={n.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-secondary">{n.title}</p>
                      <p className="text-[11px] text-slate-500">
                        Uploaded by <strong className="text-slate-700">{n.teacher_name}</strong>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-primary">
                        {n.subject}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1 justify-end">
                        <Calendar size={10} />
                        {new Date(n.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 mt-4">
            <Link to="/admin/notes" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
              <span>Manage all study notes</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
