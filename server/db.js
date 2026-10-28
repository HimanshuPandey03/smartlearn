import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config(); // fallback

const isCloudDb = process.env.DB_SSL === 'true' || Boolean(
  process.env.DB_HOST && 
  process.env.DB_HOST !== '127.0.0.1' && 
  process.env.DB_HOST !== 'localhost'
);

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ...(isCloudDb ? { ssl: { rejectUnauthorized: false } } : {}),
};

let pool = null;

export async function initDatabase() {
  try {
    const dbName = process.env.DB_NAME || 'smartlearn_db';

    // 1. First connect without DB to ensure database exists (works locally, skips gracefully on managed cloud DB)
    try {
      const tempConnection = await mysql.createConnection({
        host: dbConfig.host,
        port: dbConfig.port,
        user: dbConfig.user,
        password: dbConfig.password,
        ...(isCloudDb ? { ssl: { rejectUnauthorized: false } } : {}),
      });

      await tempConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
      await tempConnection.end();
    } catch (dbErr) {
      console.log('Skipping CREATE DATABASE step (using pre-existing DB or cloud instance):', dbErr.message);
    }

    // 2. Create pool connected to the target database
    pool = mysql.createPool({
      ...dbConfig,
      database: dbName,
    });

    // 3. Create tables if not exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'teacher', 'student') NOT NULL DEFAULT 'student',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS notes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        teacher_id INT NOT NULL,
        teacher_name VARCHAR(100) NOT NULL,
        title VARCHAR(200) NOT NULL,
        subject VARCHAR(100) NOT NULL,
        description TEXT,
        file_url VARCHAR(500),
        file_name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX (teacher_id),
        FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS quizzes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        teacher_id INT NOT NULL,
        teacher_name VARCHAR(100) NOT NULL,
        title VARCHAR(200) NOT NULL,
        subject VARCHAR(100) NOT NULL,
        description TEXT,
        duration_minutes INT DEFAULT 15,
        total_marks INT DEFAULT 0,
        status ENUM('draft', 'published') DEFAULT 'published',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX (teacher_id),
        FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS quiz_questions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        quiz_id INT NOT NULL,
        question_text TEXT NOT NULL,
        option_a VARCHAR(255) NOT NULL,
        option_b VARCHAR(255) NOT NULL,
        option_c VARCHAR(255) NOT NULL,
        option_d VARCHAR(255) NOT NULL,
        correct_option ENUM('A', 'B', 'C', 'D') NOT NULL,
        marks INT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX (quiz_id),
        FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS quiz_attempts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        quiz_id INT NOT NULL,
        student_id INT NOT NULL,
        student_name VARCHAR(100) NOT NULL,
        score INT NOT NULL,
        total_marks INT NOT NULL,
        percentage DECIMAL(5,2) NOT NULL,
        answers_json JSON,
        attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX (quiz_id),
        INDEX (student_id),
        FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    // 4. Seed default Admin account if no users exist
    const [existingUsers] = await pool.query('SELECT COUNT(*) as count FROM users');
    if (existingUsers[0].count === 0) {
      console.log('Seeding initial System Admin account into MySQL...');
      const adminPass = await bcrypt.hash('admin123', 10);

      await pool.query(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        ['System Admin', 'admin@smartlearn.com', adminPass, 'admin']
      );

      console.log('Admin account created: admin@smartlearn.com / admin123');
    }

    console.log('MySQL Database and Tables initialized successfully.');
    return pool;
  } catch (error) {
    console.error('Database initialization error:', error.message);
    throw error;
  }
}

export function getPool() {
  if (!pool) {
    throw new Error('Database pool not initialized. Call initDatabase first.');
  }
  return pool;
}
