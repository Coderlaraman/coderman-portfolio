import { PrismaClient } from '@prisma/client';
import { DatabaseClient, Project, Skill, ContactMessage, SiteContent } from './types';

// PrismaClient singleton pattern to prevent multiple instances in development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Simple initialization to avoid "client" engine issues
const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export class PrismaDatabaseAdapter implements DatabaseClient {
  // Projects methods
  async getProjects(options?: { featured?: boolean; limit?: number }): Promise<Project[]> {
    const where = options?.featured !== undefined ? { featured: options.featured } : {};
    
    const projects = await prisma.project.findMany({
      where,
      orderBy: { order: 'asc' },
      take: options?.limit,
    });

    return projects.map(this.mapPrismaProjectToProject);
  }

  async getProjectById(id: string): Promise<Project | null> {
    const project = await prisma.project.findUnique({ where: { id } });
    return project ? this.mapPrismaProjectToProject(project) : null;
  }

  async createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    const newProject = await prisma.project.create({
      data: {
        ...project,
        technologies: project.technologies as any,
        challenges: project.challenges as any,
        results: project.results as any,
        imageUrls: project.imageUrls as any,
      },
    });
    return this.mapPrismaProjectToProject(newProject);
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project | null> {
    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        ...updates,
        technologies: updates.technologies ? (updates.technologies as any) : undefined,
        challenges: updates.challenges ? (updates.challenges as any) : undefined,
        results: updates.results ? (updates.results as any) : undefined,
        imageUrls: updates.imageUrls ? (updates.imageUrls as any) : undefined,
      },
    });
    return this.mapPrismaProjectToProject(updatedProject);
  }

  async deleteProject(id: string): Promise<boolean> {
    try {
      await prisma.project.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  // Skills methods
  async getSkills(options?: { category?: string; limit?: number }): Promise<Skill[]> {
    const where = options?.category ? { category: options.category } : {};
    
    const skills = await prisma.skill.findMany({
      where,
      orderBy: { order: 'asc' },
      take: options?.limit,
    });

    return skills.map(this.mapPrismaSkillToSkill);
  }

  async getSkillById(id: string): Promise<Skill | null> {
    const skill = await prisma.skill.findUnique({ where: { id } });
    return skill ? this.mapPrismaSkillToSkill(skill) : null;
  }

  async createSkill(skill: Omit<Skill, 'id'>): Promise<Skill> {
    const newSkill = await prisma.skill.create({
      data: {
        ...skill,
        // visible is optional in Skill type but has default in DB, handle if missing
        visible: skill.visible ?? true, 
      } as any,
    });
    return this.mapPrismaSkillToSkill(newSkill);
  }

  async updateSkill(id: string, updates: Partial<Skill>): Promise<Skill | null> {
    const updatedSkill = await prisma.skill.update({
      where: { id },
      data: updates as any,
    });
    return this.mapPrismaSkillToSkill(updatedSkill);
  }

  async deleteSkill(id: string): Promise<boolean> {
    try {
      await prisma.skill.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  // Contact Messages methods
  async getContactMessages(options?: { read?: boolean; limit?: number }): Promise<ContactMessage[]> {
    const where = options?.read !== undefined ? { read: options.read } : {};
    
    const messages = await prisma.contactMessage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: options?.limit,
    });

    return messages.map(m => ({
      id: m.id,
      name: m.name,
      email: m.email,
      subject: m.subject ?? undefined,
      message: m.message,
      read: m.read,
      createdAt: m.createdAt,
      ipAddress: m.ipAddress ?? undefined,
      userAgent: m.userAgent ?? undefined,
    }));
  }

  async getContactMessageById(id: string): Promise<ContactMessage | null> {
    const m = await prisma.contactMessage.findUnique({ where: { id } });
    if (!m) return null;
    return {
      id: m.id,
      name: m.name,
      email: m.email,
      subject: m.subject ?? undefined,
      message: m.message,
      read: m.read,
      createdAt: m.createdAt,
      ipAddress: m.ipAddress ?? undefined,
      userAgent: m.userAgent ?? undefined,
    };
  }

  async createContactMessage(message: Omit<ContactMessage, 'id' | 'createdAt' | 'read'>): Promise<ContactMessage> {
    const m = await prisma.contactMessage.create({
      data: message,
    });
    return {
      id: m.id,
      name: m.name,
      email: m.email,
      subject: m.subject ?? undefined,
      message: m.message,
      read: m.read,
      createdAt: m.createdAt,
      ipAddress: m.ipAddress ?? undefined,
      userAgent: m.userAgent ?? undefined,
    };
  }

  async markMessageAsRead(id: string): Promise<ContactMessage | null> {
    const m = await prisma.contactMessage.update({
      where: { id },
      data: { read: true },
    });
    if (!m) return null;
    return {
      id: m.id,
      name: m.name,
      email: m.email,
      subject: m.subject ?? undefined,
      message: m.message,
      read: m.read,
      createdAt: m.createdAt,
      ipAddress: m.ipAddress ?? undefined,
      userAgent: m.userAgent ?? undefined,
    };
  }

  async deleteContactMessage(id: string): Promise<boolean> {
    try {
      await prisma.contactMessage.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  // Site Content methods
  async getSiteContent(key: string, language: 'en' | 'es'): Promise<SiteContent | null> {
    const content = await prisma.siteContent.findUnique({
      where: {
        key_language: {
          key,
          language,
        },
      },
    });
    return content ? (content as unknown as SiteContent) : null;
  }

  async getAllSiteContent(language: 'en' | 'es'): Promise<SiteContent[]> {
    const content = await prisma.siteContent.findMany({
      where: { language },
    });
    return content as unknown as SiteContent[];
  }

  async createSiteContent(content: Omit<SiteContent, 'id' | 'createdAt' | 'updatedAt'>): Promise<SiteContent> {
    const newContent = await prisma.siteContent.create({
      data: content,
    });
    return newContent as unknown as SiteContent;
  }

  async updateSiteContent(id: string, updates: Partial<SiteContent>): Promise<SiteContent | null> {
    const updatedContent = await prisma.siteContent.update({
      where: { id },
      data: updates,
    });
    return updatedContent as unknown as SiteContent;
  }

  async deleteSiteContent(id: string): Promise<boolean> {
    try {
      await prisma.siteContent.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  // Helpers to map Prisma types (with Json) to application types (with arrays)
  private mapPrismaProjectToProject(prismaProject: any): Project {
    return {
      ...prismaProject,
      technologies: prismaProject.technologies as string[],
      challenges: prismaProject.challenges as string[],
      results: prismaProject.results as string[],
      imageUrls: prismaProject.imageUrls as string[],
    };
  }

  private mapPrismaSkillToSkill(prismaSkill: any): Skill {
    return {
      ...prismaSkill,
      category: prismaSkill.category as any,
    };
  }
}
