'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export default function AdminDashboardPage() {
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => api.get<any>('/admin/dashboard'),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Users', value: stats?.users },
          { label: 'Practices', value: stats?.practices },
          { label: 'Total Appointments', value: stats?.appointments },
          { label: 'Active Appointments', value: stats?.activeAppointments },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg border p-4">
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900">{stat.value ?? '-'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
