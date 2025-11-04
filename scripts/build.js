const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function hasTsSources(dir) {
  if (!fs.existsSync(dir)) return false;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (hasTsSources(p)) return true;
    } else if (e.isFile() && p.endsWith('.ts')) {
      return true;
    }
  }
  return false;
}

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

const srcDir = path.join(process.cwd(), 'src');
if (hasTsSources(srcDir)) {
  console.log('[build] TypeScript sources detected. Running tsc...');
  execSync('npx tsc -p tsconfig.json', { stdio: 'inherit' });
  console.log('[build] tsc completed.');
} else {
  console.log('[build] No TypeScript sources found in ./src. Using existing dist output.');
}

// Copy template files
const templatesDir = path.join(srcDir, 'templates');
const distTemplatesDir = path.join(process.cwd(), 'dist', 'templates');

if (fs.existsSync(templatesDir)) {
  console.log('[build] Copying template files...');
  
  // Remove existing compiled template files
  if (fs.existsSync(distTemplatesDir)) {
    try {
      fs.rmSync(distTemplatesDir, { recursive: true, force: true });
    } catch (e) {
      console.warn('[build] Warning: failed to clear dist/templates:', e && e.message ? e.message : e);
      // Proceed without failing; copying will overwrite existing files
    }
  }
  
  // Copy original template files
  copyDir(templatesDir, distTemplatesDir);
  console.log('[build] Template files copied.');
}