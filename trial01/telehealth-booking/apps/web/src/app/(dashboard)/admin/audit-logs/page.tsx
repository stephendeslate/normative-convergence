'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, Input, Badge } from '@medconnect/ui';
import { api } from '@/lib/api';

interface AuditLog {
  id: string;
  action: string;
  userId: string;
  userName: string;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  createdAt: string;
}

export default function AuditLogsPage() {
  const [actionFilter, setActionFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');

  const { data: logs, isLoading } = useQuery<AuditLog[]>({
    queryKey: ['audit-logs', actionFilter, userFilter],
    queryFn: () => {
      const params = new URLSearchParams();
      if (actionFilter) params.set('action', actionFilter);
      if (userFilter) params.set('user', userFilter);
      return api.get(`/admin/audit-logs?${params.toString()}`);
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Audit Logs</h1>

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Filter by action..."
          value={actionFilter}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setActionFilter(e.target.value)}
          className="max-w-xs"
        />
        <Input
          placeholder="Filter by user..."
          value={userFilter}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserFilter(e.target.value)}
          className="max-w-xs"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium">Timestamp</th>
                  <th className="px-4 py-3 text-left font-medium">Action</th>
                  <th className="px-4 py-3 text-left font-medium">User</th>
                  <th className="px-4 py-3 text-left font-medium">Target</th>
                  <th className="px-4 py-3 text-left font-medium">IP Address</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                      Loading...
                    </td>
                  </tr>
                ) : logs?.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                      No audit logs found.
                    </td>
                  </tr>
                ) : (
                  logs?.map((log) => (
                    <tr key={log.id} className="border-b last:border-0">
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline">{log.action}</Badge>
                      </td>
                      <td className="px-4 py-3">{log.userName}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {log.targetType && `${log.targetType}:${log.targetId}`}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{log.ipAddress ?? '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
