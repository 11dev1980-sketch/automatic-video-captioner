/**
 * Generate iOS-optimized PWA icons
 * iOS requires icons without transparency and with proper sizing
 */

const fs = require('fs');
const path = require('path');

console.log('📱 iOS Icon Generation Guide');
console.log('================================\n');

console.log('iOS PWA icons need to be:');
console.log('1. 180x180px minimum (for Retina displays)');
console.log('2. Fill the entire canvas (no padding/margins)');
console.log('3. No transparency (solid background)');
console.log('4. PNG format\n');

console.log('Current icon issues:');
console.log('- Icon likely has transparent background → iOS adds white border');
console.log('- Icon might have padding → appears small on homescreen');
console.log('- Resolution might be too low → appears blurry\n');

console.log('SOLUTION:');
console.log('=========\n');

console.log('Option 1: Use online tool (Recommended)');
console.log('----------------------------------------');
console.log('1. Go to: https://www.pwabuilder.com/imageGenerator');
console.log('2. Upload your icon (assets/icon.png)');
console.log('3. Download iOS icons');
console.log('4. Place in assets/ folder\n');

console.log('Option 2: Manual creation');
console.log('-------------------------');
console.log('Create these icon sizes:');
console.log('- apple-touch-icon-180x180.png (180x180px)');
console.log('- apple-touch-icon-167x167.png (167x167px) - iPad Pro');
console.log('- apple-touch-icon-152x152.png (152x152px) - iPad');
console.log('- apple-touch-icon-120x120.png (120x120px) - iPhone\n');

console.log('Design tips:');
console.log('- Use solid background color (not transparent)');
console.log('- Make logo/text fill 80-90% of canvas');
console.log('- Use high contrast colors');
console.log('- Test on actual iOS device\n');

console.log('After creating icons, update web/index.html with new paths.');
