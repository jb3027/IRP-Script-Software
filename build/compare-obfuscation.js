const fs = require('fs-extra');
const path = require('path');

async function compareObfuscation() {
    console.log('🔍 Comparing Obfuscation Levels\n');
    
    const levels = ['minify', 'basic', 'advanced'];
    const files = ['scripts/kindeAuth.js', 'scripts/main.js', 'scripts/stateManagement.js'];
    
    for (const file of files) {
        console.log(`📄 File: ${file}`);
        console.log('─'.repeat(50));
        
        for (const level of levels) {
            const filePath = path.join('dist', level, file);
            
            if (await fs.pathExists(filePath)) {
                const content = await fs.readFile(filePath, 'utf8');
                const size = content.length;
                const lines = content.split('\n').length;
                
                // Calculate readability metrics
                const avgLineLength = Math.round(content.length / lines);
                const uniqueChars = new Set(content.replace(/\s/g, '')).size;
                const entropy = calculateEntropy(content);
                
                console.log(`\n${level.toUpperCase()}:`);
                console.log(`  📏 Size: ${size.toLocaleString()} bytes`);
                console.log(`  📊 Lines: ${lines.toLocaleString()}`);
                console.log(`  📐 Avg line length: ${avgLineLength} chars`);
                console.log(`  🔤 Unique characters: ${uniqueChars}`);
                console.log(`  🎲 Entropy: ${entropy.toFixed(2)}`);
                
                // Show sample of obfuscated code
                const sample = content.substring(0, 200).replace(/\n/g, '\\n');
                console.log(`  📝 Sample: ${sample}...`);
            } else {
                console.log(`\n${level.toUpperCase()}: File not found`);
            }
        }
        console.log('\n' + '='.repeat(60) + '\n');
    }
    
    // Show protection summary
    console.log('🛡️ PROTECTION SUMMARY');
    console.log('─'.repeat(50));
    console.log('MINIFY:');
    console.log('  ✅ Code compression');
    console.log('  ✅ Variable name mangling');
    console.log('  ❌ Easy to reverse engineer');
    console.log('  ⚡ Fastest execution');
    
    console.log('\nBASIC:');
    console.log('  ✅ String obfuscation');
    console.log('  ✅ Control flow flattening');
    console.log('  ✅ Dead code injection');
    console.log('  ⚠️  Moderate protection');
    console.log('  ⚡ Good performance');
    
    console.log('\nADVANCED:');
    console.log('  ✅ Maximum string obfuscation');
    console.log('  ✅ Debug protection');
    console.log('  ✅ Console output disabled');
    console.log('  ✅ Multiple encoding layers');
    console.log('  ⚠️  Slower execution');
    console.log('  🔒 Maximum protection');
}

function calculateEntropy(str) {
    const freq = {};
    for (const char of str) {
        freq[char] = (freq[char] || 0) + 1;
    }
    
    let entropy = 0;
    const len = str.length;
    
    for (const char in freq) {
        const p = freq[char] / len;
        entropy -= p * Math.log2(p);
    }
    
    return entropy;
}

// Run comparison
compareObfuscation().catch(console.error); 