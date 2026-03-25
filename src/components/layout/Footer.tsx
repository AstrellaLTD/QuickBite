'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();

  // Custom landing page has its own footer
  if (pathname === '/') return null;
  // Admin/Driver also usually don't need this footer
  if (pathname.startsWith('/admin') || pathname.startsWith('/driver')) return null;

  return (
    <footer
      style={{
        borderTop: '1px solid var(--color-border)',
        background: 'var(--bg-secondary)',
        padding: 'var(--space-2xl) 0 var(--space-lg)',
        marginTop: 'auto',
      }}
      id="main-footer"
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--space-2xl)',
            marginBottom: 'var(--space-2xl)',
          }}
        >
          {/* Brand */}
          <div>
            <div className="logo" style={{ marginBottom: 'var(--space-md)' }}>
              <span style={{ fontSize: '1.5rem' }}>🍔</span>
              QuickBite
            </div>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', lineHeight: 1.7 }}>
              Delicious food delivered fast to your doorstep. Order from your favorite restaurant with just a few clicks.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h5 style={{ marginBottom: 'var(--space-md)', color: 'var(--color-text)' }}>Quick Links</h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
              <Link href="/menu" style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>Our Menu</Link>
              <Link href="/orders" style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>Track Order</Link>
              <Link href="/cart" style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>Your Cart</Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h5 style={{ marginBottom: 'var(--space-md)', color: 'var(--color-text)' }}>Contact Us</h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
              <span>📍 123 Food Street, Downtown</span>
              <span>📞 (555) 123-4567</span>
              <span>✉️ hello@quickbite.com</span>
            </div>
          </div>

          {/* Hours */}
          <div>
            <h5 style={{ marginBottom: 'var(--space-md)', color: 'var(--color-text)' }}>Opening Hours</h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
              <span>Mon–Fri: 10:00 AM – 11:00 PM</span>
              <span>Sat–Sun: 11:00 AM – 12:00 AM</span>
            </div>
          </div>
        </div>

        <div
          className="divider"
          style={{ margin: '0 0 var(--space-lg)' }}
        />

        <div className="flex-between" style={{ flexWrap: 'wrap', gap: 'var(--space-md)' }}>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)' }}>
            © {new Date().getFullYear()} QuickBite. All rights reserved.
          </p>
          <div className="flex gap-md">
            <Link href="#" style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)' }}>Privacy Policy</Link>
            <Link href="#" style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)' }}>Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
