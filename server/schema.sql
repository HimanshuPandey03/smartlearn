-- ======================================================
-- SmartLearn MySQL Database Schema
-- Compatible with MySQL 8.0+ and MariaDB (XAMPP)
-- ======================================================

CREATE DATABASE IF NOT EXISTS `smartlearn_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `smartlearn_db`;

-- 1. Users Table (Role-based access: Admin, Teacher, Student)
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('admin', 'teacher', 'student') NOT NULL DEFAULT 'student',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Study Notes Table (Uploaded by Teachers)
CREATE TABLE IF NOT EXISTS `notes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `teacher_id` INT NOT NULL,
  `teacher_name` VARCHAR(100) NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `subject` VARCHAR(100) NOT NULL,
  `description` TEXT,
  `file_url` VARCHAR(500),
  `file_name` VARCHAR(255),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (`teacher_id`),
  FOREIGN KEY (`teacher_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. Quizzes Table (Created by Teachers)
CREATE TABLE IF NOT EXISTS `quizzes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `teacher_id` INT NOT NULL,
  `teacher_name` VARCHAR(100) NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `subject` VARCHAR(100) NOT NULL,
  `description` TEXT,
  `duration_minutes` INT DEFAULT 15,
  `total_marks` INT DEFAULT 0,
  `status` ENUM('draft', 'published') DEFAULT 'published',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (`teacher_id`),
  FOREIGN KEY (`teacher_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. Quiz Questions Table (Multiple Choice Questions)
CREATE TABLE IF NOT EXISTS `quiz_questions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `quiz_id` INT NOT NULL,
  `question_text` TEXT NOT NULL,
  `option_a` VARCHAR(255) NOT NULL,
  `option_b` VARCHAR(255) NOT NULL,
  `option_c` VARCHAR(255) NOT NULL,
  `option_d` VARCHAR(255) NOT NULL,
  `correct_option` ENUM('A', 'B', 'C', 'D') NOT NULL,
  `marks` INT DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (`quiz_id`),
  FOREIGN KEY (`quiz_id`) REFERENCES `quizzes`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. Quiz Attempts / Submissions Table (Submitted by Students)
CREATE TABLE IF NOT EXISTS `quiz_attempts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `quiz_id` INT NOT NULL,
  `student_id` INT NOT NULL,
  `student_name` VARCHAR(100) NOT NULL,
  `score` INT NOT NULL,
  `total_marks` INT NOT NULL,
  `percentage` DECIMAL(5,2) NOT NULL,
  `answers_json` JSON,
  `attempted_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (`quiz_id`),
  INDEX (`student_id`),
  FOREIGN KEY (`quiz_id`) REFERENCES `quizzes`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;
