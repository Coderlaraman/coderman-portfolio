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
    // Ensure DB has required columns (handles environments not yet migrated)
    await ensureResumeSchema();
    
    // Upsert resume (update if exists, create if not)
    // Since we only have one resume, we can just check if any exists
    console.log('🔍 Checking for existing resume...');
    const existing = await (prisma as any).resume.findFirst();
    console.log('📊 Existing resume found:', !!existing);
    
    // Normalize optional JSON fields to avoid schema mismatches
    const normalized = {
      ...data,
      experience: Array.isArray((data as any).experience) ? (data as any).experience : [],
      education: Array.isArray((data as any).education) ? (data as any).education : [],
      skills: Array.isArray((data as any).skills)
        ? (data as any).skills.map((s: any) => String(s)).filter(Boolean)
        : typeof (data as any).skills === 'string'
        ? (data as any).skills.split(',').map((s: string) => s.trim()).filter(Boolean)
        : [],
      languages: Array.isArray((data as any).languages)
        ? (data as any).languages.map((l: any) =>
            typeof l === 'string'
              ? { language: l, proficiency: 'Professional' }
              : { language: String(l.language || ''), proficiency: String(l.proficiency || 'Professional') }
          )
        : [],
      projects: Array.isArray((data as any).projects)
        ? (data as any).projects.map((p: any) => ({
            name: String(p.name || ''),
            technologies: String(p.technologies || ''),
            year: String(p.year || ''),
            description: String(p.description || ''),
          }))
        : [],
    };

    const columnSet = await getResumeColumns();
    const dataToPersist = filterDataByColumns(normalized, columnSet);

    let resume;
    if (existing) {
      console.log('✏️ Updating existing resume with ID:', existing.id);
      resume = await (prisma as any).resume.update({
        where: { id: existing.id },
        data: {
          ...dataToPersist,
        },
      });
      console.log('✅ Resume updated successfully');
    } else {
      console.log('🆕 Creating new resume');
      resume = await (prisma as any).resume.create({
        data: {
          ...dataToPersist,
        },
      });
      console.log('✅ Resume created successfully');
    }

    const resumeForPdf = {
      ...resume,
      photoUrl: (dataToPersist as any).photoUrl ?? (normalized as any).photoUrl ?? (resume as any).photoUrl,
      skills: (dataToPersist as any).skills ?? (normalized as any).skills ?? (resume as any).skills,
      languages: (dataToPersist as any).languages ?? (normalized as any).languages ?? (resume as any).languages,
      projects: (dataToPersist as any).projects ?? (normalized as any).projects ?? (resume as any).projects,
    };

    console.log('📄 Resume data for PDF generation:', JSON.stringify(resumeForPdf, null, 2));

    // Generate PDF and report status to client
    let pdfGenerated = false;
    let pdfUrl: string | null = null;
    try {
      console.log('Starting PDF generation...');
      const filename = (resumeForPdf as any).fullName
        ? `${String((resumeForPdf as any).fullName).replace(/[^a-z0-9]/gi, '_').toLowerCase()}_resume.pdf`
        : 'resume.pdf';
      await generatePDF(resumeForPdf);
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

    return NextResponse.json({ ...resumeForPdf, pdfGenerated, pdfUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Error saving resume:', message);
    return NextResponse.json(
      { error: 'Failed to save resume', reason: message },
      { status: 500 }
    );
  }
}

async function ensureResumeSchema() {
  try {
    const cols: any[] = await (prisma as any).$queryRaw`SHOW COLUMNS FROM Resume`;
    const names = new Set(cols.map((c: any) => c.Field));
    const alters: string[] = [];
    if (!names.has('skills')) alters.push('ADD COLUMN skills JSON NULL');
    if (!names.has('languages')) alters.push('ADD COLUMN languages JSON NULL');
    if (!names.has('projects')) alters.push('ADD COLUMN projects JSON NULL');
    if (!names.has('photoUrl')) alters.push('ADD COLUMN photoUrl VARCHAR(191) NULL');
    if (alters.length) {
      const sql = `ALTER TABLE Resume ${alters.join(', ')}`;
      console.log('🔧 Applying schema fix:', sql);
      await (prisma as any).$executeRawUnsafe(sql);
      console.log('✅ Schema fix applied');
    }
  } catch (e: any) {
    console.warn('⚠️ Could not verify/alter Resume schema:', e?.message || e);
  }
}

// Fetch current columns for Resume table
async function getResumeColumns(): Promise<Set<string> | null> {
  try {
    const cols: any[] = await (prisma as any).$queryRaw`SHOW COLUMNS FROM Resume`;
    const names = new Set(cols.map((c: any) => c.Field));
    console.log('🧾 Resume columns:', Array.from(names).join(', '));
    return names;
  } catch (e: any) {
    console.warn('⚠️ Could not fetch Resume columns:', e?.message || e);
    return null;
  }
}

// Only include data keys that map to existing columns
function filterDataByColumns(data: any, columns: Set<string> | null) {
  if (!columns) {
    const allowed = ['fullName','title','summary','email','phone','location','website','github','linkedin','experience','education'];
    const filtered: any = {};
    for (const key of allowed) {
      if (key in data) filtered[key] = (data as any)[key];
    }
    console.log('⚖️ Using conservative payload (no column discovery)');
    return filtered;
  }
  const filtered: any = {};
  for (const [key, value] of Object.entries(data)) {
    if (columns.has(key)) filtered[key] = value;
  }
  console.log('✅ Filtered payload keys:', Object.keys(filtered).join(', '));
  return filtered;
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
    let page = pdfDoc.addPage([595.28, 841.89]);
    let { width, height } = page.getSize();
    
    // Embed fonts
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    // Professional colors
    const primaryColor = rgb(0.173, 0.243, 0.314); // #2c3e50
    const secondaryColor = rgb(0.204, 0.596, 0.859); // #3498db
    const textColor = rgb(0.2, 0.2, 0.2); // Dark gray
    const lightText = rgb(0.4, 0.4, 0.4); // Medium gray
    const veryLightText = rgb(0.7, 0.7, 0.7); // Light gray
    
    let yPosition = height - 50;
    const lineHeight = 20;
    const margin = 50;
    const sectionSpacing = lineHeight * 1.8;
    
    // Professional Header Section
    const headerHeight = 120;
    const headerY = height - 50;
    
    // Draw header background
    page.drawRectangle({ x: 0, y: headerY - headerHeight, width, height: headerHeight, color: primaryColor });
    page.drawLine({
      start: { x: 0, y: headerY - headerHeight - 5 },
      end: { x: width, y: headerY - headerHeight - 5 },
      thickness: 1,
      color: secondaryColor,
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
    
    // Photo: embed uploaded image if available, else placeholder text
    if (data.photoUrl) {
      try {
        const imgPath = path.join(process.cwd(), 'public', String(data.photoUrl).replace(/^\//, ''));
        const lower = imgPath.toLowerCase();
        const bytes = fs.readFileSync(imgPath);
        if (lower.endsWith('.png')) {
          const embedded = await pdfDoc.embedPng(bytes);
          page.drawImage(embedded, { x: photoX, y: photoY, width: photoSize, height: photoSize });
        } else {
          const embedded = await pdfDoc.embedJpg(bytes);
          page.drawImage(embedded, { x: photoX, y: photoY, width: photoSize, height: photoSize });
        }
      } catch (e) {
        page.drawText('PHOTO', {
          x: photoX + 25,
          y: photoY + 35,
          size: 10,
          font: helveticaFont,
          color: rgb(1, 1, 1),
        });
      }
    } else {
      page.drawText('PHOTO', {
        x: photoX + 25,
        y: photoY + 35,
        size: 10,
        font: helveticaFont,
        color: rgb(1, 1, 1),
      });
    }
    
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
    
    // Title (wrap up to 2 lines)
    if (data.title) {
      const maxTitleWidth = width - margin - headerTextX;
      const words = String(data.title).split(' ');
      let line = '';
      let lines: string[] = [];
      for (const w of words) {
        const test = line + (line ? ' ' : '') + w;
        const tw = helveticaFont.widthOfTextAtSize(test, 16);
        if (tw > maxTitleWidth && line) {
          lines.push(line);
          line = w;
        } else {
          line = test;
        }
      }
      if (line) lines.push(line);
      lines = lines.slice(0, 2);
      for (const l of lines) {
        page.drawText(l, { x: headerTextX, y: headerTextY, size: 16, font: helveticaFont, color: secondaryColor });
        headerTextY -= 18;
      }
    }
    
    const contactItems: string[] = [];
    if (data.email) contactItems.push(data.email);
    if (data.phone) contactItems.push(data.phone);
    if (data.location) contactItems.push(data.location);
    if (data.website) contactItems.push(data.website);
    if (data.github) contactItems.push(data.github);
    if (data.linkedin) contactItems.push(data.linkedin);
    
    if (contactItems.length > 0) {
      const contactText = contactItems.join(' • ');
      const allowedWidth = width - margin - headerTextX;
      let line = '';
      const words = contactText.split(' ');
      for (const w of words) {
        const test = line + (line ? ' ' : '') + w;
        const tw = helveticaFont.widthOfTextAtSize(test, 10);
        if (tw > allowedWidth && line) {
          page.drawText(line, { x: headerTextX, y: headerTextY, size: 10, font: helveticaFont, color: rgb(0.9, 0.9, 0.9) });
          headerTextY -= 14;
          line = w;
        } else {
          line = test;
        }
      }
      if (line) {
        page.drawText(line, { x: headerTextX, y: headerTextY, size: 10, font: helveticaFont, color: rgb(0.9, 0.9, 0.9) });
        headerTextY -= 14;
      }
    }
    
    // Update yPosition for content after header
    yPosition = headerY - headerHeight - 45;
    
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
          page = pdfDoc.addPage([595.28, 841.89]);
          ({ width, height } = page.getSize());
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
      if (yPosition < 150) {
        page = pdfDoc.addPage([595.28, 841.89]);
        ({ width, height } = page.getSize());
        yPosition = height - 50;
      } else {
        yPosition -= sectionSpacing;
      }
      page.drawText('EDUCATION & CERTIFICATIONS', {
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
      yPosition -= lineHeight * 0.8;

      for (const edu of data.education) {
        if (yPosition < 140) {
          page = pdfDoc.addPage([595.28, 841.89]);
          ({ width, height } = page.getSize());
          yPosition = height - 50;
        }
        if (edu.degree) {
          page.drawText(edu.degree, {
            x: margin,
            y: yPosition,
            size: 11,
            font: helveticaBoldFont,
            color: rgb(0, 0, 0),
          });
          yPosition -= lineHeight * 0.9;
        }
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
          yPosition -= lineHeight * 0.9;
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
              yPosition -= lineHeight * 0.9;
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
            yPosition -= lineHeight * 0.9;
          }
        }
        yPosition -= lineHeight;
      }
    }
    
    if (data.skills && data.skills.length > 0) {
      if (yPosition < 150) {
        page = pdfDoc.addPage([595.28, 841.89]);
        ({ width, height } = page.getSize());
        yPosition = height - 50;
      } else {
        yPosition -= sectionSpacing;
      }
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
      yPosition -= lineHeight * 0.8;
      
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
          yPosition -= lineHeight;
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
      yPosition -= sectionSpacing;
    }
    
    if (data.languages && data.languages.length > 0) {
      if (yPosition < 150) {
        page = pdfDoc.addPage([595.28, 841.89]);
        ({ width, height } = page.getSize());
        yPosition = height - 50;
      } else {
        yPosition -= sectionSpacing;
      }
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
      yPosition -= lineHeight * 0.8;
      
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
          yPosition -= lineHeight;
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
      yPosition -= lineHeight * 0.5;
    }
    
    if (data.projects && data.projects.length > 0) {
      if (yPosition < 150) {
        page = pdfDoc.addPage([595.28, 841.89]);
        ({ width, height } = page.getSize());
        yPosition = height - 50;
      } else {
        yPosition -= sectionSpacing;
      }
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
      yPosition -= lineHeight * 0.8;
      
      for (const project of data.projects) {
        if (yPosition < 140) {
          page = pdfDoc.addPage([595.28, 841.89]);
          ({ width, height } = page.getSize());
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
          yPosition -= lineHeight * 0.9;
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
          yPosition -= lineHeight * 0.9;
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
              yPosition -= lineHeight * 0.9;
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
            yPosition -= lineHeight * 0.9;
          }
        }
        yPosition -= lineHeight;
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
