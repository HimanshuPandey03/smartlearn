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
import { ArrowLeft, Plus, Settings, Layers, GripVertical, Trash2 } from 'lucide-react';
import { getCourseById, updateCourse } from '@/services/firebase/courses';
import { getModulesByCourse, createModule, updateModule } from '@/services/firebase/modules';

const AdminCourseDetail = () => {
  const { userProfile } = useAuth();
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  
  // Forms
  const [courseForm, setCourseForm] = useState({});
  const [moduleForm, setModuleForm] = useState({ title: '', description: '', status: 'published' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, [courseId]);

  const fetchData = async () => {
    setLoading(true);
    const c = await getCourseById(courseId);
    if (c) {
      setCourse(c);
      setCourseForm(c);
      const m = await getModulesByCourse(courseId, true);
      setModules(m);
    }
    setLoading(false);
  };

  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateCourse(courseId, {
        title: courseForm.title,
        description: courseForm.description,
        category: courseForm.category,
        status: courseForm.status
      });
      setCourse({ ...course, ...courseForm });
      setIsEditModalOpen(false);
    } catch (error) {
      console.error(error);
      alert('Failed to update course');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateModule = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createModule({ ...moduleForm, courseId, order: modules.length });
      setIsModuleModalOpen(false);
      setModuleForm({ title: '', description: '', status: 'published' });
      fetchData(); // reload modules
    } catch (error) {
      console.error(error);
      alert('Failed to create module');
    } finally {
      setSaving(false);
    }
  };

  const handleArchiveModule = async (moduleId) => {
    if(!window.confirm("Archive this module?")) return;
    try {
      await updateModule(moduleId, { status: 'archived' });
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <LoadingState message="Loading course details..." />;
  if (!course) return <EmptyState title="Course Not Found" description="The course you are looking for does not exist." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <Link to="/admin/courses" className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-secondary">{course.title}</h1>
          <div className="flex items-center gap-3 mt-1">
            <Badge variant={course.status === 'published' ? 'success' : course.status === 'archived' ? 'danger' : 'neutral'}>
              {course.status.toUpperCase()}
            </Badge>
            <span className="text-sm text-slate-500">{course.category}</span>
          </div>
        </div>
        <div className="ml-auto">
          {userProfile?.role === "admin" && (<Button variant="outline" className="flex items-center gap-2" onClick={() => setIsEditModalOpen(true)}><Settings size={18} /> Edit Course</Button>)}
        </div>
      </div>

      <p className="text-slate-600 bg-white p-4 rounded-xl border border-slate-100">{course.description}</p>

      {/* Modules Section */}
      <div className="flex justify-between items-center mt-8 mb-4">
        <h2 className="text-xl font-bold text-secondary flex items-center gap-2">
          <Layers size={24} className="text-primary" /> Modules
        </h2>
        {userProfile?.role === "admin" && (<Button onClick={() => setIsModuleModalOpen(true)} className="flex items-center gap-2" size="sm"><Plus size={16} /> Add Module</Button>)}
      </div>

      {modules.length === 0 ? (
        <EmptyState title="No modules yet" description="Add the first module to this course." icon={Layers} />
      ) : (
        <div className="space-y-3">
          {modules.map((mod, index) => (
            <Card key={mod.id} className={`p-4 flex items-center gap-4 hover:border-slate-300 transition-colors ${mod.status === 'archived' ? 'opacity-60 bg-slate-50' : ''}`}>
              <div className="text-slate-400 cursor-move"><GripVertical size={20} /></div>
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-sm">
                {index + 1}
              </div>
              <div className="flex-1">
                <Link to={`/admin/courses/${courseId}/modules/${mod.id}`} className="font-bold text-secondary hover:text-primary transition-colors text-lg">
                  {mod.title}
                </Link>
                {mod.status === 'archived' && <Badge variant="danger" className="ml-2">Archived</Badge>}
                <p className="text-sm text-slate-500 line-clamp-1">{mod.description}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleArchiveModule(mod.id)} title="Archive Module">
{userProfile?.role === 'admin' && <Trash2 size={16} className="text-slate-500" />}
                </Button>
                <Link to={`/admin/courses/${courseId}/modules/${mod.id}`}>
                  <Button size="sm">Manage Lessons</Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Course Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Course">
        <form onSubmit={handleUpdateCourse} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">Course Title *</label>
            <Input required value={courseForm.title} onChange={e => setCourseForm({...courseForm, title: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">Description *</label>
            <textarea 
              required
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors min-h-[100px]"
              value={courseForm.description} 
              onChange={e => setCourseForm({...courseForm, description: e.target.value})} 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Status</label>
              <select className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-white" value={courseForm.status} onChange={e => setCourseForm({...courseForm, status: e.target.value})}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
            <Button type="button" variant="ghost" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
          </div>
        </form>
      </Modal>

      {/* Add Module Modal */}
      <Modal isOpen={isModuleModalOpen} onClose={() => setIsModuleModalOpen(false)} title="Add Module">
        <form onSubmit={handleCreateModule} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">Module Title *</label>
            <Input required value={moduleForm.title} onChange={e => setModuleForm({...moduleForm, title: e.target.value})} placeholder="e.g., Internet Basics" />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">Description</label>
            <textarea 
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors min-h-[80px]"
              value={moduleForm.description} 
              onChange={e => setModuleForm({...moduleForm, description: e.target.value})} 
            />
          </div>
          <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
            <Button type="button" variant="ghost" onClick={() => setIsModuleModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Creating...' : 'Create Module'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminCourseDetail;
