'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent, Input, Button } from '@medconnect/ui';
import { api } from '@/lib/api';

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface AvailabilityRule {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
  enabled: boolean;
}

interface BlockedDate {
  id: string;
  startDate: string;
  endDate: string;
  reason?: string;
}

export default function AvailabilityPage() {
  const queryClient = useQueryClient();
  const [blockedStart, setBlockedStart] = useState('');
  const [blockedEnd, setBlockedEnd] = useState('');
  const [blockedReason, setBlockedReason] = useState('');

  const { data: rules } = useQuery<AvailabilityRule[]>({
    queryKey: ['availability-rules'],
    queryFn: () => api.get('/availability/rules'),
  });

  const { data: blockedDates } = useQuery<BlockedDate[]>({
    queryKey: ['blocked-dates'],
    queryFn: () => api.get('/availability/blocked-dates'),
  });

  const toggleMutation = useMutation({
    mutationFn: (rule: AvailabilityRule) =>
      api.patch(`/availability/rules/${rule.id}`, { enabled: !rule.enabled }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['availability-rules'] }),
  });

  const updateTimeMutation = useMutation({
    mutationFn: ({ id, field, value }: { id: string; field: string; value: string }) =>
      api.patch(`/availability/rules/${id}`, { [field]: value }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['availability-rules'] }),
  });

  const addBlockedMutation = useMutation({
    mutationFn: () =>
      api.post('/availability/blocked-dates', {
        startDate: blockedStart,
        endDate: blockedEnd,
        reason: blockedReason || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocked-dates'] });
      setBlockedStart('');
      setBlockedEnd('');
      setBlockedReason('');
    },
  });

  const removeBlockedMutation = useMutation({
    mutationFn: (id: string) => api.del(`/availability/blocked-dates/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['blocked-dates'] }),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Availability Management</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Weekly Schedule</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {DAYS_OF_WEEK.map((dayName, dayIndex) => {
            const rule = rules?.find((r) => r.dayOfWeek === dayIndex);
            return (
              <div key={dayName} className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => rule && toggleMutation.mutate(rule)}
                  className={`w-4 h-4 rounded border ${
                    rule?.enabled ? 'bg-primary border-primary' : 'bg-background border-input'
                  }`}
                  aria-label={`Toggle ${dayName}`}
                />
                <span className="w-24 text-sm font-medium">{dayName}</span>
                {rule?.enabled ? (
                  <div className="flex items-center gap-2">
                    <Input
                      type="time"
                      value={rule.startTime}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        updateTimeMutation.mutate({ id: rule.id, field: 'startTime', value: e.target.value })
                      }
                      className="w-32"
                    />
                    <span className="text-sm text-muted-foreground">to</span>
                    <Input
                      type="time"
                      value={rule.endTime}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        updateTimeMutation.mutate({ id: rule.id, field: 'endTime', value: e.target.value })
                      }
                      className="w-32"
                    />
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">Unavailable</span>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Blocked Dates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">Start Date</label>
              <Input type="date" value={blockedStart} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBlockedStart(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">End Date</label>
              <Input type="date" value={blockedEnd} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBlockedEnd(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Reason</label>
              <Input placeholder="Optional reason" value={blockedReason} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBlockedReason(e.target.value)} />
            </div>
            <Button
              onClick={() => addBlockedMutation.mutate()}
              disabled={!blockedStart || !blockedEnd || addBlockedMutation.isPending}
            >
              Add
            </Button>
          </div>

          {blockedDates?.length === 0 && (
            <p className="text-sm text-muted-foreground">No blocked dates.</p>
          )}

          <div className="space-y-2">
            {blockedDates?.map((bd) => (
              <div key={bd.id} className="flex items-center justify-between rounded-md border p-3 text-sm">
                <div>
                  <p className="font-medium">
                    {bd.startDate} to {bd.endDate}
                  </p>
                  {bd.reason && <p className="text-muted-foreground">{bd.reason}</p>}
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeBlockedMutation.mutate(bd.id)}
                  disabled={removeBlockedMutation.isPending}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
