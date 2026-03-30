/**
 * State transition validation for appointment and other status workflows.
 * Prevents invalid state transitions at the domain level.
 */

export type TransitionMap<T extends string> = Record<T, T[]>;

export function canTransition<T extends string>(
  current: T,
  target: T,
  validTransitions: TransitionMap<T>,
): boolean {
  const allowed = validTransitions[current];
  return allowed?.includes(target) ?? false;
}

export const AppointmentTransitions: TransitionMap<string> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['IN_PROGRESS', 'CANCELLED', 'NO_SHOW'],
  IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
  NO_SHOW: ['PENDING'],
};
