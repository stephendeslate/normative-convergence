'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export default function AuditLogsPage() {
  const { data } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: () => api.get<any>('/admin/audit-logs'),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Audit Logs</h1>
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Time</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Action</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">User</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Resource</th>
            </tr>
          </thead>
          <tbody>
            {data?.data?.map((log: any) => (
              <tr key={log.id} className="border-t">
                <td className="px-4 py-3 text-sm text-gray-500">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-sm">{log.action}</td>
                <td className="px-4 py-3 text-sm">
                  {log.user ? `${log.user.firstName} ${log.user.lastName}` : 'System'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">{log.resource}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
