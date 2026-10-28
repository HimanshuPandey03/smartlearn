import { useAuth } from '@/context/AuthContext';
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import LoadingState from '@/components/ui/LoadingState';
import EmptyState from '@/components/ui/EmptyState';
import { ArrowLeft, Plus, Settings, BookOpen, GripVertical, Trash2 } from 'lucide-react';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '@/services/firebase/firestore';
import { updateModule } from '@/services/firebase/modules';
import { getLessonsByModule, createLesson, updateLesson } from '@/services/firebase/lessons';

const AdminModuleDetail = () => {
  const { userProfile } = useAuth();
  const { courseId, moduleId } = useParams();
  const [moduleData, setModuleData] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  
  const [moduleForm, setModuleForm] = useState({});
  const [lessonForm, setLessonForm] = useState({ title: '', description: '', content: '', status: 'published' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, [moduleId]);

  const fetchData = async () => {
    setLoading(true);
    const modSnap = await getDoc(doc(db, 'modules', moduleId));
    if (modSnap.exists()) {
      const m = { id: modSnap.id, ...modSnap.data() };
      setModuleData(m);
      setModuleForm(m);
      
      const less = await getLessonsByModule(moduleId, true);
      setLessons(less);
    }
    setLoading(false);
  };

  const handleUpdateModule = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateModule(moduleId, { title: moduleForm.title, description: moduleForm.description, status: moduleForm.status });
      setModuleData({ ...moduleData, ...moduleForm });
      setIsEditModalOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateLesson = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createLesson({ ...lessonForm, moduleId, courseId, order: lessons.length });
      setIsLessonModalOpen(false);
      setLessonForm({ title: '', description: '', content: '', status: 'published' });
      fetchData();
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleArchiveLesson = async (lessonId) => {
    if(!window.confirm("Archive this lesson?")) return;
    try {
      await updateLesson(lessonId, { status: 'archived' });
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <LoadingState message="Loading module..." />;
  if (!moduleData) return <EmptyState title="Module Not Found" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-4">
        <Link to={`/admin/courses/${courseId}`} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-secondary">Module: {moduleData.title}</h1>
          <Badge variant={moduleData.status === 'published' ? 'success' : 'neutral'} className="mt-1">
            {moduleData.status?.toUpperCase()}
          </Badge>
        </div>
        <div className="ml-auto">
          {userProfile?.role === "admin" && (<Button variant="outline" className="flex items-center gap-2" onClick={() => setIsEditModalOpen(true)}><Settings size={18} /> Edit Module</Button>)}
        </div>
      </div>

      <div className="flex justify-between items-center mt-8 mb-4">
        <h2 className="text-xl font-bold text-secondary flex items-center gap-2">
          <BookOpen size={24} className="text-primary" /> Lessons
        </h2>
        {userProfile?.role === "admin" && (<Button onClick={() => setIsLessonModalOpen(true)} className="flex items-center gap-2" size="sm"><Plus size={16} /> Add Lesson</Button>)}
      </div>

      {lessons.length === 0 ? (
        <EmptyState title="No lessons yet" description="Add the first lesson to this module." icon={BookOpen} />
      ) : (
        <div className="space-y-3">
          {lessons.map((lesson, index) => (
            <Card key={lesson.id} className={`p-4 flex items-center gap-4 hover:border-slate-300 transition-colors ${lesson.status === 'archived' ? 'opacity-60 bg-slate-50' : ''}`}>
              <div className="text-slate-400 cursor-move"><GripVertical size={20} /></div>
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-sm">
                {index + 1}
              </div>
              <div className="flex-1">
                <Link to={`/admin/courses/${courseId}/modules/${moduleId}/lessons/${lesson.id}`} className="font-bold text-secondary hover:text-primary transition-colors text-lg">
                  {lesson.title}
                </Link>
                {lesson.status === 'archived' && <Badge variant="danger" className="ml-2">Archived</Badge>}
                <p className="text-sm text-slate-500 line-clamp-1">{lesson.description}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleArchiveLesson(lesson.id)}>
{userProfile?.role === 'admin' && <Trash2 size={16} className="text-slate-500" />}
                </Button>
                <Link to={`/admin/courses/${courseId}/modules/${moduleId}/lessons/${lesson.id}`}>
                  <Button size="sm">Manage Content</Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Module Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Module">
        <form onSubmit={handleUpdateModule} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">Title *</label>
            <Input required value={moduleForm.title} onChange={e => setModuleForm({...moduleForm, title: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">Status</label>
            <select className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-white" value={moduleForm.status} onChange={e => setModuleForm({...moduleForm, status: e.target.value})}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
            <Button type="button" variant="ghost" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
          </div>
        </form>
      </Modal>

      {/* Add Lesson Modal */}
      <Modal isOpen={isLessonModalOpen} onClose={() => setIsLessonModalOpen(false)} title="Add Lesson" maxWidth="max-w-2xl">
        <form onSubmit={handleCreateLesson} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">Lesson Title *</label>
            <Input required value={lessonForm.title} onChange={e => setLessonForm({...lessonForm, title: e.target.value})} placeholder="e.g., What is an OS?" />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">Description</label>
            <textarea 
              className="w-full px-4 py-2 border border-slate-200 rounded-lg min-h-[60px]"
              value={lessonForm.description} 
              onChange={e => setLessonForm({...lessonForm, description: e.target.value})} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">Content (Text/HTML)</label>
            <textarea 
              className="w-full px-4 py-2 border border-slate-200 rounded-lg min-h-[150px]"
              value={lessonForm.content} 
              onChange={e => setLessonForm({...lessonForm, content: e.target.value})} 
              placeholder="Enter lesson text here..."
            />
          </div>
          <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
            <Button type="button" variant="ghost" onClick={() => setIsLessonModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Creating...' : 'Create Lesson'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminModuleDetail;
