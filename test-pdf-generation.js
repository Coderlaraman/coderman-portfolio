const { PrismaClient } = require('@prisma/client');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function testPDFGeneration() {
  try {
    console.log('🧪 Testing PDF generation with current database data...');
    
    // Fetch resume data from database
    const resume = await prisma.resume.findFirst();
    
    if (!resume) {
      console.log('❌ No resume found in database');
      return;
    }
    
    console.log('✅ Found resume data:');
    console.log('Full Name:', resume.fullName);
    console.log('Title:', resume.title);
    console.log('Email:', resume.email);
    
    // Create PDF
    console.log('🎨 Creating PDF document...');
    const doc = new PDFDocument({ 
      margin: 50,
      font: 'Helvetica',
      info: {
        Title: resume.fullName ? `${resume.fullName} - Resume` : 'Resume',
        Author: resume.fullName || 'Coderman',
      }
    });
    
    const publicDir = path.join(process.cwd(), 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    const filePath = path.join(publicDir, 'test-resume.pdf');
    const writeStream = fs.createWriteStream(filePath);
    
    doc.pipe(writeStream);
    
    // Header
    console.log('🖋️ Writing header...');
    doc.fontSize(24).text(resume.fullName || 'Resume', { align: 'center' });
    doc.fontSize(14).text(resume.title, { align: 'center' });
    doc.moveDown();
    
    // Contact Info
    const contactInfo = [
      resume.email,
      resume.phone,
      resume.location,
      resume.website,
      resume.linkedin
    ].filter(Boolean).join(' • ');
    
    doc.fontSize(10).text(contactInfo, { align: 'center' });
    doc.moveDown();
    
    // Summary
    if (resume.summary) {
      doc.fontSize(12).font('Helvetica-Bold').text('Summary');
      doc.fontSize(10).font('Helvetica').text(resume.summary);
      doc.moveDown();
    }
    
    // Experience
    if (resume.experience && resume.experience.length > 0) {
      doc.fontSize(12).font('Helvetica-Bold').text('Experience');
      doc.moveDown(0.5);
      
      resume.experience.forEach((exp, index) => {
        console.log(`💼 Writing experience ${index + 1}:`, exp);
        doc.fontSize(11).font('Helvetica-Bold').text(exp.company || '');
        doc.fontSize(10).font('Helvetica-Oblique').text(`${exp.role || ''} | ${exp.startDate || ''} - ${exp.endDate || ''}`);
        doc.fontSize(10).font('Helvetica').text(exp.description || '');
        doc.moveDown();
      });
    }
    
    // Education
    if (resume.education && resume.education.length > 0) {
      doc.fontSize(12).font('Helvetica-Bold').text('Education');
      doc.moveDown(0.5);
      
      resume.education.forEach((edu, index) => {
        console.log(`🎓 Writing education ${index + 1}:`, edu);
        doc.fontSize(11).font('Helvetica-Bold').text(edu.institution || '');
        doc.fontSize(10).font('Helvetica-Oblique').text(`${edu.degree || ''} | ${edu.startDate || ''} - ${edu.endDate || ''}`);
        if (edu.description) {
          doc.fontSize(10).font('Helvetica').text(edu.description);
        }
        doc.moveDown();
      });
    }
    
    doc.end();
    
    writeStream.on('finish', () => {
      console.log('✅ Test PDF generated successfully!');
      console.log('📄 File saved to:', filePath);
      console.log('📊 File size:', fs.statSync(filePath).size, 'bytes');
      
      // Compare with existing resume.pdf
      const existingPath = path.join(publicDir, 'resume.pdf');
      if (fs.existsSync(existingPath)) {
        const existingSize = fs.statSync(existingPath).size;
        console.log('📊 Existing resume.pdf size:', existingSize, 'bytes');
        console.log('📊 Difference:', fs.statSync(filePath).size - existingSize, 'bytes');
      }
    });
    
    writeStream.on('error', (err) => {
      console.error('❌ Write stream error:', err);
    });
    
  } catch (error) {
    console.error('❌ Error generating test PDF:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPDFGeneration();