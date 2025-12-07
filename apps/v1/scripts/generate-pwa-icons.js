/**
 * PWA Icon Generator
 *
 * This script generates PWA icons in all required sizes.
 * Run with: node scripts/generate-pwa-icons.js
 *
 * Note: For production, replace these generated icons with
 * professionally designed ones based on the brand logo.
 */

const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, '..', 'public', 'icons');

// Ensure icons directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// SVG template for a mountain icon with ski theme
function createIconSVG(size) {
  const padding = Math.round(size * 0.1); // 10% padding for maskable safe zone
  const innerSize = size - (padding * 2);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <!-- Background -->
  <rect width="${size}" height="${size}" fill="#1E40AF"/>

  <!-- Mountain shape -->
  <g transform="translate(${padding}, ${padding})">
    <!-- Main mountain -->
    <polygon
      points="${innerSize * 0.5},${innerSize * 0.15} ${innerSize * 0.85},${innerSize * 0.75} ${innerSize * 0.15},${innerSize * 0.75}"
      fill="#FFFFFF"
    />
    <!-- Snow cap -->
    <polygon
      points="${innerSize * 0.5},${innerSize * 0.15} ${innerSize * 0.6},${innerSize * 0.35} ${innerSize * 0.4},${innerSize * 0.35}"
      fill="#E0E7FF"
    />
    <!-- Second peak -->
    <polygon
      points="${innerSize * 0.72},${innerSize * 0.35} ${innerSize * 0.92},${innerSize * 0.75} ${innerSize * 0.52},${innerSize * 0.75}"
      fill="#DBEAFE"
    />
    <!-- Ski trail line -->
    <path
      d="M ${innerSize * 0.45} ${innerSize * 0.4} Q ${innerSize * 0.55} ${innerSize * 0.55}, ${innerSize * 0.4} ${innerSize * 0.7}"
      stroke="#60A5FA"
      stroke-width="${Math.max(2, innerSize * 0.02)}"
      fill="none"
      stroke-linecap="round"
    />
  </g>

  <!-- Text "SD" for larger icons -->
  ${size >= 192 ? `
  <text
    x="${size * 0.5}"
    y="${size * 0.92}"
    font-family="Arial, sans-serif"
    font-size="${size * 0.12}"
    font-weight="bold"
    fill="#FFFFFF"
    text-anchor="middle"
  >SKI DIRECTORY</text>
  ` : ''}
</svg>`;
}

// Generate icons
sizes.forEach(size => {
  const svg = createIconSVG(size);
  const filename = `icon-${size}x${size}.svg`;
  const filepath = path.join(iconsDir, filename);

  fs.writeFileSync(filepath, svg);
  console.log(`Created: ${filename}`);
});

// Create a simple favicon.ico placeholder (actually an SVG)
const faviconSVG = createIconSVG(32);
fs.writeFileSync(path.join(iconsDir, '..', 'favicon.svg'), faviconSVG);
console.log('Created: favicon.svg');

console.log('\n✅ PWA icons generated!');
console.log('\n📝 Note: These are SVG placeholders.');
console.log('For production, convert to PNG using a tool like:');
console.log('  - https://realfavicongenerator.net');
console.log('  - npx pwa-asset-generator');
console.log('  - ImageMagick: convert icon.svg -resize 512x512 icon-512x512.png');
