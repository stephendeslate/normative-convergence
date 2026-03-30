'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function AppointmentDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { data: appointment, isLoading } = useQuery({
    queryKey: ['appointment', id],
    queryFn: () => api.get<any>(`/practices/demo/appointments/${id}`),
    enabled: !!id,
  });

  if (isLoading) return <p>Loading...</p>;
  if (!appointment) return <p>Appointment not found</p>;

  return (
    <div className="max-w-2xl">
      <Link href="/appointments" className="text-blue-600 hover:underline text-sm mb-4 inline-block">
        &larr; Back to appointments
      </Link>

      <div className="bg-white rounded-lg border p-6">
        <h1 className="text-2xl font-bold mb-4">{appointment.service?.name || 'Appointment'}</h1>

        <dl className="space-y-3">
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="text-gray-900">{appointment.status}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Date & Time</dt>
            <dd className="text-gray-900">{new Date(appointment.startTime).toLocaleString()}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Provider</dt>
            <dd className="text-gray-900">
              {appointment.providerProfile?.user
                ? `Dr. ${appointment.providerProfile.user.firstName} ${appointment.providerProfile.user.lastName}`
                : 'N/A'}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Type</dt>
            <dd className="text-gray-900">{appointment.consultationType}</dd>
          </div>
          {appointment.notes && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Notes</dt>
              <dd className="text-gray-900">{appointment.notes}</dd>
            </div>
          )}
        </dl>

        {appointment.consultationType === 'VIDEO' &&
          ['CONFIRMED', 'IN_PROGRESS'].includes(appointment.status) && (
            <Link
              href={`/video/${appointment.id}`}
              className="mt-6 inline-block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Join Video Call
            </Link>
          )}
      </div>
    </div>
  );
}
