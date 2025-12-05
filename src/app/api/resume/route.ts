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

    // Generate PDF with a specific filename for the user
    try {
        console.log('Starting PDF generation...');
        // Create a unique filename based on user's name or default
        const filename = resume.fullName 
          ? `${resume.fullName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_resume.pdf` 
          : 'resume.pdf';
        
        // We'll still save to resume.pdf for backward compatibility/simplicity for now,
        // but we could update the client to download this specific file
        await generatePDF(resume);
        console.log('PDF generation completed successfully');
    } catch (pdfError) {
        console.error('Error generating PDF:', pdfError);
        // Don't fail the request if PDF generation fails, but log it
        // Ideally, we might want to return a warning
    }

    return NextResponse.json(resume);
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

    // Create HTML content for the resume
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
          .header { text-align: center; margin-bottom: 30px; }
          .name { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
          .title { font-size: 14px; color: #666; margin-bottom: 10px; }
          .contact-info { font-size: 10px; color: #888; margin-bottom: 20px; }
          .section { margin-bottom: 25px; }
          .section-title { font-size: 12px; font-weight: bold; text-decoration: underline; margin-bottom: 10px; }
          .item { margin-bottom: 15px; }
          .item-title { font-size: 11px; font-weight: bold; }
          .item-subtitle { font-size: 10px; color: #666; }
          .item-description { font-size: 10px; margin-top: 5px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="name">${data.fullName || 'Resume'}</div>
          ${data.title ? `<div class="title">${data.title}</div>` : ''}
          <div class="contact-info">
            ${[data.email, data.phone, data.location, data.website, data.linkedin].filter(Boolean).join(' • ')}
          </div>
        </div>
        
        ${data.summary ? `
          <div class="section">
            <div class="section-title">Summary</div>
            <div>${data.summary}</div>
          </div>
        ` : ''}
        
        ${data.experience && data.experience.length > 0 ? `
          <div class="section">
            <div class="section-title">Experience</div>
            ${data.experience.map((exp: any) => `
              <div class="item">
                <div class="item-title">${exp.company || ''}</div>
                <div class="item-subtitle">${[exp.role, exp.startDate && exp.endDate ? `${exp.startDate} - ${exp.endDate}` : ''].filter(Boolean).join(' • ')}</div>
                ${exp.description ? `<div class="item-description">${exp.description}</div>` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}
        
        ${data.education && data.education.length > 0 ? `
          <div class="section">
            <div class="section-title">Education</div>
            ${data.education.map((edu: any) => `
              <div class="item">
                <div class="item-title">${edu.institution || ''}</div>
                <div class="item-subtitle">${[edu.degree, edu.startDate && edu.endDate ? `${edu.startDate} - ${edu.endDate}` : ''].filter(Boolean).join(' • ')}</div>
                ${edu.description ? `<div class="item-description">${edu.description}</div>` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}
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
          } catch (err) {
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
    
    // Colors
    const black = rgb(0, 0, 0);
    const gray = rgb(0.4, 0.4, 0.4);
    const lightGray = rgb(0.7, 0.7, 0.7);
    
    let yPosition = height - 50; // Start from top
    const lineHeight = 20;
    const margin = 50;
    
    // Header with name and title
    if (data.fullName) {
      page.drawText(data.fullName, {
        x: margin,
        y: yPosition,
        size: 18,
        font: helveticaBoldFont,
        color: black,
      });
      yPosition -= lineHeight;
    }
    
    if (data.title) {
      page.drawText(data.title, {
        x: margin,
        y: yPosition,
        size: 14,
        font: helveticaFont,
        color: gray,
      });
      yPosition -= lineHeight * 1.5;
    }
    
    // Contact info
    const contactInfo = [data.email, data.phone, data.location, data.website, data.linkedin]
      .filter(Boolean)
      .join(' • ');
    
    if (contactInfo) {
      page.drawText(contactInfo, {
        x: margin,
        y: yPosition,
        size: 10,
        font: helveticaFont,
        color: lightGray,
      });
      yPosition -= lineHeight * 2;
    }
    
    // Summary
    if (data.summary) {
      page.drawText('SUMMARY', {
        x: margin,
        y: yPosition,
        size: 12,
        font: helveticaBoldFont,
        color: black,
      });
      yPosition -= lineHeight;
      
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
            color: black,
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
          color: black,
        });
        yPosition -= lineHeight;
      }
      yPosition -= lineHeight;
    }
    
    // Experience
    if (data.experience && data.experience.length > 0) {
      page.drawText('EXPERIENCE', {
        x: margin,
        y: yPosition,
        size: 12,
        font: helveticaBoldFont,
        color: black,
      });
      yPosition -= lineHeight;
      
      for (const exp of data.experience) {
        if (yPosition < 100) {
          // Add new page if we're running out of space
          const newPage = pdfDoc.addPage([595.28, 841.89]);
          yPosition = height - 50;
        }
        
        if (exp.company) {
          page.drawText(exp.company, {
            x: margin,
            y: yPosition,
            size: 11,
            font: helveticaBoldFont,
            color: black,
          });
          yPosition -= lineHeight * 0.8;
        }
        
        const roleAndDates = [exp.role, exp.startDate && exp.endDate ? `${exp.startDate} - ${exp.endDate}` : '']
          .filter(Boolean)
          .join(' • ');
        
        if (roleAndDates) {
          page.drawText(roleAndDates, {
            x: margin,
            y: yPosition,
            size: 10,
            font: helveticaFont,
            color: gray,
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
                color: black,
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
              color: black,
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
      page.drawText('EDUCATION', {
        x: margin,
        y: yPosition,
        size: 12,
        font: helveticaBoldFont,
        color: black,
      });
      yPosition -= lineHeight;
      
      for (const edu of data.education) {
        if (yPosition < 100) {
          // Add new page if we're running out of space
          const newPage = pdfDoc.addPage([595.28, 841.89]);
          yPosition = height - 50;
        }
        
        if (edu.institution) {
          page.drawText(edu.institution, {
            x: margin,
            y: yPosition,
            size: 11,
            font: helveticaBoldFont,
            color: black,
          });
          yPosition -= lineHeight * 0.8;
        }
        
        const degreeAndDates = [edu.degree, edu.startDate && edu.endDate ? `${edu.startDate} - ${edu.endDate}` : '']
          .filter(Boolean)
          .join(' • ');
        
        if (degreeAndDates) {
          page.drawText(degreeAndDates, {
            x: margin,
            y: yPosition,
            size: 10,
            font: helveticaFont,
            color: gray,
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
                color: black,
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
              color: black,
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
