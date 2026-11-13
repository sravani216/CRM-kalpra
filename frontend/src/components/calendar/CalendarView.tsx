import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { TaskSchedule } from '../../types';

interface CalendarViewProps {
  tasks: TaskSchedule[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  title?: string;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  tasks,
  selectedDate,
  onSelectDate,
  title = 'Schedule Overview',
}) => {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date(selectedDate));

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const totalDays = daysInMonth(year, month);
  const startDay = (firstDayOfMonth(year, month) + 6) % 7; // Align to Monday start

  const prevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const isToday = (d: number) => {
    const today = new Date();
    return (
      today.getDate() === d &&
      today.getMonth() === month &&
      today.getFullYear() === year
    );
  };

  const isSelected = (d: number) => {
    return (
      selectedDate.getDate() === d &&
      selectedDate.getMonth() === month &&
      selectedDate.getFullYear() === year
    );
  };

  // Get tasks count for a specific date in current month
  const getTasksForDay = (d: number) => {
    return tasks.filter((t) => {
      const taskDate = new Date(t.scheduledDate);
      return (
        taskDate.getDate() === d &&
        taskDate.getMonth() === month &&
        taskDate.getFullYear() === year
      );
    });
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="bg-white rounded-2xl border border-pink-100/80 p-5 shadow-soft">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-pink-100/70 flex items-center justify-center text-pink-600">
            <CalendarIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">{title}</h3>
            <p className="text-xs text-slate-400">
              {monthNames[month]} {year}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={prevMonth}
            className="p-1.5 text-slate-400 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              const now = new Date();
              setCurrentMonth(now);
              onSelectDate(now);
            }}
            className="px-2.5 py-1 text-xs font-semibold text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
          >
            Today
          </button>
          <button
            onClick={nextMonth}
            className="p-1.5 text-slate-400 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {weekDays.map((w) => (
          <div key={w} className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider py-1">
            {w}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty slots before month start */}
        {Array.from({ length: startDay }).map((_, i) => (
          <div key={`empty-${i}`} className="h-10 rounded-xl" />
        ))}

        {/* Days of current month */}
        {Array.from({ length: totalDays }).map((_, i) => {
          const dayNumber = i + 1;
          const dayTasks = getTasksForDay(dayNumber);
          const hasMeetings = dayTasks.some((t) => t.type === 'CLIENT_MEETING');
          const hasFollowUps = dayTasks.some((t) => t.type === 'FOLLOW_UP');

          const active = isSelected(dayNumber);
          const today = isToday(dayNumber);

          return (
            <button
              key={`day-${dayNumber}`}
              onClick={() => onSelectDate(new Date(year, month, dayNumber))}
              className={`h-11 rounded-xl flex flex-col items-center justify-center relative transition-all duration-150 ${
                active
                  ? 'bg-pink-500 text-white font-bold shadow-sm shadow-pink-300'
                  : today
                  ? 'bg-pink-50 text-pink-700 font-bold border border-pink-200'
                  : 'text-slate-700 hover:bg-pink-50/60 font-medium'
              }`}
            >
              <span className="text-xs">{dayNumber}</span>
              {/* Dots for tasks */}
              {dayTasks.length > 0 && (
                <div className="flex space-x-1 mt-0.5">
                  {hasMeetings && (
                    <span
                      className={`w-1 h-1 rounded-full ${
                        active ? 'bg-white' : 'bg-pink-500'
                      }`}
                    />
                  )}
                  {hasFollowUps && (
                    <span
                      className={`w-1 h-1 rounded-full ${
                        active ? 'bg-white/80' : 'bg-purple-400'
                      }`}
                    />
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

