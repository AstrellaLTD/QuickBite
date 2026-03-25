import prisma from '@/lib/prisma';
export const dynamic = 'force-dynamic';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { formatPrice, formatDate } from '@/lib/utils';
import Link from 'next/link';

export default async function OrdersListPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/login');
  }

  // Redirect Admins and Drivers to their respective portals
  // Customers stay here
  if (session.user.role === 'ADMIN') {
    redirect('/admin');
  } else if (session.user.role === 'DRIVER') {
    redirect('/driver');
  }

  const orders = await prisma.order.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      items: {
        include: {
          menuItem: true
        }
      }
    }
  });

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'DELIVERED': return <span className="badge badge-primary">Delivered</span>;
      case 'CANCELLED': return <span className="badge badge-ghost">Cancelled</span>;
      case 'PENDING': return <span className="badge" style={{ background: 'var(--color-warning)', color: 'white' }}>Pending</span>;
      default: return <span className="badge" style={{ background: 'var(--color-info)', color: 'white' }}>In Progress</span>;
    }
  }

  return (
    <div className="container" style={{ padding: 'var(--space-2xl) 0', maxWidth: '800px' }}>
      <div className="flex-between" style={{ marginBottom: 'var(--space-xl)' }}>
        <h1 className="page-title">Your Orders</h1>
        <Link href="/menu" className="btn btn-secondary">
          New Order
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-3xl) 0' }}>
          <div style={{ fontSize: '4rem', marginBottom: 'var(--space-md)' }}>🧾</div>
          <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-sm)' }}>No orders yet</h2>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-lg)' }}>
            When you place orders, they will appear here so you can track them.
          </p>
          <Link href="/menu" className="btn btn-primary">
            Browse Menu
          </Link>
        </div>
      ) : (
        <div className="flex-col" style={{ gap: 'var(--space-md)' }}>
          {orders.map((order) => (
            <Link 
              href={`/orders/${order.id}`} 
              key={order.id}
              className="card card-hover"
              style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', textDecoration: 'none', color: 'inherit' }}
            >
              <div className="flex-between" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-sm)' }}>
                <div>
                  <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600 }}>Order #{order.id.slice(-6).toUpperCase()}</h3>
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                    {formatDate(order.createdAt)}
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: '4px' }}>
                    {formatPrice(order.total)}
                  </div>
                  {getStatusBadge(order.status)}
                </div>
              </div>

              <div>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {order.items.map(item => `${item.quantity}x ${item.menuItem?.name || 'Item'}`).join(', ')}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
