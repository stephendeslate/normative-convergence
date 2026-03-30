'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ConsultationType, type TimeSlot, type AvailabilityResponse } from '@medconnect/shared';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@medconnect/ui';
import { SlotPicker } from '@/components/slot-picker';
import { api } from '@/lib/api';

interface Provider {
  id: string;
  user: { name: string };
  specialties: string[];
  credentials?: string;
  bio?: string;
}

interface Service {
  id: string;
  name: string;
  description?: string;
  durationMinutes: number;
  price: number;
  consultationType: ConsultationType;
}

export default function BookProviderPage() {
  const { providerId } = useParams<{ providerId: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { data: provider } = useQuery<Provider>({
    queryKey: ['provider', providerId],
    queryFn: () => api.get(`/providers/${providerId}`),
  });

  const { data: services } = useQuery<Service[]>({
    queryKey: ['services', providerId],
    queryFn: () => api.get(`/providers/${providerId}/services`),
  });

  const { data: availability } = useQuery<AvailabilityResponse>({
    queryKey: ['availability', providerId, selectedDate],
    queryFn: () => api.get(`/providers/${providerId}/availability?date=${selectedDate}`),
    enabled: !!selectedDate,
  });

  const bookMutation = useMutation({
    mutationFn: () =>
      api.post('/appointments', {
        providerProfileId: providerId,
        serviceId: selectedService?.id,
        startTime: selectedSlot?.startTime,
        consultationType: selectedService?.consultationType ?? ConsultationType.VIDEO,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      router.push('/appointments');
    },
  });

  return (
    <div className="space-y-6">
      {provider && (
        <Card>
          <CardHeader>
            <CardTitle>{provider.user.name}</CardTitle>
            <CardDescription>
              {provider.credentials} {provider.specialties.length > 0 && `\u2022 ${provider.specialties.join(', ')}`}
            </CardDescription>
          </CardHeader>
          {provider.bio && (
            <CardContent>
              <p className="text-sm text-muted-foreground">{provider.bio}</p>
            </CardContent>
          )}
        </Card>
      )}

      <div>
        <h2 className="mb-3 text-lg font-semibold">Select a Service</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {services?.map((service) => (
            <button
              key={service.id}
              type="button"
              onClick={() => setSelectedService(service)}
              className={`rounded-md border p-4 text-left transition-colors hover:border-primary ${
                selectedService?.id === service.id ? 'border-primary bg-primary/5' : ''
              }`}
            >
              <p className="font-medium">{service.name}</p>
              {service.description && <p className="text-sm text-muted-foreground">{service.description}</p>}
              <p className="mt-1 text-sm">
                {service.durationMinutes} min &middot; ${service.price.toFixed(2)}
              </p>
            </button>
          ))}
        </div>
      </div>

      {selectedService && (
        <div>
          <h2 className="mb-3 text-lg font-semibold">Choose a Time</h2>
          <SlotPicker
            slots={availability?.slots ?? []}
            selectedDate={selectedDate}
            selectedSlot={selectedSlot}
            onDateChange={(date) => {
              setSelectedDate(date);
              setSelectedSlot(null);
            }}
            onSlotSelect={setSelectedSlot}
          />
        </div>
      )}

      {selectedSlot && selectedService && (
        <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">Confirm Booking</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Appointment</DialogTitle>
              <DialogDescription>
                {selectedService.name} with {provider?.user.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium">Date:</span> {selectedDate}
              </p>
              <p>
                <span className="font-medium">Time:</span>{' '}
                {new Date(selectedSlot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p>
                <span className="font-medium">Duration:</span> {selectedService.durationMinutes} minutes
              </p>
              <p>
                <span className="font-medium">Price:</span> ${selectedService.price.toFixed(2)}
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => bookMutation.mutate()} disabled={bookMutation.isPending}>
                {bookMutation.isPending ? 'Booking...' : 'Book Now'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
