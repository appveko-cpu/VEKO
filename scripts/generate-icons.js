const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const sizes = [72, 96, 128, 144, 152, 180, 192, 384, 512];
const outputDir = path.join(__dirname, '../public/icons');

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

const createIcon = async (size) => {
    const fontSize = Math.floor(size * 0.35);
    const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#3b82f6"/>
                <stop offset="100%" style="stop-color:#8b5cf6"/>
            </linearGradient>
        </defs>
        <rect width="${size}" height="${size}" fill="url(#bg)" rx="${size * 0.2}"/>
        <text x="50%" y="55%" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="900" fill="white" text-anchor="middle" dominant-baseline="middle">VEKO</text>
    </svg>`;
    
    const filename = size === 180 ? 'apple-touch-icon.png' : `icon-${size}x${size}.png`;
    const outputPath = path.join(outputDir, filename);
    
    await sharp(Buffer.from(svg))
        .png()
        .toFile(outputPath);
    
    console.log(`Created: ${filename}`);
};

const generateAllIcons = async () => {
    console.log('Generating PWA icons...');
    for (const size of sizes) {
        await createIcon(size);
    }
    console.log('Done!');
};

generateAllIcons().catch(console.error);
