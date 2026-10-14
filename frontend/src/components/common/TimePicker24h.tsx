import React, { useState, useRef, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface TimePicker24hProps {
  value: string; // e.g. "14:00"
  onChange: (time: string) => void;
  required?: boolean;
  className?: string;
}

export const TimePicker24h: React.FC<TimePicker24hProps> = ({
  value,
  onChange,
  required,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hourListRef = useRef<HTMLDivElement>(null);
  const minuteListRef = useRef<HTMLDivElement>(null);

  // Parse current value (defaults to 14:00)
  const [hourStr, minuteStr] = (value && value.includes(':') ? value.split(':') : ['14', '00']);
  const currentHour = hourStr.padStart(2, '0');
  const currentMinute = minuteStr ? minuteStr.padStart(2, '0') : '00';

  // Hours 00 -> 23 (24h format)
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  // Minutes in 5-min intervals: 00, 05, 10, ..., 55
  const minutes = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0'));

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Auto scroll into view for the selected hour and minute
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        const selectedHourEl = hourListRef.current?.querySelector('[data-selected="true"]');
        if (selectedHourEl) {
          selectedHourEl.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }
        const selectedMinuteEl = minuteListRef.current?.querySelector('[data-selected="true"]');
        if (selectedMinuteEl) {
          selectedMinuteEl.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }
      }, 50);
    }
  }, [isOpen]);

  const handleSelectHour = (h: string) => {
    onChange(`${h}:${currentMinute}`);
  };

  const handleSelectMinute = (m: string) => {
    onChange(`${currentHour}:${m}`);
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus-within:ring-2 focus-within:ring-sky-500 flex items-center justify-between cursor-pointer transition-colors hover:border-slate-300 ${className || ''}`}
      >
        <input
          type="text"
          required={required}
          value={value || '14:00'}
          onChange={(e) => onChange(e.target.value)}
          placeholder="14:00"
          className="bg-transparent border-none outline-none font-semibold text-slate-800 text-xs w-full cursor-pointer"
        />
        <Clock className="w-4 h-4 text-slate-400 shrink-0 ml-1.5" />
      </div>

      {isOpen && (
        <div className="absolute top-full mt-1.5 right-0 z-50 bg-white border border-slate-200 rounded-xl shadow-2xl p-3 w-60 animate-fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
            <span className="text-[11px] font-bold text-slate-600">Khung 24 Giờ</span>
            <span className="text-xs font-extrabold text-sky-700 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-md">
              {currentHour}:{currentMinute}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center">
            {/* Hour Column: 00 -> 23h */}
            <div>
              <div className="text-[10px] font-semibold text-slate-500 mb-1">Giờ (00 - 23h)</div>
              <div
                ref={hourListRef}
                className="max-h-44 overflow-y-auto space-y-1 p-1 bg-slate-50 rounded-lg border border-slate-200/80 scrollbar-thin"
              >
                {hours.map((h) => {
                  const isSelected = h === currentHour;
                  return (
                    <button
                      key={h}
                      type="button"
                      data-selected={isSelected}
                      onClick={() => handleSelectHour(h)}
                      className={`w-full py-1 text-xs rounded-md font-medium transition-colors ${
                        isSelected
                          ? 'bg-sky-600 text-white font-bold shadow-xs'
                          : 'text-slate-700 hover:bg-slate-200/80'
                      }`}
                    >
                      {h}:00
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Minute Column */}
            <div>
              <div className="text-[10px] font-semibold text-slate-500 mb-1">Phút</div>
              <div
                ref={minuteListRef}
                className="max-h-44 overflow-y-auto space-y-1 p-1 bg-slate-50 rounded-lg border border-slate-200/80 scrollbar-thin"
              >
                {minutes.map((m) => {
                  const isSelected = m === currentMinute;
                  return (
                    <button
                      key={m}
                      type="button"
                      data-selected={isSelected}
                      onClick={() => handleSelectMinute(m)}
                      className={`w-full py-1 text-xs rounded-md font-medium transition-colors ${
                        isSelected
                          ? 'bg-sky-600 text-white font-bold shadow-xs'
                          : 'text-slate-700 hover:bg-slate-200/80'
                      }`}
                    >
                      {m}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick presets & Close */}
          <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between">
            <div className="flex gap-1 text-[10px]">
              {['09:00', '14:00', '18:00', '20:30'].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => onChange(preset)}
                  className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-medium text-[10px]"
                >
                  {preset}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-[11px] font-bold text-sky-600 hover:text-sky-700 px-2 py-0.5"
            >
              Xong
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
