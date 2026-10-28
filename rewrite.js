const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/courses/AdminCourses.jsx', 'utf8');
code = code.replace(/\{userProfile\?\.role === "admin" && \(<Button onClick=\{\(\) => setIsModalOpen\(true\)\} className="flex items-center gap-2"><Plus size=\{18\} \/>/g, 
  '{userProfile?.role === "admin" && (<Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2"><Plus size={18} /> Create Course</Button>)}');
fs.writeFileSync('src/pages/admin/courses/AdminCourses.jsx', code);

code = fs.readFileSync('src/pages/admin/courses/AdminCourseDetail.jsx', 'utf8');
code = code.replace(/\{userProfile\?\.role === "admin" && \(<Button variant="outline" className="flex items-center gap-2" onClick=\{\(\) => setIsEditModalOpen\(true\)}><Settings size=\{18\} \/>/g,
  '{userProfile?.role === "admin" && (<Button variant="outline" className="flex items-center gap-2" onClick={() => setIsEditModalOpen(true)}><Settings size={18} /> Edit Course</Button>)}');
code = code.replace(/\{userProfile\?\.role === "admin" && \(<Button onClick=\{\(\) => setIsModuleModalOpen\(true\)\} className="flex items-center gap-2" size="sm"><Plus size=\{16\} \/>/g,
  '{userProfile?.role === "admin" && (<Button onClick={() => setIsModuleModalOpen(true)} className="flex items-center gap-2" size="sm"><Plus size={16} /> Add Module</Button>)}');
fs.writeFileSync('src/pages/admin/courses/AdminCourseDetail.jsx', code);

code = fs.readFileSync('src/pages/admin/courses/AdminModuleDetail.jsx', 'utf8');
code = code.replace(/\{userProfile\?\.role === "admin" && \(<Button variant="outline" className="flex items-center gap-2" onClick=\{\(\) => setIsEditModalOpen\(true\)}><Settings size=\{18\} \/>/g,
  '{userProfile?.role === "admin" && (<Button variant="outline" className="flex items-center gap-2" onClick={() => setIsEditModalOpen(true)}><Settings size={18} /> Edit Module</Button>)}');
code = code.replace(/\{userProfile\?\.role === "admin" && \(<Button onClick=\{\(\) => setIsLessonModalOpen\(true\)\} className="flex items-center gap-2" size="sm"><Plus size=\{16\} \/>/g,
  '{userProfile?.role === "admin" && (<Button onClick={() => setIsLessonModalOpen(true)} className="flex items-center gap-2" size="sm"><Plus size={16} /> Add Lesson</Button>)}');
fs.writeFileSync('src/pages/admin/courses/AdminModuleDetail.jsx', code);

code = fs.readFileSync('src/pages/admin/courses/AdminLessonDetail.jsx', 'utf8');
code = code.replace(/\{userProfile\?\.role === "admin" && \(<Button variant="outline" className="flex items-center gap-2" onClick=\{\(\) => setIsEditModalOpen\(true\)}><Settings size=\{18\} \/>/g,
  '{userProfile?.role === "admin" && (<Button variant="outline" className="flex items-center gap-2" onClick={() => setIsEditModalOpen(true)}><Settings size={18} /> Edit Lesson</Button>)}');
fs.writeFileSync('src/pages/admin/courses/AdminLessonDetail.jsx', code);
