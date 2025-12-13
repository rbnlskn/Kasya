
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DayPickerProps {
  selectedDate: Date;
  onChange: (date: Date) => void;
  onClose?: () => void;
}

const DayPicker: React.FC<DayPickerProps> = ({ selectedDate, onChange, onClose }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleDateClick = (day: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    newDate.setHours(selectedDate.getHours());
    newDate.setMinutes(selectedDate.getMinutes());
    newDate.setSeconds(selectedDate.getSeconds());
    onChange(newDate);
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const padding = Array.from({ length: firstDay }, (_, i) => i);

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (day: number) => {
    return (
      day === selectedDate.getDate() &&
      currentMonth.getMonth() === selectedDate.getMonth() &&
      currentMonth.getFullYear() === selectedDate.getFullYear()
    );
  };

  return (
    <div className="w-full bg-white p-4 rounded-3xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-800">
          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h2>
        <div className="flex space-x-1">
          <button onClick={handlePrevMonth} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 text-gray-600">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={handleNextMonth} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 text-gray-600">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 mb-2 text-center">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={i} className="text-xs font-bold text-gray-400">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {padding.map((_, i) => (
          <div key={`padding-${i}`} />
        ))}
        {days.map((day) => (
          <button
            key={day}
            onClick={() => handleDateClick(day)}
            className={`
              h-10 w-10 flex items-center justify-center rounded-2xl text-sm font-bold transition-all active:scale-95
              ${isSelected(day)
                ? 'bg-primary text-white shadow-lg shadow-primary/30'
                : isToday(day)
                  ? 'bg-primary/10 text-primary'
                  : 'text-gray-700 hover:bg-slate-100'}
            `}
          >
            {day}
          </button>
        ))}
      </div>

      <div className="flex justify-between mt-6 text-sm font-bold">
          <button onClick={() => { const today = new Date(); onChange(today); if (onClose) onClose(); }} className="text-gray-500 hover:text-primary">Today</button>
          <button onClick={onClose} className="text-primary">Done</button>
      </div>
    </div>
  );
};

export default DayPicker;
