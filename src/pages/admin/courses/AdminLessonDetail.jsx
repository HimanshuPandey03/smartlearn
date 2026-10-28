import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import LoadingState from '@/components/ui/LoadingState';
import EmptyState from '@/components/ui/EmptyState';
import { ArrowLeft, Plus, Settings, FileText, Trash2, Upload, File, Image, Film, Link as LinkIcon } from 'lucide-react';
import { getLessonById, updateLesson } from '@/services/firebase/lessons';
import { getResourcesByLesson, createResource, deleteResource } from '@/services/firebase/resources';
import { uploadFile } from '@/services/firebase/storage';
import { useAuth } from '@/context/AuthContext';

const AdminLessonDetail = () => {
  const { userProfile } = useAuth();
  const { courseId, moduleId, lessonId } = useParams();
  const { user } = useAuth();
  
  const [lesson, setLesson] = useState(null);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  
  const [lessonForm, setLessonForm] = useState({});
  const [resourceForm, setResourceForm] = useState({ title: '', type: 'document', url: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    fetchData();
  }, [lessonId]);

  const fetchData = async () => {
    setLoading(true);
    const l = await getLessonById(lessonId);
    if (l) {
      setLesson(l);
      setLessonForm(l);
      const res = await getResourcesByLesson(lessonId);
      setResources(res);
    }
    setLoading(false);
  };

  const handleUpdateLesson = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateLesson(lessonId, { 
        title: lessonForm.title, 
        description: lessonForm.description, 
        content: lessonForm.content,
        status: lessonForm.status 
      });
      setLesson({ ...lesson, ...lessonForm });
      setIsEditModalOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddResource = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let fileUrl = resourceForm.url;
      let filePath = null;

      if (resourceForm.type !== 'link' && selectedFile) {
        // Upload to Storage
        const path = `learning-resources/${courseId}/${moduleId}/${lessonId}/${Date.now()}_${selectedFile.name}`;
        fileUrl = await uploadFile(path, selectedFile, (prog) => setUploadProgress(prog));
        filePath = path;
      }

      await createResource({
        title: resourceForm.title,
        type: resourceForm.type,
        url: fileUrl,
        filePath,
        lessonId,
        courseId,
        uploadedBy: user.uid
      });

      setIsResourceModalOpen(false);
      setResourceForm({ title: '', type: 'document', url: '' });
      setSelectedFile(null);
      setUploadProgress(0);
      fetchData();
    } catch (error) {
      console.error(error);
      alert('Failed to add resource.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteResource = async (resourceId) => {
    if(!window.confirm("Permanently delete this resource?")) return;
    try {
      await deleteResource(resourceId);
      // Optional: Delete from storage here if you want to keep storage clean
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const getResourceIcon = (type) => {
    switch(type) {
      case 'pdf': return <FileText className="text-red-500" />;
      case 'image': return <Image className="text-blue-500" />;
      case 'video': return <Film className="text-purple-500" />;
      case 'link': return <LinkIcon className="text-slate-500" />;
      default: return <File className="text-slate-500" />;
    }
  };

  if (loading) return <LoadingState message="Loading lesson..." />;
  if (!lesson) return <EmptyState title="Lesson Not Found" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-4">
        <Link to={`/admin/courses/${courseId}/modules/${moduleId}`} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-secondary">Lesson: {lesson.title}</h1>
          <Badge variant={lesson.status === 'published' ? 'success' : 'neutral'} className="mt-1">
            {lesson.status?.toUpperCase()}
          </Badge>
        </div>
        <div className="ml-auto">
          {userProfile?.role === "admin" && (<Button variant="outline" className="flex items-center gap-2" onClick={() => setIsEditModalOpen(true)}><Settings size={18} /> Edit Lesson</Button>)}
        </div>
      </div>

      <Card className="p-6">
        <h3 className="font-semibold text-secondary mb-2">Lesson Content</h3>
        {lesson.content ? (
          <div className="prose max-w-none text-slate-700 whitespace-pre-wrap">{lesson.content}</div>
        ) : (
          <p className="text-slate-400 italic">No text content added to this lesson yet.</p>
        )}
      </Card>

      <div className="flex justify-between items-center mt-8 mb-4">
        <h2 className="text-xl font-bold text-secondary flex items-center gap-2">
          <FileText size={24} className="text-primary" /> Learning Resources
        </h2>
        <Button onClick={() => setIsResourceModalOpen(true)} className="flex items-center gap-2" size="sm">
          <Plus size={16} /> Add Resource
        </Button>
      </div>

      {resources.length === 0 ? (
        <EmptyState title="No resources attached" description="Upload PDFs, images, videos, or link external resources." icon={Upload} />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {resources.map(res => (
            <Card key={res.id} className="p-4 flex items-center gap-4 border-l-4 border-l-primary">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                {getResourceIcon(res.type)}
              </div>
              <div className="flex-1 overflow-hidden">
                <a href={res.url} target="_blank" rel="noopener noreferrer" className="font-bold text-secondary hover:text-primary transition-colors block truncate">
                  {res.title}
                </a>
                <p className="text-xs text-slate-500 capitalize">{res.type}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => handleDeleteResource(res.id)} title="Delete Resource">
                <Trash2 size={16} className="text-danger" />
              </Button>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Lesson Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Lesson" maxWidth="max-w-2xl">
        <form onSubmit={handleUpdateLesson} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">Title *</label>
            <Input required value={lessonForm.title} onChange={e => setLessonForm({...lessonForm, title: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">Content (Text/HTML)</label>
            <textarea 
              className="w-full px-4 py-2 border border-slate-200 rounded-lg min-h-[200px]"
              value={lessonForm.content} 
              onChange={e => setLessonForm({...lessonForm, content: e.target.value})} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">Status</label>
            <select className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-white" value={lessonForm.status} onChange={e => setLessonForm({...lessonForm, status: e.target.value})}>
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

      {/* Add Resource Modal */}
      <Modal isOpen={isResourceModalOpen} onClose={() => setIsResourceModalOpen(false)} title="Add Resource">
        <form onSubmit={handleAddResource} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">Resource Title *</label>
            <Input required value={resourceForm.title} onChange={e => setResourceForm({...resourceForm, title: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">Resource Type</label>
            <select className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-white" value={resourceForm.type} onChange={e => setResourceForm({...resourceForm, type: e.target.value})}>
              <option value="document">Document / Other</option>
              <option value="pdf">PDF File</option>
              <option value="image">Image</option>
              <option value="video">Video</option>
              <option value="link">External Link</option>
            </select>
          </div>
          
          {resourceForm.type === 'link' ? (
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">External URL *</label>
              <Input type="url" required value={resourceForm.url} onChange={e => setResourceForm({...resourceForm, url: e.target.value})} placeholder="https://..." />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Upload File *</label>
              <input type="file" required onChange={e => setSelectedFile(e.target.files[0])} className="w-full" />
              {uploadProgress > 0 && <p className="text-xs text-primary mt-2">Uploading: {Math.round(uploadProgress)}%</p>}
            </div>
          )}

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
            <Button type="button" variant="ghost" onClick={() => setIsResourceModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Uploading...' : 'Add Resource'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminLessonDetail;
