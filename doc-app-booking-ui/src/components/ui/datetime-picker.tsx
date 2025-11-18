import * as React from "react";
import { cn } from "./utils";
import { DatePicker } from "./date-picker";
import { TimePicker } from "./time-picker";

export interface DateTimePickerProps {
  dateValue?: string;
  timeValue?: string;
  onDateChange?: (date: string) => void;
  onTimeChange?: (time: string) => void;
  onDateTimeChange?: (dateTime: string) => void;
  dateClassName?: string;
  timeClassName?: string;
  containerClassName?: string;
  disabled?: boolean;
  minDate?: string;
  maxDate?: string;
  label?: string;
  required?: boolean;
}

const DateTimePicker = React.forwardRef<HTMLDivElement, DateTimePickerProps>(
  ({
    dateValue = "",
    timeValue = "",
    onDateChange,
    onTimeChange,
    onDateTimeChange,
    dateClassName,
    timeClassName,
    containerClassName,
    disabled = false,
    minDate,
    maxDate,
    label,
    required = false,
    ...props
  }, ref) => {
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newDate = e.target.value;
      onDateChange?.(newDate);
      
      // If both date and time are available, call onDateTimeChange
      if (newDate && timeValue && onDateTimeChange) {
        onDateTimeChange(`${newDate}T${timeValue}`);
      }
    };

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newTime = e.target.value;
      onTimeChange?.(newTime);
      
      // If both date and time are available, call onDateTimeChange
      if (dateValue && newTime && onDateTimeChange) {
        onDateTimeChange(`${dateValue}T${newTime}`);
      }
    };

    return (
      <div ref={ref} className={cn("space-y-2", containerClassName)} {...props}>
        {label && (
          <label className="text-sm font-medium text-gray-700">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <DatePicker
            value={dateValue}
            onChange={handleDateChange}
            disabled={disabled}
            min={minDate}
            max={maxDate}
            className={cn("w-full", dateClassName)}
          />
          <TimePicker
            value={timeValue}
            onChange={handleTimeChange}
            disabled={disabled}
            className={cn("w-full", timeClassName)}
          />
        </div>
      </div>
    );
  }
);
DateTimePicker.displayName = "DateTimePicker";

export { DateTimePicker };