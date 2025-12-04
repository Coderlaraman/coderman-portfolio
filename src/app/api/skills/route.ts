import { NextResponse } from 'next/server';
import { db } from '@/lib/database';

// GET /api/skills - Get all skills
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = searchParams.get('limit');

    const options = {
      category: category || undefined,
      limit: limit ? parseInt(limit) : undefined,
    };

    const skills = await db.getSkills(options);
    return NextResponse.json(skills);
  } catch (error) {
    console.error('Error fetching skills:', error);
    return NextResponse.json(
      { error: 'Failed to fetch skills' },
      { status: 500 }
    );
  }
}

// POST /api/skills - Create a new skill (admin only)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Basic validation
    const requiredFields = ['name', 'category', 'proficiency'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Validate proficiency range
    if (body.proficiency < 0 || body.proficiency > 100) {
      return NextResponse.json(
        { error: 'Proficiency must be between 0 and 100' },
        { status: 400 }
      );
    }

    const newSkill = await db.createSkill({
      ...body,
      order: body.order || 0,
      icon: body.icon || undefined,
      description: body.description || undefined,
    });

    return NextResponse.json(newSkill, { status: 201 });
  } catch (error) {
    console.error('Error creating skill:', error);
    return NextResponse.json(
      { error: 'Failed to create skill' },
      { status: 500 }
    );
  }
}