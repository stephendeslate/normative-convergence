import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Badge, Button } from '@medconnect/ui';

interface ProviderCardProps {
  id: string;
  name: string;
  specialties: string[];
  credentials?: string;
  acceptingNewPatients: boolean;
}

export function ProviderCard({ id, name, specialties, credentials, acceptingNewPatients }: ProviderCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{name}</CardTitle>
            {credentials && <CardDescription>{credentials}</CardDescription>}
          </div>
          <Badge variant={acceptingNewPatients ? 'default' : 'secondary'}>
            {acceptingNewPatients ? 'Accepting' : 'Not Accepting'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-1.5">
          {specialties.map((specialty) => (
            <Badge key={specialty} variant="outline" className="text-xs">
              {specialty}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/book/${id}`}>Book Appointment</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
