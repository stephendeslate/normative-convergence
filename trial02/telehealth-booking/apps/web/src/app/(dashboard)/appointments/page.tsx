'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function AppointmentsPage() {
  // This requires a practiceId - in a real app we'd get it from context
  const { data, isLoading, error } = useQuery({
    queryKey: ['appointments'],
    queryFn: () => api.get<any>('/practices/demo/appointments').catch(() => ({ data: [], meta: { total: 0 } })),
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
        <Link
          href="/book"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Book Appointment
        </Link>
      </div>

      {isLoading && <p role="status" aria-live="polite" className="text-gray-500">Loading appointments...</p>}

      {!isLoading && (!data?.data || data.data.length === 0) && (
        <div className="text-center py-12 bg-white rounded-lg border">
          <p className="text-gray-500 mb-4">No appointments found</p>
          <Link href="/book" className="text-blue-600 hover:underline">
            Book your first appointment
          </Link>
        </div>
      )}

      <ul aria-label="Appointment list" className="list-none p-0">
      {data?.data?.map((apt: any) => (
        <li key={apt.id}>
        <Link
          href={`/appointments/${apt.id}`}
          aria-label={`${apt.service?.name || 'Appointment'} - ${apt.status}`}
          className="block bg-white rounded-lg border p-4 mb-3 hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium text-gray-900">
                {apt.service?.name || 'Appointment'}
              </p>
              <p className="text-sm text-gray-500">
                {apt.providerProfile?.user
                  ? `Dr. ${apt.providerProfile.user.firstName} ${apt.providerProfile.user.lastName}`
                  : 'Provider'}
              </p>
              <p className="text-sm text-gray-400">
                {new Date(apt.startTime).toLocaleString()}
              </p>
            </div>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                apt.status === 'CONFIRMED'
                  ? 'bg-green-100 text-green-800'
                  : apt.status === 'PENDING'
                    ? 'bg-yellow-100 text-yellow-800'
                    : apt.status === 'CANCELLED'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
              }`}
            >
              {apt.status}
            </span>
          </div>
        </Link>
        </li>
      ))}
      </ul>
    </div>
  );
}
