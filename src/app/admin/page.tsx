import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import prisma from '@/lib/prisma';
export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const session = await auth();

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/');
  }

  // Quick Analytics Fetch
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    totalOrders,
    todayOrders,
    pendingOrders,
    totalRevenue
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { createdAt: { gte: today } } }),
    prisma.order.count({ where: { status: 'PENDING' } }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { in: ['DELIVERED', 'READY', 'ACCEPTED', 'ON_THE_WAY'] } }
    }),
  ]);

  return (
    <div>
      <h1 className="page-title" style={{ marginBottom: 'var(--space-md)' }}>Dashboard Overview</h1>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-2xl)' }}>
        Welcome back, {session.user.name}. Here's what's happening today.
      </p>

      {/* Metric Cards */}
      <div className="grid grid-cols-4" style={{ marginBottom: 'var(--space-3xl)' }}>
        <div className="card">
          <div style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>Today's Orders</div>
          <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, marginTop: 'var(--space-xs)' }}>
            {todayOrders}
          </div>
        </div>
        
        <div className="card">
          <div style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>Needs Attention</div>
          <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, marginTop: 'var(--space-xs)', color: pendingOrders > 0 ? 'var(--color-warning)' : 'var(--color-text)' }}>
            {pendingOrders}
          </div>
        </div>

        <div className="card">
          <div style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>All-Time Orders</div>
          <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, marginTop: 'var(--space-xs)' }}>
            {totalOrders}
          </div>
        </div>

        <div className="card">
          <div style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>Total Revenue</div>
          <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, marginTop: 'var(--space-xs)', color: 'var(--color-success)' }}>
            {formatPrice(totalRevenue._sum.total || 0)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2" style={{ gap: 'var(--space-xl)' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-3xl) 0', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>📋</div>
          <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-xs)' }}>Manage Orders</h2>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-lg)' }}>Accept incoming orders and dispatch to drivers</p>
          <Link href="/admin/orders" className="btn btn-primary" style={{ width: '200px' }}>
            View Orders
          </Link>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-3xl) 0', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>🍔</div>
          <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-xs)' }}>Edit Menu</h2>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-lg)' }}>Update prices, stock, and add new items</p>
          <button className="btn btn-secondary" style={{ width: '200px' }} disabled title="Not implemented in this demo">
            Menu Editor
          </button>
        </div>
      </div>
    </div>
  );
}
