import { NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { ContactMessage } from '@/lib/database/types';
import { sendContactEmail } from '@/lib/email';

// GET /api/contact-messages - Get all contact messages
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const read = searchParams.get('read');
    const limit = searchParams.get('limit');

    const options = {
      read: read ? read === 'true' : undefined,
      limit: limit ? parseInt(limit) : undefined,
    };

    const messages = await db.getContactMessages(options);
    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching contact messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contact messages' },
      { status: 500 }
    );
  }
}

// POST /api/contact-messages - Create a new contact message
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, subject, message, ipAddress, userAgent } = body;

    // Basic validation
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    // Message length validation
    if (message.length < 10) {
      return NextResponse.json(
        { error: 'Message must be at least 10 characters long' },
        { status: 400 }
      );
    }

    const newMessage = await db.createContactMessage({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject ? subject.trim() : undefined,
      message: message.trim(),
      ipAddress,
      userAgent,
    });

    // Send email notification
    try {
      await sendContactEmail({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        subject: subject ? subject.trim() : undefined,
        message: message.trim(),
      });
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError);
      // We don't return an error here because the message was successfully saved to the DB
    }

    return NextResponse.json(newMessage, { status: 201 });
  } catch (error) {
    console.error('Error creating contact message:', error);
    return NextResponse.json(
      { error: 'Failed to create contact message' },
      { status: 500 }
    );
  }
}