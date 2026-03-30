'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent, Input } from '@medconnect/ui';
import { api } from '@/lib/api';

interface Practice {
  id: string;
  name: string;
  slug: string;
  category: string;
  timezone: string;
  memberCount: number;
  createdAt: string;
}

export default function PracticesPage() {
  const [search, setSearch] = useState('');

  const { data: practices, isLoading } = useQuery<Practice[]>({
    queryKey: ['admin-practices', search],
    queryFn: () => {
      const params = search ? `?search=${encodeURIComponent(search)}` : '';
      return api.get(`/admin/practices${params}`);
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Practices</h1>
        <Input
          placeholder="Search practices..."
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          className="max-w-xs"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium">Name</th>
                  <th className="px-4 py-3 text-left font-medium">Slug</th>
                  <th className="px-4 py-3 text-left font-medium">Category</th>
                  <th className="px-4 py-3 text-left font-medium">Timezone</th>
                  <th className="px-4 py-3 text-left font-medium">Members</th>
                  <th className="px-4 py-3 text-left font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                      Loading...
                    </td>
                  </tr>
                ) : practices?.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                      No practices found.
                    </td>
                  </tr>
                ) : (
                  practices?.map((practice) => (
                    <tr key={practice.id} className="border-b last:border-0">
                      <td className="px-4 py-3 font-medium">{practice.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{practice.slug}</td>
                      <td className="px-4 py-3">{practice.category.replace(/_/g, ' ')}</td>
                      <td className="px-4 py-3 text-muted-foreground">{practice.timezone}</td>
                      <td className="px-4 py-3">{practice.memberCount}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(practice.createdAt).toLocaleDateString()}
                      </td>
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
