import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { sendAdminLoginCode } from '@/lib/email';
import { randomInt } from 'crypto';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    console.log('Requesting admin code...');
    // Get admin email from environment variables
    // We use ADMIN_EMAIL if set, otherwise fallback to EMAIL_USER which is used for sending
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
    console.log('Admin email configured:', adminEmail ? 'Yes' : 'No');
    
    if (!adminEmail) {
      console.error('Admin email configuration missing');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Generate 6-digit code
    const code = randomInt(100000, 999999).toString();
    console.log('Code generated');
    
    // Save code to database associated with the admin email
    // Use 'as any' temporarily if types aren't updating immediately in IDE
    console.log('Saving code to database...');
    await (prisma as any).adminCode.create({
      data: {
        code,
        email: adminEmail,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      },
    });
    console.log('Code saved to database');

    // Send email to the admin email address
    console.log('Sending email...');
    await sendAdminLoginCode(adminEmail, code);
    console.log('Email sent successfully');

    return NextResponse.json({ message: 'Code sent successfully' });
  } catch (error) {
    console.error('Error requesting admin code:', error);
    return NextResponse.json(
      { error: 'Failed to send code' },
      { status: 500 }
    );
  }
}
