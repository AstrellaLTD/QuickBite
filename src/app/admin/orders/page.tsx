import prisma from '@/lib/prisma';
export const dynamic = 'force-dynamic';
import AdminOrdersClient from './OrdersClient';

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      customer: {
        select: {
          name: true,
          email: true
        }
      },
      address: {
        select: {
          street: true
        }
      },
      items: {
        include: {
          menuItem: {
            select: { name: true }
          }
        }
      }
    }
  });

  return <AdminOrdersClient orders={orders.map((o: any) => ({ ...o, user: o.customer })) as any} />;
}
