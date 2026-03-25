import prisma from '@/lib/prisma';
import AdminOrdersClient from './OrdersClient';

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      user: {
        select: {
          name: true,
          email: true
        }
      },
      deliveryAddress: {
        select: {
          street: true
        }
      },
      items: {
        select: {
          id: true,
          name: true,
          quantity: true
        }
      }
    }
  });

  return <AdminOrdersClient orders={orders} />;
}
