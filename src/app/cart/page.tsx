'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/stores/cartStore';
import { formatPrice } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const cartStore = useCartStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="container" style={{ padding: 'var(--space-3xl) 0' }}>
        <h1 className="page-title">Your Cart</h1>
        <div className="card skeleton" style={{ height: '300px' }} />
      </div>
    );
  }

  const { items, subtotal, updateQuantity, removeItem } = cartStore;

  const tax = subtotal * 0.08; // 8% placeholder tax
  // We'll calculate delivery fee during checkout based on zone
  const total = subtotal + tax;

  return (
    <div className="container" style={{ padding: 'var(--space-2xl) 0' }}>
      <h1 className="page-title" style={{ marginBottom: 'var(--space-xl)' }}>Your Cart</h1>

      {items.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-3xl) 0' }}>
          <div style={{ fontSize: '4rem', marginBottom: 'var(--space-md)' }}>🛒</div>
          <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-sm)' }}>Your cart is empty</h2>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-lg)' }}>
            Looks like you haven't added anything to your order yet.
          </p>
          <Link href="/menu" className="btn btn-primary">
            Browse Menu
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-3" style={{ alignItems: 'flex-start' }}>
          <div style={{ gridColumn: 'span 2' }}>
            <div className="card">
              <div className="flex-col" style={{ gap: 'var(--space-md)' }}>
                {items.map((item) => (
                  <div key={item.id} style={{ display: 'flex', gap: 'var(--space-md)', paddingBottom: 'var(--space-md)', borderBottom: '1px solid var(--color-border)' }}>
                    {/* Item Info */}
                    <div style={{ flex: 1 }}>
                      <div className="flex-between" style={{ alignItems: 'flex-start' }}>
                        <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600 }}>{item.product.name}</h3>
                        <span style={{ fontWeight: 600 }}>{formatPrice(item.itemTotal)}</span>
                      </div>

                      {/* Selections */}
                      {(item.selectedVariation || item.selectedOptions.length > 0 || item.selectedExtras.length > 0) && (
                        <ul style={{
                          fontSize: 'var(--text-sm)',
                          color: 'var(--color-text-secondary)',
                          marginTop: 'var(--space-xs)',
                          listStyle: 'none'
                        }}>
                          {item.selectedVariation && (
                            <li>• {item.selectedVariation.name} ({formatPrice(item.selectedVariation.price)})</li>
                          )}
                          {item.selectedOptions.map((o, i) => (
                            <li key={i}>• {o.choiceName} {o.priceAdd > 0 ? `(+${formatPrice(o.priceAdd)})` : ''}</li>
                          ))}
                          {item.selectedExtras.map((e, i) => (
                            <li key={i}>• {e.name} (+{formatPrice(e.priceAdd)})</li>
                          ))}
                        </ul>
                      )}

                      {/* Special Instructions */}
                      {item.specialInstructions && (
                        <p style={{ 
                          fontSize: 'var(--text-sm)', 
                          color: 'var(--color-text-secondary)',
                          marginTop: 'var(--space-xs)',
                          fontStyle: 'italic'
                        }}>
                          "{item.specialInstructions}"
                        </p>
                      )}

                      {/* Actions */}
                      <div className="flex-between" style={{ marginTop: 'var(--space-sm)', alignItems: 'center' }}>
                        <div className="qty-control" style={{ transform: 'scale(0.9)', transformOrigin: 'left' }}>
                          <button 
                            className="qty-btn" 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >−</button>
                          <div className="qty-value">{item.quantity}</div>
                          <button 
                            className="qty-btn" 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >+</button>
                        </div>
                        
                        <button 
                          className="btn btn-ghost btn-sm" 
                          style={{ color: 'var(--color-error)' }}
                          onClick={() => removeItem(item.id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="card" style={{ position: 'sticky', top: 'calc(var(--header-height) + var(--space-md))' }}>
            <h3 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-md)', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-sm)' }}>
              Order Summary
            </h3>
            
            <div className="flex-col gap-sm" style={{ marginBottom: 'var(--space-lg)' }}>
              <div className="flex-between">
                <span style={{ color: 'var(--color-text-secondary)' }}>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex-between">
                <span style={{ color: 'var(--color-text-secondary)' }}>Estimated Tax</span>
                <span>{formatPrice(tax)}</span>
              </div>
              <div className="flex-between">
                <span style={{ color: 'var(--color-text-secondary)' }}>Delivery Fee</span>
                <span style={{ fontSize: 'var(--text-xs)' }}>Calculated at checkout</span>
              </div>
            </div>

            <div className="divider" />

            <div className="flex-between" style={{ marginBottom: 'var(--space-lg)', fontSize: 'var(--text-xl)', fontWeight: 700 }}>
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>

            <button 
              className="btn btn-primary btn-lg" 
              style={{ width: '100%' }}
              onClick={() => router.push('/checkout')}
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
