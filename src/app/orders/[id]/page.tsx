import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import { formatPrice, formatDate } from '@/lib/utils';
import Link from 'next/link';

export default async function OrderPage(props: any) {
  const { id } = await (props.params as Promise<{ id: string }>);
  const searchParams = await (props.searchParams as Promise<{ success?: string }>);

  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      address: true,
      items: {
        include: {
          menuItem: true
        }
      },
      driver: {
        select: {
          name: true,
          phone: true,
        }
      }
    }
  });

  if (!order) {
    notFound();
  }

  // Security check: Only the owner, admin, or assigned driver can view this order
  const isOwner = order.userId === session.user.id;
  const isAdmin = (session.user as any).role === 'ADMIN';
  const isDriver = (session.user as any).role === 'DRIVER' && (order.driverId === null || order.driverId === session.user.id);

  if (!isOwner && !isAdmin && !isDriver) {
    redirect('/');
  }

  const isSuccess = searchParams.success === 'true';

  // Status visual mapping
  const statusSteps = ['PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'ON_THE_WAY', 'DELIVERED'];
  const currentStepIndex = statusSteps.indexOf(order.status);
  
  const getStatusDisplay = (status: string) => {
    switch(status) {
      case 'PENDING': return 'Waiting for restaurant...';
      case 'ACCEPTED': return 'Order Accepted';
      case 'PREPARING': return 'Kitchen is preparing your food';
      case 'READY': return 'Ready for pickup';
      case 'ON_THE_WAY': return 'Driver is on the way';
      case 'DELIVERED': return 'Delivered';
      case 'CANCELLED': return 'Order Cancelled';
      default: return status;
    }
  };

  return (
    <div className="container" style={{ padding: 'var(--space-2xl) 0', maxWidth: '800px' }}>
      
      {isSuccess && (
        <div style={{ padding: 'var(--space-lg)', background: 'var(--color-success-bg)', color: 'var(--color-success)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-xl)', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: 'var(--space-sm)' }}>🎉</div>
          <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 600 }}>Order Placed Successfully!</h2>
          <p>We've received your order and the kitchen has been notified.</p>
        </div>
      )}

      <div className="flex-between" style={{ marginBottom: 'var(--space-lg)', alignItems: 'flex-end' }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: 'var(--space-xs)' }}>Order #{order.id.slice(-6).toUpperCase()}</h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>Placed on {formatDate(order.createdAt)}</p>
        </div>
        <div className={`badge ${order.status === 'DELIVERED' ? 'badge-primary' : 'badge-ghost'}`} style={{ fontSize: 'var(--text-base)', padding: '0.5rem 1rem' }}>
          {getStatusDisplay(order.status)}
        </div>
      </div>

      {/* Progress Tracker (simplified) */}
      {order.status !== 'CANCELLED' && (
        <div className="card" style={{ marginBottom: 'var(--space-xl)' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            position: 'relative',
            padding: 'var(--space-md) 0'
          }}>
            {/* Background connecting line */}
            <div style={{ position: 'absolute', top: '50%', left: '10%', right: '10%', height: '4px', background: 'var(--color-border)', zIndex: 0, transform: 'translateY(-50%)' }} />
            
            {/* Active connecting line */}
            <div style={{ position: 'absolute', top: '50%', left: '10%', width: `${Math.min(100, Math.max(0, (currentStepIndex / (statusSteps.length - 1)) * 80))}%`, height: '4px', background: 'var(--color-primary)', zIndex: 1, transform: 'translateY(-50%)', transition: 'width 1s ease' }} />

            {[
              { status: 'PENDING', icon: '📝', label: 'Placed' },
              { status: 'PREPARING', icon: '🍳', label: 'Preparing' },
              { status: 'ON_THE_WAY', icon: '🛵', label: 'Out for Delivery' },
              { status: 'DELIVERED', icon: '✅', label: 'Delivered' },
            ].map((step, idx) => {
              const stepIdxInFull = statusSteps.indexOf(step.status);
              const isActive = currentStepIndex >= stepIdxInFull;
              
              return (
                <div key={step.status} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, width: '80px', background: 'var(--bg-card)' }}>
                  <div style={{ 
                    width: '40px', height: '40px', 
                    borderRadius: '50%', 
                    background: isActive ? 'var(--color-primary)' : 'var(--bg-secondary)',
                    color: isActive ? 'white' : 'var(--color-text-muted)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.2rem',
                    marginBottom: 'var(--space-xs)',
                    border: `2px solid ${isActive ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    boxShadow: isActive ? '0 0 10px rgba(255, 107, 53, 0.3)' : 'none'
                  }}>
                    {step.icon}
                  </div>
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: isActive ? 600 : 400, color: isActive ? 'var(--color-text)' : 'var(--color-text-muted)', textAlign: 'center' }}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
          
          {order.driver && order.status === 'ON_THE_WAY' && (
            <div style={{ marginTop: 'var(--space-lg)', padding: 'var(--space-md)', background: 'rgba(255, 107, 53, 0.05)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
              <div style={{ fontSize: '2rem' }}>👨‍🚀</div>
              <div>
                <p style={{ fontWeight: 600 }}>Your driver, {order.driver.name}</p>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>Contact: {order.driver.phone || 'N/A'}</p>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-2" style={{ gap: 'var(--space-xl)' }}>
        {/* Receipt items */}
        <div>
          <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-md)' }}>Order Summary</h3>
          <div className="card">
            <div className="flex-col" style={{ gap: 'var(--space-md)' }}>
              {order.items.map((item) => {
                const parsedCustomizations = item.selectedCustomizations ? JSON.parse(item.selectedCustomizations) : [];
                return (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 'var(--space-sm)', borderBottom: '1px solid var(--color-border)' }}>
                  <div>
                    <span style={{ fontWeight: 600 }}>{item.quantity}x {item.menuItem.name}</span>
                    {parsedCustomizations.length > 0 && (
                      <ul style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginTop: '4px', listStyle: 'none' }}>
                        {parsedCustomizations.map((c: any, idx: number) => (
                          <li key={idx}>• {c.name}: {c.optionLabel}</li>
                        ))}
                      </ul>
                    )}
                    {item.specialInstructions && (
                      <p style={{ fontSize: 'var(--text-xs)', fontStyle: 'italic', marginTop: '4px', color: 'var(--color-text-secondary)' }}>
                        "{item.specialInstructions}"
                      </p>
                    )}
                  </div>
                  <span style={{ fontWeight: 600 }}>{formatPrice(item.itemTotal)}</span>
                </div>
              )})}
            </div>

            <div className="flex-col gap-xs" style={{ marginTop: 'var(--space-md)', paddingTop: 'var(--space-md)', borderTop: '1px solid var(--color-border)' }}>
              <div className="flex-between" style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex-between" style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
                <span>Delivery Fee</span>
                <span>{formatPrice(order.deliveryFee)}</span>
              </div>
              <div className="flex-between" style={{ marginTop: 'var(--space-sm)', fontSize: 'var(--text-lg)', fontWeight: 700 }}>
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Details & Address */}
        <div>
          <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-md)' }}>Delivery Details</h3>
          <div className="card flex-col gap-lg">
            
            {order.address && (
              <div>
                <h4 style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-xs)' }}>
                  Delivery Address
                </h4>
                <p style={{ fontWeight: 500 }}>{order.address.street}</p>
                <p style={{ color: 'var(--color-text-secondary)' }}>{order.address.city}, {order.address.postalCode}</p>
              </div>
            )}

            

          </div>

          <div style={{ marginTop: 'var(--space-xl)', display: 'flex', gap: 'var(--space-sm)' }}>
            <Link href="/menu" className="btn btn-primary" style={{ flex: 1 }}>
              Order Again
            </Link>
            <Link href="/orders" className="btn btn-secondary" style={{ flex: 1 }}>
              All Orders
            </Link>
          </div>
        </div>
      </div>
      
    </div>
  );
}
