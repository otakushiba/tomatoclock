import { useState, useRef } from 'react';
import { useTaskStore, Task } from '@/stores/taskStore';
import { useTimerStore } from '@/stores/timerStore';
import { ACCENT_COLORS } from '@/lib/timer-utils';
import { Plus, Trash2 } from 'lucide-react';

const TaskItem = ({ task, isActive, onSelect, onToggle, onDelete }: {
  task: Task;
  isActive: boolean;
  onSelect: () => void;
  onToggle: () => void;
  onDelete: () => void;
}) => {
  const [hovering, setHovering] = useState(false);
  const [removing, setRemoving] = useState(false);
  const mode = useTimerStore((s) => s.mode);
  const accentColor = ACCENT_COLORS[mode];

  const handleDelete = () => {
    setRemoving(true);
    setTimeout(onDelete, 150);
  };

  return (
    <div
      className={`glass-sm p-3 flex items-center gap-3 cursor-pointer transition-all duration-200 ${removing ? 'animate-slideRight' : ''} ${isActive ? 'ring-1 shadow-lg' : ''}`}
      onClick={onSelect}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      style={{
        borderLeft: `4px solid ${accentColor}`,
        ...(isActive ? { ringColor: accentColor, background: 'rgba(255,255,255,0.1)', boxShadow: `0 0 20px ${accentColor}30` } : {}),
      }}
    >
      {/* Checkbox */}
      <button
        onClick={(e) => { e.stopPropagation(); onToggle(); }}
        className={`w-6 h-6 rounded-full border-2 border-white/30 flex items-center justify-center flex-shrink-0 transition-all ${task.completed ? 'animate-checkBounce' : ''}`}
        style={task.completed ? { background: accentColor, borderColor: accentColor } : {}}
      >
        {task.completed && (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 7L6 10L11 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>

      {/* Title */}
      <span className={`flex-1 text-sm font-semibold truncate ${task.completed ? 'line-through text-white/30' : 'text-white/90'}`}>
        {task.title}
      </span>

      {/* Pomodoro count */}
      <span className="text-xs whitespace-nowrap text-white/40">
        🍅 {task.actualPomodoros} / {task.estimatedPomodoros}
      </span>

      {/* Delete */}
      {hovering && (
        <button
          onClick={(e) => { e.stopPropagation(); handleDelete(); }}
          className="p-1 rounded-full hover:bg-red-500/20 transition-colors"
        >
          <Trash2 size={14} className="text-red-400/70" />
        </button>
      )}
    </div>
  );
};

const TaskList = () => {
  const { tasks, activeTaskId, addTask, removeTask, toggleComplete, setActiveTask } = useTaskStore();
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [estimated, setEstimated] = useState(1);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAdd = () => {
    if (title.trim()) {
      addTask(title.trim(), estimated);
      setTitle('');
      setEstimated(1);
      setAdding(false);
    }
  };

  const handleStartAdd = () => {
    setAdding(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  return (
    <div className="glass p-5 flex flex-col gap-3 h-full">
      <h2 className="text-lg font-bold text-white/90">📋 Today's Tasks</h2>

      <div className="flex flex-col gap-2 flex-1 overflow-y-auto max-h-[320px] pr-1">
        {tasks.length === 0 && !adding && (
          <p className="text-sm text-white/30 text-center py-6">No tasks yet — add one to get started</p>
        )}
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            isActive={activeTaskId === task.id}
            onSelect={() => setActiveTask(activeTaskId === task.id ? null : task.id)}
            onToggle={() => toggleComplete(task.id)}
            onDelete={() => removeTask(task.id)}
          />
        ))}
      </div>

      {adding ? (
        <div className="animate-slideDown flex flex-col gap-2">
          <input
            ref={inputRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="What are you working on?"
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-2 text-base text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/20"
            style={{ fontSize: '16px' }}
          />
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/40">Est. pomodoros:</span>
            <button onClick={() => setEstimated(Math.max(1, estimated - 1))} className="w-7 h-7 rounded-full bg-white/8 text-white/70 font-bold text-sm hover:bg-white/15">-</button>
            <span className="text-sm font-bold w-6 text-center text-white/80">{estimated}</span>
            <button onClick={() => setEstimated(estimated + 1)} className="w-7 h-7 rounded-full bg-white/8 text-white/70 font-bold text-sm hover:bg-white/15">+</button>
            <div className="flex-1" />
            <button onClick={handleAdd} className="btn-pill px-4 py-1 bg-white/10 text-white/80 text-sm hover:bg-white/20">Add</button>
            <button onClick={() => setAdding(false)} className="text-white/30 text-sm hover:text-white/60">Cancel</button>
          </div>
        </div>
      ) : (
        <button
          onClick={handleStartAdd}
          className="w-full py-3 border-2 border-dashed border-white/15 rounded-2xl text-white/40 font-semibold hover:bg-white/5 hover:text-white/60 hover:border-white/25 transition-all flex items-center justify-center gap-2"
        >
          <Plus size={18} /> Add Task
        </button>
      )}
    </div>
  );
};

export default TaskList;
