import { DEMO_DISCLAIMER } from '@medconnect/shared';

export function DemoBanner() {
  return (
    <div className="sticky top-0 z-50 flex items-center justify-center bg-amber-100 px-4 py-2 text-center text-sm font-medium text-amber-900 border-b border-amber-200">
      {DEMO_DISCLAIMER}
    </div>
  );
}
