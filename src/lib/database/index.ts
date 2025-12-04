import { DatabaseClient, Project, Skill, ContactMessage, SiteContent } from './types';

// In-memory database implementation
// This can be replaced with a real database like PostgreSQL, MySQL, or MongoDB
class InMemoryDatabase implements DatabaseClient {
  private projects: Project[] = [];
  private skills: Skill[] = [];
  private contactMessages: ContactMessage[] = [];
  private siteContent: SiteContent[] = [];

  constructor() {
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample projects
    this.projects = [
      {
        id: '1',
        title: 'E-Commerce Platform',
        description: 'A full-featured e-commerce platform built with Laravel and Vue.js',
        fullDescription: 'A comprehensive e-commerce solution featuring user authentication, product management, shopping cart functionality, payment integration, and admin dashboard. Built with modern technologies and best practices.',
        technologies: ['Laravel', 'Vue.js', 'MySQL', 'Redis', 'Stripe API'],
        challenges: ['Implementing secure payment processing', 'Building scalable architecture', 'Optimizing database queries'],
        results: ['Increased client sales by 150%', 'Reduced page load time by 40%', 'Improved user engagement by 60%'],
        imageUrls: ['/images/projects/ecommerce-1.jpg', '/images/projects/ecommerce-2.jpg'],
        projectUrl: 'https://example-ecommerce.com',
        codeUrl: 'https://github.com/example/ecommerce',
        order: 1,
        featured: true,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
      },
      {
        id: '2',
        title: 'Task Management App',
        description: 'A collaborative task management application with real-time updates',
        fullDescription: 'A modern task management application that allows teams to collaborate in real-time. Features include task assignment, progress tracking, file sharing, and team communication.',
        technologies: ['Next.js', 'React', 'Node.js', 'Socket.io', 'MongoDB'],
        challenges: ['Implementing real-time synchronization', 'Building responsive UI components', 'Managing complex state'],
        results: ['Improved team productivity by 35%', 'Reduced project completion time by 25%', 'Enhanced team collaboration'],
        imageUrls: ['/images/projects/taskmanager-1.jpg', '/images/projects/taskmanager-2.jpg'],
        projectUrl: 'https://example-taskmanager.com',
        codeUrl: 'https://github.com/example/taskmanager',
        order: 2,
        featured: true,
        createdAt: new Date('2024-02-20'),
        updatedAt: new Date('2024-02-20'),
      },
      {
        id: '3',
        title: 'Portfolio Website',
        description: 'A modern portfolio website showcasing creative work',
        fullDescription: 'A responsive and visually appealing portfolio website designed to showcase creative work. Features smooth animations, interactive elements, and optimized performance.',
        technologies: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Framer Motion'],
        challenges: ['Creating smooth animations', 'Optimizing for performance', 'Ensuring cross-browser compatibility'],
        results: ['Increased visitor engagement by 80%', 'Improved SEO ranking', 'Enhanced brand visibility'],
        imageUrls: ['/images/projects/portfolio-1.jpg', '/images/projects/portfolio-2.jpg'],
        projectUrl: 'https://example-portfolio.com',
        codeUrl: 'https://github.com/example/portfolio',
        order: 3,
        featured: false,
        createdAt: new Date('2024-03-10'),
        updatedAt: new Date('2024-03-10'),
      },
    ];

    // Sample skills
    this.skills = [
      // Backend Skills
      { id: '1', name: 'Laravel', category: 'backend', proficiency: 95, icon: 'laravel', description: 'PHP framework for web applications', order: 1 },
      { id: '2', name: 'Node.js', category: 'backend', proficiency: 90, icon: 'nodejs', description: 'JavaScript runtime for server-side development', order: 2 },
      { id: '3', name: 'Express.js', category: 'backend', proficiency: 85, icon: 'express', description: 'Web application framework for Node.js', order: 3 },
      { id: '4', name: 'PHP', category: 'backend', proficiency: 90, icon: 'php', description: 'Server-side scripting language', order: 4 },
      { id: '5', name: 'Python', category: 'backend', proficiency: 75, icon: 'python', description: 'High-level programming language', order: 5 },
      
      // Frontend Skills
      { id: '6', name: 'React', category: 'frontend', proficiency: 95, icon: 'react', description: 'JavaScript library for building user interfaces', order: 1 },
      { id: '7', name: 'Next.js', category: 'frontend', proficiency: 90, icon: 'nextjs', description: 'React framework for production', order: 2 },
      { id: '8', name: 'Vue.js', category: 'frontend', proficiency: 85, icon: 'vue', description: 'Progressive JavaScript framework', order: 3 },
      { id: '9', name: 'Nuxt.js', category: 'frontend', proficiency: 80, icon: 'nuxt', description: 'Vue.js framework for universal applications', order: 4 },
      { id: '10', name: 'TypeScript', category: 'frontend', proficiency: 85, icon: 'typescript', description: 'Typed superset of JavaScript', order: 5 },
      { id: '11', name: 'Tailwind CSS', category: 'frontend', proficiency: 90, icon: 'tailwind', description: 'Utility-first CSS framework', order: 6 },
      
      // Database Skills
      { id: '12', name: 'MySQL', category: 'database', proficiency: 85, icon: 'mysql', description: 'Relational database management system', order: 1 },
      { id: '13', name: 'PostgreSQL', category: 'database', proficiency: 80, icon: 'postgresql', description: 'Advanced open-source relational database', order: 2 },
      { id: '14', name: 'MongoDB', category: 'database', proficiency: 75, icon: 'mongodb', description: 'NoSQL document database', order: 3 },
      { id: '15', name: 'Redis', category: 'database', proficiency: 70, icon: 'redis', description: 'In-memory data structure store', order: 4 },
      
      // Tools & Other
      { id: '16', name: 'Git', category: 'tools', proficiency: 90, icon: 'git', description: 'Version control system', order: 1 },
      { id: '17', name: 'Docker', category: 'tools', proficiency: 75, icon: 'docker', description: 'Containerization platform', order: 2 },
      { id: '18', name: 'AWS', category: 'tools', proficiency: 70, icon: 'aws', description: 'Cloud computing services', order: 3 },
      { id: '19', name: 'Linux', category: 'tools', proficiency: 80, icon: 'linux', description: 'Open-source operating system', order: 4 },
      { id: '20', name: 'VS Code', category: 'tools', proficiency: 95, icon: 'vscode', description: 'Code editor', order: 5 },
    ];

    // Sample site content
    this.siteContent = [
      {
        id: '1',
        key: 'bio',
        language: 'en',
        content: 'I am a passionate full-stack developer with expertise in building modern web applications. I love creating efficient, scalable, and user-friendly solutions that solve real-world problems.',
        type: 'bio',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
      {
        id: '2',
        key: 'bio',
        language: 'es',
        content: 'Soy un desarrollador full-stack apasionado con experiencia en la construcción de aplicaciones web modernas. Me encanta crear soluciones eficientes, escalables y fáciles de usar que resuelvan problemas del mundo real.',
        type: 'bio',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
      {
        id: '3',
        key: 'tagline',
        language: 'en',
        content: 'Turning ideas into digital reality',
        type: 'tagline',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
      {
        id: '4',
        key: 'tagline',
        language: 'es',
        content: 'Convirtiendo ideas en realidad digital',
        type: 'tagline',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
    ];
  }

  // Projects methods
  async getProjects(options?: { featured?: boolean; limit?: number }): Promise<Project[]> {
    let filteredProjects = this.projects;
    
    if (options?.featured !== undefined) {
      filteredProjects = filteredProjects.filter(p => p.featured === options.featured);
    }
    
    filteredProjects.sort((a, b) => a.order - b.order);
    
    if (options?.limit) {
      filteredProjects = filteredProjects.slice(0, options.limit);
    }
    
    return Promise.resolve(filteredProjects);
  }

  async getProjectById(id: string): Promise<Project | null> {
    return Promise.resolve(this.projects.find(p => p.id === id) || null);
  }

  async createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    const newProject: Project = {
      ...project,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.projects.push(newProject);
    return Promise.resolve(newProject);
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project | null> {
    const index = this.projects.findIndex(p => p.id === id);
    if (index === -1) return Promise.resolve(null);
    
    this.projects[index] = {
      ...this.projects[index],
      ...updates,
      updatedAt: new Date(),
    };
    
    return Promise.resolve(this.projects[index]);
  }

  async deleteProject(id: string): Promise<boolean> {
    const index = this.projects.findIndex(p => p.id === id);
    if (index === -1) return Promise.resolve(false);
    
    this.projects.splice(index, 1);
    return Promise.resolve(true);
  }

  // Skills methods
  async getSkills(options?: { category?: string; limit?: number }): Promise<Skill[]> {
    let filteredSkills = this.skills;
    
    if (options?.category) {
      filteredSkills = filteredSkills.filter(s => s.category === options.category);
    }
    
    filteredSkills.sort((a, b) => a.order - b.order);
    
    if (options?.limit) {
      filteredSkills = filteredSkills.slice(0, options.limit);
    }
    
    return Promise.resolve(filteredSkills);
  }

  async getSkillById(id: string): Promise<Skill | null> {
    return Promise.resolve(this.skills.find(s => s.id === id) || null);
  }

  async createSkill(skill: Omit<Skill, 'id'>): Promise<Skill> {
    const newSkill: Skill = {
      ...skill,
      id: Date.now().toString(),
    };
    this.skills.push(newSkill);
    return Promise.resolve(newSkill);
  }

  async updateSkill(id: string, updates: Partial<Skill>): Promise<Skill | null> {
    const index = this.skills.findIndex(s => s.id === id);
    if (index === -1) return Promise.resolve(null);
    
    this.skills[index] = {
      ...this.skills[index],
      ...updates,
    };
    
    return Promise.resolve(this.skills[index]);
  }

  async deleteSkill(id: string): Promise<boolean> {
    const index = this.skills.findIndex(s => s.id === id);
    if (index === -1) return Promise.resolve(false);
    
    this.skills.splice(index, 1);
    return Promise.resolve(true);
  }

  // Contact Messages methods
  async getContactMessages(options?: { read?: boolean; limit?: number }): Promise<ContactMessage[]> {
    let filteredMessages = this.contactMessages;
    
    if (options?.read !== undefined) {
      filteredMessages = filteredMessages.filter(m => m.read === options.read);
    }
    
    filteredMessages.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    if (options?.limit) {
      filteredMessages = filteredMessages.slice(0, options.limit);
    }
    
    return Promise.resolve(filteredMessages);
  }

  async getContactMessageById(id: string): Promise<ContactMessage | null> {
    return Promise.resolve(this.contactMessages.find(m => m.id === id) || null);
  }

  async createContactMessage(message: Omit<ContactMessage, 'id' | 'createdAt' | 'read'>): Promise<ContactMessage> {
    const newMessage: ContactMessage = {
      ...message,
      id: Date.now().toString(),
      read: false,
      createdAt: new Date(),
    };
    this.contactMessages.push(newMessage);
    return Promise.resolve(newMessage);
  }

  async markMessageAsRead(id: string): Promise<ContactMessage | null> {
    const index = this.contactMessages.findIndex(m => m.id === id);
    if (index === -1) return Promise.resolve(null);
    
    this.contactMessages[index] = {
      ...this.contactMessages[index],
      read: true,
    };
    
    return Promise.resolve(this.contactMessages[index]);
  }

  async deleteContactMessage(id: string): Promise<boolean> {
    const index = this.contactMessages.findIndex(m => m.id === id);
    if (index === -1) return Promise.resolve(false);
    
    this.contactMessages.splice(index, 1);
    return Promise.resolve(true);
  }

  // Site Content methods
  async getSiteContent(key: string, language: 'en' | 'es'): Promise<SiteContent | null> {
    return Promise.resolve(this.siteContent.find(c => c.key === key && c.language === language) || null);
  }

  async getAllSiteContent(language: 'en' | 'es'): Promise<SiteContent[]> {
    return Promise.resolve(this.siteContent.filter(c => c.language === language));
  }

  async createSiteContent(content: Omit<SiteContent, 'id' | 'createdAt' | 'updatedAt'>): Promise<SiteContent> {
    const newContent: SiteContent = {
      ...content,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.siteContent.push(newContent);
    return Promise.resolve(newContent);
  }

  async updateSiteContent(id: string, updates: Partial<SiteContent>): Promise<SiteContent | null> {
    const index = this.siteContent.findIndex(c => c.id === id);
    if (index === -1) return Promise.resolve(null);
    
    this.siteContent[index] = {
      ...this.siteContent[index],
      ...updates,
      updatedAt: new Date(),
    };
    
    return Promise.resolve(this.siteContent[index]);
  }

  async deleteSiteContent(id: string): Promise<boolean> {
    const index = this.siteContent.findIndex(c => c.id === id);
    if (index === -1) return Promise.resolve(false);
    
    this.siteContent.splice(index, 1);
    return Promise.resolve(true);
  }
}

// Create and export a singleton instance
export const db = new InMemoryDatabase();

// Export for easy access
export default db;