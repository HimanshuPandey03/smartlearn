import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { notesAPI } from '@/services/api';
import { 
  FileText, Plus, Trash2, Download, Search, 
  ExternalLink, Loader2, BookOpen, AlertCircle, CheckCircle2, X 
} from 'lucide-react';

const TeacherNotes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form state
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [externalUrl, setExternalUrl] = useState('');

  const subjectsList = ['All', 'DBMS', 'Computer Networks', 'Operating Systems', 'Web Development', 'Data Structures', 'Python', 'General'];

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const res = await notesAPI.getAll({
        subject: selectedSubject !== 'All' ? selectedSubject : '',
        search: searchTerm,
      });
      if (res.success) {
        setNotes(res.notes);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load notes. Please verify backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [selectedSubject]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchNotes();
  };

  const handleCreateNote = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!title.trim() || !subject.trim()) {
      return setError('Title and Subject are required.');
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('title', title);
      formData.append('subject', subject);
      formData.append('description', description);
      if (file) {
        formData.append('file', file);
      }
      if (externalUrl) {
        formData.append('external_url', externalUrl);
      }

      const res = await notesAPI.create(formData);
      if (res.success) {
        setSuccessMsg('Note uploaded successfully!');
        setIsModalOpen(false);
        // Reset form
        setTitle('');
        setSubject('');
        setDescription('');
        setFile(null);
        setExternalUrl('');
        fetchNotes();
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to upload note.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this study note?')) return;
    try {
      await notesAPI.delete(noteId);
      setNotes(notes.filter(n => n.id !== noteId));
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to delete note.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary">Study Notes & Materials</h1>
          <p className="text-slate-600">Upload and manage syllabus notes, PDF documents, and study resources for students.</p>
        </div>
        <Button 
          onClick={() => { setError(''); setSuccessMsg(''); setIsModalOpen(true); }}
          className="flex items-center gap-2 self-start sm:self-auto bg-primary hover:bg-primary-hover text-white shadow-sm"
        >
          <Plus size={18} />
          <span>Upload Notes</span>
        </Button>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center gap-2 text-sm">
          <CheckCircle2 size={18} className="text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-danger rounded-lg flex items-center gap-2 text-sm">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <Card className="p-4 flex flex-col md:flex-row gap-4 justify-between items-center bg-white shadow-sm">
        {/* Subject Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {subjectsList.map((subj) => (
            <button
              key={subj}
              onClick={() => setSelectedSubject(subj)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedSubject === subj 
                  ? 'bg-primary text-white shadow-xs' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {subj}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-72">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <Button type="submit" size="sm" variant="outline">Search</Button>
        </form>
      </Card>

      {/* Notes Grid */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center text-slate-500">
          <Loader2 className="animate-spin mb-3 text-primary" size={32} />
          <p className="text-sm">Loading notes from MySQL database...</p>
        </div>
      ) : notes.length === 0 ? (
        <Card className="p-12 text-center bg-white border-dashed border-2 border-slate-200">
          <div className="w-16 h-16 bg-blue-50 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen size={32} />
          </div>
          <h3 className="text-lg font-bold text-secondary mb-1">No Notes Uploaded Yet</h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
            Share learning resources, lecture slides, or PDF notes with students so they can prepare for their exams.
          </p>
          <Button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-2">
            <Plus size={18} />
            <span>Upload First Note</span>
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {notes.map((note) => (
            <Card key={note.id} className="p-5 flex flex-col justify-between hover:shadow-md transition-shadow bg-white border border-slate-200">
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-primary">
                    {note.subject}
                  </span>
                  <button 
                    onClick={() => handleDelete(note.id)}
                    title="Delete note"
                    className="text-slate-400 hover:text-danger p-1 rounded hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <h3 className="font-bold text-secondary text-base mb-1 line-clamp-2">
                  {note.title}
                </h3>
                
                <p className="text-xs text-slate-400 mb-3">
                  Uploaded by <span className="font-medium text-slate-600">{note.teacher_name}</span> • {new Date(note.created_at).toLocaleDateString()}
                </p>

                <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed">
                  {note.description || 'No description provided.'}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                {note.file_url ? (
                  <a
                    href={note.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                  >
                    <Download size={14} />
                    <span>{note.file_name || 'Download File'}</span>
                  </a>
                ) : (
                  <span className="text-xs text-slate-400 italic">Text Resource</span>
                )}
                <span className="text-[11px] text-slate-400">ID #{note.id}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Note Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 relative animate-in fade-in zoom-in-95 duration-150">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 bg-blue-100 text-primary rounded-lg">
                <FileText size={22} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-secondary">Upload Study Notes</h2>
                <p className="text-xs text-slate-500">Fill in the details to publish notes for students.</p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-danger rounded-lg text-xs flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreateNote} className="space-y-4">
              <Input
                label="Note Title"
                placeholder="e.g. Unit 3: Normalization & SQL Queries"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Subject / Category *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. DBMS, Networking..."
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Attach File (PDF, Docs)
                  </label>
                  <input
                    type="file"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-primary hover:file:bg-blue-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  External URL / Drive Link (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/..."
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Description / Topic Summary
                </label>
                <textarea
                  rows={3}
                  placeholder="Add a brief summary or key takeaways of these notes..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="animate-spin" size={16} />
                      Uploading...
                    </span>
                  ) : (
                    'Publish Note'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherNotes;
