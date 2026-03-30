'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterDto } from '@medconnect/shared';
import { Button, Input } from '@medconnect/ui';
import { useAuthStore } from '@/lib/auth';

export default function RegisterPage() {
  const router = useRouter();
  const registerUser = useAuthStore((s) => s.register);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<RegisterDto>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch('password', '');

  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasMinLength = password.length >= 8;

  const onSubmit = async (data: RegisterDto) => {
    setError(null);
    try {
      await registerUser({ name: data.name, email: data.email, password: data.password });
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <h2 className="text-xl font-semibold text-center">Create an account</h2>

      {error && (
        <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">
          Full name
        </label>
        <Input id="name" placeholder="Jane Smith" {...register('name')} />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <Input id="email" type="email" placeholder="you@example.com" {...register('email')} />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium">
          Password
        </label>
        <Input id="password" type="password" placeholder="********" {...register('password')} />
        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        <div className="space-y-1 text-xs">
          <p className={hasMinLength ? 'text-green-600' : 'text-muted-foreground'}>
            {hasMinLength ? '\u2713' : '\u2022'} At least 8 characters
          </p>
          <p className={hasUppercase ? 'text-green-600' : 'text-muted-foreground'}>
            {hasUppercase ? '\u2713' : '\u2022'} At least one uppercase letter
          </p>
          <p className={hasNumber ? 'text-green-600' : 'text-muted-foreground'}>
            {hasNumber ? '\u2713' : '\u2022'} At least one number
          </p>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Creating account...' : 'Create account'}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
