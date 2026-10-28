import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDatabase } from './db.js';
import authRoutes from './routes/auth.js';
import notesRoutes from './routes/notes.js';
import quizzesRoutes from './routes/quizzes.js';
import adminRoutes from './routes/admin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/quizzes', quizzesRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'SmartLearn MySQL Backend is running smoothly.' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
});

async function startServer() {
  try {
    console.log('Connecting to MySQL database...');
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`=================================================`);
      console.log(`🚀 SmartLearn MySQL Server running on port ${PORT}`);
      console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
      console.log(`=================================================`);
    });
  } catch (error) {
    console.error('Failed to start server due to database error:');
    console.error(error.message);
    console.log('\nTip: Please verify MySQL is running and DB credentials in server/.env are correct.');
  }
}

startServer();
