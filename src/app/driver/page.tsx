import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import DriverDashboardClient from './DriverDashboardClient';

export const dynamic = 'force-dynamic';

export default async function DriverDashboardPage() {
  const session = await auth();

  // Find the driver's current active delivery (if any)
  // An active delivery is ON_THE_WAY where driverId = session.user.id
  const activeOrder = await prisma.order.findFirst({
    where: {
      driverId: session?.user?.id,
      status: 'ON_THE_WAY' // Or any other active status meaning they have it
    },
    include: {
      user: { select: { name: true, phone: true } },
      deliveryAddress: true,
    }
  });

  // Find all orders that are READY for pickup and have no driver yet
  // In a complex real-world app, we'd also filter by driver's zone radius
  const availableOrders = await prisma.order.findMany({
    where: {
      status: 'READY',
      driverId: null
    },
    orderBy: {
      createdAt: 'asc'
    },
    include: {
      user: { select: { name: true, phone: true } },
      deliveryAddress: true,
    }
  });

  // Map types to generic objects
  const mapOrder = (o: any) => ({
    id: o.id,
    status: o.status,
    total: o.total,
    deliveryAddress: o.deliveryAddress,
    user: o.user
  });

  return (
    <DriverDashboardClient 
      activeOrder={activeOrder ? mapOrder(activeOrder) : null}
      availableOrders={availableOrders.map(mapOrder)}
    />
  );
}
