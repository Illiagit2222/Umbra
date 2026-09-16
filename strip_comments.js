const fs = require('fs');
const path = require('path');

function stripComments(content, ext) {
    if (ext === '.css') {
        return content.replace(/\/\*[\s\S]*?\*\//g, '');
    } else if (ext === '.js' || ext === '.rs') {
        const regex = /('([^'\\]|\\.)*'|"([^"\\]|\\.)*"|`([^`\\]|\\.)*`)|(\/\*[\s\S]*?\*\/)|(\/\/.*$)/gm;
        return content.replace(regex, (match, stringMatch) => {
            if (stringMatch) return stringMatch;
            return '';
        });
    } else if (ext === '.html') {
        let res = content.replace(/<!--[\s\S]*?-->/g, '');
        res = res.replace(/\/\*[\s\S]*?\*\//g, '');
        return res;
    }
    return content;
}

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    const original = content;
    const ext = path.extname(filePath);
    
    content = stripComments(content, ext);
    content = content.replace(/\n\s*\n\s*\n/g, '\n\n');

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Cleaned', filePath);
    }
}

function walkDir(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else {
            if (/\.(css|js|html|rs)$/.test(fullPath)) {
                processFile(fullPath);
            }
        }
    }
}

walkDir('src');
walkDir('src-tauri/src');
