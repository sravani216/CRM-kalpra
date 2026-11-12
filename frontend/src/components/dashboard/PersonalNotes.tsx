import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  FileText,
  Plus,
  Pin,
  Trash2,
  Edit2,
  Search,
  Check,
  X,
  Sparkles,
  StickyNote
} from 'lucide-react';

interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  color: 'yellow' | 'purple' | 'green' | 'blue' | 'rose' | 'amber';
  isPinned?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PersonalNotesProps {
  userId?: string;
  readOnly?: boolean;
  title?: string;
  subtitle?: string;
}

export const PersonalNotes: React.FC<PersonalNotesProps> = ({
  userId,
  readOnly = false,
  title = 'Personal Thoughts & Process Notes',
  subtitle = 'A private space to dump thoughts, key learnings, and daily workflow processes.'
}) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const [form, setForm] = useState({
    title: '',
    content: '',
    color: 'yellow' as Note['color'],
    isPinned: false,
  });

  useEffect(() => {
    fetchNotes();
  }, [userId]);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notes', userId ? { userId } : undefined);
      if (res.success && res.data) {
        setNotes(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch notes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    if (readOnly) return;
    setEditingNote(null);
    setForm({
      title: '',
      content: '',
      color: 'yellow',
      isPinned: false,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (note: Note) => {
    if (readOnly) return;
    setEditingNote(note);
    setForm({
      title: note.title,
      content: note.content,
      color: note.color,
      isPinned: !!note.isPinned,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() && !form.content.trim()) return;

    try {
      if (editingNote) {
        await api.put(`/notes/${editingNote.id}`, form);
      } else {
        await api.post('/notes', { ...form, userId });
      }
      setIsModalOpen(false);
      fetchNotes();
    } catch (err) {
      alert('Failed to save note');
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (readOnly) return;
    if (!window.confirm('Delete this note?')) return;
    try {
      await api.delete(`/notes/${id}`);
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {}
  };

  const handleTogglePin = async (note: Note, e: React.MouseEvent) => {
    e.stopPropagation();
    if (readOnly) return;
    try {
      await api.put(`/notes/${note.id}`, { isPinned: !note.isPinned });
      setNotes((prev) =>
        prev.map((n) => (n.id === note.id ? { ...n, isPinned: !n.isPinned } : n))
      );
    } catch (err) {}
  };

  const getColorClasses = (color: Note['color']) => {
    switch (color) {
      case 'yellow':
        return 'bg-amber-50/90 border-amber-200 text-amber-950 hover:border-amber-300';
      case 'purple':
        return 'bg-purple-50/90 border-purple-200 text-purple-950 hover:border-purple-300';
      case 'green':
        return 'bg-emerald-50/90 border-emerald-200 text-emerald-950 hover:border-emerald-300';
      case 'blue':
        return 'bg-sky-50/90 border-sky-200 text-sky-950 hover:border-sky-300';
      case 'rose':
        return 'bg-rose-50/90 border-rose-200 text-rose-950 hover:border-rose-300';
      default:
        return 'bg-amber-50/90 border-amber-200 text-amber-950';
    }
  };

  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 transition-all duration-300 hover:shadow-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-400 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
            <StickyNote className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              {title}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
          </div>
        </div>

        {/* Search & Add button */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search thoughts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs w-44 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
            />
          </div>

          {!readOnly && (
            <button
              onClick={handleOpenAdd}
              className="btn-smooth flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 text-white font-semibold text-xs shadow-md shadow-amber-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Dump Thought</span>
            </button>
          )}
        </div>
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-6">
        {filteredNotes.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-600">No notes found</p>
            <p className="text-xs text-slate-400 mt-1">
              Dump your thoughts, pitch improvements, client quirks, or daily checklists here!
            </p>
            {!readOnly && (
              <button
                onClick={handleOpenAdd}
                className="mt-3 px-4 py-2 rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-100 text-xs font-bold transition-all"
              >
                + Write First Note
              </button>
            )}
          </div>
        ) : (
          filteredNotes.map((note) => (
            <div
              key={note.id}
              onClick={() => handleOpenEdit(note)}
              className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer relative group flex flex-col justify-between shadow-sm hover:shadow-md hover:-translate-y-1 ${getColorClasses(
                note.color
              )}`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 pb-2 border-b border-black/5">
                  <h4 className="text-sm font-bold tracking-tight line-clamp-1">
                    {note.title}
                  </h4>
                  <div className="flex items-center gap-1 shrink-0">
                    {!readOnly && (
                      <button
                        onClick={(e) => handleTogglePin(note, e)}
                        className={`p-1 rounded-lg transition-colors ${
                          note.isPinned
                            ? 'text-amber-600 bg-amber-200/50'
                            : 'text-slate-400 opacity-0 group-hover:opacity-100 hover:text-slate-700'
                        }`}
                        title={note.isPinned ? 'Unpin' : 'Pin note'}
                      >
                        <Pin className="w-3.5 h-3.5 fill-current" />
                      </button>
                    )}
                    {!readOnly && (
                      <button
                        onClick={(e) => handleDelete(note.id, e)}
                        className="p-1 rounded-lg text-slate-400 opacity-0 group-hover:opacity-100 hover:text-rose-600 hover:bg-rose-100/50 transition-colors"
                        title="Delete note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-xs mt-3 leading-relaxed whitespace-pre-line line-clamp-5 opacity-90 font-medium">
                  {note.content}
                </p>
              </div>

              <div className="mt-4 pt-2 border-t border-black/5 flex items-center justify-between text-[10px] opacity-70 font-semibold">
                <span>
                  {new Date(note.updatedAt || note.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
                {note.isPinned && (
                  <span className="flex items-center gap-1 font-bold">
                    <Pin className="w-2.5 h-2.5" /> Pinned
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Note Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <StickyNote className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingNote ? 'Edit Thought / Note' : 'Dump Thought for Personal Use'}
                  </h3>
                  <p className="text-xs text-slate-400">Captured locally in your personal workspace</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Topic / Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Objections raised by Apex Logistics CTO"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Thought & Process Details *
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder="Write down your thoughts, observations, workflow process steps, client preferences..."
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
                />
              </div>

              {/* Color Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Note Color</label>
                <div className="flex items-center gap-3">
                  {(['yellow', 'purple', 'green', 'blue', 'rose'] as const).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setForm({ ...form, color: c })}
                      className={`w-7 h-7 rounded-xl border-2 transition-transform ${
                        c === 'yellow'
                          ? 'bg-amber-100 border-amber-400'
                          : c === 'purple'
                          ? 'bg-purple-100 border-purple-400'
                          : c === 'green'
                          ? 'bg-emerald-100 border-emerald-400'
                          : c === 'blue'
                          ? 'bg-sky-100 border-sky-400'
                          : 'bg-rose-100 border-rose-400'
                      } ${form.color === c ? 'scale-125 ring-2 ring-slate-900 shadow-sm' : 'hover:scale-110'}`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="pinNote"
                  checked={form.isPinned}
                  onChange={(e) => setForm({ ...form, isPinned: e.target.checked })}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
                />
                <label htmlFor="pinNote" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Pin to top of thoughts board
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-smooth px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 text-white font-bold text-xs shadow-md shadow-amber-500/20"
                >
                  {editingNote ? 'Update Note' : 'Save Thought'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

