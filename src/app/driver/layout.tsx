import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function DriverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Protect all driver routes
  if (!session?.user || session.user.role !== 'DRIVER') {
    redirect('/');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-secondary)' }}>
      {/* Mobile-friendly top header for drivers */}
      <header style={{ padding: 'var(--space-md)', background: 'var(--bg-card)', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 }}>
        <Link href="/driver" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 700, fontSize: '1.25rem' }}>
          <span>🛵</span> DriverApp
        </Link>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
          <div style={{ fontSize: 'var(--text-sm)' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-success)', marginRight: '6px' }} />
            Online
          </div>
          <Link href="/api/auth/signout" className="btn btn-ghost btn-sm" style={{ padding: '4px 8px', fontSize: 'var(--text-xs)' }}>
            Sign Out
          </Link>
        </div>
      </header>

      {/* Main Content Area optimized for mobile */}
      <main style={{ flex: 1, padding: 'var(--space-md)', maxWidth: '600px', margin: '0 auto', width: '100%' }}>
        {children}
      </main>

      {/* Bottom Nav for mobile */}
      <nav style={{ 
        display: 'flex', 
        background: 'var(--bg-card)', 
        borderTop: '1px solid var(--color-border)',
        position: 'sticky',
        bottom: 0,
        zIndex: 10,
        paddingBottom: 'env(safe-area-inset-bottom)'
      }}>
        <Link href="/driver" style={{ flex: 1, textAlign: 'center', padding: 'var(--space-md)', fontSize: '1.5rem', color: 'var(--color-primary)', borderTop: '2px solid var(--color-primary)' }}>
          📋
        </Link>
        <Link href="/driver/history" style={{ flex: 1, textAlign: 'center', padding: 'var(--space-md)', fontSize: '1.5rem', color: 'var(--color-text-muted)' }}>
          🕘
        </Link>
      </nav>
    </div>
  );
}
