import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import puppeteer from 'puppeteer-core';
import * as fs from 'fs';
import * as path from 'path';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const resume = await (prisma as any).resume.findFirst();
    return NextResponse.json(resume || {});
  } catch (error) {
    console.error('Error fetching resume:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resume' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    console.log('📥 POST /api/resume - Starting resume save process');
    const data = await request.json();
    console.log('📋 Received data:', JSON.stringify(data, null, 2));
    
    // Upsert resume (update if exists, create if not)
    // Since we only have one resume, we can just check if any exists
    console.log('🔍 Checking for existing resume...');
    const existing = await (prisma as any).resume.findFirst();
    console.log('📊 Existing resume found:', !!existing);
    
    let resume;
    if (existing) {
      console.log('✏️ Updating existing resume with ID:', existing.id);
      resume = await (prisma as any).resume.update({
        where: { id: existing.id },
        data: {
          ...data,
          experience: data.experience || [],
          education: data.education || [],
        },
      });
      console.log('✅ Resume updated successfully');
    } else {
      console.log('🆕 Creating new resume');
      resume = await (prisma as any).resume.create({
        data: {
          ...data,
          experience: data.experience || [],
          education: data.education || [],
        },
      });
      console.log('✅ Resume created successfully');
    }

    console.log('📄 Resume data for PDF generation:', JSON.stringify(resume, null, 2));

    // Generate PDF and report status to client
    let pdfGenerated = false;
    let pdfUrl: string | null = null;
    try {
      console.log('Starting PDF generation...');
      const filename = resume.fullName
        ? `${resume.fullName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_resume.pdf`
        : 'resume.pdf';
      await generatePDF(resume);
      console.log('PDF generation completed successfully');
      const pdfPath = path.join(process.cwd(), 'public', 'resume.pdf');
      if (fs.existsSync(pdfPath)) {
        pdfGenerated = true;
        pdfUrl = '/resume.pdf';
        console.log('✅ PDF available at', pdfUrl);
      } else {
        console.warn('⚠️ PDF file not found after generation attempt');
      }
    } catch (pdfError) {
      console.error('Error generating PDF:', pdfError);
    }

    return NextResponse.json({ ...resume, pdfGenerated, pdfUrl });
  } catch (error) {
    console.error('Error saving resume:', error);
    return NextResponse.json(
      { error: 'Failed to save resume' },
      { status: 500 }
    );
  }
}

async function generatePDF(data: any) {
  try {
    console.log('🎨 Starting PDF generation process with Puppeteer...');
    console.log('📄 PDF Data received:', JSON.stringify(data, null, 2));
    
    // Ensure the directory exists
    const publicDir = path.join(process.cwd(), 'public');
    if (!fs.existsSync(publicDir)) {
      console.log('📁 Creating public directory...');
      fs.mkdirSync(publicDir, { recursive: true });
    }

    const filePath = path.join(publicDir, 'resume.pdf');
    console.log('📄 PDF will be saved to:', filePath);
    
    // If file exists, try to unlink it first to ensure we're writing fresh
    if (fs.existsSync(filePath)) {
      try {
        console.log('🗑️ Existing PDF found, deleting...');
        fs.unlinkSync(filePath);
        console.log('✅ Existing PDF deleted');
      } catch (e) {
        console.warn('⚠️ Could not delete existing resume.pdf, overwriting...', e);
      }
    }

    // Create HTML content for the resume with professional styling
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333;
            background: #fff;
          }
          
          .resume-container {
            max-width: 800px;
            margin: 0 auto;
            background: #fff;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
          }
          
          /* Header Section with Photo */
          .header {
            display: flex;
            align-items: center;
            padding: 40px;
            background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
            color: white;
            position: relative;
          }
          
          .photo-container {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            background: #ecf0f1;
            border: 4px solid #fff;
            margin-right: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
          }
          
          .photo-placeholder {
            width: 100%;
            height: 100%;
            background: linear-gradient(45deg, #bdc3c7, #ecf0f1);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #7f8c8d;
            font-size: 12px;
            text-align: center;
          }
          
          .header-info {
            flex: 1;
          }
          
          .name { 
            font-size: 32px; 
            font-weight: 700; 
            margin-bottom: 8px;
            letter-spacing: -0.5px;
          }
          
          .title { 
            font-size: 18px; 
            color: #3498db; 
            margin-bottom: 15px;
            font-weight: 400;
          }
          
          .contact-info {
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
            font-size: 14px;
            color: #ecf0f1;
          }
          
          .contact-item {
            display: flex;
            align-items: center;
            gap: 5px;
          }
          
          .contact-item::before {
            content: '•';
            color: #3498db;
            font-weight: bold;
          }
          
          /* Main Content */
          .content {
            padding: 40px;
          }
          
          /* Section Styling */
          .section { 
            margin-bottom: 35px; 
          }
          
          .section-title { 
            font-size: 18px; 
            font-weight: 600; 
            color: #2c3e50;
            margin-bottom: 15px;
            padding-bottom: 8px;
            border-bottom: 2px solid #3498db;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          
          /* Summary Section */
          .summary-text {
            font-size: 14px;
            line-height: 1.8;
            color: #555;
            text-align: justify;
          }
          
          /* Experience and Education Items */
          .item { 
            margin-bottom: 25px;
            padding: 20px;
            background: #f8f9fa;
            border-left: 4px solid #3498db;
            border-radius: 0 8px 8px 0;
            transition: all 0.3s ease;
          }
          
          .item:hover {
            background: #e8f4f8;
            transform: translateX(5px);
          }
          
          .item-title { 
            font-size: 16px; 
            font-weight: 600; 
            color: #2c3e50;
            margin-bottom: 5px;
          }
          
          .item-subtitle { 
            font-size: 14px; 
            color: #3498db; 
            font-weight: 500;
            margin-bottom: 10px;
          }
          
          .item-description { 
            font-size: 13px; 
            color: #666; 
            line-height: 1.6;
            margin-top: 8px;
          }
          
          /* Skills Section */
          .skills-container {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-top: 10px;
          }
          
          .skill-tag {
            background: #3498db;
            color: white;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 500;
          }
          
          /* Responsive adjustments */
          @media (max-width: 600px) {
            .header {
              flex-direction: column;
              text-align: center;
            }
            
            .photo-container {
              margin-right: 0;
              margin-bottom: 20px;
            }
            
            .contact-info {
              justify-content: center;
            }
          }
        </style>
      </head>
      <body>
        <div class="resume-container">
          <!-- Header with Photo -->
          <div class="header">
            <div class="photo-container">
              <div class="photo-placeholder">
                Photo<br>Space
              </div>
            </div>
            <div class="header-info">
              <div class="name">${data.fullName || 'Professional Resume'}</div>
              ${data.title ? `<div class="title">${data.title}</div>` : ''}
              <div class="contact-info">
                ${data.email ? `<div class="contact-item">${data.email}</div>` : ''}
                ${data.phone ? `<div class="contact-item">${data.phone}</div>` : ''}
                ${data.location ? `<div class="contact-item">${data.location}</div>` : ''}
                ${data.website ? `<div class="contact-item">${data.website}</div>` : ''}
                ${data.linkedin ? `<div class="contact-item">LinkedIn</div>` : ''}
              </div>
            </div>
          </div>
          
          <!-- Main Content -->
          <div class="content">
        
        ${data.summary ? `
          <div class="section">
            <div class="section-title">Professional Summary</div>
            <div class="summary-text">${data.summary}</div>
          </div>
        ` : ''}
        
        ${data.experience && data.experience.length > 0 ? `
          <div class="section">
            <div class="section-title">Professional Experience</div>
            ${data.experience.map((exp: any) => `
              <div class="item">
                <div class="item-title">${exp.role || ''}</div>
                <div class="item-subtitle">${exp.company || ''} ${exp.startDate && exp.endDate ? `• ${exp.startDate} - ${exp.endDate}` : ''}</div>
                ${exp.description ? `<div class="item-description">${exp.description}</div>` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}
        
        ${data.education && data.education.length > 0 ? `
          <div class="section">
            <div class="section-title">Education & Certifications</div>
            ${data.education.map((edu: any) => `
              <div class="item">
                <div class="item-title">${edu.degree || ''}</div>
                <div class="item-subtitle">${edu.institution || ''} ${edu.startDate && edu.endDate ? `• ${edu.startDate} - ${edu.endDate}` : ''}</div>
                ${edu.description ? `<div class="item-description">${edu.description}</div>` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}
        
        <!-- Additional Professional Sections -->
        ${data.skills && data.skills.length > 0 ? `
          <div class="section">
            <div class="section-title">Skills & Expertise</div>
            <div class="skills-container">
              ${data.skills.map((skill: string) => `<span class="skill-tag">${skill}</span>`).join('')}
            </div>
          </div>
        ` : ''}
        
        ${data.languages && data.languages.length > 0 ? `
          <div class="section">
            <div class="section-title">Languages</div>
            <div style="font-size: 14px; color: #555;">
              ${data.languages.map((lang: any) => `${lang.language || lang} (${lang.proficiency || 'Professional'})`).join(' • ')}
            </div>
          </div>
        ` : ''}
        
        ${data.projects && data.projects.length > 0 ? `
          <div class="section">
            <div class="section-title">Projects & Achievements</div>
            ${data.projects.map((project: any) => `
              <div class="item">
                <div class="item-title">${project.name || ''}</div>
                <div class="item-subtitle">${project.technologies || ''} ${project.year ? `• ${project.year}` : ''}</div>
                ${project.description ? `<div class="item-description">${project.description}</div>` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}
          </div> <!-- Close content -->
        </div> <!-- Close resume-container -->
      </body>
      </html>
    `;

    // Launch Puppeteer and generate PDF
    let browser;
    try {
      // Try to use system Chrome/Chromium first
      browser = await puppeteer.launch({
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium-browser',
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
      });
    } catch (error) {
      console.log('⚠️ Could not launch system browser, trying alternative paths...');
      
      // Try alternative Chrome/Chromium paths
      const possiblePaths = [
        '/usr/bin/google-chrome',
        '/usr/bin/google-chrome-stable',
        '/usr/bin/chromium',
        '/snap/bin/chromium',
        process.env.CHROME_EXECUTABLE
      ].filter(Boolean);
      
      let browserLaunched = false;
      for (const chromePath of possiblePaths) {
        if (chromePath && fs.existsSync(chromePath)) {
          try {
            console.log(`🔄 Trying Chrome at: ${chromePath}`);
            browser = await puppeteer.launch({
              executablePath: chromePath,
              headless: true,
              args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
            });
            browserLaunched = true;
            console.log('✅ Chrome launched successfully!');
            break;
          } catch (err: any) {
            console.log(`❌ Failed to launch Chrome at ${chromePath}:`, err.message);
            continue;
          }
        }
      }
      
      if (!browserLaunched) {
        console.error('❌ Could not launch any Chrome/Chromium browser');
        console.log('🔄 Falling back to PDF-lib for PDF generation...');
        await generatePDFFallback(data, filePath);
        console.log('✅ PDF generation completed successfully with fallback!');
        console.log('📄 PDF saved to:', filePath);
        console.log('📊 File size:', fs.statSync(filePath).size, 'bytes');
        return;
      }
    }

    // If we successfully launched a browser, use Puppeteer
    if (browser) {
      const page = await browser.newPage();
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      
      await page.pdf({
        path: filePath,
        format: 'A4',
        margin: {
          top: '20mm',
          right: '20mm',
          bottom: '20mm',
          left: '20mm'
        },
        printBackground: true
      });

      await browser.close();
      
      console.log('🎉 PDF generation completed successfully with Puppeteer!');
      console.log('📄 PDF saved to:', filePath);
      console.log('📊 File size:', fs.statSync(filePath).size, 'bytes');
    } else {
      // If browser launch failed completely, use fallback
      console.log('🔄 Using PDF-lib fallback as primary method...');
      await generatePDFFallback(data, filePath);
      console.log('✅ PDF generation completed successfully with fallback!');
      console.log('📄 PDF saved to:', filePath);
      console.log('📊 File size:', fs.statSync(filePath).size, 'bytes');
    }
    
  } catch (error) {
    console.error('❌ PDF generation error:', error);
    throw error;
  }
}

async function generatePDFFallback(data: any, filePath: string) {
  console.log('🔄 Using PDF-lib fallback for PDF generation...');
  
  try {
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    
    // Add a page
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 size in points
    const { width, height } = page.getSize();
    
    // Embed fonts
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    // Professional colors
    const primaryColor = rgb(0.173, 0.243, 0.314); // #2c3e50
    const secondaryColor = rgb(0.204, 0.596, 0.859); // #3498db
    const textColor = rgb(0.2, 0.2, 0.2); // Dark gray
    const lightText = rgb(0.4, 0.4, 0.4); // Medium gray
    const veryLightText = rgb(0.7, 0.7, 0.7); // Light gray
    
    let yPosition = height - 50; // Start from top
    const lineHeight = 20;
    const margin = 50;
    
    // Professional Header Section
    const headerHeight = 120;
    const headerY = height - 50;
    
    // Draw header background (simulated gradient with rectangle)
    page.drawRectangle({
      x: 0,
      y: headerY - headerHeight,
      width: width,
      height: headerHeight,
      color: primaryColor,
    });
    
    // Photo placeholder area (left side)
    const photoSize = 80;
    const photoX = margin;
    const photoY = headerY - headerHeight + 20;
    
    // Draw photo placeholder border
    page.drawRectangle({
      x: photoX,
      y: photoY,
      width: photoSize,
      height: photoSize,
      borderColor: rgb(1, 1, 1), // White border
      borderWidth: 3,
    });
    
    // Photo placeholder text
    page.drawText('PHOTO', {
      x: photoX + 25,
      y: photoY + 35,
      size: 10,
      font: helveticaFont,
      color: rgb(1, 1, 1), // White text
    });
    
    // Header text content (right side of photo)
    let headerTextX = photoX + photoSize + 30;
    let headerTextY = headerY - 30;
    
    // Name
    if (data.fullName) {
      page.drawText(data.fullName.toUpperCase(), {
        x: headerTextX,
        y: headerTextY,
        size: 24,
        font: helveticaBoldFont,
        color: rgb(1, 1, 1), // White text
      });
      headerTextY -= 30;
    }
    
    // Title
    if (data.title) {
      page.drawText(data.title, {
        x: headerTextX,
        y: headerTextY,
        size: 16,
        font: helveticaFont,
        color: secondaryColor, // Blue accent
      });
      headerTextY -= 25;
    }
    
    // Contact information
    const contactItems = [];
    if (data.email) contactItems.push(data.email);
    if (data.phone) contactItems.push(data.phone);
    if (data.location) contactItems.push(data.location);
    if (data.website) contactItems.push(data.website);
    if (data.linkedin) contactItems.push('LinkedIn');
    
    if (contactItems.length > 0) {
      const contactText = contactItems.join(' • ');
      page.drawText(contactText, {
        x: headerTextX,
        y: headerTextY,
        size: 10,
        font: helveticaFont,
        color: rgb(0.9, 0.9, 0.9), // Light gray
      });
    }
    
    // Update yPosition for content after header
    yPosition = height - headerHeight - 30;
    
    // Professional Summary
    if (data.summary) {
      page.drawText('PROFESSIONAL SUMMARY', {
        x: margin,
        y: yPosition,
        size: 14,
        font: helveticaBoldFont,
        color: primaryColor,
      });
      yPosition -= lineHeight * 1.5;
      
      // Draw underline
      page.drawLine({
        start: { x: margin, y: yPosition + 5 },
        end: { x: margin + 200, y: yPosition + 5 },
        thickness: 1,
        color: secondaryColor,
      });
      yPosition -= lineHeight * 0.5;
      
      // Split summary into lines that fit the page width
      const maxWidth = width - (margin * 2);
      const words = data.summary.split(' ');
      let currentLine = '';
      
      for (const word of words) {
        const testLine = currentLine + (currentLine ? ' ' : '') + word;
        const textWidth = helveticaFont.widthOfTextAtSize(testLine, 10);
        
        if (textWidth > maxWidth && currentLine) {
          page.drawText(currentLine, {
            x: margin,
            y: yPosition,
            size: 10,
            font: helveticaFont,
            color: rgb(0, 0, 0),
          });
          yPosition -= lineHeight * 0.8;
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      
      if (currentLine) {
        page.drawText(currentLine, {
          x: margin,
          y: yPosition,
          size: 10,
          font: helveticaFont,
          color: rgb(0, 0, 0),
        });
        yPosition -= lineHeight;
      }
      yPosition -= lineHeight;
    }
    
    // Experience
    if (data.experience && data.experience.length > 0) {
      page.drawText('PROFESSIONAL EXPERIENCE', {
        x: margin,
        y: yPosition,
        size: 14,
        font: helveticaBoldFont,
        color: primaryColor,
      });
      yPosition -= lineHeight * 1.5;
      
      // Draw underline
      page.drawLine({
        start: { x: margin, y: yPosition + 5 },
        end: { x: margin + 200, y: yPosition + 5 },
        thickness: 1,
        color: secondaryColor,
      });
      yPosition -= lineHeight * 0.5;
      
      for (const exp of data.experience) {
        if (yPosition < 100) {
          // Add new page if we're running out of space
          const newPage = pdfDoc.addPage([595.28, 841.89]);
          yPosition = height - 50;
        }
        
        // Role as main title
        if (exp.role) {
          page.drawText(exp.role, {
            x: margin,
            y: yPosition,
            size: 11,
            font: helveticaBoldFont,
            color: rgb(0, 0, 0),
          });
          yPosition -= lineHeight * 0.8;
        }
        
        // Company and dates as subtitle
        const companyAndDates = [exp.company, exp.startDate && exp.endDate ? `${exp.startDate} - ${exp.endDate}` : '']
          .filter(Boolean)
          .join(' • ');
        
        if (companyAndDates) {
          page.drawText(companyAndDates, {
            x: margin,
            y: yPosition,
            size: 10,
            font: helveticaFont,
            color: lightText,
          });
          yPosition -= lineHeight * 0.8;
        }
        
        if (exp.description) {
          const maxWidth = width - (margin * 2);
          const words = exp.description.split(' ');
          let currentLine = '';
          
          for (const word of words) {
            const testLine = currentLine + (currentLine ? ' ' : '') + word;
            const textWidth = helveticaFont.widthOfTextAtSize(testLine, 10);
            
            if (textWidth > maxWidth && currentLine) {
              page.drawText(currentLine, {
                x: margin,
                y: yPosition,
                size: 10,
                font: helveticaFont,
                color: rgb(0, 0, 0),
              });
              yPosition -= lineHeight * 0.7;
              currentLine = word;
            } else {
              currentLine = testLine;
            }
          }
          
          if (currentLine) {
            page.drawText(currentLine, {
              x: margin,
              y: yPosition,
              size: 10,
              font: helveticaFont,
              color: rgb(0, 0, 0),
            });
            yPosition -= lineHeight * 0.7;
          }
        }
        yPosition -= lineHeight * 0.5;
      }
      yPosition -= lineHeight;
    }
    
    // Education
    if (data.education && data.education.length > 0) {
      page.drawText('EDUCATION & CERTIFICATIONS', {
        x: margin,
        y: yPosition,
        size: 14,
        font: helveticaBoldFont,
        color: primaryColor,
      });
      yPosition -= lineHeight * 1.5;
      
      // Draw underline
      page.drawLine({
        start: { x: margin, y: yPosition + 5 },
        end: { x: margin + 200, y: yPosition + 5 },
        thickness: 1,
        color: secondaryColor,
      });
      yPosition -= lineHeight * 0.5;
      
      for (const edu of data.education) {
        if (yPosition < 100) {
          // Add new page if we're running out of space
          const newPage = pdfDoc.addPage([595.28, 841.89]);
          yPosition = height - 50;
        }
        
        // Degree as main title
        if (edu.degree) {
          page.drawText(edu.degree, {
            x: margin,
            y: yPosition,
            size: 11,
            font: helveticaBoldFont,
            color: rgb(0, 0, 0),
          });
          yPosition -= lineHeight * 0.8;
        }
        
        // Institution and dates as subtitle
        const institutionAndDates = [edu.institution, edu.startDate && edu.endDate ? `${edu.startDate} - ${edu.endDate}` : '']
          .filter(Boolean)
          .join(' • ');
        
        if (institutionAndDates) {
          page.drawText(institutionAndDates, {
            x: margin,
            y: yPosition,
            size: 10,
            font: helveticaFont,
            color: lightText,
          });
          yPosition -= lineHeight * 0.8;
        }
        
        if (edu.description) {
          const maxWidth = width - (margin * 2);
          const words = edu.description.split(' ');
          let currentLine = '';
          
          for (const word of words) {
            const testLine = currentLine + (currentLine ? ' ' : '') + word;
            const textWidth = helveticaFont.widthOfTextAtSize(testLine, 10);
            
            if (textWidth > maxWidth && currentLine) {
              page.drawText(currentLine, {
                x: margin,
                y: yPosition,
                size: 10,
                font: helveticaFont,
                color: rgb(0, 0, 0),
              });
              yPosition -= lineHeight * 0.7;
              currentLine = word;
            } else {
              currentLine = testLine;
            }
          }
          
          if (currentLine) {
            page.drawText(currentLine, {
              x: margin,
              y: yPosition,
              size: 10,
              font: helveticaFont,
              color: rgb(0, 0, 0),
            });
            yPosition -= lineHeight * 0.7;
          }
        }
        yPosition -= lineHeight * 0.5;
      }
    }
    
    // Skills & Expertise
    if (data.skills && data.skills.length > 0) {
      page.drawText('SKILLS & EXPERTISE', {
        x: margin,
        y: yPosition,
        size: 14,
        font: helveticaBoldFont,
        color: primaryColor,
      });
      yPosition -= lineHeight * 1.5;
      
      page.drawLine({
        start: { x: margin, y: yPosition + 5 },
        end: { x: margin + 200, y: yPosition + 5 },
        thickness: 1,
        color: secondaryColor,
      });
      yPosition -= lineHeight * 0.5;
      
      const maxWidth = width - (margin * 2);
      const skillText = data.skills.join(' • ');
      let currentLine = '';
      for (const word of skillText.split(' ')) {
        const testLine = currentLine + (currentLine ? ' ' : '') + word;
        const textWidth = helveticaFont.widthOfTextAtSize(testLine, 10);
        if (textWidth > maxWidth && currentLine) {
          page.drawText(currentLine, {
            x: margin,
            y: yPosition,
            size: 10,
            font: helveticaFont,
            color: rgb(0, 0, 0),
          });
          yPosition -= lineHeight * 0.7;
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) {
        page.drawText(currentLine, {
          x: margin,
          y: yPosition,
          size: 10,
          font: helveticaFont,
          color: rgb(0, 0, 0),
        });
        yPosition -= lineHeight * 0.7;
      }
      yPosition -= lineHeight * 0.5;
    }
    
    // Languages
    if (data.languages && data.languages.length > 0) {
      page.drawText('LANGUAGES', {
        x: margin,
        y: yPosition,
        size: 14,
        font: helveticaBoldFont,
        color: primaryColor,
      });
      yPosition -= lineHeight * 1.5;
      
      page.drawLine({
        start: { x: margin, y: yPosition + 5 },
        end: { x: margin + 200, y: yPosition + 5 },
        thickness: 1,
        color: secondaryColor,
      });
      yPosition -= lineHeight * 0.5;
      
      const maxWidth = width - (margin * 2);
      const langText = data.languages.map((l: any) => {
        if (typeof l === 'string') return `${l} (Professional)`;
        return `${l.language} (${l.proficiency || 'Professional'})`;
      }).join(' • ');
      let currentLine = '';
      for (const word of langText.split(' ')) {
        const testLine = currentLine + (currentLine ? ' ' : '') + word;
        const textWidth = helveticaFont.widthOfTextAtSize(testLine, 10);
        if (textWidth > maxWidth && currentLine) {
          page.drawText(currentLine, {
            x: margin,
            y: yPosition,
            size: 10,
            font: helveticaFont,
            color: rgb(0, 0, 0),
          });
          yPosition -= lineHeight * 0.7;
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) {
        page.drawText(currentLine, {
          x: margin,
          y: yPosition,
          size: 10,
          font: helveticaFont,
          color: rgb(0, 0, 0),
        });
        yPosition -= lineHeight * 0.7;
      }
      yPosition -= lineHeight * 0.5;
    }
    
    // Projects & Achievements
    if (data.projects && data.projects.length > 0) {
      page.drawText('PROJECTS & ACHIEVEMENTS', {
        x: margin,
        y: yPosition,
        size: 14,
        font: helveticaBoldFont,
        color: primaryColor,
      });
      yPosition -= lineHeight * 1.5;
      
      page.drawLine({
        start: { x: margin, y: yPosition + 5 },
        end: { x: margin + 200, y: yPosition + 5 },
        thickness: 1,
        color: secondaryColor,
      });
      yPosition -= lineHeight * 0.5;
      
      for (const project of data.projects) {
        if (yPosition < 100) {
          const newPage = pdfDoc.addPage([595.28, 841.89]);
          yPosition = height - 50;
        }
        
        if (project.name) {
          page.drawText(project.name, {
            x: margin,
            y: yPosition,
            size: 11,
            font: helveticaBoldFont,
            color: rgb(0, 0, 0),
          });
          yPosition -= lineHeight * 0.8;
        }
        
        const subtitle = [project.technologies, project.year ? `${project.year}` : '']
          .filter(Boolean)
          .join(' • ');
        if (subtitle) {
          page.drawText(subtitle, {
            x: margin,
            y: yPosition,
            size: 10,
            font: helveticaFont,
            color: lightText,
          });
          yPosition -= lineHeight * 0.8;
        }
        
        if (project.description) {
          const maxWidth = width - (margin * 2);
          const words = project.description.split(' ');
          let currentLine = '';
          for (const word of words) {
            const testLine = currentLine + (currentLine ? ' ' : '') + word;
            const textWidth = helveticaFont.widthOfTextAtSize(testLine, 10);
            if (textWidth > maxWidth && currentLine) {
              page.drawText(currentLine, {
                x: margin,
                y: yPosition,
                size: 10,
                font: helveticaFont,
                color: rgb(0, 0, 0),
              });
              yPosition -= lineHeight * 0.7;
              currentLine = word;
            } else {
              currentLine = testLine;
            }
          }
          if (currentLine) {
            page.drawText(currentLine, {
              x: margin,
              y: yPosition,
              size: 10,
              font: helveticaFont,
              color: rgb(0, 0, 0),
            });
            yPosition -= lineHeight * 0.7;
          }
        }
        yPosition -= lineHeight * 0.5;
      }
    }
    
    // Save the PDF
    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(filePath, pdfBytes);
    
    console.log('✅ PDF-lib fallback generation completed successfully!');
    console.log('📄 PDF saved to:', filePath);
    console.log('📊 File size:', fs.statSync(filePath).size, 'bytes');
    
  } catch (error) {
    console.error('❌ PDF generation error:', error);
    throw error;
  }
}
