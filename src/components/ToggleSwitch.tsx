
import React from 'react';

interface ToggleSwitchProps {
  isChecked: boolean;
  onChange: (isChecked: boolean) => void;
  label: string;
  description?: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ isChecked, onChange, label, description }) => {
  const handleToggle = () => {
    onChange(!isChecked);
  };

  return (
    <div className="bg-slate-100 p-3 rounded-2xl border-2 border-transparent">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-bold text-text-primary flex-1 block">{label}</label>
          {description && <p className="text-xs text-slate-500 mt-1">{description}</p>}
        </div>
        <div
          onClick={handleToggle}
          className={`relative w-11 h-6 flex items-center rounded-lg cursor-pointer transition-colors ${
            isChecked ? 'bg-primary' : 'bg-slate-300'
          }`}
        >
          <div
            className={`absolute left-0 w-5 h-5 bg-white rounded-md shadow-md transform transition-transform ${
              isChecked ? 'translate-x-5' : 'translate-x-0.5'
            }`}
          />
        </div>
      </div>
    </div>
  );
};

export default ToggleSwitch;
