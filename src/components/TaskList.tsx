import { useState, useRef } from 'react';
import { useTaskStore } from '@/stores/taskStore';
import { useTimerStore } from '@/stores/timerStore';
import {
  useProjects, useCreateProject, useUpdateProject, useDeleteProject,
} from '@/hooks/useProjects';
import { useTasks, useCreateTask, useToggleTask, useDeleteTask } from '@/hooks/useTasks';
import { ACCENT_COLORS } from '@/lib/timer-utils';
import { Plus, Trash2, Pencil, ChevronDown, ChevronRight, FolderPlus } from 'lucide-react';
import ProjectModal from './ProjectModal';
import type { Project, Task } from '@/types/project';

// ── Task row ──────────────────────────────────────────────────
const TaskItem = ({
  task,
  projectColor,
  isActive,
  onSelect,
  onToggle,
  onDelete,
}: {
  task: Task;
  projectColor: string;
  isActive: boolean;
  onSelect: () => void;
  onToggle: () => void;
  onDelete: () => void;
}) => {
  const [hovering, setHovering] = useState(false);
  const mode = useTimerStore((s) => s.mode);
  const accentColor = ACCENT_COLORS[mode];

  return (
    <div
      className={`glass-sm p-3 flex items-center gap-3 cursor-pointer transition-all duration-200 ${isActive ? 'ring-1 shadow-lg' : ''}`}
      onClick={onSelect}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      style={{
        borderLeft: `3px solid ${projectColor}`,
        ...(isActive
          ? { background: 'rgba(255,255,255,0.1)', boxShadow: `0 0 20px ${accentColor}30` }
          : {}),
      }}
    >
      {/* Checkbox */}
      <button
        onClick={(e) => { e.stopPropagation(); onToggle(); }}
        className="w-5 h-5 rounded-full border-2 border-white/30 flex items-center justify-center flex-shrink-0 transition-all"
        style={task.completed ? { background: projectColor, borderColor: projectColor } : {}}
      >
        {task.completed && (
          <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
            <path d="M3 7L6 10L11 4" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {/* Title */}
      <span className={`flex-1 text-sm font-medium truncate ${task.completed ? 'line-through text-white/30' : 'text-white/85'}`}>
        {task.title}
      </span>

      {/* Pomodoro count */}
      <span className="text-xs whitespace-nowrap text-white/35">
        🍅 {task.actual_pomodoros}/{task.estimated_pomodoros}
      </span>

      {/* Delete */}
      {hovering && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="p-1 rounded-full hover:bg-red-500/20 transition-colors"
        >
          <Trash2 size={13} className="text-red-400/60" />
        </button>
      )}
    </div>
  );
};

// ── Add-task inline form ──────────────────────────────────────
const AddTaskForm = ({
  projectId,
  onDone,
}: {
  projectId: string;
  onDone: () => void;
}) => {
  const [title, setTitle] = useState('');
  const [estimated, setEstimated] = useState(1);
  const inputRef = useRef<HTMLInputElement>(null);
  const { mutate: createTask, isPending } = useCreateTask();

  const handleAdd = () => {
    if (!title.trim()) return;
    createTask(
      { title: title.trim(), project_id: projectId, estimated_pomodoros: estimated },
      { onSuccess: onDone },
    );
  };

  return (
    <div className="flex flex-col gap-2 mt-1">
      <input
        ref={inputRef}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        placeholder="Task name"
        autoFocus
        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/20"
        style={{ fontSize: '16px' }}
      />
      <div className="flex items-center gap-2">
        <span className="text-xs text-white/40">Est.:</span>
        <button onClick={() => setEstimated(Math.max(1, estimated - 1))} className="w-6 h-6 rounded-full bg-white/8 text-white/60 text-sm hover:bg-white/15">-</button>
        <span className="text-sm font-bold w-5 text-center text-white/80">{estimated}</span>
        <button onClick={() => setEstimated(estimated + 1)} className="w-6 h-6 rounded-full bg-white/8 text-white/60 text-sm hover:bg-white/15">+</button>
        <div className="flex-1" />
        <button
          onClick={handleAdd}
          disabled={!title.trim() || isPending}
          className="btn-pill px-3 py-1 text-xs bg-white/10 text-white/80 hover:bg-white/20 disabled:opacity-40"
        >
          Add
        </button>
        <button onClick={onDone} className="text-white/30 text-xs hover:text-white/60">Cancel</button>
      </div>
    </div>
  );
};

// ── Project section ───────────────────────────────────────────
const ProjectSection = ({
  project,
  tasks,
  onEdit,
  onDelete,
}: {
  project: Project;
  tasks: Task[];
  onEdit: () => void;
  onDelete: () => void;
}) => {
  const [open, setOpen] = useState(true);
  const [addingTask, setAddingTask] = useState(false);
  const [hoveringHeader, setHoveringHeader] = useState(false);
  const { activeTaskId, setActiveTask } = useTaskStore();
  const { mutate: toggleTask } = useToggleTask();
  const { mutate: deleteTask } = useDeleteTask();

  return (
    <div className="flex flex-col gap-1">
      {/* Project header */}
      <div
        className="flex items-center gap-2 px-1 py-1 rounded-xl cursor-pointer transition-colors hover:bg-white/5"
        onMouseEnter={() => setHoveringHeader(true)}
        onMouseLeave={() => setHoveringHeader(false)}
      >
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 flex-1 min-w-0"
        >
          <span style={{ color: project.color }}>
            {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </span>
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ background: project.color }}
          />
          <span className="text-sm font-bold text-white/80 truncate">{project.name}</span>
          <span className="text-xs text-white/30 ml-1">{tasks.length}</span>
        </button>

        {hoveringHeader && (
          <div className="flex gap-1 flex-shrink-0">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className="p-1 rounded-full hover:bg-white/10 transition-colors"
            >
              <Pencil size={12} className="text-white/40" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="p-1 rounded-full hover:bg-red-500/20 transition-colors"
            >
              <Trash2 size={12} className="text-red-400/50" />
            </button>
          </div>
        )}
      </div>

      {/* Tasks */}
      {open && (
        <div className="flex flex-col gap-1 pl-4">
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              projectColor={project.color}
              isActive={activeTaskId === task.id}
              onSelect={() =>
                setActiveTask(
                  activeTaskId === task.id ? null : task.id,
                  task.title,
                  project.id,
                )
              }
              onToggle={() => toggleTask({ id: task.id, completed: !task.completed })}
              onDelete={() => {
                if (activeTaskId === task.id) setActiveTask(null, null, null);
                deleteTask(task.id);
              }}
            />
          ))}

          {addingTask ? (
            <AddTaskForm projectId={project.id} onDone={() => setAddingTask(false)} />
          ) : (
            <button
              onClick={() => setAddingTask(true)}
              className="flex items-center gap-1.5 px-2 py-1.5 text-xs text-white/30 hover:text-white/60 hover:bg-white/5 rounded-xl transition-colors"
            >
              <Plus size={12} /> Add task
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// ── Main TaskList ─────────────────────────────────────────────
const TaskList = () => {
  const { data: projects = [], isLoading: loadingProjects } = useProjects();
  const { data: tasks = [] } = useTasks();
  const { mutate: createProject } = useCreateProject();
  const { mutate: updateProject } = useUpdateProject();
  const { mutate: deleteProject } = useDeleteProject();
  const [saveError, setSaveError] = useState<string | null>(null);
  const { activeTaskId, setActiveTask } = useTaskStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const handleOpenCreate = () => { setEditingProject(null); setModalOpen(true); };
  const handleOpenEdit = (p: Project) => { setEditingProject(p); setModalOpen(true); };
  const handleDeleteProject = (p: Project) => {
    if (!confirm(`Delete project "${p.name}"? Tasks in this project will lose their project.`)) return;
    if (activeTaskId) {
      const activeTask = tasks.find((t) => t.id === activeTaskId);
      if (activeTask?.project_id === p.id) setActiveTask(null, null, null);
    }
    deleteProject(p.id);
  };

  const handleSave = (data: { name: string; color: string; description: string }) => {
    setSaveError(null);
    const onError = (err: unknown) => {
      console.error('[Project] save error:', err);
      const msg = (err as { message?: string })?.message || JSON.stringify(err);
      setSaveError(msg);
    };
    if (editingProject) {
      updateProject({ id: editingProject.id, ...data }, { onError });
    } else {
      createProject(data, { onError });
    }
  };

  return (
    <div className="glass p-5 flex flex-col gap-3 h-full">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white/90">📋 Projects & Tasks</h2>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white/60 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
        >
          <FolderPlus size={14} /> New Project
        </button>
      </div>

      <div className="flex flex-col gap-3 flex-1 overflow-y-auto max-h-[360px] pr-1">
        {loadingProjects ? (
          <div className="flex flex-col gap-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-8 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <span className="text-3xl">📁</span>
            <p className="text-sm text-white/30">No projects yet</p>
            <button
              onClick={handleOpenCreate}
              className="btn-pill px-4 py-2 text-sm bg-white/10 text-white/70 hover:bg-white/15"
            >
              Create your first project
            </button>
          </div>
        ) : (
          projects.map((project) => (
            <ProjectSection
              key={project.id}
              project={project}
              tasks={tasks.filter((t) => t.project_id === project.id)}
              onEdit={() => handleOpenEdit(project)}
              onDelete={() => handleDeleteProject(project)}
            />
          ))
        )}
      </div>

      {saveError && (
        <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
          ⚠️ {saveError}
        </div>
      )}

      <ProjectModal
        open={modalOpen}
        project={editingProject}
        onSave={handleSave}
        onClose={() => { setModalOpen(false); setSaveError(null); }}
      />
    </div>
  );
};

export default TaskList;
