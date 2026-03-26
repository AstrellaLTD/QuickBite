'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useCartStore } from '@/stores/cartStore';

export default function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const cartItemCount = useCartStore((state) => state.getCartCount());

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't show header on admin/driver pages or the custom landing page
  const isAdmin = pathname.startsWith('/admin');
  const isDriver = pathname.startsWith('/driver');
  const isLanding = pathname === '/';
  const isStore = pathname.startsWith('/store');
  if (isAdmin || isDriver || isLanding || isStore) return null;

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/store', label: 'Menu' },
    { href: '/orders', label: 'Orders' },
  ];

  return (
    <header className="header" id="main-header">
      <div className="header-inner">
        <Link href="/" className="logo" id="logo-link">
          <span style={{ fontSize: '1.5rem' }}>🍔</span>
          QuickBite
        </Link>

        <nav className="nav-links" id="desktop-nav">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link ${pathname === item.href ? 'active' : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex gap-sm" style={{ alignItems: 'center' }}>
          <Link href="/cart" className="btn btn-ghost cart-badge" id="cart-button" style={{ position: 'relative' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {mounted && cartItemCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-5px',
                right: '-5px',
                background: 'var(--color-primary)',
                color: 'white',
                fontSize: '10px',
                fontWeight: 'bold',
                height: '18px',
                minWidth: '18px',
                borderRadius: '9px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 4px'
              }}>
                {cartItemCount}
              </span>
            )}
          </Link>

          <Link href="/login" className="btn btn-primary btn-sm" id="login-button">
            Sign In
          </Link>

          <button
            className="mobile-menu-btn"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            id="mobile-menu-toggle"
          >
            <div className="hamburger">
              <span style={mobileOpen ? { transform: 'rotate(45deg) translate(4px, 4px)' } : {}} />
              <span style={mobileOpen ? { opacity: 0 } : {}} />
              <span style={mobileOpen ? { transform: 'rotate(-45deg) translate(4px, -4px)' } : {}} />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="animate-fade-in"
          style={{
            position: 'absolute',
            top: 'var(--header-height)',
            left: 0,
            right: 0,
            background: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--color-border)',
            padding: 'var(--space-md)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-xs)',
            zIndex: 'var(--z-dropdown)',
          }}
          id="mobile-menu"
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link ${pathname === item.href ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
