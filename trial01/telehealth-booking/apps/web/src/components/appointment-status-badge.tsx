import { AppointmentStatus } from '@medconnect/shared';
import { Badge } from '@medconnect/ui';

const statusConfig: Record<AppointmentStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string }> = {
  [AppointmentStatus.PENDING]: { label: 'Pending', variant: 'outline', className: 'border-amber-300 text-amber-700 bg-amber-50' },
  [AppointmentStatus.CONFIRMED]: { label: 'Confirmed', variant: 'default', className: 'bg-blue-600 text-white' },
  [AppointmentStatus.IN_PROGRESS]: { label: 'In Progress', variant: 'default', className: 'bg-green-600 text-white' },
  [AppointmentStatus.COMPLETED]: { label: 'Completed', variant: 'secondary', className: 'bg-gray-100 text-gray-700' },
  [AppointmentStatus.CANCELLED]: { label: 'Cancelled', variant: 'destructive', className: '' },
  [AppointmentStatus.NO_SHOW]: { label: 'No Show', variant: 'destructive', className: 'bg-red-100 text-red-800' },
};

interface AppointmentStatusBadgeProps {
  status: AppointmentStatus;
}

export function AppointmentStatusBadge({ status }: AppointmentStatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  );
}
