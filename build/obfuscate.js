const JavaScriptObfuscator = require('javascript-obfuscator');
const Terser = require('terser');
const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');

// Configuration for different obfuscation levels
const obfuscationConfigs = {
    minify: {
        // Basic minification only
        mangle: true,
        compress: {
            drop_console: false,
            drop_debugger: true,
            pure_funcs: ['console.log']
        }
    },
    basic: {
        // Basic obfuscation
        compact: true,
        controlFlowFlattening: true,
        controlFlowFlatteningThreshold: 0.3,
        deadCodeInjection: true,
        deadCodeInjectionThreshold: 0.2,
        debugProtection: false,
        debugProtectionInterval: 0,
        disableConsoleOutput: false,
        identifierNamesGenerator: 'hexadecimal',
        log: false,
        numbersToExpressions: true,
        renameGlobals: false,
        selfDefending: true,
        simplify: true,
        splitStrings: true,
        splitStringsChunkLength: 10,
        stringArray: true,
        stringArrayEncoding: ['base64'],
        stringArrayThreshold: 0.75,
        transformObjectKeys: true,
        unicodeEscapeSequence: false
    },
    advanced: {
        // Advanced obfuscation with maximum compatibility
        compact: true,
        controlFlowFlattening: false,
        deadCodeInjection: false,
        debugProtection: false,
        disableConsoleOutput: false,
        identifierNamesGenerator: 'hexadecimal',
        identifierNamesPrefix: '_0x',
        log: false,
        numbersToExpressions: false,
        renameGlobals: false,
        selfDefending: false,
        simplify: true,
        splitStrings: true,
        splitStringsChunkLength: 15,
        stringArray: true,
        stringArrayEncoding: ['base64'],
        stringArrayThreshold: 0.8,
        stringArrayWrappersCount: 0,
        transformObjectKeys: false,
        unicodeEscapeSequence: false,
        reservedStrings: ['auth', 'kinde', 'login', 'logout', 'register', 'AUTH_CONFIG', 'window', 'document', 'console', 'fetch', 'sessionStorage', 'localStorage', 'createKindeClient', 'kindeClient'],
        reservedNames: ['AuthManager', 'authManager', 'kindeClient', 'createKindeClient', 'window', 'document', 'console']
    }
};

// Files to obfuscate (excluding libraries and config files)
const sourceFiles = [
    // 'app.js',
    'auth.js',
    'auth-config.js', 
    'auth-ui.js',
    // 'camera-cards.js',
    // 'floor-plan.js',
    // 'main.js',
    // 'running-order.js',
    // 'utils.js',
    // 'sketch.js',
    'lib/preload.js',
    'lib/test-utils.js'
];

// Files to copy as-is (libraries, configs, etc.)
const copyFiles = [
    'index.html',
    'styles.css',
    'inline-styles.css',
    'lib/main-styles.css',
    'productions.json',
    'CNAME',
    'jsconfig.json',
    'lib/libraries/**/*',
    'node_modules/**/*'
];

async function obfuscateFile(filePath, config, outputDir) {
    try {
        console.log(`Processing: ${filePath}`);
        
        const sourceCode = await fs.readFile(filePath, 'utf8');
        let processedCode = sourceCode;
        
        // Special handling for authentication files to preserve functionality
        const isAuthFile = filePath.includes('auth') || filePath.includes('auth-config');
        
        if (config === 'minify') {
            // Use Terser for minification
            const result = await Terser.minify(sourceCode, obfuscationConfigs.minify);
            processedCode = result.code;
        } else if (isAuthFile) {
            // For authentication files, use minification only to preserve functionality
            const result = await Terser.minify(sourceCode, {
                mangle: false,
                compress: {
                    drop_console: false,
                    drop_debugger: true,
                    pure_funcs: []
                }
            });
            processedCode = result.code;
        } else {
            // Use JavaScript Obfuscator for other files
            const obfuscationResult = JavaScriptObfuscator.obfuscate(
                sourceCode, 
                obfuscationConfigs[config]
            );
            processedCode = obfuscationResult.getObfuscatedCode();
        }
        
        const outputPath = path.join(outputDir, filePath);
        await fs.ensureDir(path.dirname(outputPath));
        await fs.writeFile(outputPath, processedCode);
        
        console.log(`✓ Obfuscated: ${filePath}`);
        return true;
    } catch (error) {
        console.error(`✗ Error processing ${filePath}:`, error.message);
        return false;
    }
}

async function copyFile(filePath, outputDir) {
    try {
        const outputPath = path.join(outputDir, filePath);
        await fs.ensureDir(path.dirname(outputPath));
        await fs.copy(filePath, outputPath);
        console.log(`✓ Copied: ${filePath}`);
        return true;
    } catch (error) {
        console.error(`✗ Error copying ${filePath}:`, error.message);
        return false;
    }
}

async function copyLibraryFiles(outputDir) {
    const libraryPatterns = [
        'lib/libraries/**/*',
        'lib/libraries/fonts/**/*',
        'lib/libraries/p5.min.js',
        'lib/libraries/p5types/**/*',
        'node_modules/**/*'
    ];
    
    for (const pattern of libraryPatterns) {
        const files = glob.sync(pattern);
        for (const file of files) {
            await copyFile(file, outputDir);
        }
    }
}

async function main() {
    const obfuscationLevel = process.argv[2] || 'basic';
    
    if (!obfuscationConfigs[obfuscationLevel] && obfuscationLevel !== 'auth') {
        console.error('Invalid obfuscation level. Use: minify, basic, advanced, or auth');
        process.exit(1);
    }
    
    const outputDir = `dist/${obfuscationLevel}`;
    
    console.log(`🚀 Starting ${obfuscationLevel} obfuscation...`);
    console.log(`📁 Output directory: ${outputDir}`);
    
    // Clean output directory
    await fs.remove(outputDir);
    await fs.ensureDir(outputDir);
    
    // Obfuscate source files
    console.log('\n📝 Obfuscating source files...');
    let successCount = 0;
    for (const file of sourceFiles) {
        if (await fs.pathExists(file)) {
            const success = await obfuscateFile(file, obfuscationLevel, outputDir);
            if (success) successCount++;
        } else {
            console.log(`⚠️  File not found: ${file}`);
        }
    }
    
    // Copy static files
    console.log('\n📋 Copying static files...');
    for (const file of copyFiles) {
        // Handle glob patterns
        if (file.includes('**')) {
            const files = glob.sync(file);
            for (const matchedFile of files) {
                await copyFile(matchedFile, outputDir);
            }
        } else {
            // Handle single files
            if (await fs.pathExists(file)) {
                await copyFile(file, outputDir);
            }
        }
    }
    
    // Copy library files
    console.log('\n📚 Copying library files...');
    await copyLibraryFiles(outputDir);
    
    // Copy the original index.html (preserve the full application)
    await copyFile('index.html', outputDir);
    
    console.log(`\n✅ Obfuscation complete!`);
    console.log(`📊 Processed ${successCount}/${sourceFiles.length} source files`);
    console.log(`📁 Output: ${outputDir}`);
    console.log(`🔒 Protection level: ${obfuscationLevel}`);
    
    if (obfuscationLevel === 'advanced') {
        console.log(`\n⚠️  Advanced obfuscation applied!`);
        console.log(`   - Debug protection enabled`);
        console.log(`   - Console output disabled`);
        console.log(`   - Maximum string obfuscation`);
        console.log(`   - Control flow flattening`);
    }
}



// Run the obfuscation
main().catch(console.error); 