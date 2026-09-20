# Icon Generation Guide

This guide explains how to generate all required icon sizes from a single source icon.

## Requirements

### Source Icon
- **Format**: PNG
- **Recommended size**: 1024x1024 pixels (minimum 512x512)
- **Style**: Square, no transparency (iOS adds rounded corners automatically)
- **Background**: Solid color (preferably #0a0e1a to match app theme)

## Methods

### Method 1: Node.js Script (Recommended - Cross-platform)

1. **Install dependencies** (first time only):
   ```bash
   npm install
   ```

2. **Run the script**:
   ```bash
   npm run generate-icons -- --source path/to/your/icon.png
   ```
   Or directly:
   ```bash
   node generate-icons.js --source path/to/your/icon.png
   ```

### Method 2: PowerShell Script (Windows only)

1. **Run the script**:
   ```powershell
   .\generate-icons.ps1 -SourceIcon "path\to\your\icon.png"
   ```

   If you get execution policy error, run:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

## Generated Icons

The script will generate the following icons in the correct locations:

| File | Size | Locations |
|------|------|-----------|
| icon.png | 1024x1024 | dist/, assets/, web/assets/ |
| icon-512.png | 512x512 | dist/ |
| icon-192.png | 192x192 | dist/ |
| adaptive-icon.png | 512x512 | assets/, web/assets/ |
| favicon.png | 48x48 | assets/, web/assets/ |

## After Generating Icons

1. **Review the generated icons** to ensure they look correct
2. **Rebuild the web export**:
   ```bash
   npx expo export --platform web
   ```
3. **Copy updated files to dist**:
   ```bash
   Copy-Item web\manifest.json dist\manifest.json
   Copy-Item web\index.html dist\index.html
   Copy-Item web\sw.js dist\sw.js
   ```
4. **Commit and push changes**:
   ```bash
   git add -A
   git commit -m "Update app icons"
   git push
   ```

## Icon Locations Reference

- **Source icons**: `assets/` folder
- **Web build icons**: `dist/` folder (deployed to Vercel)
- **Expo web icons**: `web/assets/` folder

## Troubleshooting

### "sharp package is not installed"
Run: `npm install sharp`

### "Source icon not found"
Check that the path to your source icon is correct

### Icons look blurry
Use a higher resolution source icon (1024x1024 or larger)

### Icons have wrong aspect ratio
Ensure your source icon is square (same width and height)
