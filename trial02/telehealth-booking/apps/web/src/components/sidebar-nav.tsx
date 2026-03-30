'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';

const navItems = [
  { href: '/appointments', label: 'Appointments' },
  { href: '/book', label: 'Book Appointment' },
  { href: '/schedule', label: 'Schedule' },
  { href: '/availability', label: 'Availability' },
];

const adminItems = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/practices', label: 'Practices' },
  { href: '/admin/audit-logs', label: 'Audit Logs' },
];

export function SidebarNav() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  return (
    <aside aria-label="Main navigation" role="complementary" className="w-64 bg-white border-r border-gray-200 min-h-screen p-4">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-blue-600">MedConnect</h2>
        {user && (
          <p className="text-sm text-gray-500 mt-1">
            {user.firstName || user.email}
          </p>
        )}
      </div>

      <nav aria-label="Primary navigation" className="space-y-1" role="navigation">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={pathname === item.href ? 'page' : undefined}
            className={`block px-3 py-2 rounded-md text-sm ${
              pathname === item.href
                ? 'bg-blue-50 text-blue-700 font-medium'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            {item.label}
          </Link>
        ))}

        {user?.role === 'PLATFORM_ADMIN' && (
          <>
            <div className="pt-4 pb-2">
              <p className="px-3 text-xs font-semibold text-gray-400 uppercase">Admin</p>
            </div>
            {adminItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={pathname === item.href ? 'page' : undefined}
                className={`block px-3 py-2 rounded-md text-sm ${
                  pathname === item.href
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </>
        )}
      </nav>

      <div className="absolute bottom-4 left-4">
        <button
          onClick={logout}
          aria-label="Sign out of your account"
          className="px-3 py-2 text-sm text-gray-600 hover:text-red-600"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}
