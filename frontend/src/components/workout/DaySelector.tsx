import { useRef, useEffect } from 'react';
import { DAYS, Day } from '../../data/workoutData';

const SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const COPIES = 5;
const LOOPED = Array.from({ length: COPIES }, () => [...DAYS]).flat();
const MIDDLE_OFFSET = 2 * DAYS.length;

interface DaySelectorProps {
  selected: Day;
  onSelect: (day: Day) => void;
}

export const DaySelector = ({ selected, onSelect }: DaySelectorProps) => {
  const todayIndex = (new Date().getDay() + 6) % 7;
  const containerRef = useRef<HTMLDivElement>(null);
  // One glow element per LOOPED index — every copy of the selected day gets its own
  // underglow, so scrolling never teleports a single shared glow between copies.
  const glowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const selectedIndex = DAYS.indexOf(selected);
  const isJumping = useRef(false);
  const isMounted = useRef(false);

  // Position every mounted glow over its own pill
  const updateGlows = () => {
    const el = containerRef.current;
    if (!el) return;
    for (let i = 0; i < LOOPED.length; i++) {
      const glow = glowRefs.current[i];
      if (!glow) continue;
      const pill = el.children[i] as HTMLElement | undefined;
      if (!pill) continue;
      const pillCenter = pill.offsetLeft + pill.offsetWidth / 2 - el.scrollLeft;
      glow.style.left = `${pillCenter}px`;
      glow.style.width = `${pill.offsetWidth}px`;
    }
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (!isMounted.current) {
      // Instant scroll on mount — no animation
      isMounted.current = true;
      const target = el.children[selectedIndex + MIDDLE_OFFSET] as HTMLElement;
      if (!target) return;
      const elRect = el.getBoundingClientRect();
      const tRect = target.getBoundingClientRect();
      el.scrollLeft += tRect.left - elRect.left - (elRect.width - tRect.width) / 2;
      requestAnimationFrame(updateGlows);
      return;
    }

    // Scroll whichever copy of this day is closest to the current viewport center
    const viewCenter = el.scrollLeft + el.clientWidth / 2;
    let closest: HTMLElement | null = null;
    let minDist = Infinity;
    LOOPED.forEach((day, i) => {
      if (day !== selected) return;
      const pill = el.children[i] as HTMLElement | undefined;
      if (!pill) return;
      const dist = Math.abs(pill.offsetLeft + pill.offsetWidth / 2 - viewCenter);
      if (dist < minDist) { minDist = dist; closest = pill; }
    });
    requestAnimationFrame(updateGlows);
    (closest as HTMLElement | null)?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [selected, selectedIndex]);

  // Infinite loop: jump when scrolled into first or last copy
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onScroll = () => {
      updateGlows();
      if (isJumping.current) return;
      const oneSet = el.scrollWidth / COPIES;
      if (el.scrollLeft < oneSet) {
        isJumping.current = true;
        el.scrollLeft += oneSet * 2;
        requestAnimationFrame(() => { isJumping.current = false; });
      } else if (el.scrollLeft + el.clientWidth > oneSet * (COPIES - 1)) {
        isJumping.current = true;
        el.scrollLeft -= oneSet * 2;
        requestAnimationFrame(() => { isJumping.current = false; });
      }
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [selected]);

  // Keep glows in sync when the viewport resizes (pill widths/positions change)
  useEffect(() => {
    const onResize = () => updateGlows();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [selected]);

  const glowColor = DAYS[todayIndex] === selected ? 'bg-amber-400/60' : 'bg-blue-500/50';

  return (
    <div className="relative overflow-hidden pt-4 sm:pt-0 pb-4">
      {/* Gradient fades at both ends */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-10 z-10 bg-gradient-to-r from-slate-900 to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-10 z-10 bg-gradient-to-l from-slate-900 to-transparent" />

      <div
        ref={containerRef}
        className="relative z-[3] flex gap-2 overflow-x-auto pt-1 pb-1 px-1 no-scrollbar"
      >
        {LOOPED.map((day, i) => {
          const dayIndex = i % 7;
          const isSelected = day === selected;
          const isToday = dayIndex === todayIndex;
          return (
            <button
              key={i}
              onClick={() => onSelect(day)}
              className={`
                relative flex-shrink-0 px-4 sm:px-5 py-2 rounded-full text-sm font-medium
                transition-all duration-200
                ${isSelected
                  ? isToday
                    ? 'bg-amber-500 text-white'
                    : 'bg-blue-600 text-white'
                  : 'bg-slate-800/60 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                }
              `}
            >
              <span className="sm:hidden">{SHORT[dayIndex]}</span>
              <span className="hidden sm:inline">{day}</span>
              {isToday && !isSelected && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-amber-400 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Underglows — one per selected-day copy. Each sits BEHIND the scroll container
          (z-[1] < z-[3]) so the top of the glow is hidden behind its pill and the
          bottom glows out below. Position is kept in sync by updateGlows(). */}
      {LOOPED.map((day, i) => {
        if (day !== selected) return null;
        return (
          <div
            key={`glow-${i}`}
            ref={(el) => { glowRefs.current[i] = el; }}
            className="pointer-events-none absolute -translate-x-1/2 bottom-4 z-[1] w-14"
          >
            <div className={`w-full h-8 rounded-full blur-sm ${glowColor}`} />
          </div>
        );
      })}
    </div>
  );
};
