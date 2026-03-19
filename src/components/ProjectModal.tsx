import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { Project } from '@/types/project';

const COLORS = [
  '#7c9ef8', '#f87c9e', '#7cf8c2', '#f8c47c',
  '#c47cf8', '#f8a07c', '#7cd4f8', '#f8f07c',
];

interface Props {
  open: boolean;
  project?: Project | null;
  onSave: (data: { name: string; color: string; description: string }) => void;
  onClose: () => void;
}

export default function ProjectModal({ open, project, onSave, onClose }: Props) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (open) {
      setName(project?.name ?? '');
      setColor(project?.color ?? COLORS[0]);
      setDescription(project?.description ?? '');
    }
  }, [project, open]);

  if (!open) return null;

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), color, description: description.trim() });
    onClose();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="glass w-full max-w-sm rounded-2xl p-6 flex flex-col gap-4">
        <h2 className="text-lg font-bold text-white/90">
          {project ? 'Edit Project' : 'New Project'}
        </h2>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-white/50">Project Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            placeholder="e.g. Work, Personal, Study"
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/20"
            style={{ fontSize: '16px' }}
            autoFocus
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs text-white/50">Color</label>
          <div className="flex gap-2 flex-wrap">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className="w-8 h-8 rounded-full transition-all hover:scale-110"
                style={{
                  background: c,
                  boxShadow: color === c ? `0 0 0 3px rgba(255,255,255,0.5)` : undefined,
                  transform: color === c ? 'scale(1.15)' : undefined,
                }}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-white/50">Description (optional)</label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this project about?"
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/20"
            style={{ fontSize: '16px' }}
          />
        </div>

        <div className="flex gap-2 justify-end mt-2">
          <button
            onClick={onClose}
            className="btn-pill px-4 py-2 text-sm text-white/50 hover:text-white/80 bg-white/5 hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="btn-pill px-4 py-2 text-sm text-white font-semibold disabled:opacity-40"
            style={{ background: color }}
          >
            {project ? 'Save' : 'Create'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
