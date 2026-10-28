import express from 'express';
import multer from 'multer';
import * as XLSX from 'xlsx';
import bcrypt from 'bcryptjs';
import { getPool } from '../db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Only admin can access these overall monitoring routes
router.use(authenticateToken, requireRole(['admin']));

// Overall platform statistics
router.get('/overview', async (req, res) => {
  try {
    const pool = getPool();

    const [[studentsCount]] = await pool.query('SELECT COUNT(*) as count FROM users WHERE role = "student"');
    const [[teachersCount]] = await pool.query('SELECT COUNT(*) as count FROM users WHERE role = "teacher"');
    const [[quizzesCount]] = await pool.query('SELECT COUNT(*) as count FROM quizzes');
    const [[notesCount]] = await pool.query('SELECT COUNT(*) as count FROM notes');
    const [[attemptsCount]] = await pool.query('SELECT COUNT(*) as count FROM quiz_attempts');

    // Recent submissions
    const [recentSubmissions] = await pool.query(
      `SELECT qa.id, qa.student_name, qa.score, qa.total_marks, qa.percentage, qa.attempted_at, q.title as quiz_title 
       FROM quiz_attempts qa 
       JOIN quizzes q ON qa.quiz_id = q.id 
       ORDER BY qa.attempted_at DESC LIMIT 6`
    );

    // Recent notes uploaded
    const [recentNotes] = await pool.query(
      `SELECT id, title, subject, teacher_name, created_at 
       FROM notes 
       ORDER BY created_at DESC LIMIT 5`
    );

    res.json({
      success: true,
      stats: {
        totalStudents: studentsCount.count,
        totalTeachers: teachersCount.count,
        totalQuizzes: quizzesCount.count,
        totalNotes: notesCount.count,
        totalAttempts: attemptsCount.count,
      },
      recentSubmissions,
      recentNotes
    });
  } catch (error) {
    console.error('Admin overview error:', error);
    res.status(500).json({ success: false, message: 'Server error loading admin overview.' });
  }
});

// List all users
router.get('/users', async (req, res) => {
  try {
    const pool = getPool();
    const { role } = req.query;

    let query = 'SELECT id, name, email, role, created_at FROM users WHERE 1=1';
    const params = [];

    if (role) {
      query += ' AND role = ?';
      params.push(role);
    }

    query += ' ORDER BY created_at DESC';

    const [users] = await pool.query(query, params);
    res.json({ success: true, users });
  } catch (error) {
    console.error('Admin users error:', error);
    res.status(500).json({ success: false, message: 'Server error loading users.' });
  }
});

// Admin creates a Teacher
router.post('/teachers', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    const pool = getPool();
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'User with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, 'teacher']
    );

    res.status(201).json({
      success: true,
      message: 'Teacher account created successfully.',
      teacher: {
        id: result.insertId,
        name,
        email,
        role: 'teacher'
      }
    });
  } catch (error) {
    console.error('Create teacher error:', error);
    res.status(500).json({ success: false, message: 'Server error creating teacher.' });
  }
});

// Admin imports Students via Excel / CSV file
router.post('/students/import-excel', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an Excel or CSV file.' });
    }

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

    if (!rawRows || rawRows.length === 0) {
      return res.status(400).json({ success: false, message: 'The uploaded Excel sheet is empty.' });
    }

    const pool = getPool();
    const imported = [];
    const skipped = [];

    for (const row of rawRows) {
      // Find keys case-insensitively
      let name = '';
      let email = '';
      let password = '';

      for (const [key, val] of Object.entries(row)) {
        const cleanKey = key.trim().toLowerCase();
        if (cleanKey.includes('name')) name = String(val).trim();
        else if (cleanKey.includes('email') || cleanKey.includes('mail')) email = String(val).trim().toLowerCase();
        else if (cleanKey.includes('pass')) password = String(val).trim();
      }

      if (!name || !email) {
        skipped.push({ row, reason: 'Missing Name or Email' });
        continue;
      }

      // Check if email already exists
      const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
      if (existing.length > 0) {
        skipped.push({ email, name, reason: 'Email already exists' });
        continue;
      }

      // Default password if not in excel
      const rawPassword = password || 'Student@123';
      const hashedPassword = await bcrypt.hash(rawPassword, 10);

      const [result] = await pool.query(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [name, email, hashedPassword, 'student']
      );

      imported.push({
        id: result.insertId,
        name,
        email,
        initialPassword: rawPassword
      });
    }

    res.json({
      success: true,
      message: `Successfully imported ${imported.length} student(s).`,
      importedCount: imported.length,
      skippedCount: skipped.length,
      imported,
      skipped
    });
  } catch (error) {
    console.error('Excel import error:', error);
    res.status(500).json({ success: false, message: 'Failed to process Excel file: ' + error.message });
  }
});

// Admin deletes a user
router.delete('/users/:id', async (req, res) => {
  try {
    const pool = getPool();
    const userId = req.params.id;

    if (parseInt(userId, 10) === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own admin account.' });
    }

    await pool.query('DELETE FROM users WHERE id = ?', [userId]);
    res.json({ success: true, message: 'User deleted successfully.' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting user.' });
  }
});

// All quiz submissions across the platform
router.get('/submissions', async (req, res) => {
  try {
    const pool = getPool();
    const [submissions] = await pool.query(
      `SELECT qa.*, q.title as quiz_title, q.subject as quiz_subject, u.email as student_email 
       FROM quiz_attempts qa 
       JOIN quizzes q ON qa.quiz_id = q.id 
       JOIN users u ON qa.student_id = u.id 
       ORDER BY qa.attempted_at DESC`
    );
    res.json({ success: true, submissions });
  } catch (error) {
    console.error('Admin submissions error:', error);
    res.status(500).json({ success: false, message: 'Server error loading submissions.' });
  }
});

export default router;
