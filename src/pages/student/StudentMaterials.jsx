import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { notesAPI } from '@/services/api';
import { 
  FileText, Download, Search, BookOpen, 
  Loader2, ExternalLink, Calendar, User, AlertCircle 
} from 'lucide-react';

const StudentMaterials = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [error, setError] = useState('');

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
      setError('Failed to load notes. Please ensure backend is running.');
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-secondary">Study Notes & Learning Materials</h1>
        <p className="text-slate-600">Access and download study notes, lecture summaries, and documents published by teachers.</p>
      </div>

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
              placeholder="Search by topic or title..."
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
          <h3 className="text-lg font-bold text-secondary mb-1">No Study Notes Found</h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            Your teachers have not uploaded notes for this subject yet. Please check back later.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {notes.map((note) => (
            <Card key={note.id} className="p-5 flex flex-col justify-between hover:shadow-md transition-shadow bg-white border border-slate-200">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-primary">
                    {note.subject}
                  </span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Calendar size={12} />
                    {new Date(note.created_at).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="font-bold text-secondary text-base mb-1 line-clamp-2">
                  {note.title}
                </h3>
                
                <p className="text-xs text-slate-500 mb-3 flex items-center gap-1">
                  <User size={12} className="text-slate-400" />
                  <span>Teacher: <strong className="text-slate-700">{note.teacher_name}</strong></span>
                </p>

                <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  {note.description || 'No additional summary provided.'}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                {note.file_url ? (
                  <a
                    href={note.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary-hover shadow-xs transition-colors"
                  >
                    <Download size={14} />
                    <span>Download / View ({note.file_name || 'PDF Document'})</span>
                  </a>
                ) : (
                  <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2.5 py-1 rounded">
                    Text Resource
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentMaterials;
