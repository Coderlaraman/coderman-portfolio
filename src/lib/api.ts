import { Project, Skill, ContactMessage } from '@/lib/database/types';

// Re-export types for convenience
export type { Project, Skill, ContactMessage } from '@/lib/database/types';

// API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Generic fetch function with error handling
async function fetchWithError<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred');
  }
}

// Projects API functions
export async function getProjects(options?: { featured?: boolean; limit?: number }): Promise<Project[]> {
  const params = new URLSearchParams();
  if (options?.featured !== undefined) params.append('featured', options.featured.toString());
  if (options?.limit) params.append('limit', options.limit.toString());
  
  const url = `${API_BASE_URL}/api/projects${params.toString() ? `?${params.toString()}` : ''}`;
  return fetchWithError<Project[]>(url);
}

export async function getProjectById(id: string): Promise<Project | null> {
  // Since we don't have a specific endpoint for single projects, we'll fetch all and filter
  const projects = await getProjects();
  return projects.find(p => p.id === id) || null;
}

// Skills API functions
export async function getSkills(options?: { category?: string; limit?: number }): Promise<Skill[]> {
  const params = new URLSearchParams();
  if (options?.category) params.append('category', options.category);
  if (options?.limit) params.append('limit', options.limit.toString());
  
  const url = `${API_BASE_URL}/api/skills${params.toString() ? `?${params.toString()}` : ''}`;
  return fetchWithError<Skill[]>(url);
}

// Contact Messages API functions
export async function createContactMessage(data: {
  name: string;
  email: string;
  message: string;
  ipAddress?: string;
  userAgent?: string;
}): Promise<ContactMessage> {
  const url = `${API_BASE_URL}/api/contact-messages`;
  return fetchWithError<ContactMessage>(url, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Utility function to get client IP address (for contact form)
export function getClientIp(): Promise<string> {
  return fetch('https://api.ipify.org?format=json')
    .then(response => response.json())
    .then(data => data.ip)
    .catch(() => 'unknown');
}

// Utility function to categorize skills
export function categorizeSkills(skills: Skill[]): Record<string, Skill[]> {
  return skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);
}

// Utility function to sort projects by order
export function sortProjectsByOrder(projects: Project[]): Project[] {
  return [...projects].sort((a, b) => a.order - b.order);
}

// Utility function to filter featured projects
export function filterFeaturedProjects(projects: Project[]): Project[] {
  return projects.filter(project => project.featured);
}

// Error handling utilities
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function handleApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }
  
  if (error instanceof Error) {
    return new ApiError(error.message);
  }
  
  return new ApiError('An unexpected error occurred');
}