const fs = require('fs');
const path = require('path');

// Simple SVG icon template with crescent moon
const createSvgIcon = (size) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="#1B4332" rx="${size * 0.15}"/>
  <circle cx="${size * 0.55}" cy="${size * 0.45}" r="${size * 0.28}" fill="#D4AF37"/>
  <circle cx="${size * 0.65}" cy="${size * 0.4}" r="${size * 0.22}" fill="#1B4332"/>
  <circle cx="${size * 0.35}" cy="${size * 0.72}" r="${size * 0.04}" fill="#D4AF37"/>
  <circle cx="${size * 0.5}" cy="${size * 0.78}" r="${size * 0.03}" fill="#D4AF37"/>
  <circle cx="${size * 0.65}" cy="${size * 0.72}" r="${size * 0.04}" fill="#D4AF37"/>
</svg>`;

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, '..', 'public', 'icons');

// Ensure directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate SVG icons (browsers can use SVG, and we'll note PNG generation)
sizes.forEach((size) => {
  const svg = createSvgIcon(size);
  const filename = `icon-${size}x${size}.svg`;
  fs.writeFileSync(path.join(iconsDir, filename), svg);
  console.log(`Created ${filename}`);
});

// Create a main favicon.svg
fs.writeFileSync(path.join(__dirname, '..', 'public', 'favicon.svg'), createSvgIcon(32));
console.log('Created favicon.svg');

console.log('\\nNote: For production, convert SVGs to PNGs using a tool like sharp or an online converter.');
