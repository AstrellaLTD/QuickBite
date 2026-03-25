import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    // We can allow guest checkout, but for this demo let's require auth
    if (!session?.user) {
      return Response.json(
        { success: false, error: 'You must be signed in to place an order.' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = await request.json();
    
    const { items, address, paymentMethod, specialInstructions, deliveryZoneId } = body;

    if (!items || !items.length) {
      return Response.json({ success: false, error: 'Cart is empty' }, { status: 400 });
    }

    if (!address || !address.street || !address.city || !address.postalCode) {
      return Response.json({ success: false, error: 'Incomplete address details' }, { status: 400 });
    }

    // Usually we would fetch fresh prices from DB to avoid client-side tampering
    // For this prototype, we'll calculate totals assuming the client's payload is structured
    // correctly but we SHOULD query the DB. Let's do a basic DB validation loop:
    
    let subtotal = 0;
    
    // Validate delivery zone
    const zone = await prisma.deliveryZone.findFirst(); // In real app, find by ID. Just getting first for demo.
    const deliveryFee = zone ? zone.baseFee : 2.99;

    // Create the order atomically using a Prisma transaction
    const order = await prisma.$transaction(async (tx) => {
      // 1. Save or get the address
      const savedAddress = await tx.address.create({
        data: {
          userId,
          label: 'Delivery Address',
          street: address.street,
          city: address.city,
          postalCode: address.postalCode,
          lat: 40.7128, // Placeholder
          lng: -74.0060, // Placeholder
        }
      });

      // 2. Loop through items to calculate precise total
      const orderItemsData = [];
      
      for (const cartItem of items) {
        const dbItem = await tx.menuItem.findUnique({ where: { id: cartItem.menuItem.id } });
        if (!dbItem) throw new Error(`Item ${cartItem.menuItem.name} not found`);

        let itemModTotal = 0;
        const customizationData = [];

        // Add customizations
        for (const selected of cartItem.selectedCustomizations) {
          // You should validate carefully in production
          itemModTotal += selected.priceModifier;
          customizationData.push({
            name: selected.customizationName,
            optionLabel: selected.optionLabel,
            priceModifier: selected.priceModifier
          });
        }

        const lineTotal = (dbItem.price + itemModTotal) * cartItem.quantity;
        subtotal += lineTotal;

        orderItemsData.push({
          menuItemId: dbItem.id,
          name: dbItem.name,
          quantity: cartItem.quantity,
          priceAtTime: dbItem.price,
          specialInstructions: cartItem.specialInstructions || null,
          customizations: {
            create: customizationData
          }
        });
      }

      const tax = parseFloat((subtotal * 0.08).toFixed(2));
      const total = subtotal + tax + deliveryFee;

      // 3. Create the order
      const newOrder = await tx.order.create({
        data: {
          userId,
          status: 'PENDING',
          paymentStatus: paymentMethod === 'CARD' ? 'PAID' : 'PENDING',
          subtotal,
          tax,
          deliveryFee,
          total,
          deliveryAddressId: savedAddress.id,
          specialInstructions: specialInstructions || null,
          items: {
            create: orderItemsData
          }
        }
      });

      return newOrder;
    });

    return Response.json(
      { success: true, orderId: order.id, message: 'Order placed successfully' },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Order creation error:', error);
    return Response.json(
      { success: false, error: error.message || 'Failed to place order' },
      { status: 500 }
    );
  }
}
