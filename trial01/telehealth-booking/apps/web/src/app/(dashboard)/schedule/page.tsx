'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, addDays, startOfWeek } from 'date-fns';
import { AppointmentStatus } from '@medconnect/shared';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@medconnect/ui';
import { AppointmentStatusBadge } from '@/components/appointment-status-badge';
import { api } from '@/lib/api';

interface ScheduleAppointment {
  id: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  service: { name: string };
  patient: { name: string };
}

const HOURS = Array.from({ length: 12 }, (_, i) => i + 7);

export default function SchedulePage() {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const { data: appointments } = useQuery<ScheduleAppointment[]>({
    queryKey: ['schedule', format(weekStart, 'yyyy-MM-dd')],
    queryFn: () =>
      api.get(
        `/schedule?start=${format(weekStart, 'yyyy-MM-dd')}&end=${format(addDays(weekStart, 7), 'yyyy-MM-dd')}`,
      ),
  });

  const getAppointmentsForDayHour = (day: Date, hour: number) => {
    return appointments?.filter((appt) => {
      const apptDate = new Date(appt.startTime);
      return (
        apptDate.getDate() === day.getDate() &&
        apptDate.getMonth() === day.getMonth() &&
        apptDate.getHours() === hour
      );
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Schedule</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setWeekStart((d) => addDays(d, -7))}>
            Previous Week
          </Button>
          <Button variant="outline" size="sm" onClick={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}>
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={() => setWeekStart((d) => addDays(d, 7))}>
            Next Week
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="grid min-w-[800px] grid-cols-8 gap-px bg-border">
          <div className="bg-card p-2" />
          {days.map((day) => (
            <div key={day.toISOString()} className="bg-card p-2 text-center">
              <p className="text-xs text-muted-foreground">{format(day, 'EEE')}</p>
              <p className="font-medium">{format(day, 'MMM d')}</p>
            </div>
          ))}

          {HOURS.map((hour) => (
            <>
              <div key={`hour-${hour}`} className="bg-card p-2 text-right text-xs text-muted-foreground">
                {format(new Date().setHours(hour, 0), 'h a')}
              </div>
              {days.map((day) => {
                const dayAppointments = getAppointmentsForDayHour(day, hour);
                return (
                  <div key={`${day.toISOString()}-${hour}`} className="min-h-[60px] bg-card p-1">
                    {dayAppointments?.map((appt) => (
                      <div key={appt.id} className="mb-1 rounded bg-primary/10 p-1.5 text-xs">
                        <p className="font-medium">{appt.patient.name}</p>
                        <p className="text-muted-foreground">{appt.service.name}</p>
                        <AppointmentStatusBadge status={appt.status} />
                      </div>
                    ))}
                  </div>
                );
              })}
            </>
          ))}
        </div>
      </div>
    </div>
  );
}
