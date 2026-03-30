import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new JwtAuthGuard(reflector);
  });

  const createMockExecutionContext = (): ExecutionContext =>
    ({
      getHandler: vi.fn(),
      getClass: vi.fn(),
      switchToHttp: vi.fn().mockReturnValue({
        getRequest: vi.fn().mockReturnValue({}),
      }),
      getType: vi.fn().mockReturnValue('http'),
      getArgs: vi.fn().mockReturnValue([]),
      getArgByIndex: vi.fn(),
      switchToRpc: vi.fn(),
      switchToWs: vi.fn(),
    }) as unknown as ExecutionContext;

  it('should return true for public routes', () => {
    const context = createMockExecutionContext();
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

    const result = guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should call super.canActivate for non-public routes', () => {
    const context = createMockExecutionContext();
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

    // AuthGuard('jwt').canActivate returns a boolean or Observable
    // When no passport strategy is configured in tests, it will throw or return
    // We test that it does NOT return true (since it's not public)
    const canActivateSpy = vi
      .spyOn(Object.getPrototypeOf(Object.getPrototypeOf(guard)), 'canActivate')
      .mockReturnValue(true);

    const result = guard.canActivate(context);
    expect(canActivateSpy).toHaveBeenCalledWith(context);
    expect(result).toBe(true);

    canActivateSpy.mockRestore();
  });

  it('should check the isPublic metadata key', () => {
    const context = createMockExecutionContext();
    const spy = vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

    vi.spyOn(
      Object.getPrototypeOf(Object.getPrototypeOf(guard)),
      'canActivate',
    ).mockReturnValue(true);

    guard.canActivate(context);

    expect(spy).toHaveBeenCalledWith('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);
  });

  it('should allow access when route is marked @Public()', () => {
    const context = createMockExecutionContext();
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

    expect(guard.canActivate(context)).toBe(true);
  });
});
