const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkResumeData() {
  try {
    console.log('🔍 Checking resume data in database...');
    
    const resume = await prisma.resume.findFirst();
    
    if (resume) {
      console.log('✅ Resume found in database:');
      console.log('📄 ID:', resume.id);
      console.log('👤 Full Name:', resume.fullName);
      console.log('💼 Title:', resume.title);
      console.log('📧 Email:', resume.email);
      console.log('📱 Phone:', resume.phone);
      console.log('📍 Location:', resume.location);
      console.log('🌐 Website:', resume.website);
      console.log('💼 LinkedIn:', resume.linkedin);
      console.log('📝 Summary:', resume.summary);
      console.log('💼 Experience:', resume.experience);
      console.log('🎓 Education:', resume.education);
      console.log('🔄 Updated At:', resume.updatedAt);
    } else {
      console.log('⚠️ No resume found in database');
    }
    
    // Check if resume.pdf exists
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(process.cwd(), 'public', 'resume.pdf');
    
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      console.log('📄 PDF file exists:');
      console.log('📊 Size:', stats.size, 'bytes');
      console.log('📅 Modified:', stats.mtime);
    } else {
      console.log('❌ PDF file does not exist');
    }
    
  } catch (error) {
    console.error('❌ Error checking resume data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkResumeData();