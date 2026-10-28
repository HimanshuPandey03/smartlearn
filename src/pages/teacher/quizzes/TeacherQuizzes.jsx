import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { quizzesAPI } from '@/services/api';
import { 
  CheckSquare, Plus, Trash2, Eye, Clock, 
  HelpCircle, Award, Users, Loader2, X, AlertCircle, CheckCircle2 
} from 'lucide-react';

const TeacherQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Create Quiz Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [duration, setDuration] = useState(15);
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState([
    {
      question_text: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      correct_option: 'A',
      marks: 1
    }
  ]);

  // View Attempts Modal
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [loadingAttempts, setLoadingAttempts] = useState(false);
  const [isAttemptsModalOpen, setIsAttemptsModalOpen] = useState(false);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const res = await quizzesAPI.getAll();
      if (res.success) {
        setQuizzes(res.quizzes);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load quizzes. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        question_text: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_option: 'A',
        marks: 1
      }
    ]);
  };

  const handleRemoveQuestion = (index) => {
    if (questions.length <= 1) {
      alert('Quiz must have at least one question.');
      return;
    }
    const updated = [...questions];
    updated.splice(index, 1);
    setQuestions(updated);
  };

  const handleQuestionChange = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!title.trim() || !subject.trim()) {
      return setError('Title and Subject are required.');
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question_text.trim() || !q.option_a.trim() || !q.option_b.trim() || !q.option_c.trim() || !q.option_d.trim()) {
        return setError(`Please fill in all options for Question #${i + 1}`);
      }
    }

    try {
      setSubmitting(true);
      const res = await quizzesAPI.create({
        title,
        subject,
        duration_minutes: duration,
        description,
        questions
      });

      if (res.success) {
        setSuccessMsg('Quiz published successfully to MySQL database!');
        setIsCreateModalOpen(false);
        // Reset form
        setTitle('');
        setSubject('');
        setDuration(15);
        setDescription('');
        setQuestions([
          {
            question_text: '',
            option_a: '',
            option_b: '',
            option_c: '',
            option_d: '',
            correct_option: 'A',
            marks: 1
          }
        ]);
        fetchQuizzes();
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to create quiz.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm('Are you sure you want to delete this quiz? All student submissions will also be removed.')) return;
    try {
      await quizzesAPI.delete(quizId);
      setQuizzes(quizzes.filter(q => q.id !== quizId));
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to delete quiz.');
    }
  };

  const handleViewAttempts = async (quiz) => {
    setSelectedQuiz(quiz);
    setIsAttemptsModalOpen(true);
    try {
      setLoadingAttempts(true);
      const res = await quizzesAPI.getAttempts(quiz.id);
      if (res.success) {
        setAttempts(res.attempts);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to load student attempts.');
    } finally {
      setLoadingAttempts(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary">Manage Quizzes & Tests</h1>
          <p className="text-slate-600">Create multiple-choice quizzes with automated grading, and view student submissions.</p>
        </div>
        <Button 
          onClick={() => { setError(''); setSuccessMsg(''); setIsCreateModalOpen(true); }}
          className="flex items-center gap-2 self-start sm:self-auto bg-primary hover:bg-primary-hover text-white shadow-sm"
        >
          <Plus size={18} />
          <span>Create New Quiz</span>
        </Button>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center gap-2 text-sm">
          <CheckCircle2 size={18} className="text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-danger rounded-lg flex items-center gap-2 text-sm">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Quizzes List */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center text-slate-500">
          <Loader2 className="animate-spin mb-3 text-primary" size={32} />
          <p className="text-sm">Loading quizzes from MySQL database...</p>
        </div>
      ) : quizzes.length === 0 ? (
        <Card className="p-12 text-center bg-white border-dashed border-2 border-slate-200">
          <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckSquare size={32} />
          </div>
          <h3 className="text-lg font-bold text-secondary mb-1">No Quizzes Created Yet</h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
            Build interactive quizzes for students with automated evaluation and instant score generation.
          </p>
          <Button onClick={() => setIsCreateModalOpen(true)} className="inline-flex items-center gap-2">
            <Plus size={18} />
            <span>Create First Quiz</span>
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {quizzes.map((quiz) => (
            <Card key={quiz.id} className="p-5 flex flex-col justify-between hover:shadow-md transition-shadow bg-white border border-slate-200">
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                    {quiz.subject}
                  </span>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => handleDeleteQuiz(quiz.id)}
                      title="Delete quiz"
                      className="text-slate-400 hover:text-danger p-1 rounded hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-secondary text-base mb-1">
                  {quiz.title}
                </h3>
                
                <p className="text-xs text-slate-400 mb-3">
                  Created by <span className="font-medium text-slate-600">{quiz.teacher_name}</span> • {new Date(quiz.created_at).toLocaleDateString()}
                </p>

                <p className="text-xs text-slate-600 line-clamp-2 mb-4">
                  {quiz.description || 'No description provided.'}
                </p>

                <div className="grid grid-cols-3 gap-2 p-2.5 bg-slate-50 rounded-lg text-center mb-4">
                  <div>
                    <div className="text-xs text-slate-400 font-medium">Questions</div>
                    <div className="text-sm font-bold text-secondary">{quiz.question_count || 0}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-medium">Duration</div>
                    <div className="text-sm font-bold text-secondary">{quiz.duration_minutes}m</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-medium">Attempts</div>
                    <div className="text-sm font-bold text-primary">{quiz.total_attempts || 0}</div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleViewAttempts(quiz)}
                  className="flex items-center gap-1.5 text-xs w-full justify-center"
                >
                  <Users size={14} />
                  <span>View Student Submissions ({quiz.total_attempts || 0})</span>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Quiz Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full p-6 my-8 relative max-h-[90vh] flex flex-col">
            <button 
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-purple-100 text-purple-600 rounded-lg">
                <CheckSquare size={22} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-secondary">Create New Quiz</h2>
                <p className="text-xs text-slate-500">Configure quiz details and multiple-choice questions.</p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-danger rounded-lg text-xs flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreateQuiz} className="space-y-4 overflow-y-auto pr-2 flex-1">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <Input
                    label="Quiz Title"
                    placeholder="e.g. MS-CIT / DBMS Midterm Quiz"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Input
                    label="Subject"
                    placeholder="e.g. DBMS, Networking"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Time Limit (Minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Short Description (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Chapter 1-3 review quiz"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Questions Section */}
              <div className="pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-secondary text-sm flex items-center gap-2">
                    <HelpCircle size={16} className="text-primary" />
                    <span>Questions ({questions.length})</span>
                  </h3>
                  <Button 
                    type="button" 
                    size="sm" 
                    variant="outline" 
                    onClick={handleAddQuestion}
                    className="flex items-center gap-1 text-xs"
                  >
                    <Plus size={14} />
                    <span>Add Question</span>
                  </Button>
                </div>

                <div className="space-y-4">
                  {questions.map((q, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl relative">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                          Question #{idx + 1}
                        </span>
                        {questions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveQuestion(idx)}
                            className="text-slate-400 hover:text-danger text-xs font-medium flex items-center gap-1"
                          >
                            <Trash2 size={14} /> Remove
                          </button>
                        )}
                      </div>

                      <div className="mb-3">
                        <textarea
                          rows={2}
                          placeholder={`Enter question ${idx + 1} text here...`}
                          value={q.question_text}
                          onChange={(e) => handleQuestionChange(idx, 'question_text', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                        <div>
                          <label className="text-[11px] font-semibold text-slate-500 uppercase">Option A</label>
                          <input
                            type="text"
                            placeholder="Option A"
                            value={q.option_a}
                            onChange={(e) => handleQuestionChange(idx, 'option_a', e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-slate-500 uppercase">Option B</label>
                          <input
                            type="text"
                            placeholder="Option B"
                            value={q.option_b}
                            onChange={(e) => handleQuestionChange(idx, 'option_b', e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-slate-500 uppercase">Option C</label>
                          <input
                            type="text"
                            placeholder="Option C"
                            value={q.option_c}
                            onChange={(e) => handleQuestionChange(idx, 'option_c', e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-slate-500 uppercase">Option D</label>
                          <input
                            type="text"
                            placeholder="Option D"
                            value={q.option_d}
                            onChange={(e) => handleQuestionChange(idx, 'option_d', e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white"
                            required
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-4 pt-2 border-t border-slate-200">
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-bold text-secondary">Correct Answer:</label>
                          <select
                            value={q.correct_option}
                            onChange={(e) => handleQuestionChange(idx, 'correct_option', e.target.value)}
                            className="px-2 py-1 text-xs border border-slate-300 rounded bg-white font-bold text-primary"
                          >
                            <option value="A">Option A</option>
                            <option value="B">Option B</option>
                            <option value="C">Option C</option>
                            <option value="D">Option D</option>
                          </select>
                        </div>

                        <div className="flex items-center gap-2">
                          <label className="text-xs font-semibold text-slate-500">Marks:</label>
                          <input
                            type="number"
                            min="1"
                            max="20"
                            value={q.marks}
                            onChange={(e) => handleQuestionChange(idx, 'marks', e.target.value)}
                            className="w-16 px-2 py-1 text-xs border border-slate-300 rounded bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 sticky bottom-0 bg-white">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreateModalOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="animate-spin" size={16} />
                      Saving to MySQL...
                    </span>
                  ) : (
                    'Publish Quiz'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Submissions Modal */}
      {isAttemptsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 relative max-h-[85vh] flex flex-col">
            <button 
              onClick={() => setIsAttemptsModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
            >
              <X size={20} />
            </button>

            <div className="mb-4">
              <span className="text-xs font-bold text-primary uppercase tracking-wider">{selectedQuiz?.subject}</span>
              <h2 className="text-lg font-bold text-secondary">{selectedQuiz?.title} - Submissions</h2>
              <p className="text-xs text-slate-500">List of students who have completed this test.</p>
            </div>

            <div className="overflow-y-auto flex-1">
              {loadingAttempts ? (
                <div className="py-12 flex justify-center text-slate-400">
                  <Loader2 className="animate-spin" size={24} />
                </div>
              ) : attempts.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-sm">
                  No students have submitted this quiz yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Student</th>
                        <th className="py-2.5 px-3">Score</th>
                        <th className="py-2.5 px-3">Percentage</th>
                        <th className="py-2.5 px-3">Submitted At</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {attempts.map((att) => (
                        <tr key={att.id} className="hover:bg-slate-50/80">
                          <td className="py-3 px-3 font-semibold text-secondary">
                            <div>{att.student_name}</div>
                            <div className="text-[11px] text-slate-400 font-normal">{att.student_email}</div>
                          </td>
                          <td className="py-3 px-3 font-bold text-slate-800">
                            {att.score} / {att.total_marks}
                          </td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded-full font-bold ${
                              att.percentage >= 70 ? 'bg-emerald-100 text-emerald-700' :
                              att.percentage >= 40 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {att.percentage}%
                            </span>
                          </td>
                          <td className="py-3 px-3 text-slate-500">
                            {new Date(att.attempted_at).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-200 mt-4 flex justify-end">
              <Button size="sm" variant="outline" onClick={() => setIsAttemptsModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherQuizzes;
