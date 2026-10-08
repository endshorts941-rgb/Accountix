import React, { useRef } from 'react';
import { Calendar } from 'lucide-react';
import { getCurrentDateDDMMYYYY, ddmmToIsoDate, isoToDdmmDate } from '../../utils/dateUtils';

interface DateInputProps {
  value: string; // in DD/MM/YYYY
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

export const DateInput: React.FC<DateInputProps> = ({
  value,
  onChange,
  className = '',
  placeholder = 'DD/MM/YYYY',
  disabled = false,
}) => {
  const hiddenNativePickerRef = useRef<HTMLInputElement>(null);

  // Fallback to current date if value is missing
  const displayValue = value || getCurrentDateDDMMYYYY();
  const isoValue = ddmmToIsoDate(displayValue);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value;
    onChange(raw);
  };

  const handleNativePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      const formatted = isoToDdmmDate(e.target.value);
      onChange(formatted);
    }
  };

  const openCalendar = () => {
    if (hiddenNativePickerRef.current && !disabled) {
      try {
        if ('showPicker' in HTMLInputElement.prototype) {
          hiddenNativePickerRef.current.showPicker();
        } else {
          hiddenNativePickerRef.current.focus();
        }
      } catch {
        hiddenNativePickerRef.current.focus();
      }
    }
  };

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      {/* Typed Input showing DD/MM/YYYY */}
      <input
        type="text"
        value={displayValue}
        placeholder={placeholder}
        disabled={disabled}
        onChange={handleTextChange}
        className="w-28 text-right font-mono font-medium text-slate-900 bg-transparent border-0 p-0 text-xs focus:ring-0 focus:outline-none cursor-pointer hover:text-blue-700 transition-colors"
        title="Date format: DD/MM/YYYY (Click calendar icon to pick)"
      />

      {/* Mini Calendar Icon trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={openCalendar}
        className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
        title="Open calendar to pick date"
      >
        <Calendar className="w-3.5 h-3.5" />
      </button>

      {/* Hidden native date input for the browser calendar picker widget */}
      <input
        ref={hiddenNativePickerRef}
        type="date"
        value={isoValue}
        onChange={handleNativePickerChange}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      />
    </div>
  );
};
