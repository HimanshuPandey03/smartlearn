const fs = require('fs');

function forceReplace(file, badStart, replaceText) {
  let content = fs.readFileSync(file, 'utf8');
  let idx = content.indexOf(badStart);
  if(idx !== -1) {
    let nextDiv = content.indexOf('</div>', idx);
    content = content.substring(0, idx) + replaceText + "\n        " + content.substring(nextDiv);
    fs.writeFileSync(file, content);
  }
}

// 1. AdminCourses.jsx
forceReplace(
  'src/pages/admin/courses/AdminCourses.jsx', 
  "{userProfile?.role === 'admin' && ({userProfile?.role === \"admin\" && (<Button",
  '{userProfile?.role === "admin" && (<Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2"><Plus size={18} /> Create Course</Button>)}'
);

// 2. AdminCourseDetail.jsx
forceReplace(
  'src/pages/admin/courses/AdminCourseDetail.jsx',
  "{userProfile?.role === 'admin' && ({userProfile?.role === \"admin\" && (<Button variant=\"outline\"",
  '{userProfile?.role === "admin" && (<Button variant="outline" className="flex items-center gap-2" onClick={() => setIsEditModalOpen(true)}><Settings size={18} /> Edit Course</Button>)}'
);

// Also module add button
let detail = fs.readFileSync('src/pages/admin/courses/AdminCourseDetail.jsx', 'utf8');
detail = detail.replace(
  /\{userProfile\?\.role === 'admin' && \(\{userProfile\?\.role === "admin" && \(<Button onClick=\{\(\) => setIsModuleModalOpen\(true\)\} className="flex items-center gap-2" size="sm">\n          <Plus size=\{16\} \/> Add Module\n        <\/Button>\n      <\/div>/,
  '{userProfile?.role === "admin" && (<Button onClick={() => setIsModuleModalOpen(true)} className="flex items-center gap-2" size="sm"><Plus size={16} /> Add Module</Button>)}\n      </div>'
);
detail = detail.replace(/Create Course<\/Button>\)}/g, ''); // cleanup any dangling closures
detail = detail.replace(/Add Module<\/Button>\)}/g, ''); // cleanup any dangling closures
detail = detail.replace(/Edit Course<\/Button>\)}/g, ''); // cleanup any dangling closures
fs.writeFileSync('src/pages/admin/courses/AdminCourseDetail.jsx', detail);

// 3. AdminModuleDetail.jsx
let mod = fs.readFileSync('src/pages/admin/courses/AdminModuleDetail.jsx', 'utf8');
mod = mod.replace(
  /\{userProfile\?\.role === 'admin' && \(\{userProfile\?\.role === "admin" && \(<Button variant="outline" className="flex items-center gap-2" onClick=\{\(\) => setIsEditModalOpen\(true\)}>\n            <Settings size=\{18\} \/> Edit Module\n          <\/Button>/,
  '{userProfile?.role === "admin" && (<Button variant="outline" className="flex items-center gap-2" onClick={() => setIsEditModalOpen(true)}><Settings size={18} /> Edit Module</Button>)}'
);
mod = mod.replace(
  /\{userProfile\?\.role === 'admin' && \(\{userProfile\?\.role === "admin" && \(<Button onClick=\{\(\) => setIsLessonModalOpen\(true\)\} className="flex items-center gap-2" size="sm">\n          <Plus size=\{16\} \/> Add Lesson\n        <\/Button>/,
  '{userProfile?.role === "admin" && (<Button onClick={() => setIsLessonModalOpen(true)} className="flex items-center gap-2" size="sm"><Plus size={16} /> Add Lesson</Button>)}'
);
mod = mod.replace(/Edit Module<\/Button>\)}/g, '');
mod = mod.replace(/Add Lesson<\/Button>\)}/g, '');
fs.writeFileSync('src/pages/admin/courses/AdminModuleDetail.jsx', mod);

// 4. AdminLessonDetail.jsx
let less = fs.readFileSync('src/pages/admin/courses/AdminLessonDetail.jsx', 'utf8');
less = less.replace(
  /\{userProfile\?\.role === 'admin' && \(\{userProfile\?\.role === "admin" && \(<Button variant="outline" className="flex items-center gap-2" onClick=\{\(\) => setIsEditModalOpen\(true\)}>\n            <Settings size=\{18\} \/> Edit Lesson\n          <\/Button>/,
  '{userProfile?.role === "admin" && (<Button variant="outline" className="flex items-center gap-2" onClick={() => setIsEditModalOpen(true)}><Settings size={18} /> Edit Lesson</Button>)}'
);
less = less.replace(/Edit Lesson<\/Button>\)}/g, '');
fs.writeFileSync('src/pages/admin/courses/AdminLessonDetail.jsx', less);

