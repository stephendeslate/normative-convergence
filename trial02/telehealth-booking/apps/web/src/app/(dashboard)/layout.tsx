import { SidebarNav } from '@/components/sidebar-nav';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <SidebarNav />
      <main role="main" aria-label="Dashboard content" className="flex-1 p-8">
        <section aria-label="Page content">
          {children}
        </section>
      </main>
    </div>
  );
}
