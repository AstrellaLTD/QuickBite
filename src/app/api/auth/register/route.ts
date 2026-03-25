import { hash } from 'bcryptjs';
import prisma from '@/lib/prisma';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, phone, role } = await request.json();

    if (!name || !email || !password) {
      return Response.json(
        { success: false, error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return Response.json(
        { success: false, error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    // Only allow CUSTOMER and DRIVER registration
    const userRole = role === 'DRIVER' ? 'DRIVER' : 'CUSTOMER';

    const passwordHash = await hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone: phone || null,
        passwordHash,
        role: userRole,
      },
    });

    return Response.json(
      {
        success: true,
        data: { id: user.id, name: user.name, email: user.email, role: user.role },
        message: 'Account created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return Response.json(
      { success: false, error: 'Failed to create account' },
      { status: 500 }
    );
  }
}
