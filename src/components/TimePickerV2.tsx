
import React, { useState, useEffect, useMemo } from 'react';
import { Clock, Check } from 'lucide-react';

interface TimePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  onClose?: () => void;
}

const TimePickerV2: React.FC<TimePickerProps> = ({ value, onChange, onClose }) => {
  const [date, setDate] = useState(value);
  const [hour, setHour] = useState(value.getHours());
  const [minute, setMinute] = useState(value.getMinutes());
  const [isHourInput, setIsHourInput] = useState(true);

  const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = parseInt(e.target.value);
    if (isNaN(val) || val < 0) val = 0;
    if (val > 23) val = 23;
    setHour(val);
  };

  const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = parseInt(e.target.value);
    if (isNaN(val) || val < 0) val = 0;
    if (val > 59) val = 59;
    setMinute(val);
  };

  const handleSetTime = () => {
    const newDate = new Date(date);
    newDate.setHours(hour, minute);
    setDate(newDate);
    onChange(newDate);
    if(onClose) onClose();
  };

  return (
    <div className="w-full">
        <div className="flex justify-center items-center gap-2 mb-6">
            <input
                type="number"
                value={String(hour).padStart(2, '0')}
                onChange={handleHourChange}
                className="w-24 text-center text-4xl font-bold bg-primary/10 text-primary rounded-xl p-2 outline-none border-2 border-transparent focus:border-primary"
            />
            <span className="text-4xl font-bold text-gray-300 pb-1">:</span>
            <input
                type="number"
                value={String(minute).padStart(2, '0')}
                onChange={handleMinuteChange}
                className="w-24 text-center text-4xl font-bold bg-primary/10 text-primary rounded-xl p-2 outline-none border-2 border-transparent focus:border-primary"
            />
        </div>

        <div className="grid grid-cols-4 gap-2 mb-4 text-center">
            {[5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 0].map(m => (
                <button
                    key={m}
                    type="button"
                    onClick={() => setMinute(m)}
                    className="p-2 rounded-lg bg-slate-100 text-slate-700 font-medium hover:bg-primary/10 hover:text-primary transition-colors"
                >
                    :{String(m).padStart(2, '0')}
                </button>
            ))}
        </div>

        <button
            type="button"
            onClick={handleSetTime}
            className="w-full bg-primary text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary/30 mt-2 flex items-center justify-center gap-2"
        >
            <Check className="w-5 h-5"/>
            Set Time
        </button>
    </div>
  );
};
export default TimePickerV2;
