import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { getPool } from '../db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads/notes');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max
  fileFilter: (req, file, cb) => {
    // allow pdf, docs, images, txt
    cb(null, true);
  }
});

// GET all notes (Accessible by Student, Teacher, Admin)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const { subject, search, teacherId } = req.query;

    let query = 'SELECT * FROM notes WHERE 1=1';
    const params = [];

    if (subject && subject !== 'All') {
      query += ' AND subject = ?';
      params.push(subject);
    }

    if (teacherId) {
      query += ' AND teacher_id = ?';
      params.push(teacherId);
    }

    if (search) {
      query += ' AND (title LIKE ? OR description LIKE ? OR subject LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY created_at DESC';

    const [notes] = await pool.query(query, params);
    res.json({ success: true, notes });
  } catch (error) {
    console.error('Fetch notes error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching notes.' });
  }
});

// POST upload new note (Teacher or Admin ONLY)
router.post('/', authenticateToken, requireRole(['teacher', 'admin']), upload.single('file'), async (req, res) => {
  try {
    const { title, subject, description } = req.body;

    if (!title || !subject) {
      return res.status(400).json({ success: false, message: 'Title and Subject are required.' });
    }

    let file_url = null;
    let file_name = null;

    if (req.file) {
      file_url = `/uploads/notes/${req.file.filename}`;
      file_name = req.file.originalname;
    } else if (req.body.external_url) {
      file_url = req.body.external_url;
      file_name = req.body.external_name || 'Attached Link/Document';
    }

    const pool = getPool();
    const [result] = await pool.query(
      'INSERT INTO notes (teacher_id, teacher_name, title, subject, description, file_url, file_name) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        req.user.id,
        req.user.name,
        title,
        subject,
        description || '',
        file_url,
        file_name
      ]
    );

    const [createdNote] = await pool.query('SELECT * FROM notes WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Note uploaded successfully.',
      note: createdNote[0]
    });
  } catch (error) {
    console.error('Upload note error:', error);
    res.status(500).json({ success: false, message: 'Server error uploading note.' });
  }
});

// DELETE a note (Teacher owns it or Admin)
router.delete('/:id', authenticateToken, requireRole(['teacher', 'admin']), async (req, res) => {
  try {
    const pool = getPool();
    const noteId = req.params.id;

    // Check ownership unless admin
    const [notes] = await pool.query('SELECT * FROM notes WHERE id = ?', [noteId]);
    if (notes.length === 0) {
      return res.status(404).json({ success: false, message: 'Note not found.' });
    }

    const note = notes[0];
    if (req.user.role !== 'admin' && note.teacher_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You are not authorized to delete this note.' });
    }

    // Delete associated file if local
    if (note.file_url && note.file_url.startsWith('/uploads/notes/')) {
      const filePath = path.join(__dirname, '..', note.file_url);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (e) {
          console.error('Error removing file:', e);
        }
      }
    }

    await pool.query('DELETE FROM notes WHERE id = ?', [noteId]);
    res.json({ success: true, message: 'Note deleted successfully.' });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting note.' });
  }
});

export default router;
