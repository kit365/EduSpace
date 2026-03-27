import * as React from "react";
import { cn } from "./utils";

interface TimePickerScrollProps {
  value: string; // HH:mm
  onChange: (value: string) => void;
  minTime?: string; // HH:mm (opening time or now time)
  maxTime?: string; // HH:mm (closing time)
}

export function TimePickerScroll({
  value,
  onChange,
  minTime,
  maxTime,
}: TimePickerScrollProps) {
  const [hour, minute] = value.split(":").map(Number);
  
  const hourContainerRef = React.useRef<HTMLDivElement>(null);
  const minuteContainerRef = React.useRef<HTMLDivElement>(null);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  // Scroll into view whenever hour or minute changes
  React.useEffect(() => {
    const scrollToSelected = (container: HTMLDivElement | null) => {
      if (!container) return;
      const selected = container.querySelector('[data-selected="true"]');
      if (selected) {
        selected.scrollIntoView({ block: "center", behavior: "smooth" });
      }
    };

    // Delay slightly to ensure content is rendered and popover position is stable
    const timer = setTimeout(() => {
      scrollToSelected(hourContainerRef.current);
      scrollToSelected(minuteContainerRef.current);
    }, 100);

    return () => clearTimeout(timer);
  }, [hour, minute]);

  const isTimeDisabled = (h: number, m: number) => {
    const timeStr = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    if (minTime && timeStr < minTime) return true;
    if (maxTime && timeStr > maxTime) return true;
    return false;
  };

  const isHourDisabled = (h: number) => {
    // An hour is disabled if ALL minutes in it are disabled
    return !minutes.some(m => !isTimeDisabled(h, m));
  };

  const handleHourSelect = (h: number) => {
    // When hour changes, try to keep the same minute if valid, else pick first valid one
    let targetMinute = minute;
    if (isTimeDisabled(h, minute)) {
      const firstValidMinute = minutes.find(m => !isTimeDisabled(h, m));
      if (firstValidMinute !== undefined) targetMinute = firstValidMinute;
    }
    const nextValue = `${String(h).padStart(2, "0")}:${String(targetMinute).padStart(2, "0")}`;
    onChange(nextValue);
  };

  const handleMinuteSelect = (m: number) => {
    const nextValue = `${String(hour).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    onChange(nextValue);
  };

  return (
    <div className="flex h-72 w-full gap-2 p-2 select-none" onWheel={(e) => e.stopPropagation()}>
      {/* Hours Column */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-2 text-center">GIỜ</div>
        <div 
          ref={hourContainerRef}
          className="flex-1 overflow-y-auto no-scrollbar scroll-smooth"
        >
          <div className="flex flex-col gap-1 p-1">
            {hours.map((h) => {
              const isDisabled = isHourDisabled(h);
              const isSelected = hour === h;
              return (
                <button
                  key={h}
                  type="button"
                  data-selected={isSelected}
                  disabled={isDisabled}
                  onClick={() => handleHourSelect(h)}
                  className={cn(
                    "w-full px-4 py-2 relative rounded-xl text-center font-bold text-sm transition-all shrink-0",
                    isSelected
                      ? "bg-red-50 text-red-600 shadow-sm ring-1 ring-red-100"
                      : "hover:bg-gray-50 text-gray-400 hover:text-gray-900",
                    isDisabled && "opacity-20 cursor-not-allowed grayscale"
                  )}
                >
                  {String(h).padStart(2, "0")}
                </button>
              );
            })}
            <div className="h-24 shrink-0" /> {/* Spacer for better scrolling */}
          </div>
        </div>
      </div>

      <div className="w-px bg-gray-100 my-8 shrink-0" />

      {/* Minutes Column */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-2 text-center">PHÚT</div>
        <div 
          ref={minuteContainerRef}
          className="flex-1 overflow-y-auto no-scrollbar scroll-smooth"
        >
          <div className="flex flex-col gap-1 p-1">
            {minutes.map((m) => {
              const isDisabled = isTimeDisabled(hour, m);
              const isSelected = minute === m;
              return (
                <button
                  key={m}
                  type="button"
                  data-selected={isSelected}
                  disabled={isDisabled}
                  onClick={() => handleMinuteSelect(m)}
                  className={cn(
                    "w-full px-4 py-2 relative rounded-xl text-center font-bold text-sm transition-all shrink-0",
                    isSelected
                      ? "bg-red-50 text-red-600 shadow-sm ring-1 ring-red-100"
                      : "hover:bg-gray-50 text-gray-400 hover:text-gray-900",
                    isDisabled && "opacity-20 cursor-not-allowed grayscale"
                  )}
                >
                  {String(m).padStart(2, "0")}
                </button>
              );
            })}
            <div className="h-24 shrink-0" /> {/* Spacer for better scrolling */}
          </div>
        </div>
      </div>
    </div>
  );
}
