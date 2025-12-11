
import React, { useState, useEffect } from 'react';

interface TimePickerProps {
  value: Date;
  onChange: (date: Date) => void;
}

const TimePicker: React.FC<TimePickerProps> = ({ value, onChange }) => {
  const [mode, setMode] = useState<'HOUR' | 'MINUTE'>('HOUR');
  const [date, setDate] = useState(value);

  useEffect(() => {
    onChange(date);
  }, [date]);

  const handleHourClick = (hour: number) => {
    const newDate = new Date(date);
    const isPM = newDate.getHours() >= 12;
    let newHour = hour;
    if (isPM && hour !== 12) {
      newHour += 12;
    } else if (!isPM && hour === 12) {
      newHour = 0;
    }
    newDate.setHours(newHour);
    setDate(newDate);
    setMode('MINUTE');
  };

  const handleMinuteClick = (minute: number) => {
    const newDate = new Date(date);
    newDate.setMinutes(minute);
    setDate(newDate);
  };

  const togglePeriod = (period: 'AM' | 'PM') => {
    const newDate = new Date(date);
    const currentHour = newDate.getHours();
    if (period === 'PM' && currentHour < 12) {
      newDate.setHours(currentHour + 12);
    } else if (period === 'AM' && currentHour >= 12) {
      newDate.setHours(currentHour - 12);
    }
    setDate(newDate);
  };

  const getClockNumbers = () => {
    if (mode === 'HOUR') {
      return Array.from({ length: 12 }, (_, i) => i + 1);
    }
    return Array.from({ length: 12 }, (_, i) => i * 5);
  };

  const currentHour = date.getHours();
  const currentMinute = date.getMinutes();
  const isPM = currentHour >= 12;
  let displayHour = currentHour % 12;
  if (displayHour === 0) displayHour = 12;

  const rotationAngle = mode === 'HOUR'
    ? (displayHour * 30) - 90
    : (currentMinute * 6) - 90;

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center mb-6">
        <button
          type="button"
          onClick={() => setMode('HOUR')}
          className={`text-5xl font-bold p-2 rounded-lg transition-colors ${mode === 'HOUR' ? 'bg-primary/10 text-primary' : 'text-gray-400'}`}
        >
          {String(displayHour).padStart(2, '0')}
        </button>
        <span className="text-5xl font-bold text-gray-300 mx-2">:</span>
        <button
          type="button"
          onClick={() => setMode('MINUTE')}
          className={`text-5xl font-bold p-2 rounded-lg transition-colors ${mode === 'MINUTE' ? 'bg-primary/10 text-primary' : 'text-gray-400'}`}
        >
          {String(currentMinute).padStart(2, '0')}
        </button>
        <div className="ml-4 flex flex-col space-y-1">
          <button
            type="button"
            onClick={() => togglePeriod('AM')}
            className={`px-3 py-1 rounded-md text-sm font-bold ${!isPM ? 'bg-primary text-white shadow' : 'bg-gray-200 text-gray-600'}`}
          >
            AM
          </button>
          <button
            type="button"
            onClick={() => togglePeriod('PM')}
            className={`px-3 py-1 rounded-md text-sm font-bold ${isPM ? 'bg-primary text-white shadow' : 'bg-gray-200 text-gray-600'}`}
          >
            PM
          </button>
        </div>
      </div>

      <div className="relative w-64 h-64 rounded-full bg-gray-100 flex items-center justify-center">
        {/* Selector Arm */}
        <div
          className="absolute w-1/2 h-1 bg-primary/40 rounded-full transition-transform duration-300 ease-in-out"
          style={{
              transform: `rotate(${rotationAngle}deg)`,
              transformOrigin: 'left center'
          }}
        ></div>

        {/* Central Point */}
        <div className="absolute w-3 h-3 bg-primary rounded-full z-10"></div>

        {getClockNumbers().map((num, i) => {
          const angle = (i * 30) - 90; // 360/12 = 30 degrees per number, offset by -90
          const x = 100 * Math.cos(angle * Math.PI / 180);
          const y = 100 * Math.sin(angle * Math.PI / 180);
          const isSelected = (mode === 'HOUR' && num === displayHour) || (mode === 'MINUTE' && num === currentMinute);
          return (
            <button
              key={num}
              type="button"
              onClick={() => mode === 'HOUR' ? handleHourClick(num) : handleMinuteClick(num)}
              className={`absolute w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors text-sm z-20 ${
                isSelected ? 'bg-primary text-white' : 'text-gray-700 hover:bg-primary/5'
              }`}
              style={{
                transform: `translate(${x}px, ${y}px)`
              }}
            >
              {mode === 'MINUTE' ? String(num).padStart(2, '0') : num}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TimePicker;