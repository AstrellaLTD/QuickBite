'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { formatPrice } from '@/lib/utils';
import { claimOrder, markDelivered } from './actions';

interface DriverOrder {
  id: string;
  status: string;
  total: number;
  deliveryAddress?: { street: string; city: string; postalCode: string };
  user?: { name: string; phone: string | null };
}

export default function DriverDashboardClient({
  activeOrder,
  availableOrders,
}: {
  activeOrder: DriverOrder | null;
  availableOrders: DriverOrder[];
}) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    // 10s auto refresh for simulated realtime orders
    const interval = setInterval(() => {
      router.refresh();
    }, 10000);
    return () => clearInterval(interval);
  }, [router]);

  const handleClaim = async (id: string) => {
    setLoadingId(id);
    try {
      await claimOrder(id);
    } catch (e: any) {
      alert(e.message || 'Failed to claim');
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelivered = async (id: string) => {
    setLoadingId(id);
    try {
      await markDelivered(id);
    } catch (e: any) {
      alert(e.message || 'Failed to update');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div>
      {/* Active Order Section */}
      <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-md)' }}>Current Delivery</h2>
      
      {activeOrder ? (
        <div className="card" style={{ border: '2px solid var(--color-primary)', marginBottom: 'var(--space-2xl)' }}>
          <div className="flex-between" style={{ marginBottom: 'var(--space-md)' }}>
            <span className="badge badge-primary">ON THE WAY</span>
            <span style={{ fontWeight: 700, fontSize: 'var(--text-lg)' }}>{formatPrice(activeOrder.total)}</span>
          </div>
          
          <div style={{ marginBottom: 'var(--space-md)' }}>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: '2px' }}>Deliver to</div>
            <div style={{ fontWeight: 600, fontSize: 'var(--text-lg)' }}>{activeOrder.deliveryAddress?.street}</div>
            <div style={{ color: 'var(--color-text-secondary)' }}>{activeOrder.deliveryAddress?.city}, {activeOrder.deliveryAddress?.postalCode}</div>
          </div>

          <div style={{ marginBottom: 'var(--space-xl)', padding: 'var(--space-md)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>Customer</div>
            <div style={{ fontWeight: 500 }}>{activeOrder.user?.name}</div>
            {activeOrder.user?.phone && (
              <a href={`tel:${activeOrder.user.phone}`} style={{ color: 'var(--color-primary)', textDecoration: 'none', display: 'block', marginTop: 'var(--space-xs)' }}>
                📞 {activeOrder.user.phone}
              </a>
            )}
          </div>

          <button 
            className="btn btn-primary btn-lg" 
            style={{ width: '100%' }}
            onClick={() => handleDelivered(activeOrder.id)}
            disabled={loadingId === activeOrder.id}
          >
            {loadingId === activeOrder.id ? 'Updating...' : 'Mark as Delivered'}
          </button>
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', marginBottom: 'var(--space-2xl)', color: 'var(--color-text-muted)', borderStyle: 'dashed' }}>
          No active delivery. Claim an order below.
        </div>
      )}


      {/* Available Orders Section */}
      <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-md)' }}>Available Orders</h2>
      
      {availableOrders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-2xl) 0', color: 'var(--color-text-muted)' }}>
          <div style={{ fontSize: '3rem', marginBottom: 'var(--space-sm)' }}>😴</div>
          No orders ready for pickup currently.
        </div>
      ) : (
        <div className="flex-col gap-md">
          {availableOrders.map(order => (
            <div key={order.id} className="card">
              <div className="flex-between" style={{ marginBottom: 'var(--space-sm)' }}>
                <span style={{ fontWeight: 600 }}>{formatPrice(order.total)}</span>
                <span className="badge" style={{ background: 'var(--color-info)', color: 'white' }}>READY</span>
              </div>
              
              <div style={{ marginBottom: 'var(--space-md)' }}>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>Dropoff</div>
                <div style={{ fontWeight: 500 }}>{order.deliveryAddress?.street}</div>
              </div>

              <button 
                className="btn btn-secondary" 
                style={{ width: '100%' }}
                onClick={() => handleClaim(order.id)}
                disabled={loadingId === order.id || activeOrder !== null}
              >
                {loadingId === order.id ? 'Claiming...' : 'Claim Delivery'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
