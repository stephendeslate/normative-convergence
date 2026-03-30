'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@medconnect/ui';
import { UserRole } from '@medconnect/shared';
import { useAuthStore } from '@/lib/auth';

interface NavItem {
  label: string;
  href: string;
  roles?: string[];
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/' },
  { label: 'Book Appointment', href: '/book' },
  { label: 'Appointments', href: '/appointments' },
  { label: 'Schedule', href: '/schedule', roles: [UserRole.PLATFORM_ADMIN] },
  { label: 'Availability', href: '/availability', roles: [UserRole.PLATFORM_ADMIN] },
  { label: 'Admin', href: '/admin', roles: [UserRole.PLATFORM_ADMIN] },
];

export function SidebarNav() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const [collapsed, setCollapsed] = useState(false);

  const filteredItems = navItems.filter((item) => {
    if (!item.roles) return true;
    return user?.role && item.roles.includes(user.role);
  });

  return (
    <nav className={cn('flex flex-col border-r bg-card', collapsed ? 'w-16' : 'w-64')}>
      <div className="flex items-center justify-between border-b p-4">
        {!collapsed && <span className="text-lg font-semibold text-primary">MedConnect</span>}
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? '\u25B6' : '\u25C0'}
        </button>
      </div>

      <div className="flex-1 space-y-1 p-2">
        {filteredItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
                isActive && 'bg-accent text-accent-foreground',
              )}
            >
              {!collapsed && item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
