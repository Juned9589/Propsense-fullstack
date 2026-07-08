const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory) {
            walkDir(dirPath, callback);
        } else if (dirPath.endsWith('.jsx')) {
            callback(dirPath);
        }
    });
}

let count = 0;
walkDir('src', function(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Add lazy loading to images that don't have it
    content = content.replace(/<img(?![^>]*loading=)([^>]+)>/g, '<img loading="lazy" decoding="async"$1>');
    
    // Convert unnecessary backdrop-blur-xl to backdrop-blur-md for performance
    content = content.replace(/backdrop-blur-xl/g, 'backdrop-blur-md');
    // Convert backdrop-blur-3xl to md
    content = content.replace(/backdrop-blur-2xl/g, 'backdrop-blur-md');
    
    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        count++;
    }
});

console.log('Optimized ' + count + ' files for images and blur performance.');
