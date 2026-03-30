'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function BookProviderPage() {
  const params = useParams();
  const router = useRouter();
  const providerId = params.providerId as string;
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const { data: provider } = useQuery({
    queryKey: ['provider', providerId],
    queryFn: () => api.get<any>(`/practices/demo/providers/${providerId}`),
    enabled: !!providerId,
  });

  const { data: availability } = useQuery({
    queryKey: ['availability', providerId, selectedDate],
    queryFn: () =>
      api.get<any>(`/practices/demo/providers/${providerId}/availability?date=${selectedDate}`),
    enabled: !!providerId && !!selectedDate,
  });

  const handleBookSlot = async (slot: any) => {
    if (!slot.available) return;
    try {
      await api.post('/practices/demo/appointments', {
        providerProfileId: providerId,
        serviceId: provider?.serviceProviders?.[0]?.service?.id,
        startTime: slot.startTime,
        consultationType: 'VIDEO',
      });
      router.push('/appointments');
    } catch (err: any) {
      alert(err.message || 'Booking failed');
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Book with Dr. {provider?.user?.firstName} {provider?.user?.lastName}
      </h1>
      <p className="text-gray-500 mb-6">{provider?.specialties?.join(', ')}</p>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Select Date</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        {availability?.slots?.map((slot: any, i: number) => (
          <button
            key={i}
            onClick={() => handleBookSlot(slot)}
            disabled={!slot.available}
            className={`px-3 py-2 rounded-md text-sm ${
              slot.available
                ? 'bg-white border border-gray-300 hover:bg-blue-50 hover:border-blue-300'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </button>
        ))}
      </div>

      {availability?.slots?.length === 0 && (
        <p className="text-gray-500">No available slots for this date</p>
      )}
    </div>
  );
}
