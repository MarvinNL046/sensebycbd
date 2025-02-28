const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// Create a canvas
const size = 64;
const canvas = createCanvas(size, size);
const ctx = canvas.getContext('2d');

// Draw white background
ctx.fillStyle = '#ffffff';
ctx.fillRect(0, 0, size, size);

// Draw green 'S'
ctx.fillStyle = '#4CAF50'; // Green color
ctx.font = 'bold 40px Arial';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText('S', size / 2, size / 2 + 4); // +4 for visual centering

// Save as PNG
const buffer = canvas.toBuffer('image/png');
const outputPath = path.join(__dirname, '../public/favicon.ico');
fs.writeFileSync(outputPath, buffer);

console.log(`Favicon created at: ${outputPath}`);
