const fs = require('fs');
const path = require('path');

// Script untuk mengecek semua gambar yang ada
function checkImages() {
    const imagesDir = path.join(__dirname, 'images');
    
    console.log('=== CHECKING IMAGES ===');
    console.log('Images directory:', imagesDir);
    
    if (!fs.existsSync(imagesDir)) {
        console.log('❌ Images directory not found!');
        return;
    }
    
    const folders = fs.readdirSync(imagesDir);
    
    folders.forEach(folder => {
        const folderPath = path.join(imagesDir, folder);
        if (fs.statSync(folderPath).isDirectory()) {
            console.log(`\n📁 ${folder}/`);
            const files = fs.readdirSync(folderPath);
            files.forEach(file => {
                const filePath = path.join(folderPath, file);
                const stats = fs.statSync(filePath);
                console.log(`  📄 ${file} (${Math.round(stats.size/1024)}KB)`);
            });
        }
    });
    
    console.log('\n=== URL PATHS THAT SHOULD WORK ===');
    folders.forEach(folder => {
        const folderPath = path.join(imagesDir, folder);
        if (fs.statSync(folderPath).isDirectory()) {
            const files = fs.readdirSync(folderPath);
            files.forEach(file => {
                console.log(`http://localhost:3000/images/${folder}/${file}`);
            });
        }
    });
}

checkImages();