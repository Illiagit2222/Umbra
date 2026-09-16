const fs = require('fs');
const readline = require('readline');

async function extract() {
    const fileStream = fs.createReadStream('C:/Users/Freezx/.gemini/antigravity-ide/brain/8af2d147-ef9f-4c5c-865c-5e808f339f00/.system_generated/logs/transcript.jsonl');
    const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });
    
    let originalCSS = null;
    
    for await (const line of rl) {
        try {
            const data = JSON.parse(line);
            if (data.type === 'TOOL_CALL_RESPONSE' && data.content && data.content.includes('File Path: ile:///c:/Users/Freezx/Downloads/search/src/styles.css')) {
                originalCSS = data.content;
                break;
            }
        } catch(e) {}
    }
    
    if (originalCSS) {
        fs.writeFileSync('extracted_css_log.txt', originalCSS);
        console.log('Found it!');
    } else {
        console.log('Not found');
    }
}
extract();
