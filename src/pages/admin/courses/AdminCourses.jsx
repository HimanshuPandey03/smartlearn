import { useAuth } from '@/context/AuthContext';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import LoadingState from '@/components/ui/LoadingState';
import EmptyState from '@/components/ui/EmptyState';
import { Plus, Search, BookOpen, Edit, Eye } from 'lucide-react';
import { getAllCourses, createCourse } from '@/services/firebase/courses';

const AdminCourses = () => {
  const { userProfile } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ title: '', description: '', category: 'MS-CIT', status: 'draft' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    const data = await getAllCourses(true);
    setCourses(data);
    setLoading(false);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const newId = await createCourse(formData);
      setIsModalOpen(false);
      setFormData({ title: '', description: '', category: 'MS-CIT', status: 'draft' });
      navigate(`/admin/courses/${newId}`);
    } catch (error) {
      console.error(error);
      alert('Failed to create course');
    } finally {
      setSaving(false);
    }
  };

  const filteredCourses = courses.filter(c => c.title.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <LoadingState message="Loading courses..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary">Course Management</h1>
          <p className="text-slate-600">Create and manage learning courses.</p>
        </div>
        {userProfile?.role === "admin" && (<Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2"><Plus size={18} /> Create Course</Button>)}
      </div>

      <Card className="p-4 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <Input 
            className="pl-10 w-full" 
            placeholder="Search courses by title..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </Card>

      {filteredCourses.length === 0 ? (
        <EmptyState title="No courses found" description="Get started by creating your first course." />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map(course => (
            <Card key={course.id} className="flex flex-col h-full hover:border-primary/50 transition-colors">
              <div className="h-32 bg-slate-100 rounded-t-xl flex items-center justify-center">
                <BookOpen size={48} className="text-slate-300" />
              </div>
              <div className="p-5 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant={course.status === 'published' ? 'success' : course.status === 'archived' ? 'danger' : 'neutral'}>
                    {course.status.toUpperCase()}
                  </Badge>
                  <span className="text-xs text-slate-500">{course.category}</span>
                </div>
                <h3 className="font-bold text-lg text-secondary mb-2 line-clamp-1">{course.title}</h3>
                <p className="text-slate-600 text-sm mb-4 line-clamp-2 flex-1">{course.description}</p>
                <div className="flex gap-2 mt-auto">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => navigate(`/admin/courses/${course.id}`)}>
                    <Eye size={16} className="mr-2" /> View & Edit
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Course">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">Course Title *</label>
            <Input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g., Computer Fundamentals" />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">Description *</label>
            <textarea 
              required
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors min-h-[100px]"
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})} 
              placeholder="Brief description of the course..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Category</label>
              <select 
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors bg-white"
                value={formData.category} 
                onChange={e => setFormData({...formData, category: e.target.value})}
              >
                <option value="MS-CIT / MKCL">MS-CIT / MKCL</option>
                <option value="Digital Literacy">Digital Literacy</option>
                <option value="Computer Fundamentals">Computer Fundamentals</option>
                <option value="Employability & Soft Skills">Employability & Soft Skills</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Status</label>
              <select 
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors bg-white"
                value={formData.status} 
                onChange={e => setFormData({...formData, status: e.target.value})}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Creating...' : 'Create Course'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminCourses;
