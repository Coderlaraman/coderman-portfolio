import { NextResponse } from 'next/server';
import { db } from '@/lib/database';

// GET /api/projects - Get all projects
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const featured = searchParams.get('featured');
    const limit = searchParams.get('limit');

    const options = {
      featured: featured ? featured === 'true' : undefined,
      limit: limit ? parseInt(limit) : undefined,
    };

    const projects = await db.getProjects(options);
    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

// POST /api/projects - Create a new project (admin only)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Basic validation
    const requiredFields = ['title', 'description', 'fullDescription', 'technologies', 'challenges', 'results'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    const newProject = await db.createProject({
      ...body,
      order: body.order || 0,
      featured: body.featured || false,
      imageUrls: body.imageUrls || [],
      projectUrl: body.projectUrl || undefined,
      codeUrl: body.codeUrl || undefined,
    });

    return NextResponse.json(newProject, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}