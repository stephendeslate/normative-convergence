'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AppointmentStatus } from '@medconnect/shared';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@medconnect/ui';
import { AppointmentStatusBadge } from '@/components/appointment-status-badge';
import { IntakeForm } from '@/components/intake-form';
import { api } from '@/lib/api';

interface AppointmentDetail {
  id: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  consultationType: string;
  service: { name: string; durationMinutes: number; price: number };
  provider: { user: { name: string }; credentials?: string };
  intakeForm?: {
    id: string;
    status: string;
    template: {
      fields: Array<{
        id: string;
        type: string;
        label: string;
        required: boolean;
        placeholder?: string;
        options?: string[];
      }>;
    };
  };
  messages: Array<{
    id: string;
    content: string;
    senderId: string;
    createdAt: string;
  }>;
  statusHistory: Array<{
    status: AppointmentStatus;
    changedAt: string;
    notes?: string;
  }>;
}

export default function AppointmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: appointment, isLoading } = useQuery<AppointmentDetail>({
    queryKey: ['appointment', id],
    queryFn: () => api.get(`/appointments/${id}`),
  });

  const intakeMutation = useMutation({
    mutationFn: (responses: Record<string, unknown>) =>
      api.post('/intake/submit', { appointmentId: id, responses }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['appointment', id] }),
  });

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading appointment...</p>;
  }

  if (!appointment) {
    return <p className="text-sm text-muted-foreground">Appointment not found.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Appointment Details</h1>
        <AppointmentStatusBadge status={appointment.status} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{appointment.service.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <p className="font-medium">Provider</p>
              <p className="text-muted-foreground">
                {appointment.provider.user.name}
                {appointment.provider.credentials && `, ${appointment.provider.credentials}`}
              </p>
            </div>
            <div>
              <p className="font-medium">Date & Time</p>
              <p className="text-muted-foreground">
                {new Date(appointment.startTime).toLocaleString(undefined, {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <div>
              <p className="font-medium">Duration</p>
              <p className="text-muted-foreground">{appointment.service.durationMinutes} minutes</p>
            </div>
            <div>
              <p className="font-medium">Type</p>
              <p className="text-muted-foreground">{appointment.consultationType}</p>
            </div>
            <div>
              <p className="font-medium">Price</p>
              <p className="text-muted-foreground">${appointment.service.price.toFixed(2)}</p>
            </div>
          </div>

          {(appointment.status === AppointmentStatus.CONFIRMED ||
            appointment.status === AppointmentStatus.IN_PROGRESS) && (
            <Button asChild>
              <Link href={`/video/${appointment.id}`}>Join Video Call</Link>
            </Button>
          )}
        </CardContent>
      </Card>

      {appointment.statusHistory && appointment.statusHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Status Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {appointment.statusHistory.map((entry, i) => (
                <div key={i} className="flex items-start gap-3 text-sm">
                  <AppointmentStatusBadge status={entry.status} />
                  <div>
                    <p className="text-muted-foreground">
                      {new Date(entry.changedAt).toLocaleString()}
                    </p>
                    {entry.notes && <p className="text-xs text-muted-foreground">{entry.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {appointment.intakeForm && appointment.intakeForm.status === 'PENDING' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Intake Form</CardTitle>
          </CardHeader>
          <CardContent>
            <IntakeForm
              fields={appointment.intakeForm.template.fields as never}
              onSubmit={(responses) => intakeMutation.mutate(responses)}
              isSubmitting={intakeMutation.isPending}
            />
          </CardContent>
        </Card>
      )}

      {appointment.messages && appointment.messages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {appointment.messages.map((msg) => (
                <div key={msg.id} className="rounded-md bg-muted p-3 text-sm">
                  <p>{msg.content}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(msg.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
