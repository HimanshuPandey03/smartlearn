import express from 'express';
import { getPool } from '../db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// GET all quizzes
router.get('/', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const userId = req.user.id;
    const userRole = req.user.role;

    let query = `
      SELECT q.*, 
        (SELECT COUNT(*) FROM quiz_questions qq WHERE qq.quiz_id = q.id) as question_count,
        (SELECT COUNT(*) FROM quiz_attempts qa WHERE qa.quiz_id = q.id) as total_attempts
      FROM quizzes q
    `;

    const params = [];

    if (userRole === 'student') {
      // Students only see published
      query += ' WHERE q.status = "published"';
    } else if (userRole === 'teacher' && req.query.mine === 'true') {
      query += ' WHERE q.teacher_id = ?';
      params.push(userId);
    }

    query += ' ORDER BY q.created_at DESC';

    const [quizzes] = await pool.query(query, params);

    // If user is student, check which quizzes they have already attempted
    if (userRole === 'student') {
      const [attempts] = await pool.query(
        'SELECT quiz_id, score, total_marks, percentage, attempted_at FROM quiz_attempts WHERE student_id = ?',
        [userId]
      );
      const attemptMap = {};
      attempts.forEach(att => {
        attemptMap[att.quiz_id] = att;
      });

      const enrichedQuizzes = quizzes.map(q => ({
        ...q,
        attempted: !!attemptMap[q.id],
        userAttempt: attemptMap[q.id] || null
      }));

      return res.json({ success: true, quizzes: enrichedQuizzes });
    }

    res.json({ success: true, quizzes });
  } catch (error) {
    console.error('Fetch quizzes error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching quizzes.' });
  }
});

// GET single quiz details & questions
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const quizId = req.params.id;
    const userRole = req.user.role;

    const [quizzes] = await pool.query('SELECT * FROM quizzes WHERE id = ?', [quizId]);
    if (quizzes.length === 0) {
      return res.status(404).json({ success: false, message: 'Quiz not found.' });
    }

    const quiz = quizzes[0];

    // Fetch questions
    let questionQuery = '';
    if (userRole === 'student') {
      // Don't leak correct_option to student taking the quiz!
      questionQuery = `
        SELECT id, quiz_id, question_text, option_a, option_b, option_c, option_d, marks
        FROM quiz_questions WHERE quiz_id = ? ORDER BY id ASC
      `;
    } else {
      // Teacher / Admin sees correct_option
      questionQuery = `
        SELECT id, quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option, marks
        FROM quiz_questions WHERE quiz_id = ? ORDER BY id ASC
      `;
    }

    const [questions] = await pool.query(questionQuery, [quizId]);

    // Check if student has previous attempt
    let attempt = null;
    if (userRole === 'student') {
      const [attempts] = await pool.query(
        'SELECT * FROM quiz_attempts WHERE quiz_id = ? AND student_id = ? ORDER BY attempted_at DESC LIMIT 1',
        [quizId, req.user.id]
      );
      if (attempts.length > 0) {
        attempt = attempts[0];
      }
    }

    res.json({
      success: true,
      quiz: {
        ...quiz,
        questions,
        userAttempt: attempt
      }
    });
  } catch (error) {
    console.error('Fetch quiz detail error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching quiz.' });
  }
});

// POST Create new quiz with questions (Teacher or Admin ONLY)
router.post('/', authenticateToken, requireRole(['teacher', 'admin']), async (req, res) => {
  const connection = await getPool().getConnection();
  try {
    await connection.beginTransaction();

    const { title, subject, description, duration_minutes, status, questions } = req.body;

    if (!title || !subject || !questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title, Subject and at least 1 Question are required.' 
      });
    }

    // Calculate total marks
    let totalMarks = 0;
    questions.forEach(q => {
      totalMarks += parseInt(q.marks || 1, 10);
    });

    // Insert Quiz
    const [quizResult] = await connection.query(
      `INSERT INTO quizzes 
        (teacher_id, teacher_name, title, subject, description, duration_minutes, total_marks, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        req.user.name,
        title,
        subject,
        description || '',
        parseInt(duration_minutes, 10) || 15,
        totalMarks,
        status || 'published'
      ]
    );

    const quizId = quizResult.insertId;

    // Insert Questions
    for (const q of questions) {
      if (!q.question_text || !q.option_a || !q.option_b || !q.option_c || !q.option_d || !q.correct_option) {
        throw new Error('All questions must have question text, options A-D, and a correct option.');
      }

      await connection.query(
        `INSERT INTO quiz_questions 
          (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option, marks) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          quizId,
          q.question_text,
          q.option_a,
          q.option_b,
          q.option_c,
          q.option_d,
          q.correct_option.toUpperCase(),
          parseInt(q.marks || 1, 10)
        ]
      );
    }

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Quiz created successfully!',
      quizId
    });
  } catch (error) {
    await connection.rollback();
    console.error('Create quiz error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error creating quiz.' });
  } finally {
    connection.release();
  }
});

// DELETE quiz (Teacher owner or Admin)
router.delete('/:id', authenticateToken, requireRole(['teacher', 'admin']), async (req, res) => {
  try {
    const pool = getPool();
    const quizId = req.params.id;

    const [quizzes] = await pool.query('SELECT * FROM quizzes WHERE id = ?', [quizId]);
    if (quizzes.length === 0) {
      return res.status(404).json({ success: false, message: 'Quiz not found.' });
    }

    const quiz = quizzes[0];
    if (req.user.role !== 'admin' && quiz.teacher_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this quiz.' });
    }

    await pool.query('DELETE FROM quizzes WHERE id = ?', [quizId]);
    res.json({ success: true, message: 'Quiz deleted successfully.' });
  } catch (error) {
    console.error('Delete quiz error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting quiz.' });
  }
});

// POST Submit Quiz (Student Only)
router.post('/:id/submit', authenticateToken, requireRole(['student']), async (req, res) => {
  try {
    const pool = getPool();
    const quizId = req.params.id;
    const studentId = req.user.id;
    const studentName = req.user.name;
    const { answers } = req.body; // e.g. { "12": "A", "13": "B" }

    // Fetch quiz & questions with answers
    const [quizzes] = await pool.query('SELECT * FROM quizzes WHERE id = ?', [quizId]);
    if (quizzes.length === 0) {
      return res.status(404).json({ success: false, message: 'Quiz not found.' });
    }

    const [questions] = await pool.query(
      'SELECT id, question_text, option_a, option_b, option_c, option_d, correct_option, marks FROM quiz_questions WHERE quiz_id = ?',
      [quizId]
    );

    let score = 0;
    let totalMarks = 0;
    const detailedReview = [];

    questions.forEach(q => {
      const qId = q.id.toString();
      const studentChoice = answers ? answers[qId] : null;
      const isCorrect = studentChoice && studentChoice.toUpperCase() === q.correct_option.toUpperCase();
      const questionMarks = parseInt(q.marks || 1, 10);

      totalMarks += questionMarks;
      if (isCorrect) {
        score += questionMarks;
      }

      detailedReview.push({
        questionId: q.id,
        questionText: q.question_text,
        options: {
          A: q.option_a,
          B: q.option_b,
          C: q.option_c,
          D: q.option_d,
        },
        studentChoice: studentChoice || 'Not Answered',
        correctOption: q.correct_option,
        isCorrect,
        marks: isCorrect ? questionMarks : 0
      });
    });

    const percentage = totalMarks > 0 ? parseFloat(((score / totalMarks) * 100).toFixed(2)) : 0;

    // Save attempt
    const [result] = await pool.query(
      `INSERT INTO quiz_attempts 
        (quiz_id, student_id, student_name, score, total_marks, percentage, answers_json) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        quizId,
        studentId,
        studentName,
        score,
        totalMarks,
        percentage,
        JSON.stringify(answers || {})
      ]
    );

    res.json({
      success: true,
      message: 'Quiz submitted successfully!',
      attemptId: result.insertId,
      score,
      totalMarks,
      percentage,
      detailedReview
    });
  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({ success: false, message: 'Server error evaluating quiz submission.' });
  }
});

// GET all attempts for a quiz (Teacher/Admin)
router.get('/:id/attempts', authenticateToken, requireRole(['teacher', 'admin']), async (req, res) => {
  try {
    const pool = getPool();
    const quizId = req.params.id;

    const [attempts] = await pool.query(
      `SELECT qa.*, u.email as student_email 
       FROM quiz_attempts qa 
       JOIN users u ON qa.student_id = u.id 
       WHERE qa.quiz_id = ? 
       ORDER BY qa.attempted_at DESC`,
      [quizId]
    );

    res.json({ success: true, attempts });
  } catch (error) {
    console.error('Fetch quiz attempts error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching attempts.' });
  }
});

// GET student's own attempts (Student only)
router.get('/student/my-attempts', authenticateToken, requireRole(['student']), async (req, res) => {
  try {
    const pool = getPool();
    const studentId = req.user.id;

    const [attempts] = await pool.query(
      `SELECT qa.*, q.title as quiz_title, q.subject as quiz_subject 
       FROM quiz_attempts qa 
       JOIN quizzes q ON qa.quiz_id = q.id 
       WHERE qa.student_id = ? 
       ORDER BY qa.attempted_at DESC`,
      [studentId]
    );

    res.json({ success: true, attempts });
  } catch (error) {
    console.error('Fetch student attempts error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching your quiz attempts.' });
  }
});

export default router;
