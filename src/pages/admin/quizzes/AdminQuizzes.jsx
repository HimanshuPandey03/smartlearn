import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { quizzesAPI } from '@/services/api';
import { CheckSquare, Trash2, Users, Loader2, X, AlertCircle } from 'lucide-react';

const AdminQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Attempts Modal
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [loadingAttempts, setLoadingAttempts] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const res = await quizzesAPI.getAll();
      if (res.success) {
        setQuizzes(res.quizzes);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load quizzes from MySQL.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const handleDelete = async (quizId) => {
    if (!window.confirm('Admin action: Are you sure you want to delete this quiz from the platform?')) return;
    try {
      await quizzesAPI.delete(quizId);
      setQuizzes(quizzes.filter(q => q.id !== quizId));
    } catch (err) {
      console.error(err);
      alert('Failed to delete quiz.');
    }
  };

  const handleViewAttempts = async (quiz) => {
    setSelectedQuiz(quiz);
    setIsModalOpen(true);
    try {
      setLoadingAttempts(true);
      const res = await quizzesAPI.getAttempts(quiz.id);
      if (res.success) {
        setAttempts(res.attempts);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to load attempts.');
    } finally {
      setLoadingAttempts(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary">All Platform Quizzes</h1>
        <p className="text-slate-600">Admin overall oversight: Inspect quizzes across all teachers and view all student submission records.</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-danger rounded-lg text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-16 flex justify-center text-slate-400">
          <Loader2 className="animate-spin" size={32} />
        </div>
      ) : quizzes.length === 0 ? (
        <Card className="p-12 text-center text-slate-400">No quizzes available in MySQL.</Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {quizzes.map((quiz) => (
            <Card key={quiz.id} className="p-5 flex flex-col justify-between bg-white border border-slate-200">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                    {quiz.subject}
                  </span>
                  <button 
                    onClick={() => handleDelete(quiz.id)}
                    title="Delete quiz"
                    className="text-slate-400 hover:text-danger p-1 rounded"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <h3 className="font-bold text-secondary text-base mb-1">{quiz.title}</h3>
                <p className="text-xs text-slate-500 mb-3">
                  Created by <strong className="text-slate-700">{quiz.teacher_name}</strong>
                </p>

                <p className="text-xs text-slate-600 line-clamp-2 mb-4">
                  {quiz.description || 'No description.'}
                </p>

                <div className="grid grid-cols-3 gap-2 p-2.5 bg-slate-50 rounded-lg text-center text-xs mb-3">
                  <div>
                    <span className="text-slate-400">Questions:</span> <strong className="text-secondary">{quiz.question_count || 0}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Time:</span> <strong className="text-secondary">{quiz.duration_minutes}m</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Attempts:</span> <strong className="text-primary">{quiz.total_attempts || 0}</strong>
                  </div>
                </div>
              </div>

              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => handleViewAttempts(quiz)}
                className="w-full justify-center text-xs flex items-center gap-1.5"
              >
                <Users size={14} />
                <span>View Submissions ({quiz.total_attempts || 0})</span>
              </Button>
            </Card>
          ))}
        </div>
      )}

      {/* Submissions Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 relative max-h-[85vh] flex flex-col">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X size={20} />
            </button>

            <h2 className="text-lg font-bold text-secondary mb-1">{selectedQuiz?.title} - Submissions</h2>
            <p className="text-xs text-slate-500 mb-4">Teacher: {selectedQuiz?.teacher_name}</p>

            <div className="overflow-y-auto flex-1">
              {loadingAttempts ? (
                <div className="py-12 flex justify-center text-slate-400">
                  <Loader2 className="animate-spin" size={24} />
                </div>
              ) : attempts.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-sm">No submissions recorded yet.</div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b">
                    <tr>
                      <th className="py-2 px-3">Student</th>
                      <th className="py-2 px-3">Score</th>
                      <th className="py-2 px-3">Percentage</th>
                      <th className="py-2 px-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {attempts.map(att => (
                      <tr key={att.id}>
                        <td className="py-2.5 px-3 font-semibold">{att.student_name}</td>
                        <td className="py-2.5 px-3 font-bold">{att.score} / {att.total_marks}</td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded-full font-bold bg-blue-100 text-primary">
                            {att.percentage}%
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-400">{new Date(att.attempted_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="pt-3 border-t mt-4 flex justify-end">
              <Button size="sm" variant="outline" onClick={() => setIsModalOpen(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminQuizzes;
