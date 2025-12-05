// Helper to fix PDFKit font loading in Next.js
// PDFKit tries to load fonts from the virtual filesystem which can fail in some environments
// This monkey-patches the fs module for PDFKit if needed, or we can rely on fontkit
import fs from 'fs';
import path from 'path';

// Ensure the public directory exists
const publicDir = path.join(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}
