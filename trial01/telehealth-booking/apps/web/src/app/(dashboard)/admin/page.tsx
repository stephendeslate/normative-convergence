'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@medconnect/ui';
import { api } from '@/lib/api';

interface AdminStats {
  totalUsers: number;
  totalPractices: number;
  totalAppointments: number;
  totalProviders: number;
  activeVideoRooms: number;
  revenue: number;
}

export default function AdminPage() {
  const { data: stats } = useQuery<AdminStats>({
    queryKey: ['admin-stats'],
    queryFn: () => api.get('/admin/stats'),
  });

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers ?? 0 },
    { label: 'Practices', value: stats?.totalPractices ?? 0 },
    { label: 'Appointments', value: stats?.totalAppointments ?? 0 },
    { label: 'Providers', value: stats?.totalProviders ?? 0 },
    { label: 'Active Video Rooms', value: stats?.activeVideoRooms ?? 0 },
    { label: 'Revenue', value: `$${(stats?.revenue ?? 0).toLocaleString()}` },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card) => (
          <Card key={card.label}>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
