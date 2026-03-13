import { useState, useRef } from 'react';
import { useTaskStore, Task } from '@/stores/taskStore';
import { useTimerStore } from '@/stores/timerStore';
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
  const accentColor = mode === 'focus' ? '#f953c6' : mode === 'shortBreak' ? '#43e97b' : '#4facfe';

  const handleDelete = () => {
    setRemoving(true);
    setTimeout(onDelete, 150);
  };

  return (
    <div
      className={`glass-sm p-3 flex items-center gap-3 cursor-pointer transition-all duration-200 ${removing ? 'animate-slideRight' : ''} ${isActive ? 'ring-2 ring-white/50 shadow-lg bg-white/25' : ''}`}
      onClick={onSelect}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      style={{ borderLeft: `4px solid ${accentColor}` }}
    >
      {/* Checkbox */}
      <button
        onClick={(e) => { e.stopPropagation(); onToggle(); }}
        className={`w-6 h-6 rounded-full border-2 border-white/50 flex items-center justify-center flex-shrink-0 transition-all ${task.completed ? 'bg-white animate-checkBounce' : ''}`}
      >
        {task.completed && (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 7L6 10L11 4" stroke={accentColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>

      {/* Title */}
      <span className={`flex-1 text-sm font-semibold truncate ${task.completed ? 'line-through opacity-50' : ''}`}>
        {task.title}
      </span>

      {/* Pomodoro count */}
      <span className="text-xs whitespace-nowrap" style={{ color: 'rgba(255,255,255,0.7)' }}>
        🍅 {task.actualPomodoros} / {task.estimatedPomodoros}
      </span>

      {/* Delete */}
      {hovering && (
        <button
          onClick={(e) => { e.stopPropagation(); handleDelete(); }}
          className="p-1 rounded-full hover:bg-red-500/30 transition-colors"
        >
          <Trash2 size={14} className="text-red-300" />
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
      <h2 className="text-lg font-bold">📋 今日任務</h2>

      <div className="flex flex-col gap-2 flex-1 overflow-y-auto max-h-[320px] pr-1">
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
            placeholder="任務名稱..."
            className="w-full bg-white/15 border border-white/25 rounded-2xl px-4 py-2 text-base text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
            style={{ fontSize: '16px' }}
          />
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/70">預估番茄數：</span>
            <button onClick={() => setEstimated(Math.max(1, estimated - 1))} className="w-7 h-7 rounded-full bg-white/15 text-white font-bold text-sm">-</button>
            <span className="text-sm font-bold w-6 text-center">{estimated}</span>
            <button onClick={() => setEstimated(estimated + 1)} className="w-7 h-7 rounded-full bg-white/15 text-white font-bold text-sm">+</button>
            <div className="flex-1" />
            <button onClick={handleAdd} className="btn-pill px-4 py-1 bg-white/20 text-white text-sm hover:bg-white/30">新增</button>
            <button onClick={() => setAdding(false)} className="text-white/50 text-sm hover:text-white">取消</button>
          </div>
        </div>
      ) : (
        <button
          onClick={handleStartAdd}
          className="w-full py-3 border-2 border-dashed border-white/30 rounded-2xl text-white/60 font-semibold hover:bg-white/10 hover:text-white hover:border-white/50 transition-all flex items-center justify-center gap-2"
        >
          <Plus size={18} /> 新增任務
        </button>
      )}
    </div>
  );
};

export default TaskList;
