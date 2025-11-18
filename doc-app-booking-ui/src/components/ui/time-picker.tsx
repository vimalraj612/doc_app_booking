import * as React from "react";
import { cn } from "./utils";

export interface TimePickerProps extends Omit<React.ComponentProps<"input">, 'type'> {
  className?: string;
}

const TimePicker = React.forwardRef<HTMLInputElement, TimePickerProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        type="time"
        ref={ref}
        className={cn(
          "flex h-10 w-full min-w-0 rounded-md border border-input bg-input-background px-3 py-1 text-sm transition-[color,box-shadow] outline-none",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "placeholder:text-muted-foreground",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          // Strict mobile viewport constraints
          "max-w-full overflow-hidden",
          "text-ellipsis",
          // Mobile-responsive min width
          "min-w-0 sm:min-w-[120px]",
          // Prevent iOS time picker from expanding beyond container
          "[&::-webkit-datetime-edit]:max-w-full [&::-webkit-datetime-edit]:overflow-hidden",
          "[&::-webkit-calendar-picker-indicator]:max-w-[20px] [&::-webkit-calendar-picker-indicator]:shrink-0",
          className
        )}
        {...props}
      />
    );
  }
);
TimePicker.displayName = "TimePicker";

export { TimePicker };