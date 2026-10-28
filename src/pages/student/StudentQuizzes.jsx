import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { quizzesAPI } from '@/services/api';
import { 
  CheckSquare, Clock, Award, CheckCircle2, 
  XCircle, AlertCircle, Loader2, ArrowRight, RotateCcw, X 
} from 'lucide-react';

const StudentQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Active Quiz Playing State
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [loadingActiveQuiz, setLoadingActiveQuiz] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  // Result State
  const [quizResult, setQuizResult] = useState(null);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const res = await quizzesAPI.getAll();
      if (res.success) {
        setQuizzes(res.quizzes);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load quizzes. Please ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  // Timer countdown
  useEffect(() => {
    if (!activeQuiz || quizResult || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeQuiz, quizResult, timeLeft]);

  const handleStartQuiz = async (quizId) => {
    try {
      setLoadingActiveQuiz(true);
      const res = await quizzesAPI.getById(quizId);
      if (res.success) {
        setActiveQuiz(res.quiz);
        setSelectedAnswers({});
        setQuizResult(null);
        setTimeLeft((res.quiz.duration_minutes || 15) * 60);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to load quiz questions.');
    } finally {
      setLoadingActiveQuiz(false);
    }
  };

  const handleSelectOption = (questionId, option) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: option
    }));
  };

  const handleAutoSubmit = () => {
    alert('Time has expired! Submitting your answers automatically.');
    handleSubmitQuiz();
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz) return;
    try {
      setSubmitting(true);
      const res = await quizzesAPI.submit(activeQuiz.id, selectedAnswers);
      if (res.success) {
        setQuizResult(res);
        fetchQuizzes(); // Refresh list to show new score
      }
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to submit quiz.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-secondary">Quizzes & Self Assessment</h1>
        <p className="text-slate-600">Test your understanding with automated grading quizzes uploaded by teachers.</p>
      </div>

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
          <p className="text-sm">Loading available quizzes from MySQL...</p>
        </div>
      ) : quizzes.length === 0 ? (
        <Card className="p-12 text-center bg-white border-dashed border-2 border-slate-200">
          <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckSquare size={32} />
          </div>
          <h3 className="text-lg font-bold text-secondary mb-1">No Quizzes Available</h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            Your teachers have not published any quizzes yet. Please check back later.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {quizzes.map((quiz) => {
            const hasAttempted = quiz.attempted && quiz.userAttempt;
            const attempt = quiz.userAttempt;

            return (
              <Card key={quiz.id} className="p-5 flex flex-col justify-between hover:shadow-md transition-shadow bg-white border border-slate-200">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                      {quiz.subject}
                    </span>
                    {hasAttempted && (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <CheckCircle2 size={12} />
                        Score: {attempt.score}/{attempt.total_marks} ({attempt.percentage}%)
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-secondary text-base mb-1">
                    {quiz.title}
                  </h3>

                  <p className="text-xs text-slate-500 mb-3">
                    By <strong className="text-slate-700">{quiz.teacher_name}</strong>
                  </p>

                  <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                    {quiz.description || 'Test your knowledge on this topic.'}
                  </p>

                  <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 rounded-lg text-center mb-4">
                    <div className="flex items-center justify-center gap-1.5 text-xs text-slate-600 font-medium">
                      <CheckSquare size={14} className="text-primary" />
                      <span>{quiz.question_count || 0} Questions</span>
                    </div>
                    <div className="flex items-center justify-center gap-1.5 text-xs text-slate-600 font-medium">
                      <Clock size={14} className="text-amber-500" />
                      <span>{quiz.duration_minutes} Mins</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <Button
                    onClick={() => handleStartQuiz(quiz.id)}
                    disabled={loadingActiveQuiz}
                    className="w-full flex items-center justify-center gap-2 text-xs"
                    variant={hasAttempted ? 'outline' : 'default'}
                  >
                    {hasAttempted ? (
                      <>
                        <RotateCcw size={14} />
                        <span>Retake Quiz</span>
                      </>
                    ) : (
                      <>
                        <ArrowRight size={14} />
                        <span>Start Quiz</span>
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Active Quiz Player Modal */}
      {activeQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col relative overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/20 px-2 py-0.5 rounded">
                  {activeQuiz.subject}
                </span>
                <h2 className="text-base sm:text-lg font-bold text-white mt-1">{activeQuiz.title}</h2>
              </div>

              {!quizResult && (
                <div className="flex items-center gap-3">
                  <div className={`px-3 py-1.5 rounded-lg font-mono text-sm font-bold flex items-center gap-1.5 ${
                    timeLeft < 180 ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse' : 'bg-slate-800 text-slate-200'
                  }`}>
                    <Clock size={16} />
                    <span>{formatTime(timeLeft)}</span>
                  </div>
                  <button 
                    onClick={() => { if (window.confirm('Cancel test and exit? Progress will be lost.')) setActiveQuiz(null); }}
                    className="text-slate-400 hover:text-white p-1 rounded"
                  >
                    <X size={20} />
                  </button>
                </div>
              )}
            </div>

            {/* Quiz Content or Result View */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
              {quizResult ? (
                /* Instant Result Screen */
                <div className="space-y-6">
                  <div className="text-center p-6 bg-linear-to-b from-blue-50 to-indigo-50/30 rounded-2xl border border-blue-100">
                    <div className="w-16 h-16 bg-white shadow-md text-primary rounded-full flex items-center justify-center mx-auto mb-3">
                      <Award size={36} className="text-amber-500" />
                    </div>
                    <h3 className="text-xl font-bold text-secondary mb-1">Quiz Completed!</h3>
                    <p className="text-xs text-slate-500 mb-4">Your answers have been evaluated and recorded in MySQL.</p>

                    <div className="inline-flex items-center gap-4 bg-white px-5 py-3 rounded-xl shadow-xs border border-slate-200">
                      <div>
                        <div className="text-xs text-slate-400 font-medium">Your Score</div>
                        <div className="text-2xl font-extrabold text-secondary">{quizResult.score} / {quizResult.totalMarks}</div>
                      </div>
                      <div className="h-8 w-px bg-slate-200" />
                      <div>
                        <div className="text-xs text-slate-400 font-medium">Percentage</div>
                        <div className={`text-2xl font-extrabold ${quizResult.percentage >= 60 ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {quizResult.percentage}%
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Review breakdown */}
                  <div>
                    <h4 className="font-bold text-secondary text-sm mb-3">Question-by-Question Review:</h4>
                    <div className="space-y-3">
                      {quizResult.detailedReview?.map((rev, idx) => (
                        <div 
                          key={rev.questionId}
                          className={`p-4 rounded-xl border ${
                            rev.isCorrect ? 'bg-emerald-50/50 border-emerald-200' : 'bg-red-50/50 border-red-200'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <span className="text-xs font-bold text-slate-700">
                              Q{idx + 1}. {rev.questionText}
                            </span>
                            {rev.isCorrect ? (
                              <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                                <CheckCircle2 size={14} /> Correct (+{rev.marks})
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded">
                                <XCircle size={14} /> Incorrect (0)
                              </span>
                            )}
                          </div>

                          <div className="text-xs space-y-1 mt-2 text-slate-600">
                            <div>Your Answer: <strong className={rev.isCorrect ? 'text-emerald-700' : 'text-red-600'}>{rev.studentChoice}</strong></div>
                            {!rev.isCorrect && (
                              <div className="text-emerald-800 font-semibold">
                                Correct Answer: Option {rev.correctOption} ({rev.options[rev.correctOption]})
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* Question Taking Form */
                <div className="space-y-6">
                  {activeQuiz.questions?.map((q, idx) => {
                    const selected = selectedAnswers[q.id];

                    return (
                      <div key={q.id} className="p-4 sm:p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider bg-white px-2 py-0.5 rounded border border-slate-200">
                            Question {idx + 1} of {activeQuiz.questions.length}
                          </span>
                          <span className="text-xs font-semibold text-slate-400">
                            {q.marks || 1} mark
                          </span>
                        </div>

                        <p className="text-sm font-bold text-secondary">
                          {q.question_text}
                        </p>

                        <div className="space-y-2 pt-1">
                          {[
                            { key: 'A', text: q.option_a },
                            { key: 'B', text: q.option_b },
                            { key: 'C', text: q.option_c },
                            { key: 'D', text: q.option_d },
                          ].map((opt) => {
                            const isChosen = selected === opt.key;
                            return (
                              <button
                                key={opt.key}
                                type="button"
                                onClick={() => handleSelectOption(q.id, opt.key)}
                                className={`w-full text-left p-3 rounded-lg text-xs font-medium transition-all flex items-center gap-3 border ${
                                  isChosen 
                                    ? 'bg-blue-50 border-primary text-primary shadow-xs ring-1 ring-primary' 
                                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100/70'
                                }`}
                              >
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                                  isChosen ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'
                                }`}>
                                  {opt.key}
                                </span>
                                <span>{opt.text}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              {quizResult ? (
                <Button 
                  onClick={() => setActiveQuiz(null)} 
                  className="w-full justify-center"
                >
                  Done & Return to Quizzes
                </Button>
              ) : (
                <>
                  <div className="text-xs text-slate-500">
                    Answered: <strong className="text-secondary">{Object.keys(selectedAnswers).length}</strong> of {activeQuiz.questions?.length}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => { if (window.confirm('Cancel test?')) setActiveQuiz(null); }}
                      disabled={submitting}
                    >
                      Exit
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={handleSubmitQuiz}
                      disabled={submitting || Object.keys(selectedAnswers).length === 0}
                    >
                      {submitting ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="animate-spin" size={14} />
                          Evaluating...
                        </span>
                      ) : (
                        'Submit Answers'
                      )}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentQuizzes;
