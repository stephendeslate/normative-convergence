'use client';

import { useState } from 'react';
import { format, addDays, startOfToday } from 'date-fns';
import { Button } from '@medconnect/ui';
import { cn } from '@medconnect/ui';
import type { TimeSlot } from '@medconnect/shared';

interface SlotPickerProps {
  slots: TimeSlot[];
  selectedDate: string | null;
  selectedSlot: TimeSlot | null;
  onDateChange: (date: string) => void;
  onSlotSelect: (slot: TimeSlot) => void;
}

export function SlotPicker({ slots, selectedDate, selectedSlot, onDateChange, onSlotSelect }: SlotPickerProps) {
  const today = startOfToday();
  const [weekOffset, setWeekOffset] = useState(0);

  const days = Array.from({ length: 7 }, (_, i) => addDays(today, weekOffset * 7 + i));

  const availableSlots = slots.filter((s) => s.available);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={() => setWeekOffset((o) => Math.max(0, o - 1))} disabled={weekOffset === 0}>
          Previous
        </Button>
        <span className="text-sm font-medium">
          {format(days[0], 'MMM d')} - {format(days[6], 'MMM d, yyyy')}
        </span>
        <Button variant="outline" size="sm" onClick={() => setWeekOffset((o) => o + 1)}>
          Next
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const isSelected = selectedDate === dateStr;
          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => onDateChange(dateStr)}
              className={cn(
                'flex flex-col items-center rounded-md p-2 text-sm transition-colors hover:bg-accent',
                isSelected && 'bg-primary text-primary-foreground hover:bg-primary/90',
              )}
            >
              <span className="text-xs">{format(day, 'EEE')}</span>
              <span className="font-medium">{format(day, 'd')}</span>
            </button>
          );
        })}
      </div>

      {selectedDate && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Available Times</h4>
          {availableSlots.length === 0 ? (
            <p className="text-sm text-muted-foreground">No available slots for this date.</p>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {availableSlots.map((slot) => {
                const isSelected = selectedSlot?.startTime === slot.startTime;
                return (
                  <Button
                    key={slot.startTime}
                    variant={isSelected ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onSlotSelect(slot)}
                  >
                    {format(new Date(slot.startTime), 'h:mm a')}
                  </Button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
