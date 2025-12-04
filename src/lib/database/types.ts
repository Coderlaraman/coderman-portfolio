// Database types and interfaces
export interface Project {
  id: string;
  title: string;
  description: string;
  fullDescription: string;
  technologies: string[];
  challenges: string[];
  results: string[];
  imageUrls: string[];
  projectUrl?: string;
  codeUrl?: string;
  order: number;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Skill {
  id: string;
  name: string;
  category: 'backend' | 'frontend' | 'tools' | 'database' | 'other';
  proficiency: number; // 0-100
  icon?: string;
  description?: string;
  order: number;
  visible: boolean;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  read: boolean;
  createdAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

export interface SiteContent {
  id: string;
  key: string;
  language: 'en' | 'es';
  content: string;
  type: 'bio' | 'tagline' | 'section_header' | 'button_text' | 'placeholder';
  createdAt: Date;
  updatedAt: Date;
}

// Database client interface
export interface DatabaseClient {
  // Projects
  getProjects: (options?: { featured?: boolean; limit?: number }) => Promise<Project[]>;
  getProjectById: (id: string) => Promise<Project | null>;
  createProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Project>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<Project | null>;
  deleteProject: (id: string) => Promise<boolean>;

  // Skills
  getSkills: (options?: { category?: string; limit?: number }) => Promise<Skill[]>;
  getSkillById: (id: string) => Promise<Skill | null>;
  createSkill: (skill: Omit<Skill, 'id'>) => Promise<Skill>;
  updateSkill: (id: string, updates: Partial<Skill>) => Promise<Skill | null>;
  deleteSkill: (id: string) => Promise<boolean>;

  // Contact Messages
  getContactMessages: (options?: { read?: boolean; limit?: number }) => Promise<ContactMessage[]>;
  getContactMessageById: (id: string) => Promise<ContactMessage | null>;
  createContactMessage: (message: Omit<ContactMessage, 'id' | 'createdAt' | 'read'>) => Promise<ContactMessage>;
  markMessageAsRead: (id: string) => Promise<ContactMessage | null>;
  deleteContactMessage: (id: string) => Promise<boolean>;

  // Site Content
  getSiteContent: (key: string, language: 'en' | 'es') => Promise<SiteContent | null>;
  getAllSiteContent: (language: 'en' | 'es') => Promise<SiteContent[]>;
  createSiteContent: (content: Omit<SiteContent, 'id' | 'createdAt' | 'updatedAt'>) => Promise<SiteContent>;
  updateSiteContent: (id: string, updates: Partial<SiteContent>) => Promise<SiteContent | null>;
  deleteSiteContent: (id: string) => Promise<boolean>;
}