'use client';

import { Target, Plus, CheckCircle2, Circle, Trash2 } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useState } from 'react';

export function FocusList() {
  const { user, todayStats, addFocusTask, toggleFocusTask, removeFocusTask } = useAppStore();
  const focusTasks = todayStats?.focusTasks || [];
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskLabel, setNewTaskLabel] = useState('');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskLabel.trim() || !user || !todayStats) return;

    const newTask = {
      id: Date.now().toString(),
      label: newTaskLabel.trim(),
      tag: 'Prioritas',
      done: false
    };

    addFocusTask(newTask);
    setNewTaskLabel('');
    setIsAdding(false);

    try {
      const { updateDailyStats } = await import('@/lib/firebase/firestore');
      await updateDailyStats(user.uid, todayStats.date, {
        focusTasks: [...focusTasks, newTask]
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggle = async (taskId: string) => {
    if (!user || !todayStats) return;
    
    toggleFocusTask(taskId);

    try {
      const nextTasks = focusTasks.map(t => t.id === taskId ? { ...t, done: !t.done } : t);
      const { updateDailyStats } = await import('@/lib/firebase/firestore');
      await updateDailyStats(user.uid, todayStats.date, {
        focusTasks: nextTasks
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (taskId: string) => {
    if (!user || !todayStats) return;
    
    removeFocusTask(taskId);

    try {
      const nextTasks = focusTasks.filter(t => t.id !== taskId);
      const { updateDailyStats } = await import('@/lib/firebase/firestore');
      await updateDailyStats(user.uid, todayStats.date, {
        focusTasks: nextTasks
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="card p-5 rounded-2xl h-full flex flex-col" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-4 h-4 text-red-500" />
        <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>3 Fokus Utama Hari Ini</h2>
      </div>

      <div className="flex-1 space-y-3">
        {focusTasks.length === 0 && !isAdding && (
          <div className="text-xs text-center py-4" style={{ color: 'var(--text-muted)' }}>Belum ada fokus untuk hari ini.</div>
        )}
        {focusTasks.map((f, i) => (
          <div key={f.id} className="flex items-start justify-between gap-2 pb-3 border-b group/item" style={{ borderColor: 'var(--border)' }}>
            <div className="flex gap-3 items-start cursor-pointer group flex-1" onClick={() => handleToggle(f.id)}>
              <div className="mt-0.5">
                {f.done ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Circle className="w-3.5 h-3.5 text-indigo-400 group-hover:text-indigo-300" />}
              </div>
              <span className="text-xs font-medium" style={{ 
                color: f.done ? 'var(--text-secondary)' : 'var(--text-primary)',
                textDecoration: f.done ? 'line-through' : 'none'
              }}>
                {f.label}
              </span>
            </div>
            <div className="flex items-center gap-2 opacity-0 group-hover/item:opacity-100 transition-opacity">
              <span className="text-[9px] px-2 py-0.5 rounded-md uppercase tracking-wider flex-shrink-0" 
                    style={{ background: 'var(--bg-primary)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                {f.tag}
              </span>
              <button onClick={() => handleDelete(f.id)} className="text-red-400 hover:text-red-300 p-1 rounded-md hover:bg-red-400/10 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}

        {isAdding && (
          <form onSubmit={handleAdd} className="flex gap-2 pb-3 border-b" style={{ borderColor: 'var(--border)' }}>
            <input 
              type="text" 
              autoFocus
              placeholder="Ketik tugas..."
              value={newTaskLabel}
              onChange={(e) => setNewTaskLabel(e.target.value)}
              className="flex-1 text-xs p-2.5 rounded-lg outline-none"
              style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
            />
            <button 
              type="submit"
              disabled={!newTaskLabel.trim()}
              className="px-3 rounded-lg text-white text-xs font-bold transition-all shadow-md shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'var(--accent)' }}
            >
              Simpan
            </button>
            <button 
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 rounded-lg text-xs font-bold transition-colors"
              style={{ background: 'var(--bg-primary)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
            >
              Batal
            </button>
          </form>
        )}
      </div>

      {!isAdding && focusTasks.length < 3 && (
        <button onClick={() => setIsAdding(true)} className="mt-4 w-full py-3 flex flex-col items-center justify-center gap-1 rounded-xl transition-colors hover:bg-white/5 border border-dashed"
                style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
          <Plus className="w-4 h-4" />
          <span className="text-xs font-medium">Tambah Fokus</span>
        </button>
      )}
    </div>
  );
}
