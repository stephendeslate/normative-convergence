import { describe, it, expect, vi } from 'vitest';
import { TimeoutInterceptor } from './timeout.interceptor';
import { of, delay } from 'rxjs';
import { RequestTimeoutException } from '@nestjs/common';

describe('TimeoutInterceptor', () => {
  const mockContext = {} as any;

  it('should pass through for fast responses', async () => {
    const interceptor = new TimeoutInterceptor(5000);
    const handler = { handle: () => of({ data: 'ok' }) };

    const result = await new Promise((resolve, reject) => {
      interceptor.intercept(mockContext, handler).subscribe({
        next: resolve,
        error: reject,
      });
    });

    expect(result).toEqual({ data: 'ok' });
  });

  it('should throw RequestTimeoutException on timeout', async () => {
    const interceptor = new TimeoutInterceptor(50);
    const handler = { handle: () => of({ data: 'slow' }).pipe(delay(200)) };

    await expect(
      new Promise((resolve, reject) => {
        interceptor.intercept(mockContext, handler).subscribe({
          next: resolve,
          error: reject,
        });
      }),
    ).rejects.toThrow(RequestTimeoutException);
  });
});
