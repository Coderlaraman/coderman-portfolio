const fs = require('fs');
const path = require('path');

async function readPDFContent() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'resume.pdf');
    
    if (!fs.existsSync(filePath)) {
      console.log('❌ PDF file does not exist');
      return;
    }
    
    const stats = fs.statSync(filePath);
    console.log('📄 PDF File Stats:');
    console.log('📊 Size:', stats.size, 'bytes');
    console.log('📅 Created:', stats.birthtime);
    console.log('🔄 Modified:', stats.mtime);
    
    // Read first few bytes to check PDF header
    const fd = fs.openSync(filePath, 'r');
    const buffer = Buffer.alloc(100);
    fs.readSync(fd, buffer, 0, 100, 0);
    fs.closeSync(fd);
    
    console.log('📖 PDF Header:', buffer.toString('utf8', 0, 100));
    
    // Check if we can find any text content
    const fullContent = fs.readFileSync(filePath);
    const contentStr = fullContent.toString('utf8');
    
    console.log('\n🔍 Searching for text content...');
    
    // Look for common resume keywords
    const keywords = ['Jaime', 'Sierra', 'yuyu', 'Resume', 'Experience', 'Education', 'Summary'];
    keywords.forEach(keyword => {
      if (contentStr.includes(keyword)) {
        console.log(`✅ Found: "${keyword}"`);
      } else {
        console.log(`❌ Not found: "${keyword}"`);
      }
    });
    
  } catch (error) {
    console.error('❌ Error reading PDF:', error);
  }
}

readPDFContent();