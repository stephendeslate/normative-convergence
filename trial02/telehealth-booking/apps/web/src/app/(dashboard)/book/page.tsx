'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function BookPage() {
  const { data: providers, isLoading } = useQuery({
    queryKey: ['providers'],
    queryFn: () => api.get<any[]>('/practices/demo/providers').catch(() => []),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Book an Appointment</h1>

      {isLoading && <p role="status" aria-live="polite" className="text-gray-500">Loading providers...</p>}

      <div role="list" aria-label="Available providers" className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {providers?.map((provider: any) => (
          <Link
            key={provider.id}
            href={`/book/${provider.id}`}
            role="listitem"
            aria-label={`Book with Dr. ${provider.user?.firstName} ${provider.user?.lastName}`}
            tabIndex={0}
            className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <h3 className="font-medium text-gray-900">
              Dr. {provider.user?.firstName} {provider.user?.lastName}
            </h3>
            <p className="text-sm text-gray-500 mt-1">{provider.credentials}</p>
            <p className="text-sm text-gray-400 mt-1">
              {provider.specialties?.join(', ')}
            </p>
            <div className="mt-3 flex flex-wrap gap-1">
              {provider.consultationTypes?.map((type: string) => (
                <span
                  key={type}
                  className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full"
                >
                  {type}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>

      {!isLoading && (!providers || providers.length === 0) && (
        <p className="text-gray-500">No providers available</p>
      )}
    </div>
  );
}
