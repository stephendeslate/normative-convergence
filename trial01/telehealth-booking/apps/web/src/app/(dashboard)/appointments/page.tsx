'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AppointmentStatus } from '@medconnect/shared';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button } from '@medconnect/ui';
import { AppointmentStatusBadge } from '@/components/appointment-status-badge';
import { api } from '@/lib/api';

type TabValue = 'upcoming' | 'past' | 'cancelled';

interface Appointment {
  id: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  service: { name: string };
  provider: { user: { name: string } };
}

export default function AppointmentsPage() {
  const [tab, setTab] = useState<TabValue>('upcoming');
  const queryClient = useQueryClient();

  const { data: appointments, isLoading } = useQuery<Appointment[]>({
    queryKey: ['appointments', tab],
    queryFn: () => api.get(`/appointments?filter=${tab}`),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => api.post(`/appointments/${id}/cancel`, { reason: 'Cancelled by patient' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['appointments'] }),
  });

  const tabs: { label: string; value: TabValue }[] = [
    { label: 'Upcoming', value: 'upcoming' },
    { label: 'Past', value: 'past' },
    { label: 'Cancelled', value: 'cancelled' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Appointments</h1>

      <div className="flex gap-1 rounded-lg bg-muted p-1">
        {tabs.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setTab(t.value)}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.value ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading appointments...</p>
      ) : appointments?.length === 0 ? (
        <p className="text-sm text-muted-foreground">No {tab} appointments.</p>
      ) : (
        <div className="space-y-3">
          {appointments?.map((appt) => (
            <Card key={appt.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{appt.service.name}</CardTitle>
                    <CardDescription>
                      with {appt.provider.user.name} &middot;{' '}
                      {new Date(appt.startTime).toLocaleDateString(undefined, {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </CardDescription>
                  </div>
                  <AppointmentStatusBadge status={appt.status} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/appointments/${appt.id}`}>View Details</Link>
                  </Button>
                  {(appt.status === AppointmentStatus.CONFIRMED || appt.status === AppointmentStatus.IN_PROGRESS) && (
                    <Button size="sm" asChild>
                      <Link href={`/video/${appt.id}`}>Join Video</Link>
                    </Button>
                  )}
                  {(appt.status === AppointmentStatus.PENDING || appt.status === AppointmentStatus.CONFIRMED) && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => cancelMutation.mutate(appt.id)}
                      disabled={cancelMutation.isPending}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
