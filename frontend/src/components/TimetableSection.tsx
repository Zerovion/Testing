import React, { useState, useEffect } from 'react';
import { TimetableItem, Task, TaskCategory, UserRole } from '../types';
import { Clock, Plus, BookOpen, Laptop, GraduationCap, Dumbbell, Calendar, Trash2, Heart, Sparkles } from 'lucide-react';

interface TimetableSectionProps {
  slots: TimetableItem[];
  tasks: Task[];
  userRole?: UserRole;
  adminName?: string;
  learnerName?: string;
  onAddTaskToSlot: (slot: TimetableItem, taskTitle: string) => Promise<void>;
  onToggleTask: (taskId: string) => Promise<void>;
  onCreateSlot?: (slotData: Partial<TimetableItem>) => Promise<void>;
  onDeleteSlot?: (id: string) => Promise<void>;
}

export const TimetableSection: React.FC<TimetableSectionProps> = ({
  slots,
  tasks,
  userRole = 'admin',
  adminName = 'Aboli',
  learnerName = 'Boyfriend',
  onAddTaskToSlot,
  onToggleTask,
  onCreateSlot,
  onDeleteSlot
}) => {
  const [currentSlotId, setCurrentSlotId] = useState<string | null>(null);
  const [nextSlot, setNextSlot] = useState<TimetableItem | null>(null);
  const [selectedSlotForTask, setSelectedSlotForTask] = useState<TimetableItem | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // New slot creation state
  const [isCreatingSlotModal, setIsCreatingSlotModal] = useState(false);
  const [newSlotActivity, setNewSlotActivity] = useState('');
  const [newSlotTimeRange, setNewSlotTimeRange] = useState('8:00 AM – 9:00 AM');
  const [newSlotCategory, setNewSlotCategory] = useState<TaskCategory>('General');
  const [newSlotDescription, setNewSlotDescription] = useState('');
  const [newSlotIsStudy, setNewSlotIsStudy] = useState(true);

  // Calculate current active routine slot based on local time
  useEffect(() => {
    const calculateCurrentSlot = () => {
      const now = new Date();
      const curHour = now.getHours();
      const curMin = now.getMinutes();
      const totalCurMins = curHour * 60 + curMin;

      let foundSlotId: string | null = null;
      let upcoming: TimetableItem | null = null;

      for (let i = 0; i < slots.length; i++) {
        const slot = slots[i];
        let startMins = slot.startHour * 60 + slot.startMinute;
        let endMins = slot.endHour * 60 + slot.endMinute;

        if (endMins <= startMins) {
          endMins += 24 * 60;
        }

        let testCurMins = totalCurMins;
        if (slot.startHour > 20 && curHour < 6) {
          testCurMins += 24 * 60;
        }

        if (testCurMins >= startMins && testCurMins < endMins) {
          foundSlotId = slot.id;
          upcoming = slots[(i + 1) % slots.length];
          break;
        }
      }

      setCurrentSlotId(foundSlotId);
      if (upcoming) setNextSlot(upcoming);
    };

    calculateCurrentSlot();
    const interval = setInterval(calculateCurrentSlot, 30000);
    return () => clearInterval(interval);
  }, [slots]);

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlotForTask || !newTaskTitle.trim()) return;

    setIsAdding(true);
    try {
      await onAddTaskToSlot(selectedSlotForTask, newTaskTitle.trim());
      setNewTaskTitle('');
      setSelectedSlotForTask(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleCreateSlotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlotActivity.trim() || !onCreateSlot) return;

    setIsAdding(true);
    try {
      await onCreateSlot({
        ownerRole: 'admin',
        activity: newSlotActivity.trim(),
        timeRange: newSlotTimeRange.trim(),
        category: newSlotCategory,
        description: newSlotDescription.trim(),
        isStudySession: newSlotIsStudy,
        startHour: 9,
        startMinute: 0,
        endHour: 10,
        endMinute: 0
      });
      setIsCreatingSlotModal(false);
      setNewSlotActivity('');
      setNewSlotDescription('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsAdding(false);
    }
  };

  const getCategoryIcon = (category: TaskCategory) => {
    switch (category) {
      case 'Japanese N4':
      case 'Japanese N5':
        return <BookOpen className="w-4 h-4 text-pink-500" />;
      case 'Skills / Internship':
        return <Laptop className="w-4 h-4 text-purple-500" />;
      case 'College Study':
        return <GraduationCap className="w-4 h-4 text-blue-500" />;
      case 'Exercise':
        return <Dumbbell className="w-4 h-4 text-emerald-500" />;
      default:
        return <Clock className="w-4 h-4 text-pink-400" />;
    }
  };

  const activeSlot = slots.find((s) => s.id === currentSlotId);

  return (
    <div className="space-y-6">
      {/* Shared Routine Header Banner */}
      <div className="flex items-center justify-between bg-white dark:bg-[#322E2B] p-4 rounded-3xl border border-pink-100 dark:border-[#5D574D] shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-400 flex items-center justify-center text-white shadow-md shadow-pink-500/20">
            <Heart className="w-5 h-5 fill-current animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-bold font-serif text-[#3E3B39] dark:text-[#F5F2ED]">
              ❤️ Our Daily Routine
            </h2>
            <p className="text-xs text-pink-600 dark:text-pink-300 font-medium">
              One shared schedule for both of us — {adminName} & {learnerName}
            </p>
          </div>
        </div>

        {userRole === 'admin' && onCreateSlot && (
          <button
            onClick={() => setIsCreatingSlotModal(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold bg-pink-500 hover:bg-pink-600 text-white shadow-sm shadow-pink-500/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Routine Slot</span>
          </button>
        )}
      </div>

      {/* Active Time Block Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-pink-500/90 via-rose-500/90 to-pink-600 text-white shadow-lg shadow-pink-500/15">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/20 text-white backdrop-blur-md">
                ⏰ Live Routine Tracker
              </span>
              <span className="text-xs text-pink-100 font-medium">
                Shared Schedule for {adminName} & {learnerName}
              </span>
            </div>

            {activeSlot ? (
              <div>
                <h3 className="text-xl font-bold font-serif flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-300 animate-ping"></span>
                  <span>Active Now: {activeSlot.activity}</span>
                </h3>
                <p className="text-xs text-pink-100 font-medium">
                  {activeSlot.timeRange} — {activeSlot.description}
                </p>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-bold font-serif">Daily Study & Task Routine</h3>
                <p className="text-xs text-pink-100">Click any study session to add task goals</p>
              </div>
            )}
          </div>

          {nextSlot && (
            <div className="px-4 py-2 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 text-right">
              <span className="block text-[10px] uppercase font-bold text-pink-200">
                ⏳ Up Next
              </span>
              <span className="block text-xs font-bold text-white">
                {nextSlot.activity}
              </span>
              <span className="block text-[10px] text-pink-100">{nextSlot.timeRange}</span>
            </div>
          )}
        </div>
      </div>

      {/* Routine Timeline Grid */}
      <div className="bg-white dark:bg-[#322E2B] rounded-3xl p-6 border border-pink-100 dark:border-[#5D574D] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold font-serif text-[#3E3B39] dark:text-[#F5F2ED]">
              ⏰ Shared Daily Timetable
            </h2>
            <p className="text-xs text-pink-600 dark:text-pink-300 font-medium">
              Daily routine slots. Click any study block to assign specific tasks!
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-pink-50 text-pink-600 dark:bg-pink-950 dark:text-pink-300 border border-pink-200 dark:border-pink-900">
            {slots.length} Slots
          </span>
        </div>

        <div className="divide-y divide-pink-50 dark:divide-[#4A4744]">
          {slots.map((slot) => {
            const isActive = slot.id === currentSlotId;
            const slotTasks = tasks.filter((t) => t.timetableSlotId === slot.id);

            return (
              <div
                key={slot.id}
                className={`py-4 px-3 sm:px-4 rounded-2xl transition-all ${
                  isActive
                    ? 'bg-pink-50/70 dark:bg-pink-950/40 border-l-4 border-pink-500'
                    : 'hover:bg-pink-50/30 dark:hover:bg-[#4A4744]/40'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-start space-x-3">
                    <div className="p-2.5 rounded-xl bg-pink-100/70 dark:bg-pink-900/30 mt-0.5">
                      {getCategoryIcon(slot.category)}
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-extrabold text-pink-600 dark:text-pink-300 bg-pink-100/60 dark:bg-pink-950/80 px-2.5 py-0.5 rounded-lg">
                          {slot.timeRange}
                        </span>
                        {isActive && (
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
                            🟢 Active Now
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-[#3E3B39] dark:text-[#F5F2ED] mt-1">
                        {slot.activity}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {slot.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 self-start sm:self-auto">
                    {/* Add Task Button for Study Sessions */}
                    {slot.isStudySession && (
                      <button
                        id={`add-task-to-${slot.id}`}
                        onClick={() => setSelectedSlotForTask(slot)}
                        className="flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-pink-50 hover:bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300 dark:hover:bg-pink-900 border border-pink-200 dark:border-pink-900 transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Goal Task</span>
                      </button>
                    )}

                    {/* Delete Slot (Admin only) */}
                    {userRole === 'admin' && onDeleteSlot && (
                      <button
                        onClick={() => onDeleteSlot(slot.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-all"
                        title="Delete slot"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Sub-tasks created for this specific timetable slot */}
                {slotTasks.length > 0 && (
                  <div className="mt-3 ml-2 sm:ml-12 space-y-1.5">
                    {slotTasks.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => onToggleTask(t.id)}
                        className="flex items-center space-x-2.5 p-2 rounded-xl bg-white dark:bg-[#2B2826] border border-pink-100 dark:border-[#5D574D] cursor-pointer hover:border-pink-300 transition-all"
                      >
                        <span
                          className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${
                            t.completed
                              ? 'bg-emerald-500 border-emerald-500 text-white font-bold'
                              : 'border-pink-300'
                          }`}
                        >
                          {t.completed ? '✓' : ''}
                        </span>
                        <span
                          className={`text-xs font-medium ${
                            t.completed
                              ? 'line-through text-slate-400 dark:text-slate-500'
                              : 'text-[#3E3B39] dark:text-[#F5F2ED]'
                          }`}
                        >
                          {t.title}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Add Task Modal */}
      {selectedSlotForTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#322E2B] rounded-3xl p-6 max-w-md w-full border border-pink-100 dark:border-[#5D574D] shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#3E3B39] dark:text-[#F5F2ED]">
                  Add Task to {selectedSlotForTask.activity}
                </h3>
                <p className="text-xs text-pink-600 dark:text-pink-300 font-semibold">
                  {selectedSlotForTask.timeRange}
                </p>
              </div>
              <button
                onClick={() => setSelectedSlotForTask(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleQuickAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#3E3B39] dark:text-[#F5F2ED] mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Complete N4 Lesson 8 Grammar"
                  className="w-full px-4 py-2.5 rounded-xl border border-pink-200 dark:border-[#5D574D] bg-[#FFFDF9] dark:bg-[#2B2826] text-[#3E3B39] dark:text-[#F5F2ED] text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedSlotForTask(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAdding}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-pink-500 hover:bg-pink-600 shadow-md shadow-pink-500/20"
                >
                  {isAdding ? 'Adding...' : 'Add Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create New Routine Slot Modal (Admin) */}
      {isCreatingSlotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#322E2B] rounded-3xl p-6 max-w-md w-full border border-pink-100 dark:border-[#5D574D] shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#3E3B39] dark:text-[#F5F2ED]">
                  Add Shared Routine Slot
                </h3>
                <p className="text-xs text-pink-600 dark:text-pink-300 font-semibold">
                  New schedule entry for both {adminName} & {learnerName}
                </p>
              </div>
              <button
                onClick={() => setIsCreatingSlotModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSlotSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#3E3B39] dark:text-[#F5F2ED] mb-1">
                  Activity Name
                </label>
                <input
                  type="text"
                  required
                  value={newSlotActivity}
                  onChange={(e) => setNewSlotActivity(e.target.value)}
                  placeholder="e.g. Japanese Kanji Practice 🇯🇵"
                  className="w-full px-4 py-2.5 rounded-xl border border-pink-200 dark:border-[#5D574D] bg-[#FFFDF9] dark:bg-[#2B2826] text-[#3E3B39] dark:text-[#F5F2ED] text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#3E3B39] dark:text-[#F5F2ED] mb-1">
                  Time Range Label
                </label>
                <input
                  type="text"
                  required
                  value={newSlotTimeRange}
                  onChange={(e) => setNewSlotTimeRange(e.target.value)}
                  placeholder="e.g. 8:00 PM – 9:00 PM"
                  className="w-full px-4 py-2.5 rounded-xl border border-pink-200 dark:border-[#5D574D] bg-[#FFFDF9] dark:bg-[#2B2826] text-[#3E3B39] dark:text-[#F5F2ED] text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#3E3B39] dark:text-[#F5F2ED] mb-1">
                  Category
                </label>
                <select
                  value={newSlotCategory}
                  onChange={(e) => setNewSlotCategory(e.target.value as TaskCategory)}
                  className="w-full px-4 py-2.5 rounded-xl border border-pink-200 dark:border-[#5D574D] bg-[#FFFDF9] dark:bg-[#2B2826] text-[#3E3B39] dark:text-[#F5F2ED] text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                >
                  <option value="General">General</option>
                  <option value="Japanese N4">Japanese N4</option>
                  <option value="Japanese N5">Japanese N5</option>
                  <option value="College Study">College Study</option>
                  <option value="Skills / Internship">Skills / Internship</option>
                  <option value="Exercise">Exercise</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#3E3B39] dark:text-[#F5F2ED] mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={newSlotDescription}
                  onChange={(e) => setNewSlotDescription(e.target.value)}
                  placeholder="e.g. Focus on vocabulary drill"
                  className="w-full px-4 py-2.5 rounded-xl border border-pink-200 dark:border-[#5D574D] bg-[#FFFDF9] dark:bg-[#2B2826] text-[#3E3B39] dark:text-[#F5F2ED] text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="slot-study-cb"
                  checked={newSlotIsStudy}
                  onChange={(e) => setNewSlotIsStudy(e.target.checked)}
                  className="w-4 h-4 text-pink-500 rounded border-pink-300 focus:ring-pink-400"
                />
                <label htmlFor="slot-study-cb" className="text-xs font-bold text-[#3E3B39] dark:text-[#F5F2ED]">
                  Allow assigning daily goal tasks to this slot
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingSlotModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAdding}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-pink-500 hover:bg-pink-600 shadow-md shadow-pink-500/20"
                >
                  {isAdding ? 'Creating...' : 'Create Slot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};


