import fs from 'fs';
import path from 'path';

try {
  const distPath = path.join(process.cwd(), 'dist');
  const srcHtml = path.join(distPath, 'index.html');
  const destHtml = path.join(distPath, '404.html');

  if (fs.existsSync(srcHtml)) {
    fs.copyFileSync(srcHtml, destHtml);
    console.log('Successfully copied index.html to 404.html for GitHub Pages routing support.');
  } else {
    console.warn('Warning: dist/index.html not found, skipping 404.html generation.');
  }
} catch (error) {
  console.error('Failed to create 404.html postbuild fallback:', error);
}
