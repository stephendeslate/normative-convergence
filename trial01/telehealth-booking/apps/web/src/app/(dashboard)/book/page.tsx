'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@medconnect/ui';
import { SpecialtyCategory } from '@medconnect/shared';
import { ProviderCard } from '@/components/provider-card';
import { api } from '@/lib/api';

interface Provider {
  id: string;
  user: { name: string };
  specialties: string[];
  credentials?: string;
  acceptingNewPatients: boolean;
  category?: string;
}

export default function BookPage() {
  const [search, setSearch] = useState('');
  const [specialty, setSpecialty] = useState<string>('');

  const { data: providers, isLoading } = useQuery<Provider[]>({
    queryKey: ['providers', search, specialty],
    queryFn: () => {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (specialty) params.set('specialty', specialty);
      return api.get(`/providers?${params.toString()}`);
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Find a Provider</h1>
        <p className="text-muted-foreground">Browse providers and book an appointment.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          placeholder="Search providers..."
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          className="sm:max-w-xs"
        />
        <select
          value={specialty}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSpecialty(e.target.value)}
          className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <option value="">All Specialties</option>
          {Object.values(SpecialtyCategory).map((cat) => (
            <option key={cat} value={cat}>
              {cat.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading providers...</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {providers?.map((provider) => (
            <ProviderCard
              key={provider.id}
              id={provider.id}
              name={provider.user.name}
              specialties={provider.specialties}
              credentials={provider.credentials}
              acceptingNewPatients={provider.acceptingNewPatients}
            />
          )) ?? (
            <p className="col-span-full text-sm text-muted-foreground">No providers found.</p>
          )}
        </div>
      )}
    </div>
  );
}
