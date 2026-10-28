# Smart Learning and Skill Support Platform

A digital learning platform for Matrubhoomi School, Thakur Village, Kandivali East, Mumbai.

## Overview
This platform provides underserved school students with structured digital learning, MS-CIT/MKCL preparation, computer fundamentals, digital literacy, employability skills, soft skills, quizzes, practice tests, assignments, and progress monitoring.

## Technology Stack
- **Frontend**: React 18, Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Charts**: Recharts (prepared)
- **Backend**: Firebase (Auth, Firestore)

## Installation & Setup

1. Clone the repository
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`
3. Create a \`.env.local\` file in the root directory and add your Firebase credentials:
   \`\`\`env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   \`\`\`
4. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

## Firebase Console Setup Requirements
To make authentication work, you MUST complete these steps in your Firebase Console:
1. Create a Firebase project.
2. Go to **Authentication** > **Get Started** > **Sign-in method**.
3. Enable **Email/Password** provider.
4. Go to **Firestore Database** > **Create database**.
5. Set initial security rules (Start in test mode or add basic rules allowing authenticated users to read/write their own profile).

## Current Phase (Phase 2)
- Firebase Authentication Integration (Email/Password)
- Firestore user profile creation upon registration
- Secure Context API for Authentication state management
- Role-based Protected Routes (`student`, `teacher`, `admin`)
- Dynamic navigation based on auth state
- Loading and Error handling UX
- Authentication persistence

## Future Phases
- Phase 3: Content Management & Learning Modules
- Phase 4: Assessment & Progress Tracking
- Phase 5: Analytics & Reporting

### Phase 4: Teacher & Admin Content Management System (Completed)
- **Admin Dashboard UI**: Built nested views for Course -> Module -> Lesson -> Resources.
- **Firebase Firestore CRUD**: Created service abstractions (`courses.js`, `modules.js`, `lessons.js`, `resources.js`).
- **Firebase Storage**: Integrated for uploading learning resources (PDFs, images, videos) attached to lessons.
- **Role Permissions & Security**: Updated `firestore.rules` to enforce Admin write-access for courses/modules/lessons, and Teacher write-access for resources.
- **Student Visibility Workflow**: Courses support Draft, Published, and Archived statuses. Only Published courses appear for enrolled students.
- **No Sample Data**: Content generation is strictly manual or handled safely by development seeds decoupled from production UI.

### Phase 5: Student Learning Experience & Lesson Progress (Completed)
- **Student Learning Flow**: Built the actual student UI for nested course browsing (Course → Module → Lesson).
- **Progress Tracking**: Added dynamic lesson completion tracking (`markLessonComplete`) using Firestore data (`progress` collection) as the single source of truth.
- **Resource Access**: Displayed securely scoped learning resources attached to each lesson.
- **Navigation**: Implemented robust "Continue Learning" and Previous/Next lesson navigation strictly on published learning paths.
- **Security Check**: Enforced enrollment restrictions and handled unauthorized access cleanly.
