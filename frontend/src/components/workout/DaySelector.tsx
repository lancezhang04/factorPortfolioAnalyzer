import { useRef, useEffect } from 'react';
import { DAYS, Day } from '../../data/workoutData';

const SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface DaySelectorProps {
  selected: Day;
  onSelect: (day: Day) => void;
}

export const DaySelector = ({ selected, onSelect }: DaySelectorProps) => {
  const todayIndex = (new Date().getDay() + 6) % 7;
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedIndex = DAYS.indexOf(selected);

  // Scroll selected day into view on mount / change
  useEffect(() => {
    const el = containerRef.current?.children[selectedIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [selectedIndex]);

  return (
    <div className="relative">
      {/* Day pills — horizontally scrollable on mobile */}
      <div
        ref={containerRef}
        className="flex gap-2 overflow-x-auto sm:justify-center pt-1 pb-8 px-1 no-scrollbar"
      >
        {DAYS.map((day, i) => {
          const isSelected = day === selected;
          const isToday = i === todayIndex;
          return (
            <button
              key={day}
              onClick={() => onSelect(day)}
              className={`
                relative flex-shrink-0 px-4 sm:px-5 py-2 rounded-full text-sm font-medium
                transition-all duration-200
                ${isSelected
                  ? isToday
                    ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                    : 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'bg-slate-800/60 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                }
              `}
            >
              <span className="sm:hidden">{SHORT[i]}</span>
              <span className="hidden sm:inline">{day}</span>
              {isToday && !isSelected && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-amber-400 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
