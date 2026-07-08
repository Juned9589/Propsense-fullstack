const fs = require('fs');
const replacements = {
    'src/pages/Landing.jsx': [
        [
            '<div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/80 to-transparent" />',
            '<div className="absolute inset-0 bg-black/60 dark:bg-black/80" />\n                    <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-surface to-transparent" />'
        ],
        ['text-surface-container-highest', 'text-white/90'],
        ['text-white/20', 'border-outline-variant/30'],
        ['bg-white dark:bg-gray-900', 'bg-surface'],
        ['bg-gray-50 dark:bg-gray-800', 'bg-surface-dim'],
        ['bg-gray-50 dark:bg-gray-950', 'bg-surface-dim'],
        ['border-gray-100 dark:border-gray-700', 'border-outline-variant/50'],
        ['border-gray-200 dark:border-gray-800', 'border-outline-variant/50'],
        ['text-gray-700 dark:text-gray-300', 'text-on-surface-variant'],
        ['text-gray-600 dark:text-gray-400', 'text-on-surface-variant'],
        ['text-gray-500', 'text-on-surface-variant'],
        ['text-blue-600', 'text-primary'],
        ['hover:bg-gray-50 dark:hover:bg-gray-800/50', 'hover:bg-surface-variant'],
        ['bg-gray-200 dark:bg-gray-700', 'bg-surface-variant'],
        ['text-primary-fixed', 'text-primary'],
    ],
    'src/components/layout/Navbar.jsx': [
        ['bg-surface/70 backdrop-blur-xl', 'bg-surface/85 backdrop-blur-md shadow-sm'],
        ['bg-surface/90 backdrop-blur-xl', 'bg-surface/95 backdrop-blur-md'],
    ],
    'src/pages/dashboard/AdminDashboard.jsx': [
        ['bg-surface-dim p-5 rounded-2xl shadow-lg border backdrop-blur-md border-outline-variant/30', 'bg-surface p-5 rounded-2xl shadow-md border border-outline-variant/50'],
        ['bg-surface-dim p-6 rounded-2xl shadow-lg border backdrop-blur-md border-outline-variant/30', 'bg-surface p-6 rounded-2xl shadow-md border border-outline-variant/50'],
        ['bg-surface-dim rounded-2xl shadow-lg border backdrop-blur-md border-outline-variant/30', 'bg-surface rounded-2xl shadow-md border border-outline-variant/50'],
    ],
    'src/pages/dashboard/AgentDashboard.jsx': [
        ['bg-surface-dim p-6 rounded-2xl shadow-lg border backdrop-blur-md border-outline-variant/30', 'bg-surface p-6 rounded-2xl shadow-md border border-outline-variant/50'],
        ['bg-surface-dim rounded-2xl shadow-lg border backdrop-blur-md border-outline-variant/30', 'bg-surface rounded-2xl shadow-md border border-outline-variant/50'],
    ],
    'src/components/common/PropertyCard.jsx': [
        ['bg-surface/80 backdrop-blur-md', 'bg-surface/90 backdrop-blur-sm'],
        ['bg-surface/90 backdrop-blur-sm', 'bg-surface'],
    ]
};

Object.keys(replacements).forEach(file_path => {
    if (fs.existsSync(file_path)) {
        let content = fs.readFileSync(file_path, 'utf8');
        replacements[file_path].forEach(([oldStr, newStr]) => {
            content = content.split(oldStr).join(newStr);
        });
        fs.writeFileSync(file_path, content, 'utf8');
        console.log('Updated ' + file_path);
    } else {
        console.log('File not found: ' + file_path);
    }
});
