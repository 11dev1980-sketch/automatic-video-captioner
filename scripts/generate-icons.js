const fs = require('fs');
const path = require('path');

// Check if canvas is available
let Canvas;
try {
  Canvas = require('canvas');
} catch (e) {
  console.log('Canvas package not found. Please install it with: npm install canvas');
  console.log('Alternatively, open scripts/generate-pwa-icon.html in a browser to generate icons manually.');
  process.exit(1);
}

const { createCanvas } = Canvas;

function drawIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  const scale = size / 1024;
  
  // Background gradient (indigo to purple)
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#6366f1');
  gradient.addColorStop(1, '#8b5cf6');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  
  // Add subtle pattern
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 2 * scale;
  for (let i = 0; i < 10; i++) {
    ctx.beginPath();
    ctx.arc(512 * scale, 512 * scale, (100 + i * 50) * scale, 0, Math.PI * 2);
    ctx.stroke();
  }
  
  // Main circle background
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.beginPath();
  ctx.arc(512 * scale, 512 * scale, 380 * scale, 0, Math.PI * 2);
  ctx.fill();
  
  // Play button triangle (video element)
  ctx.fillStyle = '#6366f1';
  ctx.beginPath();
  ctx.moveTo(420 * scale, 350 * scale);
  ctx.lineTo(420 * scale, 674 * scale);
  ctx.lineTo(680 * scale, 512 * scale);
  ctx.closePath();
  ctx.fill();
  
  // Arabic letter "ع" (Ain) - stylized
  ctx.fillStyle = '#8b5cf6';
  ctx.font = `bold ${180 * scale}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('ع', 560 * scale, 520 * scale);
  
  // Translation arrows (subtle)
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 12 * scale;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  // Right arrow
  ctx.beginPath();
  ctx.moveTo(650 * scale, 420 * scale);
  ctx.lineTo(720 * scale, 420 * scale);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(700 * scale, 400 * scale);
  ctx.lineTo(720 * scale, 420 * scale);
  ctx.lineTo(700 * scale, 440 * scale);
  ctx.stroke();
  
  // Left arrow
  ctx.beginPath();
  ctx.moveTo(650 * scale, 600 * scale);
  ctx.lineTo(720 * scale, 600 * scale);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(670 * scale, 580 * scale);
  ctx.lineTo(650 * scale, 600 * scale);
  ctx.lineTo(670 * scale, 620 * scale);
  ctx.stroke();
  
  // Subtitle lines (representing transcription)
  ctx.fillStyle = '#6366f1';
  ctx.fillRect(320 * scale, 740 * scale, 180 * scale, 8 * scale);
  ctx.fillRect(320 * scale, 765 * scale, 240 * scale, 8 * scale);
  ctx.fillRect(320 * scale, 790 * scale, 200 * scale, 8 * scale);
  
  return canvas;
}

// Generate icons
const assetsDir = path.join(__dirname, '..', 'assets');
const publicDir = path.join(__dirname, '..', 'public');

// Create public directory if it doesn't exist
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

console.log('Generating PWA icons...');

// Generate main icon (1024x1024)
const icon1024 = drawIcon(1024);
fs.writeFileSync(path.join(assetsDir, 'icon.png'), icon1024.toBuffer('image/png'));
console.log('✓ Generated icon.png (1024x1024)');

// Generate adaptive icon (1024x1024)
fs.writeFileSync(path.join(assetsDir, 'adaptive-icon.png'), icon1024.toBuffer('image/png'));
console.log('✓ Generated adaptive-icon.png (1024x1024)');

// Generate splash icon (1024x1024)
fs.writeFileSync(path.join(assetsDir, 'splash-icon.png'), icon1024.toBuffer('image/png'));
console.log('✓ Generated splash-icon.png (1024x1024)');

// Generate favicon (48x48)
const favicon = drawIcon(48);
fs.writeFileSync(path.join(assetsDir, 'favicon.png'), favicon.toBuffer('image/png'));
console.log('✓ Generated favicon.png (48x48)');

// Generate PWA icons for public folder
const icon512 = drawIcon(512);
fs.writeFileSync(path.join(publicDir, 'icon-512.png'), icon512.toBuffer('image/png'));
console.log('✓ Generated public/icon-512.png (512x512)');

const icon192 = drawIcon(192);
fs.writeFileSync(path.join(publicDir, 'icon-192.png'), icon192.toBuffer('image/png'));
console.log('✓ Generated public/icon-192.png (192x192)');

console.log('\n✅ All icons generated successfully!');
console.log('\nNext steps:');
console.log('1. Review the generated icons in the assets/ and public/ folders');
console.log('2. Update your manifest.json to reference the new icons');
console.log('3. Test the PWA installation on different devices');
