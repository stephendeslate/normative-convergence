'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { DEMO_DISCLAIMER } from '@medconnect/shared';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@medconnect/ui';
import { useAuthStore } from '@/lib/auth';
import { api } from '@/lib/api';

interface DashboardStats {
  upcomingAppointments: number;
  completedAppointments: number;
  totalProviders: number;
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.get('/dashboard/stats'),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome back, {user?.name}</h1>
        <p className="text-muted-foreground">Here&apos;s an overview of your account.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Upcoming Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats?.upcomingAppointments ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats?.completedAppointments ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Providers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats?.totalProviders ?? 0}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-3">
        <Button asChild>
          <Link href="/book">Book Appointment</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/appointments">View Appointments</Link>
        </Button>
      </div>

      <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        {DEMO_DISCLAIMER}
      </div>
    </div>
  );
}
