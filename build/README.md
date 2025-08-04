# JavaScript Obfuscation System

This build system provides multiple levels of JavaScript obfuscation to protect your intellectual property.

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Choose your obfuscation level:**
   ```bash
   # Basic minification (fastest, least protection)
   npm run build:minify
   
   # Basic obfuscation (good balance)
   npm run build:basic
   
   # Advanced obfuscation (maximum protection)
   npm run build:advanced
   ```

## 📊 Obfuscation Levels

### 1. Minify (`npm run build:minify`)
- **Protection Level:** Low
- **Speed:** Fastest
- **Use Case:** Basic code compression
- **Features:**
  - Code minification
  - Variable name mangling
  - Dead code removal
  - Console logs preserved

### 2. Basic (`npm run build:basic`)
- **Protection Level:** Medium
- **Speed:** Fast
- **Use Case:** Standard protection
- **Features:**
  - Control flow flattening (30%)
  - Dead code injection (20%)
  - String array encoding (base64)
  - Self-defending code
  - Hexadecimal identifier names

### 3. Advanced (`npm run build:advanced`)
- **Protection Level:** Maximum
- **Speed:** Slower
- **Use Case:** High-security applications
- **Features:**
  - Control flow flattening (75%)
  - Dead code injection (40%)
  - Debug protection enabled
  - Console output disabled
  - Multiple string encodings (base64 + rc4)
  - Global variable renaming
  - Unicode escape sequences

## 📁 Output Structure

After running any build command, your obfuscated code will be in:
```
dist/
├── minify/          # Minified version
├── basic/           # Basic obfuscation
└── advanced/        # Advanced obfuscation
```

Each directory contains:
- Obfuscated JavaScript files
- Original HTML, CSS, and assets
- Library files (p5.js, etc.)
- Configuration files

## 🔧 Customization

### Modifying Obfuscation Settings

Edit `build/obfuscate.js` to customize obfuscation settings:

```javascript
const obfuscationConfigs = {
    advanced: {
        // Increase protection
        controlFlowFlatteningThreshold: 0.9,
        deadCodeInjectionThreshold: 0.5,
        
        // Add more reserved names
        reservedNames: ['AuthManager', 'authManager', 'kindeClient', 'yourCustomClass'],
        
        // Custom string encodings
        stringArrayEncoding: ['base64', 'rc4', 'aes']
    }
};
```

### Adding Files to Obfuscate

Edit the `sourceFiles` array in `build/obfuscate.js`:

```javascript
const sourceFiles = [
    'auth.js',
    'auth-config.js', 
    'auth-ui.js',
    'sketch.js',
    'lib/preload.js',
    'lib/test-utils.js',
    'your-new-file.js'  // Add your files here
];
```

## 🛡️ Security Best Practices

### 1. Environment Variables
Never hardcode sensitive data. Use environment variables:

```javascript
// ❌ Bad
const API_KEY = 'sk-1234567890abcdef';

// ✅ Good
const API_KEY = process.env.API_KEY || '';
```

### 2. Server-Side Validation
Always validate authentication on the server side, not just client side.

### 3. API Key Protection
- Use HTTPS for all API calls
- Implement rate limiting
- Use short-lived tokens

### 4. Code Splitting
Consider splitting your application into multiple files to make reverse engineering harder.

## 🔍 Testing Obfuscated Code

1. **Build the obfuscated version:**
   ```bash
   npm run build:advanced
   ```

2. **Test locally:**
   ```bash
   cd dist/advanced
   python -m http.server 8000
   # or
   npx serve .
   ```

3. **Verify functionality:**
   - Test all authentication flows
   - Check console for errors
   - Verify API calls work
   - Test user interactions

## ⚠️ Important Notes

### Performance Impact
- **Minify:** No performance impact
- **Basic:** Minimal performance impact
- **Advanced:** 10-30% performance impact

### Debugging
- Advanced obfuscation makes debugging difficult
- Keep source maps for development
- Use source control for original code

### Browser Compatibility
- Advanced obfuscation may not work in older browsers
- Test thoroughly across target browsers

### Legal Considerations
- Obfuscation doesn't guarantee complete protection
- Consider additional legal protections (licenses, patents)
- Some jurisdictions have specific requirements for software protection

## 🚨 Troubleshooting

### Common Issues

1. **"Module not found" errors:**
   ```bash
   npm install
   ```

2. **Obfuscation fails:**
   - Check for syntax errors in source files
   - Ensure all dependencies are installed
   - Verify file paths are correct

3. **Code doesn't work after obfuscation:**
   - Check reserved names/strings
   - Verify external dependencies
   - Test with basic obfuscation first

4. **Performance issues:**
   - Use basic obfuscation for better performance
   - Profile the application
   - Consider code splitting

## 📞 Support

For issues with the obfuscation system:
1. Check the console for error messages
2. Verify all dependencies are installed
3. Test with different obfuscation levels
4. Review the configuration settings

## 🔄 Continuous Integration

Add to your CI/CD pipeline:

```yaml
# .github/workflows/build.yml
- name: Build obfuscated version
  run: |
    npm install
    npm run build:advanced
```

## 📈 Monitoring

Consider implementing:
- Error tracking (Sentry, etc.)
- Performance monitoring
- Usage analytics
- Security monitoring

Remember: Obfuscation is just one layer of protection. Combine it with proper authentication, authorization, and legal protections for comprehensive IP security. 