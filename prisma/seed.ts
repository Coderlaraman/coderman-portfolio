import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.project.deleteMany();
  await prisma.skill.deleteMany();
  console.log('Start seeding...');

  // Seed Skills
  const skills = [
    // Backend Skills
    { name: 'Laravel', category: 'backend', proficiency: 95, icon: 'laravel', description: 'PHP framework for web applications', order: 1, visible: true },
    { name: 'Node.js', category: 'backend', proficiency: 90, icon: 'nodejs', description: 'JavaScript runtime for server-side development', order: 2, visible: true },
    { name: 'Express.js', category: 'backend', proficiency: 85, icon: 'express', description: 'Web application framework for Node.js', order: 3, visible: true },
    { name: 'PHP', category: 'backend', proficiency: 90, icon: 'php', description: 'Server-side scripting language', order: 4, visible: true },
    { name: 'Python', category: 'backend', proficiency: 75, icon: 'python', description: 'High-level programming language', order: 5, visible: true },
    
    // Frontend Skills
    { name: 'React', category: 'frontend', proficiency: 95, icon: 'react', description: 'JavaScript library for building user interfaces', order: 1, visible: true },
    { name: 'Next.js', category: 'frontend', proficiency: 90, icon: 'nextjs', description: 'React framework for production', order: 2, visible: true },
    { name: 'Vue.js', category: 'frontend', proficiency: 85, icon: 'vue', description: 'Progressive JavaScript framework', order: 3, visible: true },
    { name: 'Nuxt.js', category: 'frontend', proficiency: 80, icon: 'nuxt', description: 'Vue.js framework for universal applications', order: 4, visible: true },
    { name: 'TypeScript', category: 'frontend', proficiency: 85, icon: 'typescript', description: 'Typed superset of JavaScript', order: 5, visible: true },
    { name: 'Tailwind CSS', category: 'frontend', proficiency: 90, icon: 'tailwind', description: 'Utility-first CSS framework', order: 6, visible: true },
    
    // Database Skills
    { name: 'MySQL', category: 'database', proficiency: 85, icon: 'mysql', description: 'Relational database management system', order: 1, visible: true },
    { name: 'PostgreSQL', category: 'database', proficiency: 80, icon: 'postgresql', description: 'Advanced open-source relational database', order: 2, visible: true },
    { name: 'MongoDB', category: 'database', proficiency: 75, icon: 'mongodb', description: 'NoSQL document database', order: 3, visible: true },
    { name: 'Redis', category: 'database', proficiency: 70, icon: 'redis', description: 'In-memory data structure store', order: 4, visible: true },
    
    // Tools & Other
    { name: 'Git', category: 'tools', proficiency: 90, icon: 'git', description: 'Version control system', order: 1, visible: true },
    { name: 'Docker', category: 'tools', proficiency: 75, icon: 'docker', description: 'Containerization platform', order: 2, visible: true },
    { name: 'AWS', category: 'tools', proficiency: 70, icon: 'aws', description: 'Cloud computing services', order: 3, visible: true },
    { name: 'Linux', category: 'tools', proficiency: 80, icon: 'linux', description: 'Open-source operating system', order: 4, visible: true },
    { name: 'VS Code', category: 'tools', proficiency: 95, icon: 'vscode', description: 'Code editor', order: 5, visible: true },
  ];

  for (const skill of skills) {
    await prisma.skill.create({ data: skill });
  }

  // Seed Projects
  const projects = [
    {
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
    },
    {
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
    },
    {
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
    },
  ];

  for (const project of projects) {
    await prisma.project.create({ data: project });
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
