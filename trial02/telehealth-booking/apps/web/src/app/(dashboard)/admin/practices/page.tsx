'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export default function AdminPracticesPage() {
  const { data } = useQuery({
    queryKey: ['admin-practices'],
    queryFn: () => api.get<any>('/admin/practices'),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Practices</h1>
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Name</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Slug</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Tier</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Members</th>
            </tr>
          </thead>
          <tbody>
            {data?.data?.map((practice: any) => (
              <tr key={practice.id} className="border-t">
                <td className="px-4 py-3 text-sm">{practice.name}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{practice.slug}</td>
                <td className="px-4 py-3 text-sm">{practice.subscriptionTier}</td>
                <td className="px-4 py-3 text-sm">{practice._count?.memberships}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
