import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Protect all admin routes
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/');
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-secondary)' }}>
      {/* Sidebar */}
      <aside style={{ width: '280px', background: 'var(--bg-card)', borderRight: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: 'var(--space-lg)', borderBottom: '1px solid var(--color-border)' }}>
          <Link href="/admin" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', color: 'var(--color-text)', textDecoration: 'none', fontWeight: 700, fontSize: '1.25rem' }}>
            <span>🍔</span> QuickBite Admin
          </Link>
        </div>
        
        <nav style={{ padding: 'var(--space-md)', display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)', flex: 1 }}>
          <Link href="/admin" className="nav-link" style={{ fontSize: 'var(--text-sm)', display: 'block', padding: 'var(--space-sm) var(--space-md)' }}>
            Overview
          </Link>
          <Link href="/admin/orders" className="nav-link" style={{ fontSize: 'var(--text-sm)', display: 'block', padding: 'var(--space-sm) var(--space-md)' }}>
            Live Orders
          </Link>
          <div style={{ padding: 'var(--space-sm) var(--space-md)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', cursor: 'not-allowed' }}>
            Menu Builder (Demo)
          </div>
          <div style={{ padding: 'var(--space-sm) var(--space-md)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', cursor: 'not-allowed' }}>
            Drivers (Demo)
          </div>
          <div style={{ padding: 'var(--space-sm) var(--space-md)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', cursor: 'not-allowed' }}>
            Settings (Demo)
          </div>
        </nav>

        <div style={{ padding: 'var(--space-md)', borderTop: '1px solid var(--color-border)' }}>
          <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{session.user.name}</div>
          <Link href="/api/auth/signout" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-error)', textDecoration: 'none' }}>
            Sign Out
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: 'var(--space-3xl)', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
}
