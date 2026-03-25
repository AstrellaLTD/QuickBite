'use server';

import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function claimOrder(orderId: string) {
  const session = await auth();

  if (!session?.user || session.user.role !== 'DRIVER') {
    throw new Error('Unauthorized');
  }

  // Transaction to prevent double-claiming
  const result = await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId } });
    if (!order) throw new Error('Order not found');
    if (order.driverId !== null) throw new Error('Order already claimed');

    return await tx.order.update({
      where: { id: orderId },
      data: { 
        driverId: session.user.id,
        // Wait for admin to dispatch, but we claim it here.
        // Usually it goes READY -> ON_THE_WAY. The driver claims it when it's READY.
        status: 'ON_THE_WAY' 
      }
    });
  });

  revalidatePath('/driver');
  revalidatePath('/admin/orders');
  revalidatePath(`/orders/${orderId}`);

  return { success: true };
}

export async function markDelivered(orderId: string) {
  const session = await auth();

  if (!session?.user || session.user.role !== 'DRIVER') {
    throw new Error('Unauthorized');
  }

  await prisma.order.update({
    where: { 
      id: orderId,
      driverId: session.user.id 
    },
    data: { status: 'DELIVERED' }
  });

  revalidatePath('/driver');
  revalidatePath('/admin/orders');
  revalidatePath(`/orders/${orderId}`);

  return { success: true };
}
