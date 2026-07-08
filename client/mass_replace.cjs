// const fs = require('fs');
// const path = require('path');

// const replacements = [
//     // Backgrounds
//     ['bg-white dark:bg-gray-900', 'bg-surface'],
//     ['bg-white dark:bg-gray-800', 'bg-surface'],
//     ['bg-white dark:bg-gray-950', 'bg-surface'],
//     ['bg-gray-50 dark:bg-gray-900', 'bg-surface-dim'],
//     ['bg-gray-50 dark:bg-gray-950', 'bg-surface-dim'],
//     ['bg-gray-50 dark:bg-gray-800', 'bg-surface-variant'],
//     ['bg-gray-100 dark:bg-gray-800', 'bg-surface-variant'],
//     ['bg-gray-100 dark:bg-gray-900', 'bg-surface-variant'],
//     ['bg-gray-200 dark:bg-gray-700', 'bg-surface-variant'],
//     ['bg-gray-200 dark:bg-gray-800', 'bg-surface-variant'],
//     ['bg-gray-800', 'bg-surface-variant'], // Often used standalone
    
//     // Borders
//     ['border-gray-100 dark:border-gray-800', 'border-outline-variant/30'],
//     ['border-gray-100 dark:border-gray-700', 'border-outline-variant/50'],
//     ['border-gray-200 dark:border-gray-800', 'border-outline-variant/50'],
//     ['border-gray-200 dark:border-gray-700', 'border-outline-variant/50'],
//     ['border-gray-300 dark:border-gray-600', 'border-outline'],
    
//     // Text
//     ['text-gray-900 dark:text-white', 'text-on-surface'],
//     ['text-gray-800 dark:text-gray-200', 'text-on-surface'],
//     ['text-gray-700 dark:text-gray-300', 'text-on-surface-variant'],
//     ['text-gray-600 dark:text-gray-400', 'text-on-surface-variant'],
//     ['text-gray-500 dark:text-gray-400', 'text-on-surface-variant'],
//     ['text-gray-500', 'text-on-surface-variant'],
//     ['text-gray-600', 'text-on-surface-variant'],
    
//     // Primary Color Variations
//     ['text-indigo-600 dark:text-indigo-400', 'text-primary'],
//     ['text-indigo-600', 'text-primary'],
//     ['text-blue-600 dark:text-blue-400', 'text-primary'],
//     ['text-blue-600', 'text-primary'],
//     ['bg-indigo-600', 'bg-primary text-on-primary'],
//     ['bg-blue-600', 'bg-primary text-on-primary'],
//     ['hover:bg-indigo-700', 'hover:bg-primary-container hover:text-on-primary-container'],
//     ['hover:bg-blue-700', 'hover:bg-primary-container hover:text-on-primary-container'],
    
//     // Hover states
//     ['hover:bg-gray-50 dark:hover:bg-gray-800/50', 'hover:bg-surface-variant'],
//     ['hover:bg-gray-50 dark:hover:bg-gray-800', 'hover:bg-surface-variant'],
//     ['hover:bg-gray-100 dark:hover:bg-gray-700', 'hover:bg-surface-variant'],

//     // Overlays / Modals
//     ['bg-gray-900/60 backdrop-blur-sm', 'bg-black/60 backdrop-blur-sm'],
//     ['bg-gray-900/50 backdrop-blur-sm', 'bg-black/60 backdrop-blur-sm'],
//     ['dark:bg-gray-950/80', ''],
// ];

// function walkDir(dir, callback) {
//     fs.readdirSync(dir).forEach(f => {
//         let dirPath = path.join(dir, f);
//         let isDirectory = fs.statSync(dirPath).isDirectory();
//         if (isDirectory) {
//             walkDir(dirPath, callback);
//         } else if (dirPath.endsWith('.jsx')) {
//             callback(dirPath);
//         }
//     });
// }

// let count = 0;
// walkDir('src', function(filePath) {
//     let content = fs.readFileSync(filePath, 'utf8');
//     let original = content;
    
//     replacements.forEach(([oldStr, newStr]) => {
//         content = content.split(oldStr).join(newStr);
//     });

//     // Special regex cases for lingering dark: classes since exact string replace might miss varied formats
//     // e.g. dark:bg-gray-800 -> bg-surface-variant (if not already part of a replaced string)
//     // We already replaced the common pairings like "bg-white dark:bg-gray-900"
//     content = content.replace(/dark:bg-gray-[0-9]{3}/g, '');
//     content = content.replace(/dark:border-gray-[0-9]{3}/g, '');
//     content = content.replace(/dark:text-gray-[0-9]{3}/g, '');
//     content = content.replace(/dark:text-white/g, 'text-on-surface');

//     // Clean up multiple spaces that might result from replacing with empty string
//     content = content.replace(/  +/g, ' ');
//     // Clean up trailing spaces in classNames
//     content = content.replace(/ \)/g, ')');
//     content = content.replace(/ \"/g, '"');

//     if (content !== original) {
//         fs.writeFileSync(filePath, content, 'utf8');
//         count++;
//     }
// });

// console.log(`Updated ${count} files.`);
