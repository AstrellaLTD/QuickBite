'use server';

import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function updateOrderStatus(orderId: string, newStatus: string) {
  const session = await auth();

  // Validate admin session
  if (!session?.user || session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }

  // Define valid transitions. An admin can generally force transitions,
  // but let's keep it simple.
  const validStatuses = ['PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'ON_THE_WAY', 'DELIVERED', 'CANCELLED'];
  if (!validStatuses.includes(newStatus)) {
    throw new Error('Invalid status');
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { status: newStatus }
  });

  // Revalidate the admin orders page and the customer's specific order page
  revalidatePath('/admin/orders');
  revalidatePath(`/orders/${orderId}`);
  
  return { success: true };
}
