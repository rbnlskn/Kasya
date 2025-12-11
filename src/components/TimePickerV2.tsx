
import React, { useState, useEffect, useRef } from 'react';

interface TimePickerV2Props {
  value: Date;
  onChange: (date: Date) => void;
  onClose?: () => void;
}

const TimePickerV2: React.FC<TimePickerV2Props> = ({ value, onChange, onClose }) => {
  const [mode, setMode] = useState<'HOUR' | 'MINUTE'>('HOUR');
  const [date, setDate] = useState(value);
  const clockRef = useRef<HTMLDivElement>(null);

  // Sync internal state if prop value changes externally
  useEffect(() => {
    setDate(value);
  }, [value]);

  const handleTimeChange = (newDate: Date) => {
    setDate(newDate);
    onChange(newDate);
  };

  const getAngle = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    if (!clockRef.current) return 0;
    const rect = clockRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as MouseEvent | React.MouseEvent).clientX;
      clientY = (e as MouseEvent | React.MouseEvent).clientY;
    }

    const x = clientX - centerX;
    const y = clientY - centerY;

    let angle = Math.atan2(y, x) * (180 / Math.PI) + 90;
    if (angle < 0) angle += 360;
    return angle;
  };

  const handleInteraction = (e: React.MouseEvent | React.TouchEvent, isFinal = false) => {
    e.preventDefault(); // Prevent scrolling while interacting
    const angle = getAngle(e);

    const newDate = new Date(date);

    if (mode === 'HOUR') {
      let hour = Math.round(angle / 30);
      if (hour === 0) hour = 12;
      if (hour > 12) hour -= 12;

      const isPM = newDate.getHours() >= 12;

      // Handle 12 AM/PM cases carefully
      if (isPM) {
        if (hour === 12) newDate.setHours(12); // 12 PM
        else newDate.setHours(hour + 12);      // 1 PM -> 13
      } else {
        if (hour === 12) newDate.setHours(0);  // 12 AM -> 0
        else newDate.setHours(hour);           // 1 AM -> 1
      }

      handleTimeChange(newDate);
      if (isFinal) setMode('MINUTE');

    } else {
      // Minute mode: Granular (6 degrees per minute)
      let minute = Math.round(angle / 6);
      if (minute === 60) minute = 0;
      newDate.setMinutes(minute);
      handleTimeChange(newDate);
    }
  };

  const togglePeriod = (period: 'AM' | 'PM') => {
    const newDate = new Date(date);
    const currentHour = newDate.getHours();

    if (period === 'AM' && currentHour >= 12) {
      newDate.setHours(currentHour - 12);
    } else if (period === 'PM' && currentHour < 12) {
      newDate.setHours(currentHour + 12);
    }
    handleTimeChange(newDate);
  };

  const currentHour = date.getHours();
  const currentMinute = date.getMinutes();
  const isPM = currentHour >= 12;

  // Display hour (1-12)
  let displayHour = currentHour % 12;
  if (displayHour === 0) displayHour = 12;

  // Render Hand
  const getHandRotation = () => {
    if (mode === 'HOUR') {
        // 30 deg per hour, plus 0.5 deg per minute for smoothness (optional, usually discrete for selection)
        // Sticking to discrete for selection clarity
        const h = displayHour === 12 ? 0 : displayHour;
        return h * 30;
    } else {
        return currentMinute * 6;
    }
  };

  return (
    <div className="flex flex-col items-center p-4 bg-surface dark:bg-surface rounded-3xl w-full max-w-xs mx-auto">
      {/* Time Display */}
      <div className="flex items-end justify-center gap-2 mb-8">
        <button
          onClick={() => setMode('HOUR')}
          className={`text-6xl font-bold leading-none transition-colors ${
            mode === 'HOUR' ? 'text-primary' : 'text-text-secondary dark:text-text-secondary opacity-50'
          }`}
        >
          {String(displayHour).padStart(2, '0')}
        </button>
        <span className="text-6xl font-bold leading-none text-text-secondary dark:text-text-secondary pb-1">:</span>
        <button
          onClick={() => setMode('MINUTE')}
          className={`text-6xl font-bold leading-none transition-colors ${
            mode === 'MINUTE' ? 'text-primary' : 'text-text-secondary dark:text-text-secondary opacity-50'
          }`}
        >
          {String(currentMinute).padStart(2, '0')}
        </button>

        <div className="flex flex-col gap-1 ml-2 mb-1">
           <button
             onClick={() => togglePeriod('AM')}
             className={`text-sm font-bold px-2 py-1 rounded-lg ${!isPM ? 'bg-warning text-white shadow-sm' : 'text-text-secondary bg-surface border border-border'}`}
           >
             AM
           </button>
           <button
             onClick={() => togglePeriod('PM')}
             className={`text-sm font-bold px-2 py-1 rounded-lg ${isPM ? 'bg-warning text-white shadow-sm' : 'text-text-secondary bg-surface border border-border'}`}
           >
             PM
           </button>
        </div>
      </div>

      {/* Clock Face */}
      <div
        ref={clockRef}
        className="relative w-64 h-64 rounded-full bg-app-bg dark:bg-black/20 border-4 border-surface shadow-inner touch-none cursor-pointer"
        onMouseDown={(e) => handleInteraction(e)}
        onMouseMove={(e) => { if(e.buttons === 1) handleInteraction(e); }}
        onMouseUp={(e) => handleInteraction(e, true)}
        onTouchStart={(e) => handleInteraction(e)}
        onTouchMove={(e) => handleInteraction(e)}
        onTouchEnd={(e) => handleInteraction(e, true)} // Note: TouchEnd doesn't give coords usually, rely on last move
      >
        {/* Center Dot */}
        <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-primary rounded-full transform -translate-x-1/2 -translate-y-1/2 z-20"></div>

        {/* Clock Hand */}
        <div
           className="absolute top-1/2 left-1/2 h-[40%] w-[2px] bg-primary origin-bottom z-10 pointer-events-none"
           style={{ transform: `translateX(-50%) rotate(${getHandRotation()}deg) translateY(-100%)` }}
        >
           {/* Hand Tip */}
           <div className="absolute top-0 left-1/2 w-8 h-8 bg-primary rounded-full transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center text-white font-bold text-sm shadow-md">
             {mode === 'HOUR' ? displayHour : currentMinute}
           </div>
        </div>

        {/* Numbers */}
        {mode === 'HOUR' && [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((num, i) => {
            const angle = (i * 30);
            const radius = 100; // slightly inside
            const x = radius * Math.sin(angle * Math.PI / 180);
            const y = -radius * Math.cos(angle * Math.PI / 180);
            return (
                <div
                   key={num}
                   className={`absolute w-8 h-8 flex items-center justify-center text-md font-bold text-text-secondary dark:text-text-secondary pointer-events-none`}
                   style={{
                       left: '50%', top: '50%',
                       transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`
                   }}
                >
                    {num}
                </div>
            );
        })}

        {mode === 'MINUTE' && [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((num, i) => {
             const angle = (i * 30);
             const radius = 100;
             const x = radius * Math.sin(angle * Math.PI / 180);
             const y = -radius * Math.cos(angle * Math.PI / 180);
             return (
                 <div
                    key={num}
                    className={`absolute w-8 h-8 flex items-center justify-center text-xs font-bold text-text-secondary dark:text-text-secondary pointer-events-none`}
                    style={{
                        left: '50%', top: '50%',
                        transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`
                    }}
                 >
                     {num}
                 </div>
             );
        })}

      </div>

      <p className="mt-6 text-sm text-text-secondary dark:text-text-secondary font-medium">
         {mode === 'HOUR' ? 'Select Hour' : 'Select Minute'}
      </p>
    </div>
  );
};

export default TimePickerV2;
