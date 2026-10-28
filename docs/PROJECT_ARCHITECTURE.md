# SmartLearn Architecture

## Content Hierarchy
The learning content follows a strict relational hierarchy:
1. **Course**: The top-level container (e.g., *Computer Fundamentals*). Contains `title`, `description`, `category`, and `status`.
2. **Module**: A section within a course. Linked via `courseId`.
3. **Lesson**: An individual learning topic within a module. Linked via `moduleId` and `courseId`. Supports rich-text/HTML content.
4. **Resource**: Supplementary files (PDF, image, video, external link) attached to a lesson. 

## Role Permissions
- **Admin**: Has full CRUD access across all collections.
- **Teacher**: Can view all content and manage resources.
- **Student**: Can only read `published` content that they are actively enrolled in.

## Data Flow & Storage
- **Firestore**: Stores metadata and hierarchy logic.
  - Collections: `users`, `courses`, `modules`, `lessons`, `resources`, `enrollments`, `progress`, `quizzes`, `quizAttempts`, `assignments`.
- **Firebase Storage**: Handles binary file uploads for learning resources.
  - Path structure: `learning-resources/{courseId}/{moduleId}/{lessonId}/{filename}`

## Publishing Workflow
All learning content supports a `status` field:
- `draft`: Hidden from students.
- `published`: Visible to students with correct enrollments.
- `archived`: Hidden from students and de-emphasized in Admin panels. Avoids hard-deleting historical educational data.

## Student Learning Architecture
- **Navigation Flow**: `/student/courses` -> `/student/courses/:courseId` (Overview) -> `/student/courses/:courseId/lessons/:lessonId` (Learning UI).
- **Lesson Completion & Progress**:
  - The `progress` collection tracks documents keyed safely per user/lesson.
  - Overall progress percentages are calculated mathematically on the frontend via `completed / total_published`.
- **Course Access Control**: The frontend verifies `getStudentEnrollments(studentId)` before allowing access to deep nested lessons. Firestore security rules restrict modifications to `request.auth.uid`.
