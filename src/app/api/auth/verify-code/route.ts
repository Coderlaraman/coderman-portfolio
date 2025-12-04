import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

export async function POST(request: Request) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: 'Code is required' },
        { status: 400 }
      );
    }

    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
    
    if (!adminEmail) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Verify code
    const validCode = await (prisma as any).adminCode.findFirst({
      where: {
        email: adminEmail,
        code,
        used: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!validCode) {
      return NextResponse.json(
        { error: 'Invalid or expired code' },
        { status: 401 }
      );
    }

    // Mark code as used
    await (prisma as any).adminCode.update({
      where: { id: validCode.id },
      data: { used: true },
    });

    // Generate JWT token
    const token = jwt.sign({ email: adminEmail, role: 'admin' }, JWT_SECRET, {
      expiresIn: '24h',
    });

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error verifying admin code:', error);
    return NextResponse.json(
      { error: 'Failed to verify code' },
      { status: 500 }
    );
  }
}
