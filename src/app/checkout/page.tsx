'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/stores/cartStore';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const cartStore = useCartStore();
  const [mounted, setMounted] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [address, setAddress] = useState({
    street: '',
    city: 'Downtown',
    postalCode: ''
  });
  
  const [paymentMethod, setPaymentMethod] = useState('CARD');
  const [specialInstructions, setSpecialInstructions] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (status === 'loading' || !mounted) {
    return <div className="container" style={{ padding: 'var(--space-3xl) 0' }}>Loading checkout...</div>;
  }

  if (status === 'unauthenticated') {
    return (
      <div className="container" style={{ padding: 'var(--space-3xl) 0', textAlign: 'center' }}>
        <h1 className="page-title">Sign in required</h1>
        <p style={{ marginBottom: 'var(--space-lg)', color: 'var(--color-text-secondary)' }}>
          You must be signed in to place an order.
        </p>
        <Link href="/login" className="btn btn-primary">
          Sign In
        </Link>
      </div>
    );
  }

  const { items, subtotal, clearCart } = cartStore;

  if (items.length === 0) {
    router.push('/cart');
    return null;
  }

  const tax = subtotal * 0.08;
  const deliveryFee = 2.99; // Mock delivery zone fee
  const total = subtotal + tax + deliveryFee;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items,
          address,
          paymentMethod,
          specialInstructions
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to place order');
      }

      // Success! Clear cart and redirect to order success page
      clearCart();
      router.push(`/orders/${data.orderId}?success=true`);
      
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: 'var(--space-2xl) 0' }}>
      <h1 className="page-title" style={{ marginBottom: 'var(--space-xl)' }}>Checkout</h1>

      {error && (
        <div style={{ padding: 'var(--space-md)', background: 'var(--color-error-bg)', color: 'var(--color-error)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-lg)' }}>
          {error}
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-3" style={{ alignItems: 'flex-start' }}>
        {/* Checkout Details Form */}
        <div className="flex-col" style={{ gridColumn: 'span 2', gap: 'var(--space-xl)' }}>
          
          <div className="card">
            <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-md)' }}>1. Contact Information</h2>
            <div className="grid grid-cols-2" style={{ gap: 'var(--space-md)' }}>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input type="text" className="form-input" value={session?.user?.name || ''} disabled />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" className="form-input" value={session?.user?.email || ''} disabled />
              </div>
            </div>
          </div>

          <div className="card">
            <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-md)' }}>2. Delivery Address</h2>
            <div className="form-group" style={{ marginBottom: 'var(--space-md)' }}>
              <label className="form-label" htmlFor="street">Street Address</label>
              <input 
                id="street" 
                type="text" 
                className="form-input" 
                required
                placeholder="123 Main St, Apt 4B"
                value={address.street}
                onChange={e => setAddress({...address, street: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2" style={{ gap: 'var(--space-md)' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="city">City/Zone</label>
                <select 
                  id="city" 
                  className="form-select"
                  value={address.city}
                  onChange={e => setAddress({...address, city: e.target.value})}
                >
                  <option value="Downtown">Downtown Delivery Zone</option>
                  <option value="Suburbs" disabled>Suburbs (Currently Unavailable)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="postal">Postal Code</label>
                <input 
                  id="postal" 
                  type="text" 
                  className="form-input"
                  required
                  placeholder="10001"
                  value={address.postalCode}
                  onChange={e => setAddress({...address, postalCode: e.target.value})}
                />
              </div>
            </div>
            
            <div className="form-group" style={{ marginTop: 'var(--space-md)' }}>
              <label className="form-label" htmlFor="instructions">Delivery Instructions</label>
              <textarea 
                id="instructions"
                className="form-textarea"
                placeholder="E.g., Leave at the front door, gate code is 1234..."
                value={specialInstructions}
                onChange={e => setSpecialInstructions(e.target.value)}
              />
            </div>
          </div>

          <div className="card">
            <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-md)' }}>3. Payment Method</h2>
            <div className="flex-col gap-sm">
              <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', padding: 'var(--space-md)', border: `1px solid ${paymentMethod === 'CARD' ? 'var(--color-primary)' : 'var(--color-border)'}`, borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  name="payment" 
                  checked={paymentMethod === 'CARD'} 
                  onChange={() => setPaymentMethod('CARD')}
                  style={{ accentColor: 'var(--color-primary)', width: '20px', height: '20px' }}
                />
                <div>
                  <div style={{ fontWeight: 600 }}>Credit Card</div>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>Pay securely online</div>
                </div>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', padding: 'var(--space-md)', border: `1px solid ${paymentMethod === 'CASH' ? 'var(--color-primary)' : 'var(--color-border)'}`, borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  name="payment" 
                  checked={paymentMethod === 'CASH'} 
                  onChange={() => setPaymentMethod('CASH')}
                  style={{ accentColor: 'var(--color-primary)', width: '20px', height: '20px' }}
                />
                <div>
                  <div style={{ fontWeight: 600 }}>Cash on Delivery</div>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>Pay when your food arrives</div>
                </div>
              </label>
            </div>
            
            {paymentMethod === 'CARD' && (
              <div style={{ marginTop: 'var(--space-md)', padding: 'var(--space-md)', background: 'rgba(255, 107, 53, 0.05)', borderRadius: 'var(--radius-md)' }}>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-primary)' }}>
                  ℹ️ This is a demo. Your order will be placed instantly without a real charge.
                </p>
              </div>
            )}
          </div>

        </div>

        {/* Order Summary & Submit Sidebar */}
        <div className="card" style={{ position: 'sticky', top: 'calc(var(--header-height) + var(--space-md))' }}>
          <h3 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-md)', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-sm)' }}>
            Order Summary
          </h3>
          
          <div className="flex-col gap-sm" style={{ marginBottom: 'var(--space-lg)' }}>
            <div className="flex-between">
              <span style={{ color: 'var(--color-text-secondary)' }}>Items ({items.reduce((a, b) => a + b.quantity, 0)})</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex-between">
              <span style={{ color: 'var(--color-text-secondary)' }}>Estimated Tax</span>
              <span>{formatPrice(tax)}</span>
            </div>
            <div className="flex-between">
              <span style={{ color: 'var(--color-text-secondary)' }}>Delivery Fee</span>
              <span>{formatPrice(deliveryFee)}</span>
            </div>
          </div>

          <div className="divider" />

          <div className="flex-between" style={{ marginBottom: 'var(--space-md)', fontSize: 'var(--text-xl)', fontWeight: 700 }}>
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>

          <button 
            type="submit"
            className="btn btn-primary btn-lg" 
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? 'Placing Order...' : `Place Order • ${formatPrice(total)}`}
          </button>
          
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textAlign: 'center', marginTop: 'var(--space-sm)' }}>
            By placing your order, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </form>
    </div>
  );
}
