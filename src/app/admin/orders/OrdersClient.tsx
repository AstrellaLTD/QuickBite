"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { formatDate, formatPrice } from '@/lib/utils';
import { updateOrderStatus } from './actions';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
}

interface Order {
  id: string;
  userId: string;
  status: string;
  total: number;
  createdAt: string | Date;
  items: OrderItem[];
  user?: { name: string; email: string };
  deliveryAddress?: { street: string };
}

export default function AdminOrdersClient({ orders }: { orders: Order[] }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    // 10s auto refresh for simulated realtime orders
    const interval = setInterval(() => {
      router.refresh();
    }, 10000);
    return () => clearInterval(interval);
  }, [router]);

  const handleStatusChange = async (orderId: string, currentStatus: string) => {
    // Determine next logical status for the button
    let nextStatus = '';
    switch(currentStatus) {
      case 'PENDING': nextStatus = 'ACCEPTED'; break;
      case 'ACCEPTED': nextStatus = 'PREPARING'; break;
      case 'PREPARING': nextStatus = 'READY'; break;
      case 'READY': nextStatus = 'ON_THE_WAY'; break; // Admin forcing dispatch
      case 'ON_THE_WAY': nextStatus = 'DELIVERED'; break;
      default: return;
    }

    setLoadingId(orderId);
    try {
      await updateOrderStatus(orderId, nextStatus);
    } catch (err) {
      alert('Failed to update status');
      console.error(err);
    } finally {
      setLoadingId(null);
    }
  };

  const getButtonText = (status: string) => {
    switch(status) {
      case 'PENDING': return 'Accept Order';
      case 'ACCEPTED': return 'Start Preparing';
      case 'PREPARING': return 'Mark Ready for Driver';
      case 'READY': return 'Dispatch (Force)';
      case 'ON_THE_WAY': return 'Mark Delivered';
      case 'DELIVERED': return 'Completed';
      case 'CANCELLED': return 'Cancelled';
      default: return 'Update';
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'PENDING': return 'var(--color-warning)';
      case 'ACCEPTED': return 'var(--color-info)';
      case 'PREPARING': return 'var(--color-info)';
      case 'READY': return 'var(--color-primary)';
      case 'ON_THE_WAY': return 'var(--color-primary)';
      case 'DELIVERED': return 'var(--color-success)';
      default: return 'var(--color-text-muted)';
    }
  };

  const filteredOrders = orders.filter(o => {
    if (filter === 'ALL') return true;
    if (filter === 'ACTIVE') return !['DELIVERED', 'CANCELLED'].includes(o.status);
    if (filter === 'COMPLETED') return o.status === 'DELIVERED';
    return o.status === filter;
  });

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: 'var(--space-xl)' }}>
        <h1 className="page-title">Live Orders</h1>
        
        <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
          {['ALL', 'ACTIVE', 'PENDING', 'READY', 'COMPLETED'].map(f => (
            <button 
              key={f}
              className={`btn ${filter === f ? 'btn-primary' : 'btn-ghost'}`}
              style={{ padding: '0.25rem 0.75rem', fontSize: 'var(--text-sm)' }}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--color-border)' }}>
              <th style={{ padding: 'var(--space-md)', fontWeight: 600, color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>Order ID</th>
              <th style={{ padding: 'var(--space-md)', fontWeight: 600, color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>Time</th>
              <th style={{ padding: 'var(--space-md)', fontWeight: 600, color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>Customer</th>
              <th style={{ padding: 'var(--space-md)', fontWeight: 600, color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>Items</th>
              <th style={{ padding: 'var(--space-md)', fontWeight: 600, color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>Total</th>
              <th style={{ padding: 'var(--space-md)', fontWeight: 600, color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>Status</th>
              <th style={{ padding: 'var(--space-md)', fontWeight: 600, color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: 'var(--space-2xl)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  No orders found matching this filter.
                </td>
              </tr>
            ) : filteredOrders.map(order => (
              <tr key={order.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: 'var(--space-md)', fontFamily: 'monospace', fontSize: 'var(--text-sm)' }}>
                  #{order.id.slice(-6).toUpperCase()}
                </td>
                <td style={{ padding: 'var(--space-md)', fontSize: 'var(--text-sm)' }}>
                  {formatDate(order.createdAt)}
                </td>
                <td style={{ padding: 'var(--space-md)' }}>
                  <div style={{ fontWeight: 500 }}>{order.user?.name || 'Guest'}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>{order.deliveryAddress?.street || 'No address'}</div>
                </td>
                <td style={{ padding: 'var(--space-md)', fontSize: 'var(--text-sm)' }}>
                  {order.items.length} items
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                    {order.items.slice(0, 2).map(i => i.name).join(', ')}
                    {order.items.length > 2 ? '...' : ''}
                  </div>
                </td>
                <td style={{ padding: 'var(--space-md)', fontWeight: 600 }}>
                  {formatPrice(order.total)}
                </td>
                <td style={{ padding: 'var(--space-md)' }}>
                  <span className="badge" style={{ background: getStatusColor(order.status), color: 'white', fontSize: '10px' }}>
                    {order.status}
                  </span>
                </td>
                <td style={{ padding: 'var(--space-md)', textAlign: 'right' }}>
                  {['DELIVERED', 'CANCELLED'].includes(order.status) ? (
                    <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Closed</span>
                  ) : (
                    <button 
                      className={`btn ${order.status === 'PENDING' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                      onClick={() => handleStatusChange(order.id, order.status)}
                      disabled={loadingId === order.id}
                    >
                      {loadingId === order.id ? 'Updating...' : getButtonText(order.status)}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
