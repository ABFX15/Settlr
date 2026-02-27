const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, '..', 'src', 'app', 'icon.svg');
const icoPath = path.join(__dirname, '..', 'public', 'favicon.ico');
const applePath = path.join(__dirname, '..', 'public', 'apple-touch-icon.png');

const svg = fs.readFileSync(svgPath);

async function main() {
    // 32x32 for favicon.ico
    const buf32 = await sharp(svg).resize(32, 32).png().toBuffer();

    // ICO format wrapper
    const header = Buffer.alloc(6);
    header.writeUInt16LE(0, 0);
    header.writeUInt16LE(1, 2);
    header.writeUInt16LE(1, 4);

    const entry = Buffer.alloc(16);
    entry.writeUInt8(32, 0);
    entry.writeUInt8(32, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(buf32.length, 8);
    entry.writeUInt32LE(22, 12);

    const ico = Buffer.concat([header, entry, buf32]);
    fs.writeFileSync(icoPath, ico);
    console.log('favicon.ico written (' + ico.length + ' bytes)');

    // 180x180 for apple-touch-icon
    const buf180 = await sharp(svg).resize(180, 180).png().toBuffer();
    fs.writeFileSync(applePath, buf180);
    console.log('apple-touch-icon.png written (' + buf180.length + ' bytes)');
}

main().catch(console.error);
