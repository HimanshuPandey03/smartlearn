const fs = require('fs');

function restoreAdminCourses() {
  let content = fs.readFileSync('src/pages/admin/courses/AdminCourses.jsx', 'utf8');
  content = content.replace(/\{userProfile\?\.role === "admin".*Create Course<\/Button>\)\}.*/, '{userProfile?.role === "admin" && (<Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2"><Plus size={18} /> Create Course</Button>)}');
  fs.writeFileSync('src/pages/admin/courses/AdminCourses.jsx', content);
}

function restoreCourseDetail() {
  let content = fs.readFileSync('src/pages/admin/courses/AdminCourseDetail.jsx', 'utf8');
  content = content.replace(/\{userProfile\?\.role === "admin".*Edit Course<\/Button>\)\}.*/, '{userProfile?.role === "admin" && (<Button variant="outline" className="flex items-center gap-2" onClick={() => setIsEditModalOpen(true)}><Settings size={18} /> Edit Course</Button>)}');
  content = content.replace(/\{userProfile\?\.role === "admin".*Add Module<\/Button>\)\}.*/, '{userProfile?.role === "admin" && (<Button onClick={() => setIsModuleModalOpen(true)} className="flex items-center gap-2" size="sm"><Plus size={16} /> Add Module</Button>)}');
  fs.writeFileSync('src/pages/admin/courses/AdminCourseDetail.jsx', content);
}

function restoreModuleDetail() {
  let content = fs.readFileSync('src/pages/admin/courses/AdminModuleDetail.jsx', 'utf8');
  content = content.replace(/\{userProfile\?\.role === "admin".*Edit Module<\/Button>\)\}.*/, '{userProfile?.role === "admin" && (<Button variant="outline" className="flex items-center gap-2" onClick={() => setIsEditModalOpen(true)}><Settings size={18} /> Edit Module</Button>)}');
  content = content.replace(/\{userProfile\?\.role === "admin".*Add Lesson<\/Button>\)\}.*/, '{userProfile?.role === "admin" && (<Button onClick={() => setIsLessonModalOpen(true)} className="flex items-center gap-2" size="sm"><Plus size={16} /> Add Lesson</Button>)}');
  fs.writeFileSync('src/pages/admin/courses/AdminModuleDetail.jsx', content);
}

function restoreLessonDetail() {
  let content = fs.readFileSync('src/pages/admin/courses/AdminLessonDetail.jsx', 'utf8');
  content = content.replace(/\{userProfile\?\.role === "admin".*Edit Lesson<\/Button>\)\}.*/, '{userProfile?.role === "admin" && (<Button variant="outline" className="flex items-center gap-2" onClick={() => setIsEditModalOpen(true)}><Settings size={18} /> Edit Lesson</Button>)}');
  fs.writeFileSync('src/pages/admin/courses/AdminLessonDetail.jsx', content);
}

restoreAdminCourses();
restoreCourseDetail();
restoreModuleDetail();
restoreLessonDetail();
