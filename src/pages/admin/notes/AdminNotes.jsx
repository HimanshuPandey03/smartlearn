import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { notesAPI } from '@/services/api';
import { FileText, Trash2, Download, Loader2, Calendar } from 'lucide-react';

const AdminNotes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const res = await notesAPI.getAll();
      if (res.success) {
        setNotes(res.notes);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Admin action: Are you sure you want to remove this study note?')) return;
    try {
      await notesAPI.delete(id);
      setNotes(notes.filter(n => n.id !== id));
    } catch (err) {
      alert('Failed to delete note.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary">All Study Notes & Materials</h1>
        <p className="text-slate-600">Admin overall oversight: Review all study notes uploaded by teachers.</p>
      </div>

      {loading ? (
        <div className="py-16 flex justify-center text-slate-400">
          <Loader2 className="animate-spin" size={32} />
        </div>
      ) : notes.length === 0 ? (
        <Card className="p-12 text-center text-slate-400">No notes found in MySQL.</Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {notes.map((note) => (
            <Card key={note.id} className="p-5 flex flex-col justify-between bg-white border border-slate-200">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-primary">
                    {note.subject}
                  </span>
                  <button 
                    onClick={() => handleDelete(note.id)} 
                    title="Delete Note"
                    className="text-slate-400 hover:text-danger p-1 rounded"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <h3 className="font-bold text-secondary text-base mb-1">{note.title}</h3>
                <p className="text-xs text-slate-500 mb-3">
                  Uploaded by <strong className="text-slate-700">{note.teacher_name}</strong>
                </p>

                <p className="text-xs text-slate-600 line-clamp-3 mb-4">
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
                    <span>Download File</span>
                  </a>
                ) : (
                  <span className="text-xs text-slate-400 italic">Text Resource</span>
                )}
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Calendar size={12} />
                  {new Date(note.created_at).toLocaleDateString()}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminNotes;
