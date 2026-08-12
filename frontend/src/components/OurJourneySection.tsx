import React from 'react';
import { CombinedStats } from '../types';
import { Heart, Flame, BookOpen, Laptop, GraduationCap, Dumbbell, Award, CheckCircle2 } from 'lucide-react';

interface OurJourneySectionProps {
  stats: CombinedStats | null;
  adminName?: string;
  learnerName?: string;
}

export const OurJourneySection: React.FC<OurJourneySectionProps> = ({
  stats,
  adminName = 'Aboli',
  learnerName = 'Boyfriend'
}) => {
  if (!stats) return null;

  return (
    <div className="bg-white dark:bg-[#3E3B39] rounded-3xl p-6 sm:p-8 border border-[#E8E4D9] dark:border-[#5D574D] shadow-sm space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-[#F5F2ED] text-[#8B7E66] dark:bg-[#4A4744] dark:text-[#D9C5B2] border border-[#E8E4D9] dark:border-[#5D574D] text-xs font-bold">
          <Heart className="w-3.5 h-3.5 text-[#A7C0A8] fill-current animate-pulse" />
          <span>Shared Learning Journey</span>
        </div>
        <h2 className="text-2xl font-bold font-serif text-[#3E3B39] dark:text-[#F5F2ED] tracking-tight">
          Our Study Journey ❤️
        </h2>
        <p className="text-xs text-[#8B7E66] dark:text-[#D9C5B2] max-w-md mx-auto">
          Growing together, supporting each other's goals, and building daily consistency.
        </p>
      </div>

      {/* Together Banner */}
      <div className="p-4 rounded-2xl bg-[#3E3B39] text-[#F5F2ED] border border-[#5D574D] text-center font-bold text-sm sm:text-base shadow-sm">
        ✨ Together, you completed {stats.totalCombinedTasks} tasks this week! Keep going! ❤️
      </div>

      {/* Grid: Her vs His Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* Me (Admin) */}
        <div className="p-5 rounded-2xl bg-[#FAF7F2] dark:bg-[#4A4744] border border-[#E8E4D9] dark:border-[#5D574D] space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#E8E4D9] dark:border-[#5D574D]">
            <h3 className="font-bold text-sm text-[#3E3B39] dark:text-[#F5F2ED] flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-[#A7C0A8]"></span>
              <span>👩 {adminName} (Admin / Manager)</span>
            </h3>
            <span className="text-[10px] uppercase font-bold text-[#8B7E66] dark:text-[#D9C5B2]">
              N4 & Career Goals
            </span>
          </div>

          <div className="space-y-3 text-xs font-semibold text-[#3E3B39] dark:text-[#F5F2ED]">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-[#2B2826] border border-[#E8E4D9] dark:border-[#5D574D]">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-[#A7C0A8]" />
                <span>🇯🇵 Japanese N4</span>
              </div>
              <span className="font-bold text-[#8B7E66] dark:text-[#D9C5B2]">
                {stats.adminN4LessonsCompleted}/25 Lessons
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-[#2B2826] border border-[#E8E4D9] dark:border-[#5D574D]">
              <div className="flex items-center space-x-2">
                <Laptop className="w-4 h-4 text-[#D9C5B2]" />
                <span>💻 Skills & Internship</span>
              </div>
              <span className="font-bold text-[#3E3B39] dark:text-[#F5F2ED]">
                {stats.adminCompletedTasksThisWeek} Tasks Completed
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-[#2B2826] border border-[#E8E4D9] dark:border-[#5D574D]">
              <div className="flex items-center space-x-2">
                <GraduationCap className="w-4 h-4 text-[#8B7E66]" />
                <span>📚 College Study</span>
              </div>
              <span className="font-bold text-[#3E3B39] dark:text-[#F5F2ED]">
                Fixed Routine Slots
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-[#2B2826] border border-[#E8E4D9] dark:border-[#5D574D]">
              <div className="flex items-center space-x-2">
                <Dumbbell className="w-4 h-4 text-[#A7C0A8]" />
                <span>💪 Exercise Routine</span>
              </div>
              <span className="font-bold text-[#A7C0A8]">
                8:00 – 10:30 PM Slot
              </span>
            </div>
          </div>
        </div>

        {/* Him (Learner) */}
        <div className="p-5 rounded-2xl bg-[#FAF7F2] dark:bg-[#4A4744] border border-[#E8E4D9] dark:border-[#5D574D] space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#E8E4D9] dark:border-[#5D574D]">
            <h3 className="font-bold text-sm text-[#3E3B39] dark:text-[#F5F2ED] flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-[#D9C5B2]"></span>
              <span>👨 {learnerName} (Learner)</span>
            </h3>
            <span className="text-[10px] uppercase font-bold text-[#8B7E66] dark:text-[#D9C5B2]">
              N5 Learning & Streak
            </span>
          </div>

          <div className="space-y-3 text-xs font-semibold text-[#3E3B39] dark:text-[#F5F2ED]">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-[#2B2826] border border-[#E8E4D9] dark:border-[#5D574D]">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-[#8B7E66]" />
                <span>🗾 Japanese N5</span>
              </div>
              <span className="font-bold text-[#8B7E66] dark:text-[#D9C5B2]">
                {stats.learnerN5LessonsCompleted}/25 Lessons
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-[#2B2826] border border-[#E8E4D9] dark:border-[#5D574D]">
              <div className="flex items-center space-x-2">
                <Flame className="w-4 h-4 text-amber-600 fill-amber-500" />
                <span>🔥 Learning Streak</span>
              </div>
              <span className="font-bold text-amber-700 dark:text-amber-400">
                {stats.learnerStreak} Days Streak
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-purple-100/80 dark:border-slate-700">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>✅ Tasks Completed</span>
              </div>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {stats.learnerCompletedTasksThisWeek} Tasks This Week
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-purple-100/80 dark:border-slate-700">
              <div className="flex items-center space-x-2">
                <Award className="w-4 h-4 text-pink-500" />
                <span>🎁 Unlocked Rewards</span>
              </div>
              <span className="font-bold text-pink-600 dark:text-pink-400">
                Daily Surprises Active
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
